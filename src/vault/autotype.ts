import process from "node:child_process";
import type { Credential } from "../types/Credential";

export function autotypeCredential({ username, password }: Credential) {
	process.execSync(
		`echo 'tell application "System Events" to keystroke "${username}"' | osascript`,
	);
	process.execSync(
		`echo 'tell application "System Events" to key code "48"' | osascript`,
	); // tab
	process.execSync(
		`echo 'tell application "System Events" to keystroke "${password}"' | osascript`,
	);
}

export function autotype(toType: string) {
	process.execSync(
		`echo 'tell application "System Events" to keystroke "${toType}"' | osascript`,
	);
}
