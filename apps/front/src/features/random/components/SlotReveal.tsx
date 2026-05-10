import { useEffect, useRef, useState } from "react";

const COUNTRY_POOL = [
  "Japon",
  "Brésil",
  "Islande",
  "Maroc",
  "Thaïlande",
  "Norvège",
  "Portugal",
  "Argentine",
  "Nouvelle-Zélande",
  "Inde",
  "Grèce",
  "Canada",
  "Mexique",
  "Afrique du Sud",
  "Pérou",
  "Vietnam",
  "Australie",
  "Kenya",
  "Turquie",
  "Colombie",
  "Croatie",
  "Cambodge",
  "Chili",
  "Indonésie",
  "Éthiopie",
];

interface Props {
  targetName: string | null;
  onDone: () => void;
}

export function SlotReveal({ targetName, onDone }: Props) {
  const [displayedName, setDisplayedName] = useState(COUNTRY_POOL[0]);
  const [phase, setPhase] = useState<"spinning" | "slowing" | "done">(
    "spinning",
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<"spinning" | "slowing" | "done">("spinning");

  const updatePhase = (p: "spinning" | "slowing" | "done") => {
    phaseRef.current = p;
    setPhase(p);
  };

  // Phase 1 : spinning libre tant que targetName n'est pas là
  useEffect(() => {
    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx = (idx + 1) % COUNTRY_POOL.length;
      setDisplayedName(COUNTRY_POOL[idx]);
    }, 60);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Phase 2 : ralentissement dès que targetName arrive
  useEffect(() => {
    if (!targetName || phaseRef.current !== "spinning") return;

    if (intervalRef.current) clearInterval(intervalRef.current);
    updatePhase("slowing");

    let currentCountryIndex = 0;
    const delays = [150, 250, 380, 550, 800];
    let step = 0;

    const slowDown = () => {
      if (step >= delays.length) {
        setDisplayedName(targetName);
        updatePhase("done");
        timeoutRef.current = setTimeout(onDone, 700);
        return;
      }
      currentCountryIndex = (currentCountryIndex + 1) % COUNTRY_POOL.length;
      setDisplayedName(COUNTRY_POOL[currentCountryIndex]);
      step++;
      timeoutRef.current = setTimeout(slowDown, delays[step - 1]);
    };

    timeoutRef.current = setTimeout(slowDown, delays[0]);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [targetName, onDone]);

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <p className="text-xs font-semibold tracking-widest text-green-600 uppercase">
        Analyse en cours
      </p>

      <div className="relative overflow-hidden h-16 flex items-center justify-center w-full">
        <span
          key={displayedName}
          className={`text-4xl sm:text-5xl font-bold text-gray-900 transition-all duration-100 ${
            phase === "done" ? "text-green-600 scale-110" : ""
          }`}
          style={{
            animation: phase !== "done" ? "slotTick 0.08s ease-out" : "none",
          }}
        >
          {displayedName}
        </span>
      </div>

      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      <style>{`
        @keyframes slotTick {
          0%   { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
