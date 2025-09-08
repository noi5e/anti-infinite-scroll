import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Anti-Infinite Scroll",
    description:
      "Detects the presence of infinite scroll, removes it, and paginates/titrates results.",
    content_scripts: [
      {
        matches: ["<all_urls>"],
        js: ["index.js"],
        run_at: "document_start",
      },
    ],
    permissions: ["activeTab"],
  },
});
