/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mssn: {
          green: '#2ecc71',
          greenDark: '#27ae60',
          footer: '#0d5239',
          night: '#0f1d1f',
          slate: '#1a2a2f',
          mist: '#eef2ed',
        },
      },
      fontFamily: {
        display: ['"Poppins"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 25px 60px -15px rgba(46, 204, 113, 0.35)',
        soft: '0 18px 45px rgba(15, 29, 31, 0.12)',
      },
      borderRadius: {
        xl: '0.5rem',
        '2xl': '0.75rem',
        '3xl': '1rem',
        '4xl': '1.25rem',
      },
      backgroundImage: {
        'radial-glow':
          'radial-gradient(circle at top, rgba(46, 204, 113, 0.35), rgba(15,29,31,0.75))',
      },
    },
  },
  plugins: [],
}
