import { getBabelOutputPlugin } from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'

function applyTerser(outputs) {
  return outputs.flatMap((item) => [
    item,
    {
      ...item,
      file: item.file.replace(/\.(mjs|js)$/g, '.min.$1'),
      plugins: [...(item.plugins ?? []), terser({ compress: true })],
    },
  ])
}

export default {
  input: 'src/index.ts',
  output: applyTerser([
    // ES Module, straight TS to JS compilation
    {
      file: 'dist/index.esnext.mjs',
      format: 'esm',
      sourcemap: true,
    },
    // ES Module, transpiled to ES5
    {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: true,
      plugins: [
        getBabelOutputPlugin({
          presets: [['@babel/preset-env', { modules: false }]],
        }),
      ],
    },
    // UMD, transpiled to ES5
    {
      file: 'dist/index.js',
      format: 'esm',
      sourcemap: true,
      plugins: [
        getBabelOutputPlugin({
          moduleId: 'JsBridge',
          presets: [['@babel/preset-env', { modules: 'umd' }]],
        }),
      ],
    },
  ]),
  plugins: [
    typescript({ target: 'esnext', module: 'esnext', declaration: false }),
  ],
}
