/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  safelist: ['gap-4'],
  theme: {
    fontFamily: {
      'sans': ['Poppins', 'sans-serif'],
    },
    extend: {
      borderWidth: {
        1: '1px'
      },
    },
  },
  plugins: [require("daisyui")],
};
