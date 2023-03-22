class ChattyMenuItem extends HTMLElement {
  static get observedAttributes () {
    return ['href', 'target'];
  }

  constructor () {
    super()

    this.attachShadow({ mode: 'open' });

    let href = this.getAttribute('href')
    let target = this.getAttribute('target')

    this.shadowRoot.innerHTML = `
  <link href="css/global.min.css" rel="stylesheet">

  <a${href ? ` href="${href}"` : ''}${target ? ' target="' + target + '"' : ''}
    class="cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center rounded-md px-2 py-2 text-sm font-medium">
    <slot>Menu item</slot>
  </a>
    `
  }
}

customElements.define('chatty-menu-item', ChattyMenuItem)
