import { useCallback, useEffect, useState } from "react";
import { CountryResult } from "../features/random/components/CountryResult";
import { SlotReveal } from "../features/random/components/SlotReveal";
import { getRandomCountry } from "../features/random/services/random.service";
import { ErrorState } from "../shared/components/ErrorState";
import type { CountryDetail } from "../shared/types/CountryType";

export function RandomPage() {
  const [country, setCountry] = useState<CountryDetail | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadRandom = async () => {
      setCountry(null);
      setRevealed(false);
      setError(null);
      try {
        const data = await getRandomCountry();
        if (!cancelled) setCountry(data);
      } catch {
        if (!cancelled) setError("Impossible de charger un pays aléatoire.");
      }
    };
    loadRandom();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchRandom = useCallback(async () => {
    setCountry(null);
    setRevealed(false);
    setError(null);
    try {
      const data = await getRandomCountry();
      setCountry(data);
    } catch {
      setError("Impossible de charger un pays aléatoire.");
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-green-600 uppercase mb-3">
          Destination aléatoire
        </span>
        <h1 className="text-2xl font-bold text-gray-900">
          La chance choisit pour vous
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Un pays sélectionné au hasard parmi notre catalogue.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {error ? (
          <ErrorState message={error} onRetry={fetchRandom} />
        ) : !revealed ? (
          <SlotReveal
            targetName={country?.name ?? null}
            onDone={() => setRevealed(true)}
          />
        ) : (
          country && <CountryResult country={country} onReplay={fetchRandom} />
        )}
      </div>
    </div>
  );
}
