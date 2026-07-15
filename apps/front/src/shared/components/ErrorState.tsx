interface ErrorStateProps {
  /** Message d'erreur affiché à l'utilisateur. */
  message: string;
  /** Action de récupération. Si fournie, un bouton « Réessayer » est affiché. */
  onRetry?: () => void;
}

/**
 * État d'erreur homogène pour les pages : message annoncé aux lecteurs
 * d'écran (`role="alert"`) et, quand une action de récupération est possible,
 * un bouton « Réessayer » pour ne pas laisser l'utilisateur dans une impasse.
 */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="text-center py-12">
      <p className="text-red-400 text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-sm font-semibold bg-green-500 hover:bg-green-600 transition-colors text-white px-5 py-2.5 rounded-lg"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
