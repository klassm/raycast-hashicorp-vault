/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Vault URL - URL to Vault */
  "url": string,
  /** Token Source - Where the Vault token is read from: Raycast preferences or a macOS Keychain item. */
  "tokenSource": "preferences" | "keychain",
  /** Vault Token - Only used when Token Source is "Raycast Preferences". You can obtain a token by clicking on the user icon in the top right corner after logging in to Vault. Then select "Copy token". */
  "token": string,
  /** Keychain Service - Only used when Token Source is "macOS Keychain". Service name of the keychain item. Create it with: security add-generic-password -s <service> -a <account> -U -w */
  "keychainService": string,
  /** Keychain Account - Only used when Token Source is "macOS Keychain". Optional account name of the keychain item. Leave empty to match any account under the service. */
  "keychainAccount": string,
  /** Index Paths - Optional comma-separated path prefixes to index, e.g. "team-a/,infra/prod". Leave empty to index the whole vault recursively. */
  "indexPaths": string,
  /** Cache Days - Number of days to cache the metadata keys. */
  "cacheDays": "1" | "2" | "3" | "4" | "5" | "10" | "30" | "50" | "500"
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `listMetadata` command */
  export type ListMetadata = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `listMetadata` command */
  export type ListMetadata = {}
}

