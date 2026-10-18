import { defineConfig } from "wxt";
export default defineConfig({ manifest: {
 name: "Polar Publish Bridge", description: "Check local publication sessions and prepare draft handoffs. Never exports session cookies.",
 permissions: ["cookies", "storage", "tabs", "scripting"],
 host_permissions: ["https://*.substack.com/*", "https://medium.com/*", "https://*.medium.com/*"],
 externally_connectable: { matches: ["http://localhost:3000/*"] }
} });
