import { getPreferenceValues } from "@raycast/api";
import { Config } from "../types/Config";

export function useConfig(): Config {
  const { url, token } = getPreferenceValues();
  return {
    url,
    token,
  };
}
