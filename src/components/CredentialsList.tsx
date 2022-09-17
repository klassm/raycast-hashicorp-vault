import { Action, ActionPanel, closeMainWindow, Color, Icon, List } from "@raycast/api";
import { useEffect, useState } from "react";
import { autotypeCredential } from "../vault/autotypeCredential";
import { Credential, listCredentials } from "../vault/listCredentials";

const useData = (key: string) => {
  const [data, setData] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    setIsLoading(true);
    listCredentials(key).then(setData)
    setIsLoading(false);
  }, []);

  return { data, isLoading };
}

export function CredentialsList({metadataKey}: { metadataKey: string}) {
  const { data, isLoading } = useData(metadataKey);

  return (
    <List isLoading={ isLoading } enableFiltering={ true } searchBarPlaceholder="Search credentials..." throttle>
      <List.Section title="Results">
        { ( data ?? [] ).map((entry) => (
          <MetadataItem key={ entry.name } credential={ entry }/>
        )) }
      </List.Section>
    </List>
  );
}

function MetadataItem({ credential }: { credential: Credential }) {
  const autotype = async () => {
    await closeMainWindow();
    autotypeCredential(credential);
  }
  return (
    <List.Item
      title={ credential.name }
      icon={ {
        source: Icon.Key,
        tintColor: Color.Red,
      } }
      actions={ (
        <ActionPanel>
          <ActionPanel.Section>
            <Action icon={{ source: Icon.Key, tintColor: Color.Red}} title="Type" onAction={autotype} />
          </ActionPanel.Section>
        </ActionPanel>
      ) }
    />
  );
}
