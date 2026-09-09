import { AlertTriangle } from "lucide-react";
import { useRef } from "react";
import { useFocusTrap } from "@/shared/hooks/useFocusTrap";

interface Props {
  isDeleting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

// Montée uniquement quand ouverte (le parent la rend conditionnellement).
export function DeleteAccountModal({
  isDeleting,
  error,
  onClose,
  onConfirm,
}: Readonly<Props>) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(dialogRef, { onClose, initialFocusRef: cancelButtonRef });

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
      aria-describedby="delete-account-desc"
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-md flex flex-col gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-red-600"
          style={{ background: "#fef2f2" }}
          aria-hidden="true"
        >
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div>
          <h2
            id="delete-account-title"
            className="text-lg font-bold text-gray-900"
          >
            Supprimer votre compte ?
          </h2>
          <p id="delete-account-desc" className="text-sm text-gray-500 mt-1">
            Cette action est <strong>irréversible</strong>. Toutes vos données
            (visites, avis, recommandations sauvegardées) seront définitivement
            effacées.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-red-500 text-xs">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-5 py-2.5 text-sm font-semibold text-gray-500 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Suppression…" : "Supprimer définitivement"}
          </button>
        </div>
      </div>
    </div>
  );
}
