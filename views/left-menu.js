import '../components/chatty-menu-item.js'
import '../components/chatty-menu.js'
import '../components/chatty-icon.js'

class LeftMenu extends HTMLElement {
  #controller

  constructor () {
    super()

    this.#controller = new AbortController()

    this.innerHTML = `
<!-- Menu Container -->

<chatty-menu>
  <chatty-menu-item id="menu-item-create-chat">
    <chatty-icon name="plus-circle" class="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6 flex-shrink-0">
    </chatty-icon>
    Create a new chat
  </chatty-menu-item>

  <span id="menu-chat-items"></span>

  <!-- Bottom menu items -->

  <span slot="bottom">
    <!-- <chatty-menu-item id="menu-item-about">
      <chatty-icon name="information-circle"
        class="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6 flex-shrink-0">
      </chatty-icon>
      About
    </chatty-menu-item> -->

    <chatty-menu-item id="menu-item-github">
      <a href="https://github.com/morphar/chatty-gpt" target="_blank" class=" group-hover:text-gray-500 group flex items-center">
        <chatty-icon name="github" class="text-gray-400 group-hover:text-gray-400 mr-3 h-6 w-6 flex-shrink-0">
        </chatty-icon>
        GitHub
      </a>
    </chatty-menu-item>

    <chatty-menu-item id="menu-item-settings">
      <chatty-icon name="cog-6-tooth" class="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6 flex-shrink-0">
      </chatty-icon>
      Settings
    </chatty-menu-item>

    <chatty-menu-item id="menu-item-clear">
      <chatty-icon name="trash" class="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6 flex-shrink-0">
      </chatty-icon>
      Clear everything
    </chatty-menu-item>
  </span>

</chatty-menu>
`
  }

  update () {
    this.#updateChatItems()
  }

  connectedCallback () {
    this.#updateChatItems()

    for (const menuItem of this.querySelectorAll('chatty-menu-item')) {
      if (menuItem.id) {
        if (menuItem.id.substring(0, 10) === 'menu-item-') {
          menuItem.addEventListener('click', (evt) => {
            this.dispatchEvent(new CustomEvent(menuItem.id.substring(10), { detail: menuItem.id, composed: true, bubbles: true }))
          }, { signal: this.#controller.signal })

        } else if (menuItem.id.substring(0, 5) === 'chat-') {
          menuItem.addEventListener('click', (evt) => {
            this.dispatchEvent(new CustomEvent('chat', { detail: menuItem.id, composed: true, bubbles: true }))
          }, { signal: this.#controller.signal })

        } else {
          menuItem.addEventListener('click', (evt) => {
            this.dispatchEvent(new CustomEvent(menuItem.id, { composed: true, bubbles: true }))
          }, { signal: this.#controller.signal })
        }
      }
    }

    // This will ensure, that the menu gets updated, if another tab adds a chat.
    // This seems to happen on document load as well.
    window.addEventListener('storage', this.#updateChatItems.bind(this), { signal: this.#controller.signal })
  }

  disconnectedCallback () {
    this.#controller.abort()
  }

  #updateChatItems (evt) {
    if (!localStorage.length) {
      return
    }

    const chatItems = this.querySelector('#menu-chat-items')
    chatItems.innerHTML = ''

    for (let i = 0, len = localStorage.length; i < len; i++) {
      const key = localStorage.key(i)
      if (key.substring(0, 5) !== 'chat-') {
        continue
      }

      let item = localStorage.getItem(key)
      try {
        item = JSON.parse(item)
      } catch (e) {
        continue
      }

      const menuItem = document.createElement('chatty-menu-item')
      menuItem.id = key
      menuItem.innerHTML = `
<chatty-icon
  name="chat-bubble-left-right"
  class="text-gray-400 group-hover:text-gray-500 mr-3 h-6 w-6 flex-shrink-0">
</chatty-icon>
${item.name ? item.name : key.substring(5)}
    `

      chatItems.appendChild(menuItem)

    }
  }
}

customElements.define('left-menu', LeftMenu)
