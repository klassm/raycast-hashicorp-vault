import type NodeVault from "node-vault";
import type { Config } from "../types/Config";
import type { Metadata } from "../types/Metadata";
import { encodePath, getVaultClient } from "./client";

const MAX_CONCURRENT_REQUESTS = 8;

function keywordsFor(key: string): string[] {
	const keyParts = key.toLowerCase().split("/");
	const keywords = new Set<string>();
	for (const part of keyParts) {
		const subParts = part.split(/[-_]/g);
		keywords.add(part);
		if (subParts.length >= 3) {
			keywords.add(subParts.map((subPart) => subPart.charAt(0)).join(""));
		}
		for (const subPart of subParts) {
			if (subPart) {
				keywords.add(subPart);
			}
		}
	}
	return [...keywords];
}

function metadataFrom(config: Config, key: string): Metadata {
	const optionParts = key.split("/");
	const title = optionParts.slice(optionParts.length - 2).join(" ");
	const browserUrl = `${config.url}/ui/vault/secrets/${config.mount}/kv/${encodeURIComponent(key)}/details`;
	return {
		key,
		title,
		keywords: keywordsFor(key),
		browserUrl,
	};
}

interface VaultListing {
	paths: string[];
	secrets: string[];
}

function statusCodeOf(error: unknown): number | undefined {
	return (error as { response?: { statusCode?: number } })?.response
		?.statusCode;
}

async function listAllIn(
	path: string,
	mount: string,
	vault: NodeVault.client,
): Promise<VaultListing> {
	try {
		const result = await vault.list(`${mount}/metadata/${encodePath(path)}`);
		const collection = (result?.data?.keys ?? []).map(
			(key: string) => path + key,
		);
		return {
			paths: collection.filter((entry: string) => entry.endsWith("/")),
			secrets: collection.filter((entry: string) => !entry.endsWith("/")),
		};
	} catch (error) {
		if (statusCodeOf(error) === 404) {
			return { paths: [], secrets: [] };
		}
		throw error;
	}
}

async function mapWithConcurrency<T, R>(
	items: T[],
	limit: number,
	fn: (item: T) => Promise<R>,
): Promise<R[]> {
	const results: R[] = new Array(items.length);
	let nextIndex = 0;
	const workers = Array.from(
		{ length: Math.min(limit, items.length) },
		async () => {
			while (nextIndex < items.length) {
				const index = nextIndex++;
				results[index] = await fn(items[index]);
			}
		},
	);
	await Promise.all(workers);
	return results;
}

async function listMetadataForPath(
	path: string,
	mount: string,
	vault: NodeVault.client,
): Promise<string[]> {
	const result = await listAllIn(path, mount, vault);
	const secretsFromPaths = (
		await mapWithConcurrency(
			result.paths,
			MAX_CONCURRENT_REQUESTS,
			(foundPath) => listMetadataForPath(foundPath, mount, vault),
		)
	).flat();
	return [...secretsFromPaths, ...result.secrets];
}

export async function listMetadata(config: Config): Promise<Metadata[]> {
	const vault = await getVaultClient(config);
	const roots =
		config.indexPaths.length > 0
			? config.indexPaths.map(
					(path) => `${path.replace(/^\/+/, "").replace(/\/+$/, "")}/`,
				)
			: [""];
	const allMetadata = (
		await Promise.all(
			roots.map((root) => listMetadataForPath(root, config.mount, vault)),
		)
	).flat();
	return allMetadata.map((metadata) => metadataFrom(config, metadata));
}
