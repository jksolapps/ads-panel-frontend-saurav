/** @format */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from '@svgr/rollup';
import purgecss from '@fullhuman/postcss-purgecss';
import path from 'path';

export default defineConfig({
	plugins: [
		react(),
		svgr({
			exportAsDefault: true,
		}),
	],
	resolve: {
		alias: {
			fs: path.resolve(__dirname, 'src/components/GeneralComponents/empty.js'),
		},
	},
	server: {
		port: 5000,
	},
	css: {
		postcss: {
			plugins: [
				purgecss({
					content: ['./index.html', './src/**/*.js', './src/**/*.jsx'],
					defaultExtractor: (content) => content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [],
					safelist: {
						deep: [
							/^rdr/,
							/^rdt/,
							/^svg/,
							/^spinner/,
							/^table/,
							/^custom/,
							/^page/,
							/^css/,
							/^canvasjs/,
							/^modal/,
							/^droppable/,
							/^Account/,
							/^swal2/,
							/^shepherd/,
							/^rmdp/,
							/^select/,
							/^country_prefix/,
							/^sort_header_key/,
							/^inner_sort/,
							/^outer_sort/,
							/^new_icon_class/,
							/^sort__active/,
							/^empty-leading-0/,
							/^hover-active/,
							/^default_sort_active/,
							/^day-box/,
							/^__rdt_custom_sort_icon__/,
							/^sort-icon-active/,
							/^general_select/,
						],
						keyframes: true,
						standard: [
							'active',
							'text-secondary',
							'dropdown-menu',
							'collapsed',
							'collapse',
							'modal',
							'show',
							'dropdown',
							'dropdown-toggle',
							'btn',
							'btn-primary',
							'progress-bar',
							'spinner-border',
							'canvasjs-chart-credit',
							'overview-select',
							'text-success',
						],
					},
				}),
			],
		},
	},
	build: {
		chunkSizeWarningLimit: 8000,
		commonjsOptions: {
			transformMixedEsModules: true,
		},
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('canvasjs')) {
						return null;
					}
					if (id.includes('node_modules')) {
						return 'vendor';
					}
				},
			},
		},
	},
});
