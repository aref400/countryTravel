import { whereNumeric } from "iso-3166-1";
export function getAlpha2FromNumericId(numericId: string): string | undefined {
  return whereNumeric(numericId)?.alpha2;
}
