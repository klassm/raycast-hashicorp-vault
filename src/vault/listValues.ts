import { getPreferenceValues } from "@raycast/api";
import NodeVault from "node-vault";

async function getValuesFor(key: string, vault: NodeVault.client) {
	const result = await vault.read(`secret/data/${key}`);
	return result.data.data;
}

export async function listValues(
	key: string,
): Promise<Record<string, unknown>> {
	const { url, token } = getPreferenceValues();
	const vault = NodeVault({
		apiVersion: "v1",
		endpoint: url,
		token: token,
		noCustomHTTPVerbs: true,
	});

	return getValuesFor(key, vault);
}
