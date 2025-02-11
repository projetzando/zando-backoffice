/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './components/**/*.{vue,js,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './composables/**/*.{js,ts}',
        './plugins/**/*.{js,ts}',
        './App.{js,ts,vue}',
        './app.{js,ts,vue}',
        './Error.{js,ts,vue}',
        './error.{js,ts,vue}',
    ],
    theme: {
        extend: {
            colors: {
                'brown': '#F1F1E8'
            },
            screens: {
                'mobile-s': '320px',
                'mobile-m': '375px',
                'mobile-l': '425px',
                'mobile-md': '640px',
                'tablet': '768px',
                'laptop': '1024px',
                'laptop-m': '1280px',
                'laptop-l': '1440px',
                'desktop': '1920px',
                'ultra-desktop': '2560px',
            },
        },
    },
    plugins: [],
}