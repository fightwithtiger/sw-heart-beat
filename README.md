# sw-heart-beat

[![NPM version](https://img.shields.io/npm/v/sw-heart-beat?color=a1b858&label=)](https://www.npmjs.com/package/sw-heart-beat)

WIP

sw-heart-beat is working for detecting page crash when out of memory, and report it.

support vue, react and more with vite.

## Usage
### register
main.tsx or index.ts
```ts
import { registerSw } from 'sw-heart-beat'

registerSw({
  output: '/aa/crash.js',
  scope: '/aa/',
  params: {
    ... // any parameter: key: value
  }
})
```
subscribe it in your page code:
page1.tsx
```ts
import { subscribe } from 'sw-heart-beat'

useEffect(() => {
  const unsubscribe = subscribe()
  return () => {
    unsubscribe()
  }
}, [])
```

vite.config.ts
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import SWPlugin from 'sw-heart-beat/plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    SWPlugin({
      output: '/aa/crash.js',
    })
  ],
})
```

## Development
```bash
pnpm install
pnpm run dev
pnpm build
```

## License

[MIT](./LICENSE) License © 2022 [fightwithtiger](https://github.com/fightwithtiger)
