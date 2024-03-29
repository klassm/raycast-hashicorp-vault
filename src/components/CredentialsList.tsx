import { Action, ActionPanel, closeMainWindow, Color, Icon, List } from "@raycast/api";
import { useCredentials } from "../hooks/useCredentials";
import { Credential } from "../types/Credential";
import { Metadata } from "../types/Metadata";
import { autotypeCredential } from "../vault/autotype";

export function CredentialsList({ metadata }: { metadata: Metadata }) {
  const { data, isLoading } = useCredentials(metadata.key);

  return (
    <List isLoading={isLoading} filtering searchBarPlaceholder="Search credentials..." throttle>
      {(data ?? []).map((entry) => (
        <MetadataItem key={entry.name} credential={entry} metadata={metadata} />
      ))}
    </List>
  );
}

function MetadataItem({ credential, metadata }: { credential: Credential; metadata: Metadata }) {
  const autotype = async () => {
    await closeMainWindow();
    autotypeCredential(credential);
  };
  return (
    <List.Item
      title={credential.name}
      icon={{
        source: Icon.Key,
        tintColor: Color.Red,
      }}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action icon={{ source: Icon.Key, tintColor: Color.Red }} title="Type" onAction={autotype} />
            <Action.OpenInBrowser
              icon={{ source: Icon.Link, tintColor: Color.Red }}
              url={metadata.browserUrl}
              title="Open"
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
