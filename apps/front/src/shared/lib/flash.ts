// Messages "flash" one-shot d'une page à l'autre, via sessionStorage.
// (Plus robuste qu'un query param, qu'une redirection de PrivateRoute écraserait.)

export function setFlash(key: string): void {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    /* best-effort : stockage indisponible */
  }
}

/** Lit le flag puis l'efface (à n'appeler qu'une fois, ex. à l'affichage). */
export function consumeFlash(key: string): boolean {
  try {
    if (sessionStorage.getItem(key) === "1") {
      sessionStorage.removeItem(key);
      return true;
    }
  } catch {
    /* stockage indisponible : pas de message */
  }
  return false;
}
