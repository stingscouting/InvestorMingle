/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': '#FFFFFF',
                'bg-card': '#EFEFEA',
                'primary': '#23544E',
                'primary-dark': '#2C3E50',
                'accent-yellow': '#FDF87D',
                'text-primary': '#4A4A4A',
                'text-secondary': '#8A8A8A',
                'border': '#E0E0E0',
            },
            fontFamily: {
                sans: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
                serif: ['DM Serif Display', 'serif'],
            },
            fontSize: {
                'h1': ['32px', { lineHeight: '1.2', letterSpacing: '-0.5px', fontWeight: '400' }],
                'h2': ['24px', { lineHeight: '1.3', letterSpacing: '-0.3px', fontWeight: '400' }],
                'h3': ['20px', { lineHeight: '1.4', fontWeight: '400' }],
            },
            borderRadius: {
                '4xl': '32px',
                '5xl': '40px',
                'pebble': '60px',
            },
            screens: {
                'mobile': '320px',
                'tablet': '429px',
                'desktop': '835px',
            },
            backgroundImage: {
                'premium-gradient': 'linear-gradient(135deg, #23544E 0%, #3a7c73 100%)',
                'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)',
                'gradient-beige': 'linear-gradient(180deg, #FDFCFB 0%, #F5F1EE 100%)',
                'gradient-blue': 'linear-gradient(180deg, #F8FAFB 0%, #E9F1F5 100%)',
                'gradient-gray': 'linear-gradient(180deg, #F9F9F9 0%, #EFF1F3 100%)',
                'gradient-teal': 'linear-gradient(180deg, #F0F9F8 0%, #E5F3F1 100%)',
            },
            boxShadow: {
                'card': '0 2px 12px rgba(0, 0, 0, 0.04)',
                'elevated': '0 4px 20px rgba(0, 0, 0, 0.06)',
                'premium': '0 6px 24px -6px rgba(35, 84, 78, 0.12)',
                'pebble': '0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.02)',
                'logo': '0 4px 16px rgba(0, 0, 0, 0.08)',
            },
            animation: {
                'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'scale-up': 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleUp: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                pulseSubtle: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' },
                },
            },
        },
    },
    plugins: [],
}
