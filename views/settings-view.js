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
        <button type="submit" class="flex w-full justify-center rounded-md bg-teal-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">Save</button>
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
  </div>
</div>
`
  }

  connectedCallback () {
    this.updateView()

    const iconEye = this.shadowRoot.querySelector('#icon-eye')
    const saveButton = this.shadowRoot.querySelector('button')

    // Setup the input eye icon
    if (localStorage.getItem(this.#lsKeyName)) {
      iconEye.innerHTML = this.#iconEye
    } else {
      iconEye.innerHTML = this.#iconEyeSlash
    }

    iconEye.addEventListener('click', this.#toggleApiKeyVisibility.bind(this), { signal: this.#controller.signal })
    saveButton.addEventListener('click', this.#save.bind(this), { signal: this.#controller.signal })
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
      new CustomEvent('saved', { composed: true, bubbles: true })
    )
  }
}

customElements.define('settings-view', SettingsView)
