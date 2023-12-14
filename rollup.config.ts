import { RollupOptions, ModuleFormat } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import swc from '@rollup/plugin-swc';
import pkg from './package.json' assert { type: 'json' };

enum FormatEnum {
  ESM = 'esm',
  CJS = 'cjs',
  IIFE = 'iife',
  UMD = 'umd',
}

const createConfig = ({
  output,
  min = false,
}: {
  output: { file: string; format: ModuleFormat };
  min?: boolean;
}) => {
  const swcPlugin = swc({
    swc: {
      minify: min,
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: false,
          decorators: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
        target: 'es5',
        minify: {
          sourceMap: true,
          compress: {
            defaults: true,
            pure_getters: 'strict',
            reduce_funcs: true,
            top_retain: null,
          },
          mangle: true,
        },
      },
      module: {
        type: output.format === FormatEnum.ESM ? 'es6' : 'commonjs',
        strict: true,
      },
    },
  });

  const plugins = [
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    nodeResolve({ extensions: ['.ts'] }),
    swcPlugin,
  ];

  return {
    input: 'src/perfume.ts',
    output: {
      file: output.file,
      format: output.format,
      name: 'Perfume',
      sourcemap: true,
    },
    watch: { include: 'dist/**' },
    plugins,
  };
};

const bundle: RollupOptions[] = [
  createConfig({
    output: { file: pkg.module, format: FormatEnum.ESM },
  }),
  createConfig({
    output: { file: pkg.main, format: FormatEnum.CJS },
  }),
  createConfig({
    output: { file: 'dist/perfume.esm.min.js', format: FormatEnum.ESM },
    min: true,
  }),
  createConfig({
    output: { file: 'dist/perfume.min.js', format: FormatEnum.CJS },
    min: true,
  }),
  createConfig({
    output: { file: pkg.iife, format: FormatEnum.IIFE },
  }),
  createConfig({
    output: { file: 'dist/perfume.iife.min.js', format: FormatEnum.IIFE },
    min: true,
  }),
  createConfig({
    output: { file: pkg.unpkg, format: FormatEnum.UMD },
  }),
  createConfig({
    output: { file: 'dist/perfume.umd.min.js', format: FormatEnum.UMD },
    min: true,
  }),
];

export default bundle;
