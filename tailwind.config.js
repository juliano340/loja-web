/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}"
    ],
    theme: {
        extend: {
            colors: {
                primary: "#1f2937",
                accent: "#2563eb",
                background: "#f9fafb",
                surface: "#ffffff",
                border: "#e5e7eb",
                text: {
                    primary: "#111827",
                    secondary: "#6b7280"
                }
            }
        }
    },
    plugins: [],
};
