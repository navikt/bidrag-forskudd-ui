/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {},
    },
    plugins: [],
    safelist: ["border-border-danger", "border-solid", "border-2", "w-[85px]"],
    corePlugins: {
        preflight: false,
    },
};
