/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#212121',
        'dark-sidebar': '#171717',
        'dark-border': '#404040',
        'dark-hover': '#525252',
        'dark-text': '#f5f5f5',
        'dark-text-secondary': '#a3a3a3',
        'dark-message-user': '#404040',
        'dark-message-assistant': '#2a2a2a',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
