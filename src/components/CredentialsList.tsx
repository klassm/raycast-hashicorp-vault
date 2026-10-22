import {
	Action,
	ActionPanel,
	Color,
	closeMainWindow,
	Icon,
	List,
	showToast,
	Toast,
} from "@raycast/api";
import { useCredentials } from "../hooks/useCredentials";
import type { Credential } from "../types/Credential";
import type { Metadata } from "../types/Metadata";
import { autotypeCredential } from "../vault/autotype";

export function CredentialsList({ metadata }: { metadata: Metadata }) {
	const { data, isLoading } = useCredentials(metadata.key);

	return (
		<List
			isLoading={isLoading}
			filtering
			searchBarPlaceholder="Search credentials..."
			throttle
		>
			{data.map((entry, index) => (
				<CredentialItem
					key={`${index}-${entry.name}`}
					credential={entry}
					metadata={metadata}
				/>
			))}
		</List>
	);
}

function CredentialItem({
	credential,
	metadata,
}: {
	credential: Credential;
	metadata: Metadata;
}) {
	const typeCredential = async () => {
		await closeMainWindow();
		try {
			await autotypeCredential(credential);
		} catch (error) {
			await showToast({
				style: Toast.Style.Failure,
				title: "Autotype failed",
				message: error instanceof Error ? error.message : String(error),
			});
		}
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
						<Action
							icon={{ source: Icon.Key, tintColor: Color.Red }}
							title="Type"
							onAction={typeCredential}
						/>
						<Action.CopyToClipboard
							title="Copy Username"
							content={credential.username}
						/>
						<Action.CopyToClipboard
							title="Copy Password"
							content={credential.password}
						/>
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
