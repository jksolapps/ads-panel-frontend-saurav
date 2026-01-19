// vite.config.js
import { defineConfig } from "file:///E:/Jay/Projects/FE-Panel/work/jksolAdsClient_12-29/node_modules/vite/dist/node/index.js";
import react from "file:///E:/Jay/Projects/FE-Panel/work/jksolAdsClient_12-29/node_modules/@vitejs/plugin-react/dist/index.js";
import svgr from "file:///E:/Jay/Projects/FE-Panel/work/jksolAdsClient_12-29/node_modules/@svgr/rollup/dist/index.js";
import purgecss from "file:///E:/Jay/Projects/FE-Panel/work/jksolAdsClient_12-29/node_modules/@fullhuman/postcss-purgecss/lib/postcss-purgecss.js";
import path from "path";
var __vite_injected_original_dirname = "E:\\Jay\\Projects\\FE-Panel\\work\\jksolAdsClient_12-29";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    svgr({
      exportAsDefault: true
    })
  ],
  resolve: {
    alias: {
      fs: path.resolve(__vite_injected_original_dirname, "src/components/GeneralComponents/empty.js")
    }
  },
  server: {
    host: true,
    port: 5e3
  },
  css: {
    postcss: {
      plugins: [
        purgecss({
          content: ["./index.html", "./src/**/*.js", "./src/**/*.jsx"],
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
              /^general_select/
            ],
            keyframes: true,
            standard: [
              "active",
              "text-secondary",
              "dropdown-menu",
              "collapsed",
              "collapse",
              "modal",
              "show",
              "dropdown",
              "dropdown-toggle",
              "btn",
              "btn-primary",
              "progress-bar",
              "spinner-border",
              "canvasjs-chart-credit",
              "overview-select",
              "text-success"
            ]
          }
        })
      ]
    }
  },
  build: {
    chunkSizeWarningLimit: 8e3,
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("canvasjs")) {
            return null;
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxKYXlcXFxcUHJvamVjdHNcXFxcRkUtUGFuZWxcXFxcd29ya1xcXFxqa3NvbEFkc0NsaWVudF8xMi0yOVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcSmF5XFxcXFByb2plY3RzXFxcXEZFLVBhbmVsXFxcXHdvcmtcXFxcamtzb2xBZHNDbGllbnRfMTItMjlcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L0pheS9Qcm9qZWN0cy9GRS1QYW5lbC93b3JrL2prc29sQWRzQ2xpZW50XzEyLTI5L3ZpdGUuY29uZmlnLmpzXCI7LyoqIEBmb3JtYXQgKi9cblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHN2Z3IgZnJvbSAnQHN2Z3Ivcm9sbHVwJztcbmltcG9ydCBwdXJnZWNzcyBmcm9tICdAZnVsbGh1bWFuL3Bvc3Rjc3MtcHVyZ2Vjc3MnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG5cdHBsdWdpbnM6IFtcblx0XHRyZWFjdCgpLFxuXHRcdHN2Z3Ioe1xuXHRcdFx0ZXhwb3J0QXNEZWZhdWx0OiB0cnVlLFxuXHRcdH0pLFxuXHRdLFxuXHRyZXNvbHZlOiB7XG5cdFx0YWxpYXM6IHtcblx0XHRcdGZzOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NvbXBvbmVudHMvR2VuZXJhbENvbXBvbmVudHMvZW1wdHkuanMnKSxcblx0XHR9LFxuXHR9LFxuXHRzZXJ2ZXI6IHtcblx0XHRob3N0OiB0cnVlLFxuXHRcdHBvcnQ6IDUwMDAsXG5cdH0sXG5cdGNzczoge1xuXHRcdHBvc3Rjc3M6IHtcblx0XHRcdHBsdWdpbnM6IFtcblx0XHRcdFx0cHVyZ2Vjc3Moe1xuXHRcdFx0XHRcdGNvbnRlbnQ6IFsnLi9pbmRleC5odG1sJywgJy4vc3JjLyoqLyouanMnLCAnLi9zcmMvKiovKi5qc3gnXSxcblx0XHRcdFx0XHRkZWZhdWx0RXh0cmFjdG9yOiAoY29udGVudCkgPT4gY29udGVudC5tYXRjaCgvW148PlwiJ2BcXHNdKltePD5cIidgXFxzOl0vZykgfHwgW10sXG5cdFx0XHRcdFx0c2FmZWxpc3Q6IHtcblx0XHRcdFx0XHRcdGRlZXA6IFtcblx0XHRcdFx0XHRcdFx0L15yZHIvLFxuXHRcdFx0XHRcdFx0XHQvXnJkdC8sXG5cdFx0XHRcdFx0XHRcdC9ec3ZnLyxcblx0XHRcdFx0XHRcdFx0L15zcGlubmVyLyxcblx0XHRcdFx0XHRcdFx0L150YWJsZS8sXG5cdFx0XHRcdFx0XHRcdC9eY3VzdG9tLyxcblx0XHRcdFx0XHRcdFx0L15wYWdlLyxcblx0XHRcdFx0XHRcdFx0L15jc3MvLFxuXHRcdFx0XHRcdFx0XHQvXmNhbnZhc2pzLyxcblx0XHRcdFx0XHRcdFx0L15tb2RhbC8sXG5cdFx0XHRcdFx0XHRcdC9eZHJvcHBhYmxlLyxcblx0XHRcdFx0XHRcdFx0L15BY2NvdW50Lyxcblx0XHRcdFx0XHRcdFx0L15zd2FsMi8sXG5cdFx0XHRcdFx0XHRcdC9ec2hlcGhlcmQvLFxuXHRcdFx0XHRcdFx0XHQvXnJtZHAvLFxuXHRcdFx0XHRcdFx0XHQvXnNlbGVjdC8sXG5cdFx0XHRcdFx0XHRcdC9eY291bnRyeV9wcmVmaXgvLFxuXHRcdFx0XHRcdFx0XHQvXnNvcnRfaGVhZGVyX2tleS8sXG5cdFx0XHRcdFx0XHRcdC9eaW5uZXJfc29ydC8sXG5cdFx0XHRcdFx0XHRcdC9eb3V0ZXJfc29ydC8sXG5cdFx0XHRcdFx0XHRcdC9ebmV3X2ljb25fY2xhc3MvLFxuXHRcdFx0XHRcdFx0XHQvXnNvcnRfX2FjdGl2ZS8sXG5cdFx0XHRcdFx0XHRcdC9eZW1wdHktbGVhZGluZy0wLyxcblx0XHRcdFx0XHRcdFx0L15ob3Zlci1hY3RpdmUvLFxuXHRcdFx0XHRcdFx0XHQvXmRlZmF1bHRfc29ydF9hY3RpdmUvLFxuXHRcdFx0XHRcdFx0XHQvXmRheS1ib3gvLFxuXHRcdFx0XHRcdFx0XHQvXl9fcmR0X2N1c3RvbV9zb3J0X2ljb25fXy8sXG5cdFx0XHRcdFx0XHRcdC9ec29ydC1pY29uLWFjdGl2ZS8sXG5cdFx0XHRcdFx0XHRcdC9eZ2VuZXJhbF9zZWxlY3QvLFxuXHRcdFx0XHRcdFx0XSxcblx0XHRcdFx0XHRcdGtleWZyYW1lczogdHJ1ZSxcblx0XHRcdFx0XHRcdHN0YW5kYXJkOiBbXG5cdFx0XHRcdFx0XHRcdCdhY3RpdmUnLFxuXHRcdFx0XHRcdFx0XHQndGV4dC1zZWNvbmRhcnknLFxuXHRcdFx0XHRcdFx0XHQnZHJvcGRvd24tbWVudScsXG5cdFx0XHRcdFx0XHRcdCdjb2xsYXBzZWQnLFxuXHRcdFx0XHRcdFx0XHQnY29sbGFwc2UnLFxuXHRcdFx0XHRcdFx0XHQnbW9kYWwnLFxuXHRcdFx0XHRcdFx0XHQnc2hvdycsXG5cdFx0XHRcdFx0XHRcdCdkcm9wZG93bicsXG5cdFx0XHRcdFx0XHRcdCdkcm9wZG93bi10b2dnbGUnLFxuXHRcdFx0XHRcdFx0XHQnYnRuJyxcblx0XHRcdFx0XHRcdFx0J2J0bi1wcmltYXJ5Jyxcblx0XHRcdFx0XHRcdFx0J3Byb2dyZXNzLWJhcicsXG5cdFx0XHRcdFx0XHRcdCdzcGlubmVyLWJvcmRlcicsXG5cdFx0XHRcdFx0XHRcdCdjYW52YXNqcy1jaGFydC1jcmVkaXQnLFxuXHRcdFx0XHRcdFx0XHQnb3ZlcnZpZXctc2VsZWN0Jyxcblx0XHRcdFx0XHRcdFx0J3RleHQtc3VjY2VzcycsXG5cdFx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0pLFxuXHRcdFx0XSxcblx0XHR9LFxuXHR9LFxuXHRidWlsZDoge1xuXHRcdGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogODAwMCxcblx0XHRjb21tb25qc09wdGlvbnM6IHtcblx0XHRcdHRyYW5zZm9ybU1peGVkRXNNb2R1bGVzOiB0cnVlLFxuXHRcdH0sXG5cdFx0cm9sbHVwT3B0aW9uczoge1xuXHRcdFx0b3V0cHV0OiB7XG5cdFx0XHRcdG1hbnVhbENodW5rcyhpZCkge1xuXHRcdFx0XHRcdGlmIChpZC5pbmNsdWRlcygnY2FudmFzanMnKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcblx0XHRcdFx0XHRcdHJldHVybiAndmVuZG9yJztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdH0sXG5cdH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFFQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sY0FBYztBQUNyQixPQUFPLFVBQVU7QUFOakIsSUFBTSxtQ0FBbUM7QUFRekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDM0IsU0FBUztBQUFBLElBQ1IsTUFBTTtBQUFBLElBQ04sS0FBSztBQUFBLE1BQ0osaUJBQWlCO0FBQUEsSUFDbEIsQ0FBQztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNSLE9BQU87QUFBQSxNQUNOLElBQUksS0FBSyxRQUFRLGtDQUFXLDJDQUEyQztBQUFBLElBQ3hFO0FBQUEsRUFDRDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1A7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNKLFNBQVM7QUFBQSxNQUNSLFNBQVM7QUFBQSxRQUNSLFNBQVM7QUFBQSxVQUNSLFNBQVMsQ0FBQyxnQkFBZ0IsaUJBQWlCLGdCQUFnQjtBQUFBLFVBQzNELGtCQUFrQixDQUFDLFlBQVksUUFBUSxNQUFNLHlCQUF5QixLQUFLLENBQUM7QUFBQSxVQUM1RSxVQUFVO0FBQUEsWUFDVCxNQUFNO0FBQUEsY0FDTDtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxZQUNEO0FBQUEsWUFDQSxXQUFXO0FBQUEsWUFDWCxVQUFVO0FBQUEsY0FDVDtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLFlBQ0Q7QUFBQSxVQUNEO0FBQUEsUUFDRCxDQUFDO0FBQUEsTUFDRjtBQUFBLElBQ0Q7QUFBQSxFQUNEO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTix1QkFBdUI7QUFBQSxJQUN2QixpQkFBaUI7QUFBQSxNQUNoQix5QkFBeUI7QUFBQSxJQUMxQjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2QsUUFBUTtBQUFBLFFBQ1AsYUFBYSxJQUFJO0FBQ2hCLGNBQUksR0FBRyxTQUFTLFVBQVUsR0FBRztBQUM1QixtQkFBTztBQUFBLFVBQ1I7QUFDQSxjQUFJLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFDaEMsbUJBQU87QUFBQSxVQUNSO0FBQUEsUUFDRDtBQUFBLE1BQ0Q7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
