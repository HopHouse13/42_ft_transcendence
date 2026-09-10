import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; // Utilise plugin-react-swc au lieu de plugin-react
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
