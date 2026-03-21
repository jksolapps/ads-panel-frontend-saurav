// vite.config.js
import { defineConfig } from "file:///E:/Jay/Projects/FE-Panel/work/jksolAdsClient_main/node_modules/vite/dist/node/index.js";
import react from "file:///E:/Jay/Projects/FE-Panel/work/jksolAdsClient_main/node_modules/@vitejs/plugin-react/dist/index.js";
import svgr from "file:///E:/Jay/Projects/FE-Panel/work/jksolAdsClient_main/node_modules/@svgr/rollup/dist/index.js";
import purgecss from "file:///E:/Jay/Projects/FE-Panel/work/jksolAdsClient_main/node_modules/@fullhuman/postcss-purgecss/lib/postcss-purgecss.js";
import path from "path";
var __vite_injected_original_dirname = "E:\\Jay\\Projects\\FE-Panel\\work\\jksolAdsClient_main";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxKYXlcXFxcUHJvamVjdHNcXFxcRkUtUGFuZWxcXFxcd29ya1xcXFxqa3NvbEFkc0NsaWVudF9tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxKYXlcXFxcUHJvamVjdHNcXFxcRkUtUGFuZWxcXFxcd29ya1xcXFxqa3NvbEFkc0NsaWVudF9tYWluXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9KYXkvUHJvamVjdHMvRkUtUGFuZWwvd29yay9qa3NvbEFkc0NsaWVudF9tYWluL3ZpdGUuY29uZmlnLmpzXCI7LyoqIEBmb3JtYXQgKi9cclxuXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xyXG5pbXBvcnQgc3ZnciBmcm9tICdAc3Znci9yb2xsdXAnO1xyXG5pbXBvcnQgcHVyZ2Vjc3MgZnJvbSAnQGZ1bGxodW1hbi9wb3N0Y3NzLXB1cmdlY3NzJztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG5cdHBsdWdpbnM6IFtcclxuXHRcdHJlYWN0KCksXHJcblx0XHRzdmdyKHtcclxuXHRcdFx0ZXhwb3J0QXNEZWZhdWx0OiB0cnVlLFxyXG5cdFx0fSksXHJcblx0XSxcclxuXHRyZXNvbHZlOiB7XHJcblx0XHRhbGlhczoge1xyXG5cdFx0XHRmczogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb21wb25lbnRzL0dlbmVyYWxDb21wb25lbnRzL2VtcHR5LmpzJyksXHJcblx0XHR9LFxyXG5cdH0sXHJcblx0c2VydmVyOiB7XHJcblx0XHRob3N0OiB0cnVlLFxyXG5cdFx0cG9ydDogNTAwMCxcclxuXHR9LFxyXG5cdGNzczoge1xyXG5cdFx0cG9zdGNzczoge1xyXG5cdFx0XHRwbHVnaW5zOiBbXHJcblx0XHRcdFx0cHVyZ2Vjc3Moe1xyXG5cdFx0XHRcdFx0Y29udGVudDogWycuL2luZGV4Lmh0bWwnLCAnLi9zcmMvKiovKi5qcycsICcuL3NyYy8qKi8qLmpzeCddLFxyXG5cdFx0XHRcdFx0ZGVmYXVsdEV4dHJhY3RvcjogKGNvbnRlbnQpID0+IGNvbnRlbnQubWF0Y2goL1tePD5cIidgXFxzXSpbXjw+XCInYFxcczpdL2cpIHx8IFtdLFxyXG5cdFx0XHRcdFx0c2FmZWxpc3Q6IHtcclxuXHRcdFx0XHRcdFx0ZGVlcDogW1xyXG5cdFx0XHRcdFx0XHRcdC9ecmRyLyxcclxuXHRcdFx0XHRcdFx0XHQvXnJkdC8sXHJcblx0XHRcdFx0XHRcdFx0L15zdmcvLFxyXG5cdFx0XHRcdFx0XHRcdC9ec3Bpbm5lci8sXHJcblx0XHRcdFx0XHRcdFx0L150YWJsZS8sXHJcblx0XHRcdFx0XHRcdFx0L15jdXN0b20vLFxyXG5cdFx0XHRcdFx0XHRcdC9ecGFnZS8sXHJcblx0XHRcdFx0XHRcdFx0L15jc3MvLFxyXG5cdFx0XHRcdFx0XHRcdC9eY2FudmFzanMvLFxyXG5cdFx0XHRcdFx0XHRcdC9ebW9kYWwvLFxyXG5cdFx0XHRcdFx0XHRcdC9eZHJvcHBhYmxlLyxcclxuXHRcdFx0XHRcdFx0XHQvXkFjY291bnQvLFxyXG5cdFx0XHRcdFx0XHRcdC9ec3dhbDIvLFxyXG5cdFx0XHRcdFx0XHRcdC9ec2hlcGhlcmQvLFxyXG5cdFx0XHRcdFx0XHRcdC9ecm1kcC8sXHJcblx0XHRcdFx0XHRcdFx0L15zZWxlY3QvLFxyXG5cdFx0XHRcdFx0XHRcdC9eY291bnRyeV9wcmVmaXgvLFxyXG5cdFx0XHRcdFx0XHRcdC9ec29ydF9oZWFkZXJfa2V5LyxcclxuXHRcdFx0XHRcdFx0XHQvXmlubmVyX3NvcnQvLFxyXG5cdFx0XHRcdFx0XHRcdC9eb3V0ZXJfc29ydC8sXHJcblx0XHRcdFx0XHRcdFx0L15uZXdfaWNvbl9jbGFzcy8sXHJcblx0XHRcdFx0XHRcdFx0L15zb3J0X19hY3RpdmUvLFxyXG5cdFx0XHRcdFx0XHRcdC9eZW1wdHktbGVhZGluZy0wLyxcclxuXHRcdFx0XHRcdFx0XHQvXmhvdmVyLWFjdGl2ZS8sXHJcblx0XHRcdFx0XHRcdFx0L15kZWZhdWx0X3NvcnRfYWN0aXZlLyxcclxuXHRcdFx0XHRcdFx0XHQvXmRheS1ib3gvLFxyXG5cdFx0XHRcdFx0XHRcdC9eX19yZHRfY3VzdG9tX3NvcnRfaWNvbl9fLyxcclxuXHRcdFx0XHRcdFx0XHQvXnNvcnQtaWNvbi1hY3RpdmUvLFxyXG5cdFx0XHRcdFx0XHRcdC9eZ2VuZXJhbF9zZWxlY3QvLFxyXG5cdFx0XHRcdFx0XHRdLFxyXG5cdFx0XHRcdFx0XHRrZXlmcmFtZXM6IHRydWUsXHJcblx0XHRcdFx0XHRcdHN0YW5kYXJkOiBbXHJcblx0XHRcdFx0XHRcdFx0J2FjdGl2ZScsXHJcblx0XHRcdFx0XHRcdFx0J3RleHQtc2Vjb25kYXJ5JyxcclxuXHRcdFx0XHRcdFx0XHQnZHJvcGRvd24tbWVudScsXHJcblx0XHRcdFx0XHRcdFx0J2NvbGxhcHNlZCcsXHJcblx0XHRcdFx0XHRcdFx0J2NvbGxhcHNlJyxcclxuXHRcdFx0XHRcdFx0XHQnbW9kYWwnLFxyXG5cdFx0XHRcdFx0XHRcdCdzaG93JyxcclxuXHRcdFx0XHRcdFx0XHQnZHJvcGRvd24nLFxyXG5cdFx0XHRcdFx0XHRcdCdkcm9wZG93bi10b2dnbGUnLFxyXG5cdFx0XHRcdFx0XHRcdCdidG4nLFxyXG5cdFx0XHRcdFx0XHRcdCdidG4tcHJpbWFyeScsXHJcblx0XHRcdFx0XHRcdFx0J3Byb2dyZXNzLWJhcicsXHJcblx0XHRcdFx0XHRcdFx0J3NwaW5uZXItYm9yZGVyJyxcclxuXHRcdFx0XHRcdFx0XHQnY2FudmFzanMtY2hhcnQtY3JlZGl0JyxcclxuXHRcdFx0XHRcdFx0XHQnb3ZlcnZpZXctc2VsZWN0JyxcclxuXHRcdFx0XHRcdFx0XHQndGV4dC1zdWNjZXNzJyxcclxuXHRcdFx0XHRcdFx0XSxcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0fSksXHJcblx0XHRcdF0sXHJcblx0XHR9LFxyXG5cdH0sXHJcblx0YnVpbGQ6IHtcclxuXHRcdGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogODAwMCxcclxuXHRcdGNvbW1vbmpzT3B0aW9uczoge1xyXG5cdFx0XHR0cmFuc2Zvcm1NaXhlZEVzTW9kdWxlczogdHJ1ZSxcclxuXHRcdH0sXHJcblx0XHRyb2xsdXBPcHRpb25zOiB7XHJcblx0XHRcdG91dHB1dDoge1xyXG5cdFx0XHRcdG1hbnVhbENodW5rcyhpZCkge1xyXG5cdFx0XHRcdFx0aWYgKGlkLmluY2x1ZGVzKCdjYW52YXNqcycpKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gJ3ZlbmRvcic7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0fSxcclxuXHRcdH0sXHJcblx0fSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFFQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sY0FBYztBQUNyQixPQUFPLFVBQVU7QUFOakIsSUFBTSxtQ0FBbUM7QUFRekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDM0IsU0FBUztBQUFBLElBQ1IsTUFBTTtBQUFBLElBQ04sS0FBSztBQUFBLE1BQ0osaUJBQWlCO0FBQUEsSUFDbEIsQ0FBQztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNSLE9BQU87QUFBQSxNQUNOLElBQUksS0FBSyxRQUFRLGtDQUFXLDJDQUEyQztBQUFBLElBQ3hFO0FBQUEsRUFDRDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1A7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNKLFNBQVM7QUFBQSxNQUNSLFNBQVM7QUFBQSxRQUNSLFNBQVM7QUFBQSxVQUNSLFNBQVMsQ0FBQyxnQkFBZ0IsaUJBQWlCLGdCQUFnQjtBQUFBLFVBQzNELGtCQUFrQixDQUFDLFlBQVksUUFBUSxNQUFNLHlCQUF5QixLQUFLLENBQUM7QUFBQSxVQUM1RSxVQUFVO0FBQUEsWUFDVCxNQUFNO0FBQUEsY0FDTDtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxZQUNEO0FBQUEsWUFDQSxXQUFXO0FBQUEsWUFDWCxVQUFVO0FBQUEsY0FDVDtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLFlBQ0Q7QUFBQSxVQUNEO0FBQUEsUUFDRCxDQUFDO0FBQUEsTUFDRjtBQUFBLElBQ0Q7QUFBQSxFQUNEO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTix1QkFBdUI7QUFBQSxJQUN2QixpQkFBaUI7QUFBQSxNQUNoQix5QkFBeUI7QUFBQSxJQUMxQjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2QsUUFBUTtBQUFBLFFBQ1AsYUFBYSxJQUFJO0FBQ2hCLGNBQUksR0FBRyxTQUFTLFVBQVUsR0FBRztBQUM1QixtQkFBTztBQUFBLFVBQ1I7QUFDQSxjQUFJLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFDaEMsbUJBQU87QUFBQSxVQUNSO0FBQUEsUUFDRDtBQUFBLE1BQ0Q7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
