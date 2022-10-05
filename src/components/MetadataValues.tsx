import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { FC, useMemo } from "react";
import { useValues } from "../hooks/useValues";

interface MetadataValuesProps {
  metadataKey: string;
}

function jsonToMarkdown(values: unknown): string {
  const stringify = JSON.stringify(values, undefined, 2);
  return "```\n" + stringify + "\n```";
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
            <Action.CopyToClipboard title="Copy" content={JSON.stringify(value)} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
