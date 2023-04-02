import './chat-parameters.js'
import detectOS from '../js/detect-os.js'

class CreateChat extends HTMLElement {
  #controller

  constructor () {
    super()

    this.#controller = new AbortController()

    this.attachShadow({ mode: 'open' })

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


<div id="main-content" class="mx-auto max-w-4xl px-8 sm:px-6 py-6">

  <h1 class="text-2xl font-semibold text-gray-900">Create a new Chat</h1>

  <form class="space-y-8">
    <div>

      <div class="mt-6 grid gap-y-6 gap-x-4 sm:grid-cols-6">

        <div class="sm:col-span-6">
          <label for="country" class="block text-sm font-medium leading-6 text-gray-900">Model</label>
          <div class="mt-2">
            <select id="model" name="model"
              class="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6">
              <option selected value="gpt-3.5-turbo" selected>gpt-3.5-turbo</option>
              <option value="gpt-3.5-turbo-0301">gpt-3.5-turbo-0301</option>
              <option value="gpt-4">gpt-4</option>
              <option value="gpt-4-0314">gpt-4-0314</option>
              <option value="gpt-4-32k">gpt-4-32k</option>
              <option value="gpt-4-32k-0314">gpt-4-32k-0314</option>
            </select>
          </div>
        </div>

        <dl class="col-span-6 space-y-6 divide-y divide-white/10 p-2 bg-gray-200 bg-opacity-50">
          <div>
            <dt>
              <button type="button" id="toggle-advanced" class="flex w-full items-start justify-between text-left">
                <span class="text-base font-semibold leading-7">Advanced settings</span>
                <span class="ml-6 flex h-7 items-center">
                  <chatty-icon id="icon-plus" name="plus" class="h-6 w-6"></chatty-icon>
                  <chatty-icon id="icon-minus" name="minus" class="hidden h-6 w-6"></chatty-icon>
                </span>
              </button>
            </dt>

            <dd id="advanced-settings" class="hidden mt-6">
              <chat-parameters></chat-parameters>

              <div class="mt-6 sm:col-span-6">
                <label for="system" class="block text-sm font-medium leading-6 text-gray-900">System
                  Message</label>
                <div class="mt-2">
                  <textarea id="system" name="system" rows="3" placeholder="You are a helpful assistant."
                    class="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:py-1.5 sm:text-sm sm:leading-6"></textarea>
                </div>
                <p class="mt-2 text-xs text-gray-500">The system message helps set the behavior of the assistant.
                </p>
              </div>
            </dd>
          </div>
        </dl>

        <div class="sm:col-span-6">
          <label for="user" class="block text-sm font-medium leading-6 text-gray-900">First message
            (required)</label>
          <div class="mt-2 relative">
            <textarea id="user" name="user" rows="3" required
              placeholder="Which code editor is better? Emacs or vim?"
              class="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:py-1.5 sm:text-sm sm:leading-6"></textarea>
    <div class="absolute right-1 bottom-2.5 font-sans text-xs text-gray-400">
      ${submitShortcut}
    </div>

          </div>
          <!-- <p class="mt-2 text-xs text-gray-500">The first message helps set the behavior of the assistant.</p> -->
        </div>

      </div>
    </div>

    <div class="pt-5">
      <div class="flex justify-end">
        <button id="create-chat" type="submit"
          class="ml-3 inline-flex justify-center rounded-md bg-teal-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">Create chat</button>
      </div>
    </div>
  </form>
</div>
`
  }

  connectedCallback () {
    this.shadowRoot.querySelector('#toggle-advanced').addEventListener(
      'click',
      this.#toggleAdvanced.bind(this),
      { signal: this.#controller.signal }
    )

    this.shadowRoot.querySelector('form').addEventListener(
      'submit',
      this.#createChat.bind(this),
      { signal: this.#controller.signal }
    )

    this.shadowRoot.querySelector('textarea#user').addEventListener(
      'keydown',
      (evt) => {
        if ((evt.metaKey || evt.ctrlKey) && evt.key === 'Enter') {
          this.#createChat(evt)
        }
      },
      { signal: this.#controller.signal })
  }

  disconnectedCallback () {
    this.#controller.abort()
  }

  #toggleAdvanced (evt) {
    evt.preventDefault() // necessary?
    evt.stopPropagation() // necessary?

    const dd = this.shadowRoot.querySelector('#advanced-settings')
    const iconPlus = this.shadowRoot.querySelector('#icon-plus')
    const iconMinus = this.shadowRoot.querySelector('#icon-minus')

    if (dd.classList.contains('hidden')) {
      dd.classList.remove('hidden')
      iconPlus.classList.add('hidden')
      iconMinus.classList.remove('hidden')
    } else {
      dd.classList.add('hidden')
      iconPlus.classList.remove('hidden')
      iconMinus.classList.add('hidden')
    }
  }

  #createChat (evt) {
    evt.preventDefault()
    evt.stopPropagation()

    const chat = { messages: [], createdAt: new Date().getTime() }

    const formElements = this.shadowRoot.querySelector('form')

    for (let i = 0; i < formElements.length; i++) {
      if (formElements[i].name) {
        if (formElements[i].type === 'number') {
          chat[formElements[i].name] = parseFloat(formElements[i].value)
        } else if (formElements[i].value) {
          chat[formElements[i].name] = formElements[i].value
        }
      }
    }

    if (chat.system) {
      chat.messages.push({ 'role': 'system', 'content': chat.system })
      delete chat.system
    }

    if (chat.user) {
      chat.messages.push({ 'role': 'user', 'content': chat.user })
      delete chat.user
    }


    // This is only temporare and will be changed, after the first request
    const chatStr = JSON.stringify(chat)

    const chatID = `chat-${this.#randomString()}`

    localStorage.setItem(chatID, chatStr)

    this.dispatchEvent(
      new CustomEvent('created', { detail: chatID, composed: true, bubbles: true })
    )
  }

  // Move to a "utility" class
  #randomString (length = 8) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }
}

customElements.define('create-chat', CreateChat)
