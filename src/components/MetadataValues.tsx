import { Action, ActionPanel, closeMainWindow, Color, Icon, List, showHUD } from "@raycast/api";
import { FC, useMemo } from "react";
import { useValues } from "../hooks/useValues";
import { Metadata } from "../types/Metadata";
import { autotype } from "../vault/autotype";

interface MetadataValuesProps {
  metadata: Metadata;
}

function stringify(value: unknown): string {
  const stringify = JSON.stringify(value, undefined, 2);
  return stringify.startsWith('"') && stringify.endsWith('"') ? stringify.slice(1, -1) : stringify;
}

function jsonToMarkdown(value: unknown): string {
  return "```\n" + stringify(value) + "\n```";
}
export const MetadataValues: FC<MetadataValuesProps> = ({ metadata }) => {
  const { values, loading } = useValues(metadata.key);
  const mapped = useMemo(() => Object.entries(values), [values]);

  return (
    <List isLoading={loading} enableFiltering={true} searchBarPlaceholder="Values ..." throttle isShowingDetail={true}>
      {(mapped ?? []).map(([key, value]) => (
        <ValueItem key={key} metadata={metadata} itemKey={key} itemValue={value} />
      ))}
    </List>
  );
};

function ValueItem({ metadata, itemKey, itemValue }: { itemKey: string; metadata: Metadata; itemValue: unknown }) {
  return (
    <List.Item
      title={itemKey}
      detail={<List.Item.Detail markdown={jsonToMarkdown(itemValue)} />}
      icon={{
        source: Icon.Bolt,
        tintColor: Color.Brown,
      }}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.CopyToClipboard title="Copy" onCopy={() => showHUD("Copied")} content={stringify(itemValue)} />
            <Action
              icon={{ source: Icon.Key, tintColor: Color.Red }}
              title="Type"
              onAction={async () => {
                await closeMainWindow();
                autotype(stringify(itemValue));
              }}
            />
            <Action.OpenInBrowser
              icon={{ source: Icon.Link, tintColor: Color.Blue }}
              url={metadata.browserUrl}
              title="Open"
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
