import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/plugin',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
})
