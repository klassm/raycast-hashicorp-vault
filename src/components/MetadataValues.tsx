import { Action, ActionPanel, closeMainWindow, Color, Icon, List, showHUD } from "@raycast/api";
import { FC, useMemo } from "react";
import { useValues } from "../hooks/useValues";
import { autotype } from "../vault/autotype";

interface MetadataValuesProps {
  metadataKey: string;
}

function stringify(value: unknown): string {
  const stringify = JSON.stringify(value, undefined, 2);
  return stringify.startsWith('"') && stringify.endsWith('"') ? stringify.slice(1, -1) : stringify;
}

function jsonToMarkdown(value: unknown): string {
  return "```\n" + stringify(value) + "\n```";
}
export const MetadataValues: FC<MetadataValuesProps> = ({ metadataKey }) => {
  const { values, loading } = useValues(metadataKey);
  const mapped = useMemo(() => Object.entries(values), [values]);

  return (
    <List isLoading={loading} enableFiltering={true} searchBarPlaceholder="Values ..." throttle isShowingDetail={true}>
      {(mapped ?? []).map(([key, value]) => (
        <ValueItem metadataKey={key} value={value} />
      ))}
    </List>
  );
};

function ValueItem({ metadataKey, value }: { metadataKey: string; value: unknown }) {
  return (
    <List.Item
      title={metadataKey}
      detail={<List.Item.Detail markdown={jsonToMarkdown(value)} />}
      icon={{
        source: Icon.Bolt,
        tintColor: Color.Brown,
      }}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.CopyToClipboard title="Copy" onCopy={() => showHUD("Copied")} content={JSON.stringify(value)} />
            <Action
              title="Type"
              onAction={async () => {
                await closeMainWindow();
                autotype(stringify(value));
              }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
