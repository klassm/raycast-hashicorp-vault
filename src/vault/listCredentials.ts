import { getPreferenceValues } from "@raycast/api";
import { groupBy } from "lodash";
import NodeVault from "node-vault";

async function getValuesFor(key: string, vault: NodeVault.client) {
  const result = await vault.read(`secret/data/${key}`);
  return result.data.data;
}

export interface Credential {
  username: string;
  password: string;
  name: string;
}

function valuesToCredentials(values: Record<string, any>): Credential[] {
  const stringValues = Object.entries(values).filter(([_, value]) => typeof value === "string");
  const groups = groupBy(stringValues, ([key]) => key.replace(/user(name)?/i, "").replace(/pass(word)?/i, ""));
  const credentials = Object.values(groups).filter((group) => group.length === 2);
  return credentials
    .map((values): Credential | undefined => {
      const userValues = values.find(([key]) => key.toLowerCase().includes("user"));
      const passwordValues = values.find(([key]) => key.toLowerCase().includes("pass"));
      const name: string = userValues![0].replace(/user(name)?/i, "").replace(/_$/, "");
      const username: string = userValues?.[1];
      const password: string = passwordValues?.[1];
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
