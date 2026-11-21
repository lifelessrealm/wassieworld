import {defineConfig} from 'vite';
export default defineConfig({
 optimizeDeps:{noDiscovery:true,include:[]},
 build:{rollupOptions:{output:{manualChunks:{renderer:['three'],physics:['@dimforge/rapier3d-compat']}}}}
});
