import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ⚙️ Port imposé par Tauri v2 — doit correspondre à build.devUrl dans
//    src-tauri/tauri.conf.json (par défaut : http://localhost:1420)
const TAURI_DEV_PORT = 1420

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // --- Config spécifique Tauri (Vite + Tauri doivent parler le même port) ---
  // Empêche Vite d'effacer les logs Rust/Tauri du terminal
  clearScreen: false,

  server: {
    port: TAURI_DEV_PORT,
    // strictPort : si 1420 est occupé, Vite échoue au lieu de basculer
    // silencieusement sur 1421/1422… (sinon Tauri ne retrouve plus le frontend)
    strictPort: true,
    host: '0.0.0.0',
    watch: {
      // Ne pas surveiller src-tauri : évite un reload Vite à chaque rebuild Rust
      ignored: ['**/src-tauri/**'],
    },
  },
})