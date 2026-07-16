import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StarRating } from "./StarRating";

describe("StarRating", () => {
  it("en lecture seule, annonce la note au lecteur d'écran", () => {
    render(<StarRating value={3} />);

    expect(screen.getByRole("img", { name: "Note : 3 sur 5" })).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("en mode interactif, expose un radiogroup de 5 étoiles", () => {
    render(<StarRating value={2} onChange={vi.fn()} label="Ma note sur 5" />);

    expect(
      screen.getByRole("radiogroup", { name: "Ma note sur 5" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(screen.getByRole("radio", { name: "2 sur 5" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("un clic sur une étoile appelle onChange avec la note", () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);

    fireEvent.click(screen.getByRole("radio", { name: "4 sur 5" }));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("les flèches changent la note (pattern radio natif)", () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} />);
    const current = screen.getByRole("radio", { name: "3 sur 5" });

    fireEvent.keyDown(current, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(4);

    fireEvent.keyDown(current, { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("une seule étoile est tabulable (roving tabindex)", () => {
    render(<StarRating value={3} onChange={vi.fn()} />);

    const stars = screen.getAllByRole("radio");
    const tabbable = stars.filter((s) => s.getAttribute("tabindex") === "0");
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAccessibleName("3 sur 5");
  });
});
