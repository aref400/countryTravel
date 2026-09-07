import { getAlpha2FromNumericId } from "@/features/map/utils/countryIsoCode";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import geoData from "world-atlas/countries-50m.json";

const MAP_WIDTH = 980;
const MAP_HEIGHT = 480;

interface CountryGeography {
  rsmKey: string;
  id: string | number;
  properties: { name: string };
}

interface Tooltip {
  content: ReactNode;
  x: number;
  y: number;
}

// @types/react-simple-maps mistypes this callback's parameter as SVGElement —
// at runtime react-simple-maps actually passes the raw wheel/mouse event.
// We only gate wheel events (require Ctrl/Cmd) so the page can still be
// scrolled normally when the cursor happens to be over the map; drag-to-pan
// and pinch-to-zoom are left untouched.
const filterZoomEvent = ((event: WheelEvent | MouseEvent) => {
  if (event.type === "wheel") {
    return (event as WheelEvent).ctrlKey || (event as WheelEvent).metaKey;
  }
  return true;
}) as unknown as (element: SVGElement) => boolean;

interface WorldMapProps {
  /** Couleur à appliquer à un pays, identifié par son code ISO alpha-2 (undefined si non reconnu). */
  getColor: (alpha2: string | undefined) => string;
  /** Contenu du tooltip affiché au survol d'un pays. */
  getTooltipContent: (alpha2: string | undefined) => ReactNode;
  /** Appelé au clic sur un pays. */
  onCountryClick: (alpha2: string | undefined) => void;
}

export function WorldMap({
  getColor,
  getTooltipContent,
  onCountryClick,
}: Readonly<WorldMapProps>) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  return (
    <div className="relative w-full h-[70vh] max-h-160 min-h-95">
      <ComposableMap
        projection="geoEqualEarth"
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        className="w-full h-full"
      >
        <ZoomableGroup
          minZoom={1}
          maxZoom={8}
          translateExtent={[
            [0, 0],
            [MAP_WIDTH, MAP_HEIGHT],
          ]}
          filterZoomEvent={filterZoomEvent}
        >
          <Geographies geography={geoData}>
            {({ geographies }: { geographies: CountryGeography[] }) =>
              geographies.map((geo) => {
                const alpha2 = getAlpha2FromNumericId(String(geo.id));
                const isFocused = focusedKey === geo.rsmKey;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getColor(alpha2)}
                    stroke={isFocused ? "#16a34a" : "#ffffff"}
                    strokeWidth={isFocused ? 2 : 0.5}
                    // Seuls les pays reconnus (alpha2 défini) sont interactifs :
                    // on ne rend focusable/annoncé que ce qui répond réellement
                    // au clic, comme pour la souris (cf. MAP-05).
                    tabIndex={alpha2 ? 0 : -1}
                    role={alpha2 ? "button" : undefined}
                    aria-label={alpha2 ? geo.properties.name : undefined}
                    onMouseEnter={(event) => {
                      setTooltip({
                        content: getTooltipContent(alpha2),
                        x: event.clientX,
                        y: event.clientY,
                      });
                    }}
                    onMouseMove={(event) => {
                      setTooltip((prev) =>
                        prev
                          ? { ...prev, x: event.clientX, y: event.clientY }
                          : prev,
                      );
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onFocus={(event) => {
                      if (!alpha2) return;
                      setFocusedKey(geo.rsmKey);
                      const rect = (
                        event.target as SVGPathElement
                      ).getBoundingClientRect();
                      setTooltip({
                        content: getTooltipContent(alpha2),
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onBlur={() => {
                      setFocusedKey(null);
                      setTooltip(null);
                    }}
                    onKeyDown={(event) => {
                      if (!alpha2) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onCountryClick(alpha2);
                      }
                    }}
                    onClick={() => onCountryClick(alpha2)}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        outline: "none",
                        filter: "brightness(0.9)",
                        cursor: alpha2 ? "pointer" : "default",
                      },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      <div className="pointer-events-none absolute top-3 right-3 z-10 rounded-lg bg-white/80 backdrop-blur-sm px-2.5 py-1 text-[11px] text-gray-600">
        Ctrl + molette pour zoomer
      </div>

      {tooltip && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg"
          style={{ top: tooltip.y + 12, left: tooltip.x + 12 }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
