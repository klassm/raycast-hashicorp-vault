import { useCallback } from "react";
import { listValues } from "../vault/listValues";
import { useConfig } from "./useConfig";
import { useVaultData } from "./useVaultData";

const NO_VALUES: Record<string, unknown> = {};

export function useValues(metadataKey: string) {
	const config = useConfig();
	const loader = useCallback(
		() => listValues(metadataKey, config),
		[metadataKey, config],
	);
	return useVaultData(metadataKey, loader, NO_VALUES, "Loading values failed");
}
