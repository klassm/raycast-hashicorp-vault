import { Cache, showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useRef, useState } from "react";

const cache = new Cache();

export type CacheProvider<T> = () => Promise<T>;

interface CacheData<T> {
	lastModified: number;
	data: T;
}

function errorMessage(error: unknown): string {
	return error instanceof Error && error.message
		? error.message
		: String(error);
}

function loadExistingData<T>(cacheKey: string): CacheData<T> | undefined {
	const cachedData = cache.get(cacheKey);
	if (cachedData === undefined) {
		return undefined;
	}
	try {
		const parsed = JSON.parse(cachedData) as CacheData<T>;
		if (typeof parsed?.lastModified !== "number") {
			throw new Error("unexpected cache shape");
		}
		return parsed;
	} catch {
		cache.remove(cacheKey);
		return undefined;
	}
}

export function useCache<T>(
	key: string,
	provider: CacheProvider<T>,
	expirationMillis: number,
) {
	const [data, setData] = useState<CacheData<T> | undefined>(() =>
		loadExistingData<T>(key),
	);
	const [loading, setLoading] = useState(false);
	const requestIdRef = useRef(0);
	const providerRef = useRef(provider);

	useEffect(() => {
		providerRef.current = provider;
	});

	const fetchAndStore = useCallback(
		async (cacheKey: string): Promise<CacheData<T> | undefined> => {
			const requestId = ++requestIdRef.current;
			try {
				const fresh = await providerRef.current();
				if (requestId !== requestIdRef.current) {
					return undefined;
				}
				if (Array.isArray(fresh) && fresh.length === 0) {
					return loadExistingData<T>(cacheKey);
				}
				const saveData: CacheData<T> = {
					lastModified: Date.now(),
					data: fresh,
				};
				cache.set(cacheKey, JSON.stringify(saveData));
				return saveData;
			} catch (error) {
				if (requestId === requestIdRef.current) {
					await showToast({
						style: Toast.Style.Failure,
						title: "Loading Vault data failed",
						message: errorMessage(error),
					});
				}
				return undefined;
			} finally {
				if (requestId === requestIdRef.current) {
					setLoading(false);
				}
			}
		},
		[],
	);

	const reload = useCallback(() => {
		setLoading(true);
		fetchAndStore(key).then((result) => {
			if (result !== undefined) {
				setData(result);
			}
		});
	}, [key, fetchAndStore]);

	const loadedKeyRef = useRef(key);
	useEffect(() => {
		loadedKeyRef.current = key;
		const cached = loadExistingData<T>(key);
		if (
			cached !== undefined &&
			Date.now() - cached.lastModified < expirationMillis
		) {
			setData(cached);
			return;
		}
		reload();
	}, [key, expirationMillis, reload]);

	return {
		data: data?.data,
		loading,
		reload,
	};
}
