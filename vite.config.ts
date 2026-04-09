import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/physics-ai-aerodb-demo/',
  plugins: [react()],
})
