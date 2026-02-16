# Transpic v2

This is a desktop application (electron) use to convert and compress images. It's currently under construction, you can preview these changes [here](https://transpic-v2.vercel.app/).

## Why v2?

I've actually created this desktop app in python already but I wanted to create it in Javascript with better tools and more features.

## Tech Stack

- [Vue 3 (with Typescript)](https://vuejs.org/guide/quick-start.html)
  - Single File Component (SFC) with setup <script>
  - Auto Import
  - Vue Component
  - Vue Dev tools
  - Webfont DL
- [Icons](https://icones.js.org/) - I used Tabler Icons
- [TailwindCSS](https://tailwindcss.com/)
- [Vueuse/Core](https://vueuse.org/)

## How to Run

Navigate to root folder for the project, and install the dependencies. Afterwards, you can either run the dev server or build the static files for production and run the preview version of production.

```sh
# Install dependencies
pnpm install

# Run dev mode
pnpm dev

# Build for production
pnpm build

# Preview Production
pnpm preview
```
