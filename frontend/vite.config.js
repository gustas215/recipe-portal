import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Port 5173 turi sutapti su FRONTEND_URL backend/.env faile (CORS)
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
