import {
	Action,
	ActionPanel,
	Color,
	closeMainWindow,
	Icon,
	List,
	showHUD,
	showToast,
	Toast,
} from "@raycast/api";
import { type FC, useMemo } from "react";
import { useValues } from "../hooks/useValues";
import type { Metadata } from "../types/Metadata";
import { autotype } from "../vault/autotype";

interface MetadataValuesProps {
	metadata: Metadata;
}

function stringify(value: unknown): string {
	return typeof value === "string"
		? value
		: JSON.stringify(value, undefined, 2);
}

function jsonToMarkdown(value: unknown): string {
	return `\`\`\`\n${stringify(value)}\n\`\`\``;
}
export const MetadataValues: FC<MetadataValuesProps> = ({ metadata }) => {
	const { data: values, isLoading } = useValues(metadata.key);
	const mapped = useMemo(() => Object.entries(values), [values]);

	return (
		<List
			isLoading={isLoading}
			enableFiltering={true}
			searchBarPlaceholder="Values ..."
			throttle
			isShowingDetail={true}
		>
			{mapped.map(([key, value]) => (
				<ValueItem
					key={key}
					metadata={metadata}
					itemKey={key}
					itemValue={value}
				/>
			))}
		</List>
	);
};

function ValueItem({
	metadata,
	itemKey,
	itemValue,
}: {
	itemKey: string;
	metadata: Metadata;
	itemValue: unknown;
}) {
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
						<Action.CopyToClipboard
							title="Copy"
							onCopy={() => showHUD("Copied")}
							content={stringify(itemValue)}
						/>
						<Action
							icon={{ source: Icon.Key, tintColor: Color.Red }}
							title="Type"
							onAction={async () => {
								await closeMainWindow();
								try {
									await autotype(stringify(itemValue));
								} catch (error) {
									await showToast({
										style: Toast.Style.Failure,
										title: "Autotype failed",
										message:
											error instanceof Error ? error.message : String(error),
									});
								}
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
