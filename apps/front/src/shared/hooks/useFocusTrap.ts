import { useEffect, type RefObject } from "react";

interface Options {
  onClose: () => void;
  /** Élément à focaliser à l'ouverture. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Actif seulement quand la modale est ouverte (défaut : true). */
  active?: boolean;
}

// Accessibilité des modales : focus initial, piège de focus (Tab/Shift+Tab),
// fermeture à Échap, et restitution du focus à l'élément d'origine.
export function useFocusTrap(
  dialogRef: RefObject<HTMLElement | null>,
  { onClose, initialFocusRef, active = true }: Options,
) {
  useEffect(() => {
    if (!active) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    initialFocusRef?.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [dialogRef, onClose, initialFocusRef, active]);
}
