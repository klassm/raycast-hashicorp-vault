import { getPreferenceValues } from "@raycast/api";
import nodeVault from "node-vault";
import { groupBy } from "lodash";

export const { url, token } = getPreferenceValues();

const vault = nodeVault({
  apiVersion: 'v1',
  endpoint: url,
  token: token,
  noCustomHTTPVerbs: true
})

async function listAllIn(path: string): Promise<{ paths: string[], secrets: string[]}> {
  try {
    const result = await vault.list(`secret/metadata/${path}`)
    const collection = result.data.keys.map(
      (key: string) => path + key);
    const groups = groupBy(collection,
      entry => entry.endsWith("/") ? "paths" : "secrets");
    return {
      paths: [],
      secrets: [],
      ...groups
    }
  } catch (e) {
    return {paths: [], secrets: []};
  }
}

export async function listMetadata(path = ""): Promise<string[]> {
  const result = await listAllIn(path);
  const secretsFromPaths = (await Promise.all(
    result.paths.flatMap((foundPath: string) => listMetadata(foundPath))))
    .flatMap(it => it);
  return [...secretsFromPaths, ...result.secrets];
}
