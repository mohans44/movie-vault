export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--bg) / <alpha-value>)",
        "background-soft": "rgb(var(--bg-soft) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-dark": "rgb(var(--accent-dark) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        cta: "rgb(var(--cta) / <alpha-value>)",
        text: {
          main: "rgb(var(--text-main) / <alpha-value>)",
          soft: "rgb(var(--text-soft) / <alpha-value>)",
          mute: "rgb(var(--text-mute) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Sora", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Sora", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 22px 40px -26px rgba(5, 8, 20, 0.92)",
        glow: "0 0 0 1px rgba(120,198,255,0.28), 0 18px 44px -24px rgba(0,0,0,0.44)",
        soft: "0 10px 26px -18px rgba(0, 0, 0, 0.65)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-in-up": "fadeInUp 0.6s cubic-bezier(.22,.61,.36,1)",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "button-pop": "buttonPop 0.45s cubic-bezier(.2,.8,.2,1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        buttonPop: {
          "0%": { transform: "scale(1)" },
          "35%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".glass-panel": {
          background:
            "linear-gradient(140deg, rgba(31, 43, 49, 0.72), rgba(26, 37, 43, 0.64), rgba(21, 31, 36, 0.62))",
          backdropFilter: "blur(26px) saturate(155%)",
          WebkitBackdropFilter: "blur(26px) saturate(155%)",
          border: "1px solid rgba(214, 230, 228, 0.14)",
          boxShadow:
            "inset 0 1px 0 rgba(234,246,245,0.08), 0 20px 46px -30px rgba(0,0,0,0.85)",
        },
        ".glass-pill": {
          background:
            "linear-gradient(140deg, rgba(31, 43, 49, 0.8), rgba(24, 35, 40, 0.74), rgba(19, 29, 34, 0.7))",
          backdropFilter: "blur(30px) saturate(160%)",
          WebkitBackdropFilter: "blur(30px) saturate(160%)",
          border: "1px solid rgba(214, 230, 228, 0.14)",
          boxShadow:
            "inset 0 1px 0 rgba(234,246,245,0.07), 0 20px 48px -30px rgba(0,0,0,0.9)",
        },
        ".cinematic-grid": {
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        },
      });
    },
  ],
};
