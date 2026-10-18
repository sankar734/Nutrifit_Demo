/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          dark: '#7C3AED',
        },
        lavender: '#EDE9FE',
        surface: '#FFFFFF',
        ink: '#1F1B2E',
        muted: '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(139, 92, 246, 0.12)',
        glass: '0 4px 24px rgba(139, 92, 246, 0.08)',
      },
      backgroundImage: {
        'lavender-gradient': 'linear-gradient(135deg, #EDE9FE 0%, #FFFFFF 60%)',
        'primary-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
      },
    },
  },
  plugins: [],
};
