/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#F4ECE4",
                sidebar: "#0F0F0F",
                primary: "#F26B3A",
                secondary: "#7C6E65",
                card: "#FFFFFF",
                success: "#3CB371",
                warning: "#F4A261",
                danger: "#E63946",
                text: {
                    primary: "#1F1F1F",
                    muted: "#7A7A7A"
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
