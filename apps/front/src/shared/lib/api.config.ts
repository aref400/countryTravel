// URL de base de l'API, partagée par le client HTTP et le store d'auth
// (fichier « feuille » sans import → pas de cycle de dépendances).
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";
