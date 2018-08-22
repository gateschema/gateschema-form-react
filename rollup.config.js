import pkg from './package.json'
import babel from 'rollup-plugin-babel'
import {uglify} from 'rollup-plugin-uglify'

export default [
  {
    input: 'src/index.js',
    plugins: [
      babel(),
      uglify()
    ],
    output: {
      name: 'GateSchemaForm',
      file: pkg.browser,
      globals: {
        'gateschema-transformer': 'GateSchemaTransformer',
        'react': 'React',
        'prop-types': 'PropTypes'
      },
      format: 'umd',
      sourcemap: true
    },
    external: ['gateschema-transformer', 'react', 'prop-types'],
  },
  {
    input: 'src/index.js',
    plugins: [
      babel()
    ],
    output: {
      format: 'cjs',
      file: pkg.main,
      sourcemap: true
    },
    external: ['gateschema-transformer', 'react', 'prop-types'],
  },
  {
    input: 'src/index.js',
    plugins: [
      babel()
    ],
    output: {
      format: 'es',
      file: pkg.module,
    },
    external: ['gateschema-transformer', 'react', 'prop-types']
  }
]

