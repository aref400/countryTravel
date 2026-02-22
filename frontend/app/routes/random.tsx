import { redirect } from "react-router";

export async function loader() {
  const COUNTRIES = ["FR", "JP", "BR", "AU", "ZA", "MX", "IN", "IT", "CA", "NO"];
  const random = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  return redirect(`/pays/${random}`);
}

export default function RandomPage() {
  return null;
}
