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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxKYXlcXFxcUHJvamVjdHNcXFxcRkUtUGFuZWxcXFxcd29ya1xcXFxqa3NvbEFkc0NsaWVudF8xMi0yOVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcSmF5XFxcXFByb2plY3RzXFxcXEZFLVBhbmVsXFxcXHdvcmtcXFxcamtzb2xBZHNDbGllbnRfMTItMjlcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L0pheS9Qcm9qZWN0cy9GRS1QYW5lbC93b3JrL2prc29sQWRzQ2xpZW50XzEyLTI5L3ZpdGUuY29uZmlnLmpzXCI7LyoqIEBmb3JtYXQgKi9cblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHN2Z3IgZnJvbSAnQHN2Z3Ivcm9sbHVwJztcbmltcG9ydCBwdXJnZWNzcyBmcm9tICdAZnVsbGh1bWFuL3Bvc3Rjc3MtcHVyZ2Vjc3MnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG5cdHBsdWdpbnM6IFtcblx0XHRyZWFjdCgpLFxuXHRcdHN2Z3Ioe1xuXHRcdFx0ZXhwb3J0QXNEZWZhdWx0OiB0cnVlLFxuXHRcdH0pLFxuXHRdLFxuXHRyZXNvbHZlOiB7XG5cdFx0YWxpYXM6IHtcblx0XHRcdGZzOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NvbXBvbmVudHMvR2VuZXJhbENvbXBvbmVudHMvZW1wdHkuanMnKSxcblx0XHR9LFxuXHR9LFxuXHRzZXJ2ZXI6IHtcblx0XHRwb3J0OiA1MDAwLFxuXHR9LFxuXHRjc3M6IHtcblx0XHRwb3N0Y3NzOiB7XG5cdFx0XHRwbHVnaW5zOiBbXG5cdFx0XHRcdHB1cmdlY3NzKHtcblx0XHRcdFx0XHRjb250ZW50OiBbJy4vaW5kZXguaHRtbCcsICcuL3NyYy8qKi8qLmpzJywgJy4vc3JjLyoqLyouanN4J10sXG5cdFx0XHRcdFx0ZGVmYXVsdEV4dHJhY3RvcjogKGNvbnRlbnQpID0+IGNvbnRlbnQubWF0Y2goL1tePD5cIidgXFxzXSpbXjw+XCInYFxcczpdL2cpIHx8IFtdLFxuXHRcdFx0XHRcdHNhZmVsaXN0OiB7XG5cdFx0XHRcdFx0XHRkZWVwOiBbXG5cdFx0XHRcdFx0XHRcdC9ecmRyLyxcblx0XHRcdFx0XHRcdFx0L15yZHQvLFxuXHRcdFx0XHRcdFx0XHQvXnN2Zy8sXG5cdFx0XHRcdFx0XHRcdC9ec3Bpbm5lci8sXG5cdFx0XHRcdFx0XHRcdC9edGFibGUvLFxuXHRcdFx0XHRcdFx0XHQvXmN1c3RvbS8sXG5cdFx0XHRcdFx0XHRcdC9ecGFnZS8sXG5cdFx0XHRcdFx0XHRcdC9eY3NzLyxcblx0XHRcdFx0XHRcdFx0L15jYW52YXNqcy8sXG5cdFx0XHRcdFx0XHRcdC9ebW9kYWwvLFxuXHRcdFx0XHRcdFx0XHQvXmRyb3BwYWJsZS8sXG5cdFx0XHRcdFx0XHRcdC9eQWNjb3VudC8sXG5cdFx0XHRcdFx0XHRcdC9ec3dhbDIvLFxuXHRcdFx0XHRcdFx0XHQvXnNoZXBoZXJkLyxcblx0XHRcdFx0XHRcdFx0L15ybWRwLyxcblx0XHRcdFx0XHRcdFx0L15zZWxlY3QvLFxuXHRcdFx0XHRcdFx0XHQvXmNvdW50cnlfcHJlZml4Lyxcblx0XHRcdFx0XHRcdFx0L15zb3J0X2hlYWRlcl9rZXkvLFxuXHRcdFx0XHRcdFx0XHQvXmlubmVyX3NvcnQvLFxuXHRcdFx0XHRcdFx0XHQvXm91dGVyX3NvcnQvLFxuXHRcdFx0XHRcdFx0XHQvXm5ld19pY29uX2NsYXNzLyxcblx0XHRcdFx0XHRcdFx0L15zb3J0X19hY3RpdmUvLFxuXHRcdFx0XHRcdFx0XHQvXmVtcHR5LWxlYWRpbmctMC8sXG5cdFx0XHRcdFx0XHRcdC9eaG92ZXItYWN0aXZlLyxcblx0XHRcdFx0XHRcdFx0L15kZWZhdWx0X3NvcnRfYWN0aXZlLyxcblx0XHRcdFx0XHRcdFx0L15kYXktYm94Lyxcblx0XHRcdFx0XHRcdFx0L15fX3JkdF9jdXN0b21fc29ydF9pY29uX18vLFxuXHRcdFx0XHRcdFx0XHQvXnNvcnQtaWNvbi1hY3RpdmUvLFxuXHRcdFx0XHRcdFx0XHQvXmdlbmVyYWxfc2VsZWN0Lyxcblx0XHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0XHRrZXlmcmFtZXM6IHRydWUsXG5cdFx0XHRcdFx0XHRzdGFuZGFyZDogW1xuXHRcdFx0XHRcdFx0XHQnYWN0aXZlJyxcblx0XHRcdFx0XHRcdFx0J3RleHQtc2Vjb25kYXJ5Jyxcblx0XHRcdFx0XHRcdFx0J2Ryb3Bkb3duLW1lbnUnLFxuXHRcdFx0XHRcdFx0XHQnY29sbGFwc2VkJyxcblx0XHRcdFx0XHRcdFx0J2NvbGxhcHNlJyxcblx0XHRcdFx0XHRcdFx0J21vZGFsJyxcblx0XHRcdFx0XHRcdFx0J3Nob3cnLFxuXHRcdFx0XHRcdFx0XHQnZHJvcGRvd24nLFxuXHRcdFx0XHRcdFx0XHQnZHJvcGRvd24tdG9nZ2xlJyxcblx0XHRcdFx0XHRcdFx0J2J0bicsXG5cdFx0XHRcdFx0XHRcdCdidG4tcHJpbWFyeScsXG5cdFx0XHRcdFx0XHRcdCdwcm9ncmVzcy1iYXInLFxuXHRcdFx0XHRcdFx0XHQnc3Bpbm5lci1ib3JkZXInLFxuXHRcdFx0XHRcdFx0XHQnY2FudmFzanMtY2hhcnQtY3JlZGl0Jyxcblx0XHRcdFx0XHRcdFx0J292ZXJ2aWV3LXNlbGVjdCcsXG5cdFx0XHRcdFx0XHRcdCd0ZXh0LXN1Y2Nlc3MnLFxuXHRcdFx0XHRcdFx0XSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9KSxcblx0XHRcdF0sXG5cdFx0fSxcblx0fSxcblx0YnVpbGQ6IHtcblx0XHRjaHVua1NpemVXYXJuaW5nTGltaXQ6IDgwMDAsXG5cdFx0Y29tbW9uanNPcHRpb25zOiB7XG5cdFx0XHR0cmFuc2Zvcm1NaXhlZEVzTW9kdWxlczogdHJ1ZSxcblx0XHR9LFxuXHRcdHJvbGx1cE9wdGlvbnM6IHtcblx0XHRcdG91dHB1dDoge1xuXHRcdFx0XHRtYW51YWxDaHVua3MoaWQpIHtcblx0XHRcdFx0XHRpZiAoaWQuaW5jbHVkZXMoJ2NhbnZhc2pzJykpIHtcblx0XHRcdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gJ3ZlbmRvcic7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHR9LFxuXHR9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBRUEsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixPQUFPLGNBQWM7QUFDckIsT0FBTyxVQUFVO0FBTmpCLElBQU0sbUNBQW1DO0FBUXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzNCLFNBQVM7QUFBQSxJQUNSLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNKLGlCQUFpQjtBQUFBLElBQ2xCLENBQUM7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUixPQUFPO0FBQUEsTUFDTixJQUFJLEtBQUssUUFBUSxrQ0FBVywyQ0FBMkM7QUFBQSxJQUN4RTtBQUFBLEVBQ0Q7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNQLE1BQU07QUFBQSxFQUNQO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSixTQUFTO0FBQUEsTUFDUixTQUFTO0FBQUEsUUFDUixTQUFTO0FBQUEsVUFDUixTQUFTLENBQUMsZ0JBQWdCLGlCQUFpQixnQkFBZ0I7QUFBQSxVQUMzRCxrQkFBa0IsQ0FBQyxZQUFZLFFBQVEsTUFBTSx5QkFBeUIsS0FBSyxDQUFDO0FBQUEsVUFDNUUsVUFBVTtBQUFBLFlBQ1QsTUFBTTtBQUFBLGNBQ0w7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsWUFDRDtBQUFBLFlBQ0EsV0FBVztBQUFBLFlBQ1gsVUFBVTtBQUFBLGNBQ1Q7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxZQUNEO0FBQUEsVUFDRDtBQUFBLFFBQ0QsQ0FBQztBQUFBLE1BQ0Y7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ04sdUJBQXVCO0FBQUEsSUFDdkIsaUJBQWlCO0FBQUEsTUFDaEIseUJBQXlCO0FBQUEsSUFDMUI7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNkLFFBQVE7QUFBQSxRQUNQLGFBQWEsSUFBSTtBQUNoQixjQUFJLEdBQUcsU0FBUyxVQUFVLEdBQUc7QUFDNUIsbUJBQU87QUFBQSxVQUNSO0FBQ0EsY0FBSSxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQ2hDLG1CQUFPO0FBQUEsVUFDUjtBQUFBLFFBQ0Q7QUFBQSxNQUNEO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFDRCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
