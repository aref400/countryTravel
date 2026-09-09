import { useState } from "react";

interface Props {
  username: string;
  avatarUrl?: string | null;
  /** Classes de taille/texte (ex. "w-14 h-14 text-lg"). */
  className?: string;
}

// Affiche la photo de profil si une URL valide est fournie et se charge,
// sinon les initiales du pseudo (repli automatique en cas d'image cassée).
export function Avatar({ username, avatarUrl, className = "" }: Readonly<Props>) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const initials = username.slice(0, 2).toUpperCase();
  const showImage = !!avatarUrl && failedUrl !== avatarUrl;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full overflow-hidden font-bold text-green-700 ${className}`}
      style={{ background: "#dcfce7" }}
      aria-hidden="true"
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setFailedUrl(avatarUrl)}
        />
      ) : (
        initials
      )}
    </span>
  );
}
