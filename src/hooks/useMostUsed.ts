import { Cache } from "@raycast/api";
import { useCallback, useMemo, useState } from "react";
import type { Metadata } from "../types/Metadata";

const LAST_USED_KEY = "vault-most-used";
const MAX_HISTORY = 100;
const TOP_COUNT = 20;

const cache = new Cache();

function readLastUsed(): Metadata[] {
	const raw = cache.get(LAST_USED_KEY);
	if (raw === undefined) {
		return [];
	}
	try {
		const parsed = JSON.parse(raw) as { data?: Metadata[] };
		return Array.isArray(parsed?.data) ? parsed.data : [];
	} catch {
		cache.remove(LAST_USED_KEY);
		return [];
	}
}

function getMostUsed(metadata: Metadata[]): Metadata[] {
	const entries = new Map<string, { meta: Metadata; count: number }>();
	for (const meta of metadata) {
		const entry = entries.get(meta.key);
		if (entry) {
			entry.count += 1;
		} else {
			entries.set(meta.key, { meta, count: 1 });
		}
	}
	return [...entries.values()]
		.sort((a, b) => b.count - a.count)
		.slice(0, TOP_COUNT)
		.map((entry) => entry.meta);
}

export function useMostUsed() {
	const [lastUsed, setLastUsed] = useState<Metadata[]>(readLastUsed);

	const add = useCallback((job: Metadata) => {
		setLastUsed((current) => {
			const next = [...current, job].slice(-MAX_HISTORY);
			cache.set(LAST_USED_KEY, JSON.stringify({ data: next }));
			return next;
		});
	}, []);

	const mostUsed = useMemo(() => getMostUsed(lastUsed), [lastUsed]);

	return { mostUsed, add };
}
