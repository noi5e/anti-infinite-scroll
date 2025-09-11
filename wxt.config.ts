import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Anti-Infinite Scroll",
    description:
      "Detects the presence of infinite scroll, removes it, and paginates/titrates results.",
    permissions: ["activeTab"],
  },
});
