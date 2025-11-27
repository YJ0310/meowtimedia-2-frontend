// postcss.config.mjs
const config = {
  plugins: {
    // Correct plugin for Tailwind CSS v4
    '@tailwindcss/postcss': {}, 
    
    // Essential for cross-browser compatibility
    'autoprefixer': {}, 
  },
};

export default config;