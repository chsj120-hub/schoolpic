import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Pretendard"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
        jua: ['"BMJUA"', '"Pretendard"', 'sans-serif'],
        serif: ['"MaruBuri"', 'serif'],
        maruburi: ['"MaruBuri"', 'serif'],
      },
      colors: {
        school: {
          amber: "#F59E0B",
          yellow: "#FBBF24",
          lightYellow: "#FEF3C7",
          sky: "#0284C7",
          lightSky: "#E0F2FE",
          arcadeBg: "#F8FAFC",
        },
      },
      borderRadius: {
        'arcade': '1.25rem',
      },
      boxShadow: {
        'arcade': '0 6px 0 0 rgba(0, 0, 0, 0.08), 0 10px 20px -5px rgba(0, 0, 0, 0.08)',
        'arcade-amber': '0 5px 0 0 #D97706',
        'arcade-sky': '0 5px 0 0 #0284C7',
      }
    },
  },
  plugins: [],
};
export default config;
