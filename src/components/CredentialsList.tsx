import { Action, ActionPanel, closeMainWindow, Color, Icon, List } from "@raycast/api";
import { useCredentials } from "../hooks/useCredentials";
import { Credential } from "../types/Credential";
import { autotypeCredential } from "../vault/autotypeCredential";

export function CredentialsList({ metadataKey }: { metadataKey: string }) {
  const { data, isLoading } = useCredentials(metadataKey);

  return (
    <List isLoading={isLoading} enableFiltering={true} searchBarPlaceholder="Search credentials..." throttle>
      <List.Section title="Results">
        {(data ?? []).map((entry) => (
          <MetadataItem key={entry.name} credential={entry} />
        ))}
      </List.Section>
    </List>
  );
}

function MetadataItem({ credential }: { credential: Credential }) {
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
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
