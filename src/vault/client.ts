import NodeVault from "node-vault";
import type { Config } from "../types/Config";
import { resolveVaultToken } from "./token";

const REQUEST_TIMEOUT_MS = 15000;

let cached:
	| { endpoint: string; token: string; client: NodeVault.client }
	| undefined;

export function encodePath(path: string): string {
	return path
		.split("/")
		.map((segment) => encodeURIComponent(segment))
		.join("/");
}

export async function getVaultClient({
	url,
}: Config): Promise<NodeVault.client> {
	const token = await resolveVaultToken();
	if (cached && cached.endpoint === url && cached.token === token) {
		return cached.client;
	}
	const client = NodeVault({
		apiVersion: "v1",
		endpoint: url,
		token,
		noCustomHTTPVerbs: true,
		requestOptions: {
			strictSSL: true,
			timeout: REQUEST_TIMEOUT_MS,
			agentOptions: { keepAlive: true },
		},
	});
	cached = { endpoint: url, token, client };
	return client;
}
