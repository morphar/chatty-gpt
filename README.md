## Chatty GPT is a simple alternative to ChatGPT

It works by using the OpenAI chat completions API (e.g. gpt-3.5-turbo, gpt-4, etc.).
You will need to have (paid) access to this API.

Using gpt-4 through the API, is much faster than using ChatGPT plus and doesn't have message limits.  

All chats are kept in localStorage, so you won't be able to access them from any other browser or device, unless you use the export / import functionality.  

## Why?

This is meant as a learning experiment.  
I wanted to try out the OpenAI API and at the same time, I wanted to see how easy it would be, to write an interface in plain Web Components with Tailwind CSS.  
I wanted the development to be as simple as possible, preferably without any build steps and definitely NO npm packages.  
So just plain ol' load a file into your browser and start coding.  
The structure is currently a bit messy, as I have been trying out different things. 

This is the result!  
It runs entirely from GitHub pages, in-browser, with no external calls, except to the OpenAI API.

Unfortunately, TailwindCSS requires a build step, unless you want to load the entire CSS lib into your browser.  
So I accepted that I have to run a small tailwindcss CLI, that watches the code and rebuilds the CSS file on changes.

And to use imports, everything needs to be served as a proper website - I.e.: http://, not file:/// .  
So I have to run a small webserver (npx http-server) in this directory, when developing.  

At least these are FAST compared to using anything like Webpack, Vite, etc.  
And there is no build step - it's just a couple of small dev services.

## Conclusions (so far)

While it's possible to avoid frameworks, just by using Web Components, you don't need many external dependencies, before your life is simply easier. E.g. by using somethinh like [Vite](https://vitejs.dev).  
Vite will help you keep all external dependencies local (served by you) and up to date and enable hot reloading.

Using Web Components alone, will only work for modern browsers, so you might as well go Framework shopping, if you need to support any browser that is no longer supported by their creators (e.g. Internet Explorer, older Chrome, Safari, etc.).  

## TODO
 - [ ] It should be possible to delete a chat
 - [ ] Mark the active chat in the left menu
 - [ ] When creating a new chat, suggest system messages, based on previously used system messages
 - [ ] Make the list of chats searchable (simple header content, word comparison?)
 - [ ] Implement the moderation API
 - [ ] Add an abort controller to the OpenAI calls
 - [ ] Settings for the chat (including the name)
 - [ ] Make sure that changes to chat settings are used immediately after
 - [ ] Add notifications for success and error actions
 - [ ] (Re-)generate streaming response
 - [ ] Icon or button, to re-generate last response
 - [ ] Come up with an indicator for when the stream is done (or working - like the ... indicator that openai uses) 
 - [ ] Add header on code examples, should contain language and a copy button/link (:has doesn't work in firefox...)
 - [ ] Add a way to inject helpful prompts into system messages and messages. Start with the advice in the [Prompt Engineering Course](https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/)

## TODO later / maybe
 - [ ] Consider using the official [token counter](github.com/openai/tiktoken/tree/main) ([Rust source](https://github.com/openai/tiktoken/blob/main/src/lib.rs)?)
 - [ ] Add some template system messages (e.g. frontend developer, Go developer, marketing expert, ...)
 - [ ] Make it mobile friendly

## UI / UX TODO
 - [ ] Dismiss modals with [ESC]
 - [ ] Settings: Reflect that data has been cleared, right after clearing

