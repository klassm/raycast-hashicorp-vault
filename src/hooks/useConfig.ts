import { getPreferenceValues } from "@raycast/api";
import type { Config } from "../types/Config";

export function useConfig(): Config {
	const { url, cacheDays } = getPreferenceValues();
	return {
		url,
		cacheDays: parseInt(cacheDays, 10),
	};
}
