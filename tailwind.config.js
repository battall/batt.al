/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
      },
    },
  },
  experimental: {
    optimizeUniversalDefaults: true,
  },
  plugins: [],
  darkMode: ["selector", '[data-theme="dark"]'],
};

/*
TODO: IMAGE SCALE
.slider-wrapper {
  display: flex;
  margin-top: 150px;
}
.slider-item {
  width: 200px;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transform: scaleX(1) scaleY(calc(2/3));
  margin: 0 10px;
   transition: all 0.3s ease-in-out;
  &:hover {
    transform: scaleX(1) scaleY(1);
    img {
      transform: scaleX(1) scaleY(1);
    }
  }
  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    transform: scale(1, 1.5);
    transition: clip-path 1s;
    transition: all 0.3s ease-in-out;
  }
}
*/
