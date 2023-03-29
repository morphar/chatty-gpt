// Some example messages.

// The messages parsed param, should look something like this:
// const messages = [
//   { "role": "system", "content": "You are a helpful assistant." },
//   { "role": "user", "content": "Who won the world series in 2020?" },
//   { "role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020." },
//   { "role": "user", "content": "Where was it played?" }
// ]

// Simple response example:

// const completion = new ChatCompletion(apiKey, organizationID)
// completion.create(ChatCompletion.GPT3Dot5Turbo, messages, {})
//   .then((msg) => {
//     console.log(msg)
//   })
//   .catch((err) => {
//     console.log(err)
//   })

// Streaming response example:

// completion.createStream(ChatCompletion.GPT3Dot5Turbo, messages, {}, (deltaMsg) => {
//   console.log(deltaMsg)
// })
//   .then((finalMsg) => {
//     console.log(finalMsg)
//   })
//   .catch((err) => {
//     console.log(err)
//   })

export class OpenAI {
  static GPT3Dot5Turbo = 'gpt-3.5-turbo'

  baseURL = 'https://api.openai.com/v1'
  apiKey
  organizationID = ''

  constructor (apiKey, organizationID) {
    // TODO: Make a better check than just something being present
    if (!apiKey) {
      throw new Error('no OpenAI API Key provided')
    }
    this.apiKey = apiKey

    if (organizationID) {
      this.organizationID = organizationID
    }
  }

  #getHeaders () {
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    }

    if (this.organizationID) {
      headers['OpenAI-Organization'] = this.organizationID
    }

    return headers
  }

  get (url) {
    return fetch(url, {
      method: 'GET',
      headers: this.#getHeaders()
    })
  }

  post (url, body) {
    let bodyStr = body
    if (typeof body !== 'string') {
      bodyStr = JSON.stringify(body)
    }

    return fetch(url, {
      method: 'POST',
      headers: this.#getHeaders(),
      body: bodyStr
    })
  }
}

// Params:
// model
// messages
// temperature
// top_p
// n // Don't use this, it currently gives an error, if set (at least if set to 2)
// stream
// stop
// max_tokens
// presence_penalty
// frequency_penalty
// logit_bias
// user

// Documentation:
// https://platform.openai.com/docs/api-reference/chat/create
export class ChatCompletion extends OpenAI {
  endpoint

  constructor (apiKey, organizationID) {
    super(apiKey, organizationID)
    this.endpoint = this.baseURL + '/chat/completions'
  }

  async create (options) {
    options = options || {}

    delete options.name
    delete options.createdAt
    delete options.stream

    return await this.post(this.endpoint, options).then((res) => res.json())
  }

  #buildResultFromStream (streamMessages) {
    if (!streamMessages || !streamMessages.length) {
      return null
    }

    let res = {
      id: streamMessages[0].id,
      object: 'chat.completion',
      created: streamMessages[0].created,
      model: streamMessages[0].model,
      choices: []
    }

    for (let i = 0, len1 = streamMessages.length; i < len1; i++) {
      const msg = streamMessages[i]

      for (let n = 0, len2 = msg.choices.length; n < len2; n++) {
        const choice = msg.choices[n]

        if (!res.choices[choice.index]) {
          res.choices[choice.index] = {
            message: {
              role: '',
              content: ''
            },
            finish_reason: 'stop',
            index: choice.index
          }
        }

        if (choice.delta) {
          for (let key of Object.keys(choice.delta)) {
            res.choices[choice.index].message[key] += choice.delta[key]
          }
        }
      }
    }

    return res
  }

  #reDataLine = /^data: ({[^\n]*)\r?\n$/mig

  async createStream (options, cb) {
    options = options || {}

    delete options.name
    delete options.createdAt

    options.stream = true

    const response = await this.post(this.endpoint, options)

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    let buffer = '';
    let allMessages = []

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        return this.#buildResultFromStream(allMessages)
      }

      // In seems like it should be fine, to just match on the chunks...
      // But in theory, a chunk could split a message in over multiple chunks,
      // therefore a buffer is used.
      const chunk = decoder.decode(value);
      buffer += chunk;

      const matches = buffer.matchAll(this.#reDataLine)

      for (const match of matches) {
        buffer = buffer.replace(match[0], '')

        const jsonMsg = JSON.parse(match[1])
        allMessages.push(jsonMsg)
        if (cb && typeof cb === 'function') {
          cb(jsonMsg)
        }
      }
    }

  }
}
