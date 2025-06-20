import { getPreferenceValues } from "@raycast/api";
import type { Config } from "../types/Config";

export function useConfig(): Config {
	const { url, token, cacheDays } = getPreferenceValues();
	return {
		url,
		token,
		cacheDays: parseInt(cacheDays, 10),
	};
}
