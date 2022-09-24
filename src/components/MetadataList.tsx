import { Action, ActionPanel, Cache, Color, getPreferenceValues, Icon, List, useNavigation } from "@raycast/api";
import { countBy, keyBy, sortBy, sum, takeRight, uniq } from "lodash";
import { useEffect, useState } from "react";
import { listAll } from "../vault/listMetadata";
import { CredentialsList } from "./CredentialsList";

const cache = new Cache();
const lastUsedCacheKey = "hashicorp-vault-metadata-last-used";
export const { url } = getPreferenceValues();

interface CacheData {
  lastModified: number;
  metadata: string[];
}

interface Metadata {
  title: string;
  keywords: string[];
  key: string;
  browserUrl: string;
}

function getLastUsedCache(): string[] {
  return JSON.parse(cache.get(lastUsedCacheKey) ?? "[]");
}

function getMostUsed() {
  const values = getLastUsedCache();
  const countEntries = Object.entries(countBy(values));
  const sortedEntries = sortBy(countEntries, (entry) => entry[1])
    .reverse()
    .map(([href]) => href);
  return sortedEntries.slice(0, 20);
}

function updateLastUsed(key: string) {
  const cachedEntries = getLastUsedCache();
  const newEntries = [...cachedEntries, key];
  const latestEntries = takeRight(newEntries, 100);

  cache.set(lastUsedCacheKey, JSON.stringify(latestEntries));
}

function keywordsFor(key: string): string[] {
  const keyParts = key.split("/");
  return keyParts.flatMap((part) => {
    const subParts = part.split(/[-_]/g);
    const acronym = subParts.length >= 3 ? subParts.map((part) => part.charAt(0)).join("") : undefined;
    return uniq([part, acronym, ...subParts].filter((it): it is string => !!it)).map((keyword) =>
      keyword.toLowerCase()
    );
  });
}

const metadataFrom = (key: string): Metadata => {
  const optionParts = key.split("/");
  const title = optionParts.slice(optionParts.length - 2).join(" ");
  const browserUrl = `${url}/ui/vault/secrets/secret/show/${key}`;
  return {
    key,
    title,
    keywords: keywordsFor(key),
    browserUrl,
  };
};

const getCachedData = async () => {
  const cacheKey = "hashicorp-vault-metadata";
  const cacheData = cache.get(cacheKey);
  const parsedCacheData: CacheData | undefined = cacheData === undefined ? undefined : JSON.parse(cacheData);
  const now = new Date().getTime();

  if (parsedCacheData !== undefined && now - parsedCacheData.lastModified < 1000 * 60 * 60 * 24) {
    return parsedCacheData.metadata;
  }

  const metadata = await listAll();
  if (metadata.length > 0) {
    cache.set(
      cacheKey,
      JSON.stringify({
        lastModified: now,
        metadata,
      } as CacheData)
    );
  }

  return metadata;
};

const useData = () => {
  const [data, setData] = useState<Metadata[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<Metadata[]>([]);

  useEffect(() => {
    setIsLoading(true);
    getCachedData()
      .then((entries) => entries.map(metadataFrom))
      .then(setData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (searchText) {
      setSearchResults(search(searchText, data));
    } else {
      const mostUsed = getMostUsed();
      const byUrl = keyBy(data, (metadata) => metadata.key);
      const filtered = mostUsed.map((href) => byUrl[href]).filter((metadata): metadata is Metadata => !!metadata);
      setSearchResults(filtered);
    }
  }, [searchText, data]);

  return { searchResults, setSearchText, isLoading };
};

const searchScoreFor = (queryParts: string[], metadata: Metadata): number => {
  const allPartsMatch = queryParts.every((part) => metadata.keywords.some((keyword) => keyword.includes(part)));
  if (!allPartsMatch) {
    return -1;
  }

  const keywordScores = metadata.keywords.map((keyword) => {
    const part = queryParts.find((part) => keyword.includes(part));
    return part ? part.length / keyword.length : 0;
  });

  return sum(keywordScores) / metadata.keywords.length;
};

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

export function MetadataList() {
  const { setSearchText, searchResults, isLoading } = useData();

  return (
    <List
      isLoading={isLoading}
      enableFiltering={false}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search Vault..."
      throttle
    >
      <List.Section title="Results">
        {(searchResults ?? []).map((entry) => (
          <MetadataItem key={entry.key} metadata={entry} />
        ))}
      </List.Section>
    </List>
  );
}

function MetadataItem({ metadata }: { metadata: Metadata }) {
  const navigation = useNavigation();
  return (
    <List.Item
      title={metadata.title}
      subtitle={metadata.key}
      keywords={metadata.keywords}
      icon={{
        source: Icon.Plug,
        tintColor: Color.Blue,
      }}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser onOpen={() => updateLastUsed(metadata.key)} title="Open" url={metadata.browserUrl} />
            <Action
              icon={{ source: Icon.Key, tintColor: Color.Red }}
              title="Credentials"
              onAction={() => {
                updateLastUsed(metadata.key);
                navigation.push(<CredentialsList metadataKey={metadata.key} />);
              }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
