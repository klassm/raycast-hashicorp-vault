import { Action, ActionPanel, Color, Icon, List, useNavigation } from "@raycast/api";
import { useSearchMetadata } from "../hooks/useSearchMetadata";
import { Metadata } from "../types/Metadata";
import { CredentialsList } from "./CredentialsList";
import { MetadataValues } from "./MetadataValues";

export function MetadataList() {
  const { setQuery, searchResults, loading, updateMostUsed, reload } = useSearchMetadata();

  return (
    <List
      isLoading={loading}
      filtering={false}
      onSearchTextChange={setQuery}
      searchBarPlaceholder="Search Vault..."
      throttle
    >
      {(searchResults ?? []).map((entry) => (
        <MetadataItem key={entry.key} metadata={entry} updateMostUsed={() => updateMostUsed(entry)} reload={reload} />
      ))}
    </List>
  );
}

function MetadataItem({
  metadata,
  updateMostUsed,
  reload,
}: {
  metadata: Metadata;
  updateMostUsed: () => void;
  reload: () => void;
}) {
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
            <Action
              icon={{ source: Icon.Bolt, tintColor: Color.Red }}
              title="Values"
              onAction={() => {
                updateMostUsed();
                navigation.push(<MetadataValues metadata={metadata} />);
              }}
            />
            <Action
              icon={{ source: Icon.Key, tintColor: Color.Red }}
              title="Credentials"
              onAction={() => {
                updateMostUsed();
                navigation.push(<CredentialsList metadata={metadata} />);
              }}
            />
            <Action
              icon={{ source: Icon.Download, tintColor: Color.Blue }}
              title="Reload"
              onAction={() => {
                reload();
              }}
            />
            <Action.OpenInBrowser onOpen={() => updateMostUsed()} title="Open" url={metadata.browserUrl} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
