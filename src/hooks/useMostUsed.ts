import { countBy, keyBy, sortBy, takeRight } from "lodash";
import { useMemo } from "react";
import type { Metadata } from "../types/Metadata";
import { useCache } from "./useCache";

function getMostUsed(metadata: Metadata[]): Metadata[] {
	const lookupRepositories = keyBy(metadata, (meta) => meta.key);
	const countEntries = Object.entries(countBy(metadata, (meta) => meta.key));
	return sortBy(countEntries, ([_entry, count]) => count)
		.reverse()
		.slice(0, 20)
		.map(([id]) => lookupRepositories[id])
		.filter((job): job is Metadata => job !== undefined);
}

function updateLastUsed(oldData: Metadata[], newEntry: Metadata): Metadata[] {
	const newEntries = [...oldData, newEntry];
	return takeRight(newEntries, 100);
}

export function useMostUsed() {
	const { data, update } = useCache<Metadata[]>(
		"vault-most-used",
		async () => [],
		{
			expirationMillis: 1000 * 60 * 24 * 60,
		},
	);
	const mostUsed = useMemo(() => getMostUsed(data ?? []), [data]);

	return {
		mostUsed,
		add: (job: Metadata) => update(updateLastUsed(data ?? [], job)),
	};
}
