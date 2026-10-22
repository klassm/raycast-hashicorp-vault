import { useCallback } from "react";
import type { Credential } from "../types/Credential";
import { listCredentials } from "../vault/listCredentials";
import { useConfig } from "./useConfig";
import { useVaultData } from "./useVaultData";

const NO_CREDENTIALS: Credential[] = [];

export function useCredentials(key: string) {
	const config = useConfig();
	const loader = useCallback(() => listCredentials(key, config), [key, config]);
	return useVaultData(
		key,
		loader,
		NO_CREDENTIALS,
		"Loading credentials failed",
	);
}
