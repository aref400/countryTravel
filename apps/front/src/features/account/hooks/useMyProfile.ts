import { useEffect, useState } from "react";
import { getMyProfile } from "../services/account.service";
import type { UserProfile } from "../types";

// Charge le profil de l'utilisateur courant (pattern identique à useMyVisits).
export function useMyProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isActive = true;
    getMyProfile()
      .then((data) => {
        if (isActive) setProfile(data);
      })
      .catch(() => {
        if (isActive) setError(true);
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, []);

  return { profile, loading, error };
}
