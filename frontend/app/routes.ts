import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("explorer", "routes/explorer.tsx"),
  route("carte", "routes/map.tsx"),
  route("recommander", "routes/recommend.tsx"),
  route("recherche", "routes/search.tsx"),
  route("aleatoire", "routes/random.tsx"),
  route("amis", "routes/friends.tsx"),
  route("pays/:isoCode", "routes/country.$isoCode.tsx"),
] satisfies RouteConfig;
