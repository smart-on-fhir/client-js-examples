import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: "/browser/ts_react_spa/dist/"
  base: "/client-js-examples/ts_react_spa/"
  // base: "/ts_react_spa/"
})
