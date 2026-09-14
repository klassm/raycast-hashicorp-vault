import { showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { listValues } from "../vault/listValues";
import { useConfig } from "./useConfig";

export function useValues(metadataKey: string) {
	const config = useConfig();
	const [loading, setLoading] = useState(false);
	const [values, setValues] = useState<Record<string, unknown>>({});
	useEffect(() => {
		setLoading(true);
		listValues(metadataKey, config)
			.then(setValues)
			.catch(async (error) => {
				await showToast({
					style: Toast.Style.Failure,
					title: "Loading values failed",
					message: error instanceof Error ? error.message : undefined,
				});
			})
			.then(() => setLoading(false));
	}, [metadataKey]);
	return { values, loading };
}
