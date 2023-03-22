class ChattyMenu extends HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
<link href="css/global.min.css" rel="stylesheet">

<!-- Static sidebar for desktop -->
<div class="fixed inset-y-0 flex w-64 flex-col">
  <div class="flex min-h-0 flex-1 flex-col bg-gray-800">
    <div class="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
      <div class="flex flex-shrink-0 items-center px-4 text-gray-500">
        ChattyGPT
        <!-- <img class="h-8 w-auto" src="..."
          alt="Your Company"> -->
      </div>

      <nav class="mt-5 flex-1 space-y-1 px-2">
        <slot></slot>
      </nav>
    </div>

    <div class="flex flex-shrink-0 bg-gray-700 p-4 flex-col">
      <slot name="bottom"></slot>
    </div>
  </div>
</div>

    `
  }
}

customElements.define('chatty-menu', ChattyMenu)
