/** @type {import('tailwindcss').Config} */
module.exports = {
  // Add the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#2E7D32',
        primaryDark: '#1B5E20',
        secondary: '#00695C',
        accent: '#F9A825',
        background: '#F4F6F8',
        surface: '#FFFFFF',
        textPrimary: '#1F2937',
        textSecondary: '#6B7280',
        success: '#388E3C',
        error: '#D32F2F',
        warning: '#FBC02D',
        border: '#E5E7EB',
      }
    },
  },
  plugins: [],
};

