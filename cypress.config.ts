import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 390,
    viewportHeight: 844,
    supportFile: 'cypress/support/e2e.ts',
  },
  video: true,
  // demo videosu repoda tutuluyor; her koşuda silinmesin
  trashAssetsBeforeRuns: false,
  videoCompression: 32,
});
