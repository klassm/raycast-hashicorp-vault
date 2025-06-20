import { useEffect, useState } from "react";
import type { Credential } from "../types/Credential";
import { listCredentials } from "../vault/listCredentials";

export function useCredentials(key: string) {
	const [data, setData] = useState<Credential[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	useEffect(() => {
		setIsLoading(true);
		listCredentials(key).then(setData);
		setIsLoading(false);
	}, []);

	return { data, isLoading };
}
