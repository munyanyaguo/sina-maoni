import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  manifest: {
    name: "Sina Maoni",
    description: "Run accessibility scans on the page you are viewing",
    permissions: ["activeTab", "scripting", "storage"],
    host_permissions: ["<all_urls>"],
  },
});
