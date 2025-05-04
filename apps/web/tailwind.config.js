module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/**/*.{ts,tsx,js,jsx}",
    "!../../packages/ui/node_modules"
  ],
  theme: {
    extend: {}
  },
  plugins: [require("daisyui")]
}

