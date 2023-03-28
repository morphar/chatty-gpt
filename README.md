## Chatty GPT is a simple alternative to ChatGPT

It works by using the OpenAI chat completions API (currently using the model: gpt-3.5-turbo).
You will need to have (paid) access to this API.

All chats are kept in localStorage, so you won't be able to access it from any other browser or device.  
I plan to make a simple export and import feature though.

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

While it's possible to avoid frameworks, just by using Web Components, you don't need many external dependencies, before your life is imply easier with something like [Vite](https://vitejs.dev).  
Vite will help you keep all external dependencies local (served by you) and up to date.

Using Web Components alone, will only work for modern browsers, so you might as well go Framework shopping, if you need to support any browser, that is no longer supported by their creators (e.g. Internet Explorer, older Chrome, Safari, etc.).  

## TODO
 - [ ] Currently, chats in the menu isn't ordered by create time - they should be
 - [ ] Add an abort controller to the OpenAI calls
 - [ ] Should "Return" send the message?
 - [ ] Minus icon is missing, when expanding "Advanced settings" in "Create a new chat"
 - [ ] Settings for the chat (including the name)
 - [ ] It should be possible to delete a chat
 - [ ] Make sure that changes to chat settings are used immediately after
 - [ ] Add notifications for success and error actions
 - [ ] (Re-)generate streaming response
 - [ ] Icon or button, to re-generate last response
 - [ ] Export all data from localStorage (expect key and id)
 - [ ] Import all data to localStorage (expect key and id)
 - [ ] Come up with an indicator for when the stream is done (or working - like the ... indicator that openai uses) 
 - [ ] Scroll when appropriate
   - [ ] Scroll to bottom on load
   - [ ] Scroll to bottom on stream (when already at bottom - check before inserting delta)
   - [ ] Scroll to bottom, when inserting new message
 - [ ] Add header on code examples, should contain language and a copy button/link (:has doesn't work in firefox...)

## Known issues
 - [ ] Various weird issues and overwrites - seems to be an issue with how localStorage is handled
 - [ ] "Create chat" button doesn't work after another chat was created
 - [ ] Running Chatty GPT in multiple tabs, causes weird issues like duplicate chats

## TODO later / maybe
 - [ ] Add some template system messages (e.g. frontend developer, Go developer, marketing expert, ...)

## UI / UX TODO
 - [ ] Dismiss modals with [ESC]
 - [ ] Settings: Reflect that data has been cleared, right after clearing

