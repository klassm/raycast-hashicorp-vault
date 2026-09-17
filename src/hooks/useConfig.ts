import { getPreferenceValues } from "@raycast/api";
import type { Config } from "../types/Config";

export function useConfig(): Config {
	const { url, cacheDays, indexPaths } = getPreferenceValues<{
		url: string;
		cacheDays: string;
		indexPaths?: string;
	}>();
	return {
		url,
		cacheDays: parseInt(cacheDays, 10),
		indexPaths: (indexPaths ?? "")
			.split(",")
			.map((path) => path.trim())
			.filter((path) => path.length > 0),
	};
}
