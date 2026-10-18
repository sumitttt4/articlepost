import type { Config } from "tailwindcss";
export default {
 darkMode: "class", content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
 theme: { extend: {
 colors: { background: "var(--background)", surface: "#111114", elevated: "#18181C", border: "var(--border)", primary: "var(--primary)" },
 fontFamily: { sans: ["var(--font-geist)", "sans-serif"], mono: ["var(--font-geist)", "sans-serif"], editorial: ["var(--font-geist)", "sans-serif"] },
 boxShadow: { highlight: "inset 0 1px 0 rgba(255,255,255,.06)" }
 } }, plugins: []
} satisfies Config;
