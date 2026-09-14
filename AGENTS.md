# AGENTS.md

Raycast extension for reading secrets from HashiCorp Vault.

## Commands

- `npm run lint` - lint with Biome (also covers formatting)
- `npm run format` - auto-fix lint issues and format
- `npm run build` - bundle the extension with `ray build` (writes to `dist/`)
- `npm run dev` - hot-reloading development mode via `ray develop`
- `npx tsc --noEmit` - typecheck only

Run `npm run lint` and `npm run build` before finishing any change.

## Notes

- Formatting: Biome with tabs and double quotes (see `biome.json` / `.prettierrc`).
- After a fresh `npm install`, if `npm run lint` fails with `EACCES` on the biome
  binary, the `postinstall` chmod did not run. Fix: `chmod +x ./node_modules/@biomejs/cli-*/biome`.
- `ray build`/`ray develop` need read/write access to `~/.config/raycast`. In a
  nono-sandboxed session this path is not granted by default, which makes the
  build fail with `EPERM`. Run the build outside the sandbox or start the session
  with `nono run --allow /Users/klassm/.config/raycast -- opencode`.
- Vault token resolution lives in `src/vault/token.ts` (preferences or macOS
  keychain via `security find-generic-password`). Both Vault clients
  (`listMetadata`, `listValues`) must resolve the token through this single helper.
