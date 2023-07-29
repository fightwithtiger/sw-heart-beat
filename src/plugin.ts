import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, normalize, resolve } from 'path'
import { fileURLToPath } from 'url'
import type { PluginOption } from 'vite'
import type { SWPluginOptions } from './types'

const FILE_NAME = 'sw.js'

export default function SWPlugin(options: SWPluginOptions = {}): PluginOption {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const path = resolve(__dirname, FILE_NAME)
  const content = readFileSync(path, 'utf8')
  const { output = '/sw.js' } = options
  const normalOutput = normalize(output)

  return {
    name: 'sw-heart-beat-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === output) {
          res.setHeader('Content-Type', 'text/javascript')
          res.end(content)
        } else {
          next()
        }
      })
    },
    writeBundle(config) {
      const outputDir = config.dir || '/dist'
      const folderPath = outputDir + dirname(normalOutput)
      if (!existsSync(folderPath)) {
        mkdirSync(folderPath)
      }
      writeFileSync(`${outputDir}${normalOutput}`, content)
    },
  }
}
