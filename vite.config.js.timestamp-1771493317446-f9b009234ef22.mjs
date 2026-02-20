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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxKYXlcXFxcUHJvamVjdHNcXFxcRkUtUGFuZWxcXFxcd29ya1xcXFxqa3NvbEFkc0NsaWVudF8xMi0yOVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcSmF5XFxcXFByb2plY3RzXFxcXEZFLVBhbmVsXFxcXHdvcmtcXFxcamtzb2xBZHNDbGllbnRfMTItMjlcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L0pheS9Qcm9qZWN0cy9GRS1QYW5lbC93b3JrL2prc29sQWRzQ2xpZW50XzEyLTI5L3ZpdGUuY29uZmlnLmpzXCI7LyoqIEBmb3JtYXQgKi9cclxuXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xyXG5pbXBvcnQgc3ZnciBmcm9tICdAc3Znci9yb2xsdXAnO1xyXG5pbXBvcnQgcHVyZ2Vjc3MgZnJvbSAnQGZ1bGxodW1hbi9wb3N0Y3NzLXB1cmdlY3NzJztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG5cdHBsdWdpbnM6IFtcclxuXHRcdHJlYWN0KCksXHJcblx0XHRzdmdyKHtcclxuXHRcdFx0ZXhwb3J0QXNEZWZhdWx0OiB0cnVlLFxyXG5cdFx0fSksXHJcblx0XSxcclxuXHRyZXNvbHZlOiB7XHJcblx0XHRhbGlhczoge1xyXG5cdFx0XHRmczogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb21wb25lbnRzL0dlbmVyYWxDb21wb25lbnRzL2VtcHR5LmpzJyksXHJcblx0XHR9LFxyXG5cdH0sXHJcblx0c2VydmVyOiB7XHJcblx0XHRwb3J0OiA1MDAwLFxyXG5cdH0sXHJcblx0Y3NzOiB7XHJcblx0XHRwb3N0Y3NzOiB7XHJcblx0XHRcdHBsdWdpbnM6IFtcclxuXHRcdFx0XHRwdXJnZWNzcyh7XHJcblx0XHRcdFx0XHRjb250ZW50OiBbJy4vaW5kZXguaHRtbCcsICcuL3NyYy8qKi8qLmpzJywgJy4vc3JjLyoqLyouanN4J10sXHJcblx0XHRcdFx0XHRkZWZhdWx0RXh0cmFjdG9yOiAoY29udGVudCkgPT4gY29udGVudC5tYXRjaCgvW148PlwiJ2BcXHNdKltePD5cIidgXFxzOl0vZykgfHwgW10sXHJcblx0XHRcdFx0XHRzYWZlbGlzdDoge1xyXG5cdFx0XHRcdFx0XHRkZWVwOiBbXHJcblx0XHRcdFx0XHRcdFx0L15yZHIvLFxyXG5cdFx0XHRcdFx0XHRcdC9ecmR0LyxcclxuXHRcdFx0XHRcdFx0XHQvXnN2Zy8sXHJcblx0XHRcdFx0XHRcdFx0L15zcGlubmVyLyxcclxuXHRcdFx0XHRcdFx0XHQvXnRhYmxlLyxcclxuXHRcdFx0XHRcdFx0XHQvXmN1c3RvbS8sXHJcblx0XHRcdFx0XHRcdFx0L15wYWdlLyxcclxuXHRcdFx0XHRcdFx0XHQvXmNzcy8sXHJcblx0XHRcdFx0XHRcdFx0L15jYW52YXNqcy8sXHJcblx0XHRcdFx0XHRcdFx0L15tb2RhbC8sXHJcblx0XHRcdFx0XHRcdFx0L15kcm9wcGFibGUvLFxyXG5cdFx0XHRcdFx0XHRcdC9eQWNjb3VudC8sXHJcblx0XHRcdFx0XHRcdFx0L15zd2FsMi8sXHJcblx0XHRcdFx0XHRcdFx0L15zaGVwaGVyZC8sXHJcblx0XHRcdFx0XHRcdFx0L15ybWRwLyxcclxuXHRcdFx0XHRcdFx0XHQvXnNlbGVjdC8sXHJcblx0XHRcdFx0XHRcdFx0L15jb3VudHJ5X3ByZWZpeC8sXHJcblx0XHRcdFx0XHRcdFx0L15zb3J0X2hlYWRlcl9rZXkvLFxyXG5cdFx0XHRcdFx0XHRcdC9eaW5uZXJfc29ydC8sXHJcblx0XHRcdFx0XHRcdFx0L15vdXRlcl9zb3J0LyxcclxuXHRcdFx0XHRcdFx0XHQvXm5ld19pY29uX2NsYXNzLyxcclxuXHRcdFx0XHRcdFx0XHQvXnNvcnRfX2FjdGl2ZS8sXHJcblx0XHRcdFx0XHRcdFx0L15lbXB0eS1sZWFkaW5nLTAvLFxyXG5cdFx0XHRcdFx0XHRcdC9eaG92ZXItYWN0aXZlLyxcclxuXHRcdFx0XHRcdFx0XHQvXmRlZmF1bHRfc29ydF9hY3RpdmUvLFxyXG5cdFx0XHRcdFx0XHRcdC9eZGF5LWJveC8sXHJcblx0XHRcdFx0XHRcdFx0L15fX3JkdF9jdXN0b21fc29ydF9pY29uX18vLFxyXG5cdFx0XHRcdFx0XHRcdC9ec29ydC1pY29uLWFjdGl2ZS8sXHJcblx0XHRcdFx0XHRcdFx0L15nZW5lcmFsX3NlbGVjdC8sXHJcblx0XHRcdFx0XHRcdF0sXHJcblx0XHRcdFx0XHRcdGtleWZyYW1lczogdHJ1ZSxcclxuXHRcdFx0XHRcdFx0c3RhbmRhcmQ6IFtcclxuXHRcdFx0XHRcdFx0XHQnYWN0aXZlJyxcclxuXHRcdFx0XHRcdFx0XHQndGV4dC1zZWNvbmRhcnknLFxyXG5cdFx0XHRcdFx0XHRcdCdkcm9wZG93bi1tZW51JyxcclxuXHRcdFx0XHRcdFx0XHQnY29sbGFwc2VkJyxcclxuXHRcdFx0XHRcdFx0XHQnY29sbGFwc2UnLFxyXG5cdFx0XHRcdFx0XHRcdCdtb2RhbCcsXHJcblx0XHRcdFx0XHRcdFx0J3Nob3cnLFxyXG5cdFx0XHRcdFx0XHRcdCdkcm9wZG93bicsXHJcblx0XHRcdFx0XHRcdFx0J2Ryb3Bkb3duLXRvZ2dsZScsXHJcblx0XHRcdFx0XHRcdFx0J2J0bicsXHJcblx0XHRcdFx0XHRcdFx0J2J0bi1wcmltYXJ5JyxcclxuXHRcdFx0XHRcdFx0XHQncHJvZ3Jlc3MtYmFyJyxcclxuXHRcdFx0XHRcdFx0XHQnc3Bpbm5lci1ib3JkZXInLFxyXG5cdFx0XHRcdFx0XHRcdCdjYW52YXNqcy1jaGFydC1jcmVkaXQnLFxyXG5cdFx0XHRcdFx0XHRcdCdvdmVydmlldy1zZWxlY3QnLFxyXG5cdFx0XHRcdFx0XHRcdCd0ZXh0LXN1Y2Nlc3MnLFxyXG5cdFx0XHRcdFx0XHRdLFxyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHR9KSxcclxuXHRcdFx0XSxcclxuXHRcdH0sXHJcblx0fSxcclxuXHRidWlsZDoge1xyXG5cdFx0Y2h1bmtTaXplV2FybmluZ0xpbWl0OiA4MDAwLFxyXG5cdFx0Y29tbW9uanNPcHRpb25zOiB7XHJcblx0XHRcdHRyYW5zZm9ybU1peGVkRXNNb2R1bGVzOiB0cnVlLFxyXG5cdFx0fSxcclxuXHRcdHJvbGx1cE9wdGlvbnM6IHtcclxuXHRcdFx0b3V0cHV0OiB7XHJcblx0XHRcdFx0bWFudWFsQ2h1bmtzKGlkKSB7XHJcblx0XHRcdFx0XHRpZiAoaWQuaW5jbHVkZXMoJ2NhbnZhc2pzJykpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiAndmVuZG9yJztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LFxyXG5cdFx0XHR9LFxyXG5cdFx0fSxcclxuXHR9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUVBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsT0FBTyxjQUFjO0FBQ3JCLE9BQU8sVUFBVTtBQU5qQixJQUFNLG1DQUFtQztBQVF6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMzQixTQUFTO0FBQUEsSUFDUixNQUFNO0FBQUEsSUFDTixLQUFLO0FBQUEsTUFDSixpQkFBaUI7QUFBQSxJQUNsQixDQUFDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1IsT0FBTztBQUFBLE1BQ04sSUFBSSxLQUFLLFFBQVEsa0NBQVcsMkNBQTJDO0FBQUEsSUFDeEU7QUFBQSxFQUNEO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDUCxNQUFNO0FBQUEsRUFDUDtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0osU0FBUztBQUFBLE1BQ1IsU0FBUztBQUFBLFFBQ1IsU0FBUztBQUFBLFVBQ1IsU0FBUyxDQUFDLGdCQUFnQixpQkFBaUIsZ0JBQWdCO0FBQUEsVUFDM0Qsa0JBQWtCLENBQUMsWUFBWSxRQUFRLE1BQU0seUJBQXlCLEtBQUssQ0FBQztBQUFBLFVBQzVFLFVBQVU7QUFBQSxZQUNULE1BQU07QUFBQSxjQUNMO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLFlBQ0Q7QUFBQSxZQUNBLFdBQVc7QUFBQSxZQUNYLFVBQVU7QUFBQSxjQUNUO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsWUFDRDtBQUFBLFVBQ0Q7QUFBQSxRQUNELENBQUM7QUFBQSxNQUNGO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNOLHVCQUF1QjtBQUFBLElBQ3ZCLGlCQUFpQjtBQUFBLE1BQ2hCLHlCQUF5QjtBQUFBLElBQzFCO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDZCxRQUFRO0FBQUEsUUFDUCxhQUFhLElBQUk7QUFDaEIsY0FBSSxHQUFHLFNBQVMsVUFBVSxHQUFHO0FBQzVCLG1CQUFPO0FBQUEsVUFDUjtBQUNBLGNBQUksR0FBRyxTQUFTLGNBQWMsR0FBRztBQUNoQyxtQkFBTztBQUFBLFVBQ1I7QUFBQSxRQUNEO0FBQUEsTUFDRDtBQUFBLElBQ0Q7QUFBQSxFQUNEO0FBQ0QsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
