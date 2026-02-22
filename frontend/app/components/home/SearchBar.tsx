import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../ui/Button";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center gap-2 mt-4"
    >
      <div className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-xl px-3 py-2 flex-1 max-w-xs">
        <Search size={14} className="text-gray-500 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ou chercher directement un pays..."
          className="bg-transparent text-sm text-gray-300 placeholder:text-gray-600 outline-none w-full"
        />
      </div>
      <Button type="submit" variant="secondary" size="sm">
        Chercher
      </Button>
    </form>
  );
}
