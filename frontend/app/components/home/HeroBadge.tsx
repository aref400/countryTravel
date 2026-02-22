import { Globe } from "lucide-react";
import { Badge } from "../ui/Badge";

export function HeroBadge() {
  return (
    <Badge>
      <Globe size={11} />
      Explorez le monde entier
    </Badge>
  );
}
