# Changelog Fragment Companion (VS Code)

Manage per-PR changelog fragments — the towncrier convention:
instead of every PR editing the same `CHANGELOG.md` and fighting merge
conflicts, each PR adds a small `changelog.d/<issue>.<type>.md` file,
collected into a real changelog at release time. No data leaves your
editor.

**v0.1, pilot.** Part of the Gap Hunter Labs VS Code workstream,
ported from the IntelliJ-family `changelog-fragment-companion`. No
VS Code Marketplace equivalent found for the "create/validate a
fragment inside the editor" workflow specifically.

## What it does

- **Command: `Changelog Fragment Companion: New Fragment`** — prompts
  for an issue/PR number, a type (feature/bugfix/doc/removal/misc —
  towncrier's own default set), and a one-line description, then
  creates `changelog.d/<issue>.<type>.md` with that content and opens
  it. Never overwrites an existing fragment for the same issue+type.
- **Live validation**: any file directly inside a `changelog.d/`
  directory whose name doesn't match `<issue-number>.<type>.md` gets a
  warning — catches a typo'd type, a missing issue number, or the
  wrong extension before it ships in a release.

**Scope, deliberate (same as the original):** only files whose direct
parent directory is literally named `changelog.d` are checked — a
project using a differently-named fragments directory isn't covered.
The 5 fragment types are towncrier's own default set — a team using a
custom type list isn't covered in this v0.1.

## Privacy

See [PRIVACY.md](PRIVACY.md) — zero network calls, everything runs
against files already in your workspace.

## Development

```bash
npm install
npm run compile   # or: npm run watch
npm test
```

To build an installable package without publishing:

```bash
npx @vscode/vsce package
```

## License

Apache License 2.0 — see [LICENSE](LICENSE).
