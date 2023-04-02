import { deepCompare, randomString } from '../js/utils.js'

class SettingsView extends HTMLElement {
  #controller

  // TODO: Make these names CONSTANTS somewhere?
  #lsKeyName = 'openai-apikey'
  #lsOrgIDName = 'openai-organizationid'

  #iconEye = `<chatty-icon name="eye" class="h-6 w-6"></chatty-icon>`
  #iconEyeSlash = `<chatty-icon name="eye-slash" class="h-6 w-6"></chatty-icon>`

  constructor () {
    super()

    this.#controller = new AbortController()

    this.attachShadow({ mode: 'open' })
  }

  updateView () {
    this.shadowRoot.innerHTML = `
<link href="css/global.min.css" rel="stylesheet">

<div class="bg-white shadow sm:rounded-lg">
  <div class="px-4 py-5 sm:p-6">
    <h3 class="mb-4 text-base font-semibold leading-6 text-gray-900">Set your OpenAI API Key</h3>
    <form class="space-y-6" action="#" method="POST">
      <div>
        <label for="${this.#lsKeyName}" class="block text-sm font-medium leading-6 text-gray-900">OpenAI API key</label>
        <div class="mt-2">
          <div class="relative w-full sm:max-w-xs rounded-md shadow-sm">
            <input type="${localStorage.getItem(this.#lsKeyName) ? 'password' : 'text'}"
              value="${localStorage.getItem(this.#lsKeyName) || ''}"
              name="${this.#lsKeyName}" id="${this.#lsKeyName}"
              class="block w-full rounded-md border-0 py-1.5 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6" placeholder="OpenAI API Key">
            <div id="icon-eye" class="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-3">
            </div>
          </div>
        </div>
      </div>

      <div>
        <label for="${this.#lsOrgIDName}" class="block text-sm font-medium leading-6 text-gray-900">OpenAI Organization ID (optional)</label>
        <div class="mt-2">
          <input type="text"
            value="${localStorage.getItem(this.#lsOrgIDName) || ''}"
            name="${this.#lsOrgIDName}" id="${this.#lsOrgIDName}"
            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6">
        </div>
      </div>

      <div>
        <button type="submit" id="save" name="save" class="flex w-full justify-center rounded-md bg-teal-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">Save</button>
      </div>
    </form>

    <div class="mt-6 max-w-xl text-left text-sm text-gray-500">
      <p class="m-2">
        You need an OpenAI account.<br>
        Create an account: <a href="https://platform.openai.com/"
          target="_blank"
          class="text-gray-600 hover:text-gray-900 font-medium">
        OpenAI Account</a>
      </p>
      <p class="m-2">
        Find and generate API keys: <a href="https://platform.openai.com/account/api-keys"
          target="_blank"
          class="text-gray-600 hover:text-gray-900 font-medium">
        OpenAI API keys</a>
      </p>
      <p class="m-2">
        Find Organization ID: <a href="https://platform.openai.com/account/org-settings"
          target="_blank"
          class="text-gray-600 hover:text-gray-900 font-medium">
        Organization settings</a>
      </p>
    </div>

    <form id="import-export" class="space-y-6" action="#" method="POST" enctype="multipart/form-data">
      <h4 class="mb-4 mt-6 text-base font-semibold leading-6 text-gray-900">Import / export chat history</h4>
      <div class="flex justify-between">
        <label for="import" class="cursor-pointer flex w-1/3 justify-center rounded-md bg-teal-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
          Import
        </label>
        <input id="import" name="import" type="file" multiple accept="application/json,.json" class="hidden"/>
        <!--<input id="import" name="import" type="file" accept="application/json,.json" class="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-teal-50 file:text-teal-700
          hover:file:bg-teal-100
        "/>-->

        <!-- <button type="submit" id="import" name="import" class="flex w-1/3 justify-center rounded-md bg-teal-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
          Import
        </button>-->
        <button type="submit" id="export" name="export" class="flex w-1/3 justify-center rounded-md bg-teal-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
          Export
        </button>
      </div>
    </form>

  </div>
</div>
`
  }

  connectedCallback () {
    this.updateView()

    const saveButton = this.shadowRoot.querySelector('button#save')
    const importInput = this.shadowRoot.querySelector('input#import')
    const exportButton = this.shadowRoot.querySelector('button#export')

    const iconEye = this.shadowRoot.querySelector('#icon-eye')
    // Setup the input eye icon
    if (localStorage.getItem(this.#lsKeyName)) {
      iconEye.innerHTML = this.#iconEye
    } else {
      iconEye.innerHTML = this.#iconEyeSlash
    }
    iconEye.addEventListener('click', this.#toggleApiKeyVisibility.bind(this), { signal: this.#controller.signal })

    saveButton.addEventListener('click', this.#save.bind(this), { signal: this.#controller.signal })
    // importButton.addEventListener('click', this.#save.bind(this), { signal: this.#controller.signal })
    exportButton.addEventListener('click', this.#exportChatHistory.bind(this), { signal: this.#controller.signal })

    importInput.addEventListener('change', this.#importChatHistory.bind(this), { signal: this.#controller.signal })
  }

  disconnectedCallback () {
    this.#controller.abort()
  }

  #toggleApiKeyVisibility () {
    const apiKeyInput = this.shadowRoot.querySelector(`#${this.#lsKeyName}`)
    const iconEye = this.shadowRoot.querySelector('#icon-eye')

    if (apiKeyInput.getAttribute('type') === 'password') {
      apiKeyInput.setAttribute('type', 'text')
      iconEye.innerHTML = this.#iconEyeSlash
    } else {
      apiKeyInput.setAttribute('type', 'password')
      iconEye.innerHTML = this.#iconEye
    }
  }

  #save (evt) {
    evt.preventDefault()
    evt.stopPropagation()

    const apiKeyInput = this.shadowRoot.querySelector(`#${this.#lsKeyName}`)
    localStorage.setItem(this.#lsKeyName, apiKeyInput.value)

    const orgIDInput = this.shadowRoot.querySelector(`#${this.#lsOrgIDName}`)
    localStorage.setItem(this.#lsOrgIDName, orgIDInput.value)

    this.dispatchEvent(
      new CustomEvent('done', { composed: true, bubbles: true })
    )
  }

  #exportChatHistory (evt) {
    evt.preventDefault()
    evt.stopPropagation()

    if (!localStorage.length) {
      return
    }

    // Extract all chats form localStorage
    let chats = []
    for (let i = 0, len = localStorage.length; i < len; i++) {
      const key = localStorage.key(i)
      if (key.substring(0, 5) !== 'chat-') {
        continue
      }

      let chat = localStorage.getItem(key)
      try {
        chat = JSON.parse(chat)
      } catch (e) {
        continue
      }

      if (!chat.name) {
        chat.name = key.substring(5)
      }

      chat.key = key

      chats.push(chat)
    }

    // Sort according to creation time
    chats.sort((chatA, chatB) => { return chatB.createdAt - chatA.createdAt })

    // Convert JSON object to a JSON string
    const jsonString = JSON.stringify({ chats: chats }, null, 2)

    // Create a Blob object with the JSON string
    const jsonBlob = new Blob([jsonString], { type: 'application/json' })

    // Create an anchor element with a download attribute
    const downloadAnchor = document.createElement('a')
    downloadAnchor.download = 'chatty-gpt-chats.json'
    downloadAnchor.href = URL.createObjectURL(jsonBlob)
    downloadAnchor.style.display = 'none'

    // Add the anchor element to the DOM
    document.body.appendChild(downloadAnchor)

    // Trigger the download by simulating a click event
    downloadAnchor.click()

    // Remove the anchor element from the DOM
    document.body.removeChild(downloadAnchor)

    this.dispatchEvent(
      new CustomEvent('done', { composed: true, bubbles: true })
    )
  }

  #importChatHistory (evt) {
    evt.preventDefault()
    evt.stopPropagation()

    // Get the FileList object from the event
    const files = evt.target.files

    // Iterate over the files
    for (const file of files) {
      // Initialize a new FileReader instance
      const fileReader = new FileReader()

      // Add an event listener for when the file is loaded
      fileReader.addEventListener('load', (loadEvt) => {
        // Get the import as JSON from the event
        let importJSON = null
        try {
          importJSON = JSON.parse(loadEvt.target.result)
        } catch (e) {
          console.log(e)
          return
        }

        // Check that there's actually any data in the import
        if (!importJSON.chats || !importJSON.chats.length) {
          return
        }

        // Iterate over the chats
        for (let i = 0; i < importJSON.chats.length; i++) {
          try {
            let newChat = importJSON.chats[i]
            const key = newChat.key
            delete newChat.key

            // Check if the chat already exists
            const curChat = localStorage.getItem(key)
            if (!curChat) {
              localStorage.setItem(key, JSON.stringify(newChat))

            } else {
              // Parse the chat into a JSON object
              const cur = JSON.parse(curChat)

              // Check the chat messages.
              // If they're the same, but with more messages in the import, the local version is updated.
              // If not, the import is created as a new chat.

              let update = true
              for (let i = 0; i < cur.messages.length; i++) {
                if (!deepCompare(cur.messages[i], newChat.messages[i])) {
                  update = false
                  break
                }
              }

              if (update) {
                cur.messages = newChat.messages
                localStorage.setItem(key, JSON.stringify(cur))
              } else {
                const chatID = `chat-${randomString()}`
                localStorage.setItem(chatID, JSON.stringify(newChat))
              }
            }

          } catch (e) {
            console.log(e)
            continue
          }
        }

        this.dispatchEvent(
          new CustomEvent('done', { composed: true, bubbles: true })
        )
      }, { signal: this.#controller.signal })

      // Read the file as text
      fileReader.readAsText(file)
    }
  }
}

customElements.define('settings-view', SettingsView)
