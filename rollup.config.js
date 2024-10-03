import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
    input: 'src/main.js',
    output: [
        {file: 'www/js/bundle.js', format: 'es'}
    ],
    plugins: [
        resolve(),
        replace({preventAssignment: true, 'process.env.NODE_ENV': '"production"'}),
        terser({module: true, ecma: 2020})
    ]
};
