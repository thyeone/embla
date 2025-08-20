import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'EmblaKit',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'embla-carousel-react',
        'embla-carousel',
        'embla-carousel-autoplay',
        'embla-carousel-auto-scroll',
        'embla-carousel-auto-height',
        'clsx',
        'tailwind-merge',
      ],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.app.json',
      rollupTypes: true,
    }),
  ],
});
