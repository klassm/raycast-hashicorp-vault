import { sortBy, sum } from "lodash";
import { useEffect, useState } from "react";
import { Metadata } from "../types/Metadata";
import { useMetadata } from "./useMetadata";
import { useMostUsed } from "./useMostUsed";

function searchScoreFor(queryParts: string[], metadata: Metadata): number {
  const allPartsMatch = queryParts.every((part) => metadata.keywords.some((keyword) => keyword.includes(part)));
  if (!allPartsMatch) {
    return -1;
  }

  const keywordScores = metadata.keywords.map((keyword) => {
    const part = queryParts.find((part) => keyword.includes(part));
    return part ? part.length / keyword.length : 0;
  });

  return sum(keywordScores) / metadata.keywords.length;
}

const search = (query: string, data: Metadata[]): Metadata[] => {
  const queryParts = query.toLowerCase().split(/[ -_]/);
  const withScore = data
    .map((entry) => ({
      ...entry,
      score: searchScoreFor(queryParts, entry),
    }))
    .filter((entry) => entry.score > 0);

  const sorted = sortBy(withScore, (entry) => entry.score).reverse();
  return sorted.slice(0, 20);
};

export function useSearchMetadata() {
  const { repositories = [], loading, reload } = useMetadata();
  const [searchResults, setSearchResults] = useState<Metadata[]>([]);
  const [query, setQuery] = useState("");
  const { mostUsed, add: updateMostUsed } = useMostUsed();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (query) {
      setSearchResults(search(query, repositories));
    } else {
      setSearchResults(mostUsed);
    }
  }, [query, repositories, loading]);

  return { loading, searchResults, setQuery, updateMostUsed, reload };
}
