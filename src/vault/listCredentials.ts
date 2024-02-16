import { groupBy } from "lodash";
import { Credential } from "../types/Credential";
import { listValues } from "./listValues";

function valuesToCredentials(values: Record<string, unknown>): Credential[] {
  const stringValues = Object.entries(values).filter(
    (array): array is [string, string] => typeof array[1] === "string",
  );
  const groups = groupBy(stringValues, ([key]) => key.replace(/user(name)?/i, "").replace(/pass(word)?/i, ""));
  const credentials = Object.values(groups).filter((group) => group.length === 2);
  return credentials
    .map((values): Credential | undefined => {
      const userValues = values.find(([key]) => key.toLowerCase().includes("user"));
      const passwordValues = values.find(([key]) => key.toLowerCase().includes("pass"));
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const name: string = userValues![0].replace(/user(name)?/i, "").replace(/_$/, "");
      const username = userValues?.[1];
      const password = passwordValues?.[1];
      return username !== undefined && password !== undefined && name !== undefined
        ? { name, username, password }
        : undefined;
    })
    .filter((it): it is Credential => it !== undefined);
}

export async function listCredentials(key: string): Promise<Credential[]> {
  const values = await listValues(key);
  return valuesToCredentials(values);
}
