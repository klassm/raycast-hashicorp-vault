import { listMetadata } from "../vault/listMetadata";
import { useCache } from "./useCache";
import { useConfig } from "./useConfig";

export function useMetadata() {
  const config = useConfig();
  const { data, loading, reload } = useCache(
    "vault-metadata",
    async () => {
      return listMetadata(config);
    },
    {
      expirationMillis: config.cacheDays * 1000 * 60 * 60 * 24,
    },
  );
  return { repositories: data, loading, reload };
}
