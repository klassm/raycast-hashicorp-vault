import { groupBy, uniq } from "lodash";
import NodeVault from "node-vault";
import type { Config } from "../types/Config";
import type { Metadata } from "../types/Metadata";

function keywordsFor(key: string): string[] {
	const keyParts = key.toLowerCase().split("/");
	return keyParts.flatMap((part) => {
		const subParts = part.split(/[-_]/g);
		const acronym =
			subParts.length >= 3
				? subParts.map((part) => part.charAt(0)).join("")
				: undefined;
		return uniq(
			[part, acronym, ...subParts].filter((it): it is string => !!it),
		);
	});
}

function metadataFrom(vaultUrl: string, key: string): Metadata {
	const optionParts = key.split("/");
	const title = optionParts.slice(optionParts.length - 2).join(" ");
	const browserUrl = `${vaultUrl}/ui/vault/secrets/secret/kv/${encodeURIComponent(key)}/details`;
	return {
		key,
		title,
		keywords: keywordsFor(key),
		browserUrl,
	};
}
// https://vault.srv.reu.bsh-lando.com/ui/vault/secrets/secret/kv/content-annotations%2Fruntime%2Fannotation-service%2FGLOBAL-STG/details
// https://vault.srv.reu.bsh-lando.com/ui/vault/secrets/secret/show/content-annotations%2Fruntime%2Fannotation-service%2FGLOBAL-STG/details

async function listAllIn(
	path: string,
	vault: NodeVault.client,
): Promise<{ paths: string[]; secrets: string[] }> {
	try {
		const result = await vault.list(`secret/metadata/${path}`);
		const collection = result.data.keys.map((key: string) => path + key);
		const groups = groupBy(collection, (entry) =>
			entry.endsWith("/") ? "paths" : "secrets",
		);
		return {
			paths: [],
			secrets: [],
			...groups,
		};
	} catch (_e) {
		return { paths: [], secrets: [] };
	}
}

async function listMetadataForPath(
	path = "",
	vault: NodeVault.client,
): Promise<string[]> {
	const result = await listAllIn(path, vault);
	const secretsFromPaths = (
		await Promise.all(
			result.paths.flatMap((foundPath: string) =>
				listMetadataForPath(foundPath, vault),
			),
		)
	).flat();
	return [...secretsFromPaths, ...result.secrets];
}

export async function listMetadata({
	url,
	token,
}: Config): Promise<Metadata[]> {
	const vault = NodeVault({
		apiVersion: "v1",
		endpoint: url,
		token: token,
		noCustomHTTPVerbs: true,
	});
	const allMetadata = await listMetadataForPath("", vault);
	return allMetadata.map((metadata) => metadataFrom(url, metadata));
}
