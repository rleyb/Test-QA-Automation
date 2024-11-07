import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './apps/client-e2e/tests', // Directorio donde estarán tus pruebas
  timeout: 30 * 1000,
  retries: 1, // Reintentos en caso de fallo
  use: {
    baseURL: 'http://localhost:3000', // Cambia el puerto si es necesario
    browserName: 'firefox', // Puedes cambiarlo a 'firefox' o 'webkit'
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'on-first-retry',
  },
});
