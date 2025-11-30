/** @type {import('tailwindcss').Config} */
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import aspectRatio from "@tailwindcss/aspect-ratio";


export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        container: {
            center: true,
            padding: "1rem",
            screens: {
                sm: "640px",
                md: "768px",
                lg: "1024px",
                xl: "1280px",
                "2xl": "1536px",
            },
        },
        extend: {
            fontFamily: {
                nunito: ['Nunito', 'serif'],
            },
            colors: {
                'applyons-bleu': 'var(--applyons-bleu)',
                'applyons-orange': 'var(--applyons-orange)',
            },
            boxShadow: {
                applyons: "0 4px 6px -1px rgba(21, 76, 121, 0.1), 0 2px 4px -1px rgba(21, 76, 121, 0.06)",
                "applyons-md": "0 10px 15px -3px rgba(21, 76, 121, 0.1), 0 4px 6px -2px rgba(21, 76, 121, 0.05)",
                "applyons-lg": "0 20px 25px -5px rgba(21, 76, 121, 0.15), 0 10px 10px -5px rgba(21, 76, 121, 0.04)",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: 0 },
                    "100%": { opacity: 1 },
                },
                slideUp: {
                    "0%": { transform: "translateY(20px)", opacity: 0 },
                    "100%": { transform: "translateY(0)", opacity: 1 },
                },
                bounceSlow: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
            },
            animation: {
                fadeIn: "fadeIn 0.5s ease-in-out",
                slideUp: "slideUp 0.6s ease-out",
                bounceSlow: "bounceSlow 2s infinite",
            },
        },
    },
    plugins: [forms(), typography(), aspectRatio()],
    darkMode: "class", // Active le mode sombre via `.dark`
}