/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Vault URL - URL to Vault */
  "url": string,
  /** Vault Token - You can obtain a token by clicking on the user icon in the top right corner after logging in to Vault. Then select "Copy token". */
  "token": string,
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

