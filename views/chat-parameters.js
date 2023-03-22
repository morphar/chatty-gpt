class ChatParameters extends HTMLElement {
  static get observedAttributes () {
    return ['temperature', 'top_p', 'presence_penalty', 'frequency_penalty'];
  }

  constructor () {
    super()

    this.innerHTML = `
<div class="grid gap-y-6 gap-x-4 sm:grid-cols-6">
  <div class="sm:col-span-3">
    <label for="temperature" class="block text-sm font-medium leading-6 text-gray-900">temperature
      (randomness)</label>
    <div class="mt-2">
      <input type="number" value="1" min="0.1" max="1" step="0.01" name="temperature"
        id="temperature"
        class="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6">
    </div>
    <p class="mt-2 text-xs text-gray-500">
      Focused and deterministic (0.0) -&gt; random (1.0).<br>
      Recommended: change this or top_p but not both.<br>
    </p>
  </div>

  <div class="sm:col-span-3">
    <label for="top_p" class="block text-sm font-medium leading-6 text-gray-900">top_p
      (probability)</label>
    <div class="mt-2">
      <input type="number" value="1" min="0.01" max="1" step="0.01" name="top_p" id="top_p"
        class="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6">
    </div>
    <p class="mt-2 text-xs text-gray-500">
      Consider top 1% - 100% probability mass.<br>
      Recommended: change this or temperature but not both.
    </p>
  </div>

  <div class="sm:col-span-3">
    <label for="presence_penalty"
      class="block text-sm font-medium leading-6 text-gray-900">presence_penalty</label>
    <div class="mt-2">
      <input type="number" value="0" min="0" max="2" step="0.01" name="presence_penalty"
        id="presence_penalty"
        class="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6">
    </div>
    <p class="mt-2 text-xs text-gray-500">
      Penalize new tokens based on whether they appear in the text so far,<br>
      increasing the model's likelihood to talk about new topics.
    </p>
  </div>

  <div class="sm:col-span-3">
    <label for="frequency_penalty"
      class="block text-sm font-medium leading-6 text-gray-900">frequency_penalty</label>
    <div class="mt-2">
      <input type="number" value="0" min="0" max="2" step="0.01" name="frequency_penalty"
        id="frequency_penalty"
        class="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6">
    </div>
    <p class="mt-2 text-xs text-gray-500">
      Penalize new tokens based on their existing frequency in the text so far,<br>
      decreasing the model's likelihood to repeat the same line verbatim.
    </p>
  </div>
</div>
`
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }

    this.querySelector(`#${name}`).value = newValue
  }

}

customElements.define('chat-parameters', ChatParameters)
