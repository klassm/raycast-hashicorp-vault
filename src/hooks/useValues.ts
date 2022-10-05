import { useEffect, useState } from "react";
import { listValues } from "../vault/listValues";

export function useValues(metadataKey: string) {
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>({});
  useEffect(() => {
    setLoading(true);
    listValues(metadataKey)
      .then(setValues)
      .then(() => setLoading(false));
  }, [metadataKey]);
  return { values, loading };
}
