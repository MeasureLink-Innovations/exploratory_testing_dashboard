/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        black: 'rgb(var(--tone-black) / <alpha-value>)',
        white: 'rgb(var(--tone-white) / <alpha-value>)',
        gray: Object.fromEntries([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => [
          shade,
          `rgb(var(--tone-gray-${shade}) / <alpha-value>)`,
        ])),
        blue: Object.fromEntries([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => [
          shade,
          `rgb(var(--tone-accent-${shade}) / <alpha-value>)`,
        ])),
        paper: {
          bg: 'rgb(var(--paper-bg) / <alpha-value>)',
          surface: 'rgb(var(--paper-surface) / <alpha-value>)',
        },
        ink: {
          primary: 'rgb(var(--ink-primary) / <alpha-value>)',
          secondary: 'rgb(var(--ink-secondary) / <alpha-value>)',
          border: 'rgb(var(--ink-border) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}
