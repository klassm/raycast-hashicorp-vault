import { spawn } from "node:child_process";
import type { Credential } from "../types/Credential";

function appleScriptEscape(text: string): string {
	return text.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function osascript(script: string): Promise<void> {
	await new Promise<void>((resolve, reject) => {
		const child = spawn("osascript", ["-"]);
		let stderr = "";
		child.stderr.on("data", (chunk) => {
			stderr += chunk;
		});
		child.on("error", reject);
		child.on("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(
					new Error(stderr.trim() || `osascript exited with code ${code}`),
				);
			}
		});
		child.stdin.write(script);
		child.stdin.end();
	});
}

const TELL = 'tell application "System Events"';

export async function autotypeCredential({
	username,
	password,
}: Credential): Promise<void> {
	await osascript(
		[
			TELL,
			"delay 0.2",
			`keystroke "${appleScriptEscape(username)}"`,
			"key code 48",
			`keystroke "${appleScriptEscape(password)}"`,
			"end tell",
		].join("\n"),
	);
}

export async function autotype(toType: string): Promise<void> {
	await osascript(
		[
			TELL,
			"delay 0.2",
			`keystroke "${appleScriptEscape(toType)}"`,
			"end tell",
		].join("\n"),
	);
}
