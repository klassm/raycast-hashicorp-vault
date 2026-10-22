import { getPreferenceValues } from "@raycast/api";
import { useMemo } from "react";
import type { Config } from "../types/Config";

const DEFAULT_CACHE_DAYS = 3;
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);

function validateUrl(raw: string): string {
	const url = raw.trim().replace(/\/+$/, "");
	if (!url) {
		throw new Error('Vault URL is required. Set the "Vault URL" preference.');
	}
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		throw new Error(
			`"${url}" is not a valid absolute URL (e.g. https://vault.example.com). Fix the "Vault URL" preference.`,
		);
	}
	if (parsed.protocol !== "https:" && !LOCAL_HOSTNAMES.has(parsed.hostname)) {
		throw new Error(
			'Vault URL must use https:// (http:// is only allowed for localhost). Fix the "Vault URL" preference.',
		);
	}
	return url;
}

export function useConfig(): Config {
	return useMemo(() => {
		const { url, cacheDays, mount, indexPaths } = getPreferenceValues<{
			url: string;
			cacheDays: string;
			mount?: string;
			indexPaths?: string;
		}>();
		const parsedCacheDays = parseInt(cacheDays, 10);
		return {
			url: validateUrl(url),
			mount: mount?.trim() || "secret",
			cacheDays: Number.isNaN(parsedCacheDays)
				? DEFAULT_CACHE_DAYS
				: parsedCacheDays,
			indexPaths: (indexPaths ?? "")
				.split(",")
				.map((path) => path.trim())
				.filter((path) => path.length > 0),
		};
	}, []);
}
