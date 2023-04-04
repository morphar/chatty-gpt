import './chat-parameters.js'

import { ChatCompletion } from '../js/openai.js'
import { Remarkable } from '../js/remarkable.min.js'
import hljs from '../js/highlightjs/highlight.min.js'
import detectOS from '../js/detect-os.js'

// import hljs from '../js/highlightjs/core.min.js'
// import go from '../js/highlightjs/languages/go.min.js'
// hljs.registerLanguage('go', go);

const tokenLimits = {
  'gpt-3.5-turbo': 4096,
  'gpt-3.5-turbo-0301': 4096,
  'gpt-4': 8192,
  'gpt-4-0314': 8192,
  'gpt-4-32k': 32768,
  'gpt-4-32k-0314': 32768
}

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

    let chat = {}
    try {
      chat = JSON.parse(localStorage.getItem(this.#chatID))
    } catch (err) {
      console.log(err)
      return
    }

    const os = detectOS()
    let submitShortcut = ''
    if (os === 'Windows' || os === 'Linux') {
      submitShortcut = '<kbd class="items-center rounded border border-gray-200 px-1">Ctrl</kbd>'
      submitShortcut += '<span class="text-gray-500"> + </span>'
      submitShortcut += '<kbd class="items-center rounded border border-gray-200 px-1">↵</kbd>'
    } else if (os === 'macOS') {
      submitShortcut = '<kbd class="items-center rounded border border-gray-200 px-1">⌘</kbd>'
      submitShortcut += '<span class="text-gray-500"> + </span>'
      submitShortcut += '<kbd class="items-center rounded border border-gray-200 px-1">↵</kbd>'
    }

    this.shadowRoot.innerHTML = `
<link href="css/global.min.css" rel="stylesheet">
<!-- <link href="css/highlightjs/default.min.css" rel="stylesheet"> -->
<link href="css/highlightjs/github-dark.min.css" rel="stylesheet">

<div id="chat-container" class="h-full overflow-y-auto">
  <dl class="mb-32">
    <div id="chat-gpt-model"class="py-3 border-b border-b-gray-300 bg-gray-50 text-gray-400 text-center text-sm">
      Model: ${chat.model}
    </div>
  </dl>
</div>

<div id="message-input" class="absolute bottom-0 left-0 w-full mx-auto py-6 border-t border-gray-300 bg-white bg-opacity-70 backdrop-blur-sm backdrop-filter">
  <form class="relative block mx-auto max-w-3xl">
    <!-- <textarea name="message" id="message" class="w-full resize-none rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:py-1.5 sm:text-sm sm:leading-6"></textarea> -->
    <textarea name="message" id="message" class="w-full resize-none rounded-md border border-gray-300 focus:border-gray-300 shadow-md text-gray-900 focus:ring-0 focus:ring-offset-0 placeholder:text-gray-400 sm:py-1.5 sm:text-sm sm:leading-6"></textarea>
    <div class="absolute right-1 bottom-2.5 font-sans text-xs text-gray-400">
      ${submitShortcut}
    </div>
  </form>
</div>
`

    this.shadowRoot.querySelector('textarea').focus()

    this.shadowRoot.querySelector('form').addEventListener('submit', this.#onSubmit.bind(this), { signal: this.#controller.signal })

    this.shadowRoot.querySelector('#message').addEventListener('keydown', (evt) => {
      if ((evt.metaKey || evt.ctrlKey) && evt.key === 'Enter') {
        this.#onSubmit(evt)
      }
    }, { signal: this.#controller.signal })

    // Build the chat messages
    const dl = this.shadowRoot.querySelector('dl')

    for (let i = 0; i < chat.messages.length; i++) {
      const msgEl = this.#createChatMessageEl(chat.messages[i])
      dl.appendChild(msgEl)

      this.#scrollToBottom()
    }

    // Check if the last message is a user message
    if (chat.messages[chat.messages.length - 1].role === 'user') {
      this.#getResponseFromOpenAI()
    } else {
      this.#generateChatTitle()
    }
  }

  disconnectedCallback () {
    this.#controller.abort()
  }

  #atBottom () {
    const scrollHeight = this.shadowRoot.querySelector('#chat-container').scrollHeight // Entire view, including off-screen
    const clientHeight = this.shadowRoot.querySelector('#chat-container').clientHeight // The visible view
    const inputHeight = this.shadowRoot.querySelector('#message-input').clientHeight // Height if the message input textarea
    const scrollTop = this.shadowRoot.querySelector('#chat-container').scrollTop

    const minScroll = scrollHeight - clientHeight + (inputHeight - 128)
    if (scrollTop >= minScroll) {
      return true
    }
    return false
  }

  #scrollToBottom () {
    // Scroll (almost) to the bottom
    const scrollHeight = this.shadowRoot.querySelector('#chat-container').scrollHeight // Entire view, including off-screen
    const clientHeight = this.shadowRoot.querySelector('#chat-container').clientHeight // The visible view
    const inputHeight = this.shadowRoot.querySelector('#message-input').clientHeight // Height if the message input textarea
    const scrollTop = this.shadowRoot.querySelector('#chat-container').scrollTop

    const scrollTo = scrollHeight - clientHeight + (inputHeight - 128)

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
    dt.innerHTML = `<chatty-icon name="${iconName}" class="mx-auto h-6 w-6" />`
    containerEl.appendChild(dt)

    // Create the content dd
    const dd = document.createElement('dd')

    dd.classList.add(
      'message-content',
      'prose',
      'sm:col-span-11',
    )

    switch (chatMessage.role) {
      case 'system':
        dd.classList.add('text-gray-400')
        break
      default:
        dd.classList.add('text-gray-900')
    }


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

    let msg = this.shadowRoot.querySelector('textarea').value

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

    this.shadowRoot.querySelector('textarea').value = ''

    this.#scrollToBottom()

    this.#getResponseFromOpenAI()
  }

  #getTokenCount (str) {
    // This is currently just a rough estimate (1 token = ~4 chars), calculated according to:
    // https://platform.openai.com/tokenizer
    return parseInt(str.length / 4)
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

    let scrollAfter = this.#atBottom()
    const msgEl = this.#createChatMessageEl({ role: 'assistant', content: '' })
    this.shadowRoot.querySelector('dl').append(msgEl)

    // // Only scroll, if the user hasn't scrolled up (kinda like in a terminal window)
    // const scrollTo = scrollHeight - clientHeight + (inputHeight - 128)

    if (scrollAfter) {
      this.#scrollToBottom()
    }

    const msgContentEl = msgEl.querySelector('.message-content')

    const options = Object.assign({}, chat)
    delete options.name

    const lastMsgIdx = (chat.messages.push({ role: 'assistant', content: '' })) - 1

    // Try to keep around 1k - 2k tokens avilable for the response, depending on avilable tokens for the model.
    let reqMessages = []
    let curTokens = 0
    let availableTokens = tokenLimits[chat.model]
    let maxResponseTokens = (availableTokens === 4096) ? 1024 : 2048
    let maxTokens = availableTokens - maxResponseTokens

    // Always keep system message, if it exists.
    if (options.messages[0] && options.messages[0].role === 'system') {
      curTokens = this.#getTokenCount(JSON.stringify(options.messages[0]))
    }

    // Build the new request messages array
    for (let i = (options.messages.length - 1); i >= 0; i--) {
      const tokens = this.#getTokenCount(JSON.stringify(options.messages[i]))
      if ((curTokens + tokens) > maxTokens) {
        break
      }
      curTokens += tokens

      reqMessages.unshift(options.messages[i])
    }

    if (reqMessages.length && reqMessages[0].role === 'assistant') {
      reqMessages.shift()
    }

    if (options.messages[0] && options.messages[0].role === 'system') {
      reqMessages.unshift(options.messages[0])
    }

    options.messages = reqMessages

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
          scrollAfter = this.#atBottom()
          msgContentEl.innerHTML = this.#markdownToHTML(chat.messages[lastMsgIdx].content)
          if (scrollAfter) {
            this.#scrollToBottom()
          }
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
      console.log('no OpenAI!')
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

    const options = Object.assign({}, chat)

    options.messages.push({ role: 'user', content: 'Can you come up with a title for this chat? It should summarize the content in about 3 or 4 words.' })

    this.#completionAPI.create(options)
      .then((res) => {
        try {
          if (res.choices[0].message.content) {
            chat.name = res.choices[0].message.content
            chat.name = chat.name.replace(/^[^"]*"([^"]+)"[^"]*$/, '$1')
            chat.name = chat.name.replace(/Title:\s*/, '')
            if (chat.name.split(' ').length > 5) {
              chat.name = chat.name.split(' ').splice(0, 5).join(' ')
              chat.name += '...'
            }
            chat.messages.pop()
            localStorage.setItem(this.#chatID, JSON.stringify(chat))
            this.dispatchEvent(
              new CustomEvent('update-menu', { composed: true, bubbles: true })
            )

          }
        } catch (err) {
          // TODO: show a notification on error
          console.log(err)
          console.log(res)
        }
      })
      .catch((err) => {
        // TODO: show a notification on error
        console.log(err)
      })

  }
}

customElements.define('chat-view', ChatView)
