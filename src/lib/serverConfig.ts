// Setze USE_SERVER = true wenn ein Backend verfügbar ist
// Im Dev-Modus automatisch false
export const USE_SERVER = import.meta.env.VITE_USE_SERVER === 'true'
export const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? ''
export const SERVER_API_KEY = import.meta.env.VITE_API_KEY ?? 'nova7_dev_key'
