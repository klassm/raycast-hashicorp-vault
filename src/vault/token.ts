import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getPreferenceValues } from "@raycast/api";

const execFileAsync = promisify(execFile);

interface TokenPreferences {
	tokenSource?: string;
	token?: string;
	keychainService?: string;
	keychainAccount?: string;
}

const DEFAULT_SERVICE = "hashicorp-vault";
const HEX_PATTERN = /^[0-9a-fA-F]+$/;
const PRINTABLE_ASCII = /^[\x20-\x7E]+$/;

/**
 * macOS 26 (Tahoe) hex-encodes `security ... -w` output for secrets containing
 * non-ASCII characters. Detect that case and decode back to UTF-8.
 */
function decodeKeychainOutput(output: string): string {
	const trimmed = output.trim();
	if (
		trimmed.length >= 32 &&
		trimmed.length % 2 === 0 &&
		HEX_PATTERN.test(trimmed)
	) {
		const decoded = Buffer.from(trimmed, "hex").toString("utf8");
		if (PRINTABLE_ASCII.test(decoded)) {
			return decoded;
		}
	}
	return trimmed;
}

function tokenSetupHint(service: string, account?: string): string {
	const accountPart = account ? `-a "${account}"` : "";
	return `Register it once with: security add-generic-password -s "${service}" ${accountPart} -U -w (prompts for the value, keeps it out of your shell history). On first access, macOS asks to allow Raycast access - choose "Always Allow".`;
}

async function readTokenFromKeychain(
	service: string,
	account?: string,
): Promise<string> {
	const args = ["find-generic-password", "-s", service];
	if (account) {
		args.push("-a", account);
	}
	args.push("-w");

	try {
		const { stdout } = await execFileAsync("security", args, {
			timeout: 5000,
		});
		return decodeKeychainOutput(stdout);
	} catch (error) {
		const reason =
			error instanceof Error && error.message
				? error.message.split("\n")[0]
				: "unknown error";
		throw new Error(
			`Could not read keychain item (service: "${service}"${account ? `, account: "${account}"` : ""}): ${reason}. ${tokenSetupHint(service, account)}`,
		);
	}
}

export async function resolveVaultToken(): Promise<string> {
	const { tokenSource, token, keychainService, keychainAccount } =
		getPreferenceValues<TokenPreferences>();

	if (tokenSource === "keychain") {
		const service = keychainService?.trim() || DEFAULT_SERVICE;
		const account = keychainAccount?.trim() || undefined;
		const fromKeychain = await readTokenFromKeychain(service, account);
		if (!fromKeychain) {
			throw new Error(
				`Keychain item (service: "${service}") is empty. ${tokenSetupHint(service, account)}`,
			);
		}
		return fromKeychain;
	}

	const fromPreferences = token?.trim() ?? "";
	if (!fromPreferences) {
		throw new Error(
			'No Vault token configured. Set the "Vault Token" preference or switch "Token Source" to "macOS Keychain".',
		);
	}
	return fromPreferences;
}
