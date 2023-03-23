import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'

export default {
  input: 'index.js',
  output: {
    name: 'bundle',
    file: 'public/bundle.js',
    format: 'iife',
  },
  plugins: [resolve(), commonjs()],
}
