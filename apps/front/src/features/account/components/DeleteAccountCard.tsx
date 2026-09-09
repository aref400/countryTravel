import { useState } from "react";
import { useNavigate } from "react-router";
import { setFlash } from "@/shared/lib/flash";
import { useAuthStore } from "@/shared/store/auth.store";
import { deleteAccount } from "../services/account.service";
import { DeleteAccountModal } from "./DeleteAccountModal";

export function DeleteAccountCard() {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    setIsDeleting(true);
    try {
      await deleteAccount();
      // Le compte n'existe plus : nettoyage local (pas d'appel /auth/logout) +
      // message de confirmation sur la page de connexion.
      setFlash("accountDeleted");
      clearAuth();
      navigate("/auth/login");
    } catch {
      setError("La suppression a échoué. Réessaie plus tard.");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-gray-500 max-w-lg">
          La suppression de votre compte est <strong>définitive</strong>. Toutes
          vos données — visites, avis et recommandations sauvegardées — seront
          effacées (droit à l'effacement, RGPD).
        </p>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-red-500 hover:bg-red-600 transition-colors text-white font-semibold py-2.5 px-6 rounded-lg text-sm shrink-0"
        >
          Supprimer mon compte
        </button>
      </div>

      {isOpen && (
        <DeleteAccountModal
          isDeleting={isDeleting}
          error={error}
          onClose={() => setIsOpen(false)}
          onConfirm={() => void handleConfirm()}
        />
      )}
    </>
  );
}
