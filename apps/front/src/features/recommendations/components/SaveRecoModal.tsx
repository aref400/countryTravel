import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  isOpen: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (name?: string) => void;
}

export function SaveRecoModal({ isOpen, error, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement;
    nameInputRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-reco-title"
      className={`fixed inset-0 bg-black/50 items-center justify-center ${isOpen ? "flex" : "hidden"}`}
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 id="save-reco-title" className="text-lg font-semibold">
            Sauvegarder les recommandations
          </h2>
          <button onClick={onClose} aria-label="Fermer">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nom
          </label>
          <input
            ref={nameInputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Voyage en Asie"
            id="name"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        {error && (
          <p role="alert" className="text-red-500 text-xs">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-2.5 text-sm font-semibold text-gray-500 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(name)}
            className="flex-1 px-6 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
