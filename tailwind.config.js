/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#FFF8F7",
        surface: "#FFFFFF",
        "surface-subtle": "#F8F8F8",
        "surface-container": "#FFE9EB",
        primary: "#680029",
        "primary-container": "#8B173E",
        gold: "#FFC815",
        green: "#1F6324",
        charcoal: "#474747",
        ink: "#1C1C1C",
        muted: "#6C6C6C",
        border: "#DADADA",
        error: "#BA1A1A"
      },
      fontFamily: {
        heading: ["Montserrat_700Bold"],
        body: ["Inter_400Regular"],
        label: ["Inter_600SemiBold"]
      }
    }
  },
  plugins: []
};
