import { useMemo, useState } from "react";
import type { Metadata } from "../types/Metadata";
import { useMetadata } from "./useMetadata";
import { useMostUsed } from "./useMostUsed";

function searchScoreFor(queryParts: string[], metadata: Metadata): number {
	const allPartsMatch = queryParts.every((part) =>
		metadata.keywords.some((keyword) => keyword.includes(part)),
	);
	if (!allPartsMatch) {
		return -1;
	}

	let scoreSum = 0;
	for (const keyword of metadata.keywords) {
		const part = queryParts.find((queryPart) => keyword.includes(queryPart));
		if (part) {
			scoreSum += part.length / keyword.length;
		}
	}

	return scoreSum / metadata.keywords.length;
}

const search = (query: string, data: Metadata[]): Metadata[] => {
	const queryParts = query.toLowerCase().split(/[ -_]/);
	return data
		.map((entry) => ({ entry, score: searchScoreFor(queryParts, entry) }))
		.filter(({ score }) => score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, 20)
		.map(({ entry }) => entry);
};

export function useSearchMetadata() {
	const { repositories = [], loading, reload } = useMetadata();
	const [query, setQuery] = useState("");
	const { mostUsed, add: updateMostUsed } = useMostUsed();

	const searchResults = useMemo(
		() => (query ? search(query, repositories) : mostUsed),
		[query, repositories, mostUsed],
	);

	return { loading, searchResults, setQuery, updateMostUsed, reload };
}
