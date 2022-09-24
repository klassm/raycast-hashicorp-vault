import { getPreferenceValues } from "@raycast/api";
import NodeVault from "node-vault";
import nodeVault from "node-vault";
import { groupBy } from "lodash";

async function listAllIn(path: string, vault: NodeVault.client): Promise<{ paths: string[]; secrets: string[] }> {
  console.log(path);
  try {
    const result = await vault.list(`secret/metadata/${path}`);
    const collection = result.data.keys.map((key: string) => path + key);
    const groups = groupBy(collection, (entry) => (entry.endsWith("/") ? "paths" : "secrets"));
    return {
      paths: [],
      secrets: [],
      ...groups,
    };
  } catch (e) {
    return { paths: [], secrets: [] };
  }
}

async function listMetadata(path = "", vault: NodeVault.client): Promise<string[]> {
  const result = await listAllIn(path, vault);
  const secretsFromPaths = (
    await Promise.all(result.paths.flatMap((foundPath: string) => listMetadata(foundPath, vault)))
  ).flatMap((it) => it);
  return [...secretsFromPaths, ...result.secrets];
}

export async function listAll(): Promise<string[]> {
  const { url, token } = getPreferenceValues();

  const vault = nodeVault({
    apiVersion: "v1",
    endpoint: url,
    token: token,
    noCustomHTTPVerbs: true,
  });

  return listMetadata("", vault);
}
