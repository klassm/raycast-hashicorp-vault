import { Action, ActionPanel, Color, Icon, List, useNavigation } from "@raycast/api";
import { useSearchMetadata } from "../hooks/useSearchMetadata";
import { Metadata } from "../types/Metadata";
import { CredentialsList } from "./CredentialsList";

export function MetadataList() {
  const { setQuery, searchResults, loading, updateMostUsed } = useSearchMetadata();

  return (
    <List
      isLoading={loading}
      enableFiltering={false}
      onSearchTextChange={setQuery}
      searchBarPlaceholder="Search Vault..."
      throttle
    >
      <List.Section title="Results">
        {(searchResults ?? []).map((entry) => (
          <MetadataItem key={entry.key} metadata={entry} updateMostUsed={() => updateMostUsed(entry)} />
        ))}
      </List.Section>
    </List>
  );
}

function MetadataItem({ metadata, updateMostUsed }: { metadata: Metadata; updateMostUsed: () => void }) {
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
            <Action.OpenInBrowser onOpen={() => updateMostUsed()} title="Open" url={metadata.browserUrl} />
            <Action
              icon={{ source: Icon.Key, tintColor: Color.Red }}
              title="Credentials"
              onAction={() => {
                updateMostUsed();
                navigation.push(<CredentialsList metadataKey={metadata.key} />);
              }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
