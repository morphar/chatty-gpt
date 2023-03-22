import './chat-parameters.js'

import { ChatCompletion } from '../js/openai.js'
import { Remarkable } from '../js/remarkable.min.js'
import hljs from '../js/highlightjs/highlight.min.js'

// import hljs from '../js/highlightjs/core.min.js'
// import go from '../js/highlightjs/languages/go.min.js'
// hljs.registerLanguage('go', go);


class ChatView extends HTMLElement {
  static get observedAttributes () {
    return ['chat-id']
  }

  #controller

  // TODO: Make these names CONSTANTS somewhere?
  #lsKeyName = 'openai-apikey'
  #lsOrgIDName = 'openai-organizationid'
  #completionAPI
  #apiKey
  #orgID
  #chatID

  constructor () {
    super()

    this.#controller = new AbortController()

    this.attachShadow({ mode: 'open' })
  }

  connectedCallback () {
    this.#chatID = this.getAttribute('chat-id')

    this.#apiKey = localStorage.getItem(this.#lsKeyName)
    this.#orgID = localStorage.getItem(this.#lsOrgIDName)

    if (!this.#chatID || !this.#apiKey) {
      // TODO: Probably pop the settings modal
      return
    }

    this.#completionAPI = new ChatCompletion(this.#apiKey, this.#orgID)

    this.shadowRoot.innerHTML = `
<link href="css/global.min.css" rel="stylesheet">
<!-- <link href="css/highlightjs/default.min.css" rel="stylesheet"> -->
<link href="css/highlightjs/github-dark.min.css" rel="stylesheet">

<div id="chat-container" class="h-full overflow-y-auto">
  <dl class="mb-48"></dl>
</div>

<div id="message-input" class="absolute bottom-0 left-0 w-full mx-auto py-6 border-t border-gray-300 bg-white bg-opacity-70 backdrop-blur-sm backdrop-filter">
  <form class="relative block mx-auto max-w-3xl">
    <!-- <textarea name="message" id="message" class="w-full resize-none rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:py-1.5 sm:text-sm sm:leading-6"></textarea> -->
    <textarea name="message" id="message" class="w-full resize-none rounded-md border border-gray-300 focus:border-gray-300 shadow-md text-gray-900 focus:ring-0 focus:ring-offset-0 placeholder:text-gray-400 sm:py-1.5 sm:text-sm sm:leading-6"></textarea>
      <button class="absolute p-1.5 right-0 bottom-2.5 rounded-md text-gray-500">
        <chatty-icon name="paper-airplane-solid" class="h-5 w-5 -rotate-45 stroke-none fill-gray-400 hover:fill-teal-600"></chatty-icon>
      </button>
  </form>
</div>
`

    this.shadowRoot.querySelector('textarea').focus()

    this.shadowRoot.querySelector('form').addEventListener('submit', this.#onSubmit.bind(this), { signal: this.#controller.signal })


    // Build the chat messages
    let chat = {}
    try {
      chat = JSON.parse(localStorage.getItem(this.#chatID))
    } catch (err) {
      console.log(err)
      return
    }

    const dl = this.shadowRoot.querySelector('dl')

    for (let i = 0; i < chat.messages.length; i++) {
      const msgEl = this.#createChatMessageEl(chat.messages[i])
      dl.appendChild(msgEl)

      // this.#scrollToBottom()
    }

    // Check if the last message is a user message
    if (chat.messages[chat.messages.length - 1].role === 'user') {
      this.#getResponseFromOpenAI()
    }

    this.#generateChatTitle()
  }

  disconnectedCallback () {
    this.#controller.abort()
  }

  // attributeChangedCallback (name, oldValue, newValue) {
  //   if (oldValue === newValue) {
  //     return
  //   }

  //   // if (name === 'chat-id') {
  //   //   if (!newValue || newValue === 'false') {
  //   //     this.shadowRoot.querySelector('div').classList.add('hidden')
  //   //   } else {
  //   //     this.shadowRoot.querySelector('div').classList.remove('hidden')
  //   //   }
  //   // }
  // }

  #scrollToBottom () {
    // Scroll (almos) to the bottom
    const clientHeight = this.shadowRoot.querySelector('#chat-container').clientHeight
    const scrollHeight = this.shadowRoot.querySelector('#chat-container').scrollHeight
    const inputHeight = this.shadowRoot.querySelector('#message-input').clientHeight

    const scrollTo = scrollHeight - clientHeight + (inputHeight - 192)

    this.shadowRoot.querySelector('#chat-container').scrollTo(0, scrollTo)
  }

  #createChatMessageEl (chatMessage) {
    // Create the main div
    const el = document.createElement('div')
    el.classList.add('px-4', 'py-5', 'border-b', 'border-b-gray-300')

    let iconName = ''

    // Determine color and "user" icon based on the role
    switch (chatMessage.role) {
      case 'system':
        el.classList.add('bg-gray-100')
        iconName = 'terminal'
        break
      case 'user':
        el.classList.add('bg-white')
        iconName = 'user'
        break
      case 'assistant':
        el.classList.add('bg-gray-50')
        iconName = 'openai'
        break
    }

    // Create the div, which will contain the user icon and message
    const containerEl = document.createElement('div')
    containerEl.classList.add(
      'max-w-3xl',
      'mx-auto',
      'sm:grid',
      'sm:grid-cols-12',
      'sm:gap-4',
      'sm:px-6'
    )
    el.appendChild(containerEl)

    // Create the icon <dt>
    const dt = document.createElement('dt')
    dt.classList.add('text-sm', 'font-medium', 'text-gray-500')
    dt.innerHTML = `<chatty-icon name="${iconName}" class="mx-auto text-gray-800 h-6 w-6" />`
    containerEl.appendChild(dt)

    // Create the content dd
    const dd = document.createElement('dd')

    dd.classList.add(
      'message-content',
      'prose',
      'text-gray-900',
      'sm:col-span-11',
    )

    dd.innerHTML = this.#markdownToHTML(chatMessage.content)

    containerEl.appendChild(dd)

    return el
  }

  #markdownToHTML (markdown) {
    const md = new Remarkable({
      langPrefix: 'language-detected language-',
      highlight: function (code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (err) { }
        }

        try {
          return hljs.highlightAuto(code).value;
        } catch (err) { }

        return ''; // use external default escaping
      }
    });

    return md.render(markdown)
  }

  // Create new user message
  #onSubmit (evt) {
    evt.preventDefault()
    evt.stopPropagation()

    let msg = ''
    for (let i = 0; i < evt.target.elements.length; i++) {
      if (evt.target.elements[i].nodeName === 'TEXTAREA') {
        msg = evt.target.elements[i].value
        break
      }
    }

    if (!msg.trim()) {
      return
    }

    let chat = null

    try {
      chat = JSON.parse(localStorage.getItem(this.#chatID))
    } catch (err) {
      // TODO: Pop the settings modal
      console.log('unable to find the chat:', this.#chatID)
      console.log(err)
      return
    }

    const msgObject = { role: 'user', content: msg.trim() }
    chat.messages.push(msgObject)

    const msgEl = this.#createChatMessageEl(msgObject)
    this.shadowRoot.querySelector('dl').append(msgEl)

    try {
      localStorage.setItem(this.#chatID, JSON.stringify(chat))
    } catch (err) {
      // TODO: show a notification on error
      console.log(err)
      this.shadowRoot.querySelector('dl').removeChild(msgEl)
    }

    this.#scrollToBottom()

    this.#getResponseFromOpenAI()
  }

  #getResponseFromOpenAI () {
    if (!this.#completionAPI) {
      // TODO: Probably pop the settings modal
      console.log('no openai!')
      return
    }

    let chat = null

    try {
      chat = JSON.parse(localStorage.getItem(this.#chatID))
    } catch (err) {
      // TODO: Pop the settings modal
      console.log('unable to find the chat:', this.#chatID)
      console.log(err)
      return
    }

    if (chat.messages[chat.messages.length - 1].role !== 'user') {
      return
    }

    // Create a new message element
    // v on error: remove it again
    // v on callback: append to the new message element
    // - on done:
    //   v replace the content of the new element
    //   v add the message to the chat.messages
    //   - if missing name: ask chat-gpt to create one
    //   v save the chat object to localStorage

    const msgEl = this.#createChatMessageEl({ role: 'system', content: '' })
    this.shadowRoot.querySelector('dl').append(msgEl)

    this.#scrollToBottom()

    const msgContentEl = msgEl.querySelector('.message-content')

    const options = Object.assign({}, chat)
    delete options.name

    // TODO:
    // TITLE PROMPT: Can you come up with a name or title for this chat? It should summarize the content, but be kept at around 2 or 3 words.

    const lastMsgIdx = (chat.messages.push({ role: 'assistant', content: '' })) - 1

    this.#completionAPI.createStream(options, (deltaMsg) => {
      // Each delta callback attempts to add the delta to the new message and save it to localStorage
      try {
        if (deltaMsg.choices[0].delta.content) {
          chat.messages[lastMsgIdx].content += deltaMsg.choices[0].delta.content
        }
        localStorage.setItem(this.#chatID, JSON.stringify(chat))
      } catch (err) {
        // TODO: show a notification on error
        console.log(err)
      }

      // Set the innerHTML with the content converted from markdown
      try {
        if (deltaMsg.choices[0].delta.content) {
          msgContentEl.innerHTML = this.#markdownToHTML(chat.messages[lastMsgIdx].content)
          this.#scrollToBottom()
        }
      } catch (err) {
        // TODO: show a notification on error
        console.log(err)
      }
    })
      .then((finalMsg) => {
        // When the stream is done, the full message is "compiled", added to the chat message and stored in localStorage
        try {
          if (finalMsg.choices[0].message.content) {
            chat.messages[lastMsgIdx].content = finalMsg.choices[0].message.content
          }
          localStorage.setItem(this.#chatID, JSON.stringify(chat))
        } catch (err) {
          // TODO: show a notification on error
          console.log(err)
          this.shadowRoot.querySelector('dl').removeChild(msgEl)
        }

        try {
          msgContentEl.innerHTML = this.#markdownToHTML(chat.messages[lastMsgIdx].content)
        } catch (err) {
          // TODO: show a notification on error
          console.log(err)
        }

        if (!chat.name) {
          // Ask GPT to create a title for this chat
          this.#generateChatTitle()
        }

      })
      .catch((err) => {
        // TODO: show a notification on error
        console.log(err)
        this.shadowRoot.querySelector('dl').removeChild(msgEl)
      })
  }

  #generateChatTitle () {
    if (!this.#completionAPI) {
      // TODO: Probably pop the settings modal
      console.log('no openai!')
      return
    }

    let chat = null

    try {
      chat = JSON.parse(localStorage.getItem(this.#chatID))
    } catch (err) {
      // TODO: Pop the settings modal
      console.log('unable to find the chat:', this.#chatID)
      console.log(err)
      return
    }

    if (chat.name) {
      return
    }

    delete chat.name

    chat.messages.push({ role: 'user', content: 'Can you come up with a title for this chat? It should summarize the content in about 3 or 4 words.' })

    this.#completionAPI.create(chat)
      .then((res) => {
        try {
          if (res.choices[0].message.content) {
            chat.name = res.choices[0].message.content.replace(/^[^"]*"([^"]+)"[^"]*$/, '$1')
            chat.messages.pop()
            localStorage.setItem(this.#chatID, JSON.stringify(chat))
          }
        } catch (err) {
          // TODO: show a notification on error
          console.log(err)
        }
      })
      .catch((err) => {
        // TODO: show a notification on error
        console.log(err)
      })

  }
}

customElements.define('chat-view', ChatView)
