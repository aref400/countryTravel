import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { SaveRecoModal, type SaveRecoStatus } from "./SaveRecoModal";

function renderModal(status: SaveRecoStatus, onSave = vi.fn()) {
  render(
    <MemoryRouter>
      <SaveRecoModal
        isOpen={true}
        status={status}
        onClose={vi.fn()}
        onSave={onSave}
      />
    </MemoryRouter>,
  );
  return { onSave };
}

describe("SaveRecoModal", () => {
  it("affiche le formulaire et le bouton Sauvegarder à l'état initial", () => {
    renderModal("inactive");

    expect(screen.getByLabelText("Nom")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sauvegarder" })).toBeEnabled();
  });

  it("désactive le bouton pendant la sauvegarde (pas de double soumission)", () => {
    renderModal("saving");

    expect(screen.getByRole("button", { name: "Sauvegarde…" })).toBeDisabled();
  });

  it("affiche un message de confirmation annoncé (role=status) en cas de succès (BUG-09)", () => {
    renderModal("success");

    expect(screen.getByRole("status")).toHaveTextContent(
      "Recommandation sauvegardée",
    );
    // Le formulaire laisse place à la confirmation
    expect(screen.queryByLabelText("Nom")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "tableau de bord" }),
    ).toHaveAttribute("href", "/dashboard");
  });

  it("affiche l'erreur (role=alert) et propose de réessayer en cas d'échec", () => {
    const { onSave } = renderModal("error");

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Erreur lors de la sauvegarde",
    );
    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(onSave).toHaveBeenCalled();
  });

  it("transmet le nom saisi à onSave", () => {
    const { onSave } = renderModal("inactive");

    fireEvent.change(screen.getByLabelText("Nom"), {
      target: { value: "Voyage en Asie" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sauvegarder" }));

    expect(onSave).toHaveBeenCalledWith("Voyage en Asie");
  });
});
