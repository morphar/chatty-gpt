class ChattyModal extends HTMLElement {
  static get observedAttributes () {
    return ['visible'];
  }

  constructor () {
    super()

    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
<link href="css/global.min.css" rel="stylesheet">

<div class="hidden relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

  <div class="fixed inset-0 z-10 overflow-y-auto">
    <div id="chatty-overlay" class="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
      <slot></slot>
    </div>
  </div>
</div>
`
  }

  connectedCallback () {
    this.shadowRoot.querySelector('#chatty-overlay').addEventListener('click', this.#hide.bind(this));
  }

  disconnectedCallback () {
    this.shadowRoot.querySelector('#chatty-overlay').removeEventListener('click', this.#hide.bind(this));
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
    if (evt.target.id === 'chatty-overlay') {
      evt.preventDefault()
      evt.stopPropagation()
      this.setAttribute('visible', false)
    }
  }
}

customElements.define('chatty-modal', ChattyModal)
