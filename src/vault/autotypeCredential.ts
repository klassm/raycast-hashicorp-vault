import process from "child_process";
import { Credential } from "../types/Credential";

export function autotypeCredential({ username, password }: Credential) {
  process.execSync(`echo 'tell application "System Events" to keystroke "${username}"' | osascript`);
  process.execSync(`echo 'tell application "System Events" to key code "48"' | osascript`); // tab
  process.execSync(`echo 'tell application "System Events" to keystroke "${password}"' | osascript`);
}
