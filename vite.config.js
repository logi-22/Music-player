import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
		port: 8080,
		strictPort: true,
		host: '0.0.0.0', 
		allowedHosts: true,
	},
  server: {
		allowedHosts: true
	},
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    include: /\.(js|jsx)$/,
  }
})