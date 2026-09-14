import { showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import type { Credential } from "../types/Credential";
import { listCredentials } from "../vault/listCredentials";
import { useConfig } from "./useConfig";

export function useCredentials(key: string) {
	const config = useConfig();
	const [data, setData] = useState<Credential[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	useEffect(() => {
		setIsLoading(true);
		listCredentials(key, config)
			.then(setData)
			.catch(async (error) => {
				await showToast({
					style: Toast.Style.Failure,
					title: "Loading credentials failed",
					message: error instanceof Error ? error.message : undefined,
				});
			})
			.finally(() => setIsLoading(false));
	}, []);

	return { data, isLoading };
}
