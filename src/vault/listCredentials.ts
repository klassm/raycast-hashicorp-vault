import { getPreferenceValues } from "@raycast/api";
import { groupBy } from "lodash";
import NodeVault from "node-vault";
import { Credential } from "../types/Credential";

async function getValuesFor(key: string, vault: NodeVault.client) {
  const result = await vault.read(`secret/data/${key}`);
  return result.data.data;
}

function valuesToCredentials(values: Record<string, unknown>): Credential[] {
  const stringValues = Object.entries(values).filter(
    (array): array is [string, string] => typeof array[1] === "string"
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
  const { url, token } = getPreferenceValues();
  const vault = NodeVault({
    apiVersion: "v1",
    endpoint: url,
    token: token,
    noCustomHTTPVerbs: true,
  });

  const values = await getValuesFor(key, vault);
  return valuesToCredentials(values);
}
