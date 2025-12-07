/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
        "./index.tsx"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                primary: {
                    light: '#3f3f46', // Zinc 700
                    DEFAULT: '#18181b', // Zinc 900 (Near Black)
                    dark: '#09090b', // Zinc 950
                },
                secondary: {
                    light: '#f4f4f5', // Zinc 100
                    DEFAULT: '#e4e4e7', // Zinc 200
                    dark: '#71717a', // Zinc 500
                },
                neutral: {
                    light: '#fafafa', // Zinc 50
                    DEFAULT: '#52525b', // Zinc 600
                    dark: '#27272a', // Zinc 800
                },
                surface: {
                    DEFAULT: '#ffffff',
                    subtle: '#f9fafb', // Gray 50
                    border: '#e5e7eb', // Gray 200
                }
            },
            boxShadow: {
                'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                'float': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            }
        }
    },
    plugins: [],
}
