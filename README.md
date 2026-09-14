# Hashicorp Vault

## Features

* List metadata
* List credentials (... and copy or autotype them)

## Installation

Clone this repository and run `npm install && npm run dev`.

## Configuration

* **Vault URL**: URL of your Vault instance.
* **Token Source**: where the plugin reads the Vault token from.
  * `Raycast Preferences` (default): paste the token into the "Vault Token" preference.
  * `macOS Keychain`: read the token from a keychain item, e.g. one you already share with scripts or CLI tools.
* **Keychain Service** (keychain mode only): service name of the keychain item, defaults to `hashicorp-vault`.
* **Keychain Account** (keychain mode only): optional account name. Leave empty to match any account under the service.

### Using the macOS Keychain

Create or update the keychain item (this prompts for the value so it never lands in your shell history):

```bash
security add-generic-password -s "hashicorp-vault" -a "token" -U -w
```

Omit `-a` entirely if you don't need an account name (then also leave the "Keychain Account" preference empty).

On first access, macOS shows an access prompt asking to allow Raycast to read the item - choose **Always Allow**.

Note: the token is resolved only when Vault data is actually fetched (metadata cache misses and credential lookups), not on every keystroke.
