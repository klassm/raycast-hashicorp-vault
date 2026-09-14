import NodeVault from "node-vault";
import type { Config } from "../types/Config";
import { resolveVaultToken } from "./token";

async function getValuesFor(key: string, vault: NodeVault.client) {
	const result = await vault.read(`secret/data/${key}`);
	return result.data.data;
}

export async function listValues(
	key: string,
	{ url }: Config,
): Promise<Record<string, unknown>> {
	const token = await resolveVaultToken();
	const vault = NodeVault({
		apiVersion: "v1",
		endpoint: url,
		token: token,
		noCustomHTTPVerbs: true,
	});

	return getValuesFor(key, vault);
}
