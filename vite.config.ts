import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills'


export default defineConfig({
	plugins: [
		nodePolyfills({
			// include: ["buffer", "stream", "util", "fs", "path"],
			overrides: {
				// Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
				fs: 'memfs',
			},
			// globals: {
			// 	Buffer: true, // can also be 'build', 'dev', or false
			// 	global: true,
			// 	process: true,
			// },

		})
		, sveltekit()
	],
	ssr: {
		external: ["html5-qrcode"]
	}
});

