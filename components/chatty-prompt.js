class ChattyPrompt extends HTMLElement {
  static get observedAttributes () {
    return ['visible'];
  }

  constructor () {
    super()

    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
  <link href="css/global.min.css" rel="stylesheet">

  <div id="chatty-prompt" class="hidden relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

    <div class="fixed inset-0 z-10 overflow-y-auto">
      <div id="chatty-overlay" class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <slot name="icon">
                <chatty-icon name="trash" class="h-6 w-6 text-red-600"></chatty-icon>
              </slot>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                <slot name="title">Title</slot>
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  <slot name="description">Description.</slot>
                </p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button id="ok-button" type="button" class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto">
              <slot name="ok-label">Yep! Do it!</slot>
            </button>
            <button id="cancel-button" type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">
              <slot name="cancel-label">Ooops! No thanks.</slot>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
    `
  }

  connectedCallback () {
    this.shadowRoot.querySelector('div').addEventListener('click', this.#hide.bind(this));
    this.shadowRoot.querySelector('#cancel-button').addEventListener('click', this.#hide.bind(this));
    this.shadowRoot.querySelector('#ok-button').addEventListener('click', (evt) => {
      this.dispatchEvent(new CustomEvent('ok', { composed: true, bubbles: true }))
    });
  }

  disconnectedCallback () {
    this.shadowRoot.querySelector('div').removeEventListener('click', this.#hide.bind(this));
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }

    if (name === 'visible') {
      if (!newValue || newValue === 'false') {
        this.shadowRoot.querySelector('div').classList.add('hidden')
      } else {
        this.shadowRoot.querySelector('div').classList.remove('hidden')
      }
    }
  }

  #hide (evt) {
    if (evt.target.id === 'chatty-overlay' || evt.target.id === 'cancel-button' || evt.target.slot === 'cancel-label') {
      evt.preventDefault()
      evt.stopPropagation()
      this.setAttribute('visible', false)
    }
  }
}

customElements.define('chatty-prompt', ChattyPrompt)
