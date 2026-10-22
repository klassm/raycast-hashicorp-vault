import type { Config } from "../types/Config";
import type { Credential } from "../types/Credential";
import { listValues } from "./listValues";

function valuesToCredentials(values: Record<string, unknown>): Credential[] {
	const stringValues = Object.entries(values).filter(
		(entry): entry is [string, string] => typeof entry[1] === "string",
	);
	const groups = new Map<string, [string, string][]>();
	for (const entry of stringValues) {
		const groupKey = entry[0]
			.replace(/user(name)?/i, "")
			.replace(/pass(word)?/i, "");
		const group = groups.get(groupKey);
		if (group) {
			group.push(entry);
		} else {
			groups.set(groupKey, [entry]);
		}
	}
	return [...groups.values()].flatMap((group) => {
		if (group.length !== 2) {
			return [];
		}
		const userEntry = group.find(([key]) => key.toLowerCase().includes("user"));
		const passwordEntry = group.find(([key]) =>
			key.toLowerCase().includes("pass"),
		);
		if (!userEntry || !passwordEntry) {
			return [];
		}
		const name = userEntry[0].replace(/user(name)?/i, "").replace(/_$/, "");
		return [{ name, username: userEntry[1], password: passwordEntry[1] }];
	});
}

export async function listCredentials(
	key: string,
	config: Config,
): Promise<Credential[]> {
	const values = await listValues(key, config);
	return valuesToCredentials(values);
}
