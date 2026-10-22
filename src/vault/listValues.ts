import type { Config } from "../types/Config";
import { encodePath, getVaultClient } from "./client";

export async function listValues(
	key: string,
	config: Config,
): Promise<Record<string, unknown>> {
	const vault = await getVaultClient(config);
	const result = await vault.read(`${config.mount}/data/${encodePath(key)}`);
	return result?.data?.data ?? {};
}
