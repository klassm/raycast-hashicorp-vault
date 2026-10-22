import { showToast, Toast } from "@raycast/api";
import { useEffect, useRef, useState } from "react";

function errorMessage(error: unknown): string | undefined {
	return error instanceof Error ? error.message : String(error);
}

/**
 * Shared "load once per key" hook with stale-response protection: when `key`
 * changes or the component unmounts, resolutions from superseded requests are
 * ignored.
 */
export function useVaultData<T>(
	key: string,
	loader: () => Promise<T>,
	initialData: T,
	failureTitle: string,
): { data: T; isLoading: boolean } {
	const [data, setData] = useState<T>(initialData);
	const [isLoading, setIsLoading] = useState(false);
	const loaderRef = useRef(loader);

	useEffect(() => {
		loaderRef.current = loader;
	});

	useEffect(() => {
		let cancelled = false;
		setIsLoading(true);
		loaderRef
			.current()
			.then((result) => {
				if (!cancelled) {
					setData(result);
				}
			})
			.catch(async (error) => {
				if (cancelled) {
					return;
				}
				await showToast({
					style: Toast.Style.Failure,
					title: failureTitle,
					message: errorMessage(error),
				});
			})
			.finally(() => {
				if (!cancelled) {
					setIsLoading(false);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [key, failureTitle]);

	return { data, isLoading };
}
