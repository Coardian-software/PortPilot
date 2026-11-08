# Contributing to PortPilot

## Development setup

Requirements:

- Node.js 20 or newer
- pnpm 11 or newer
- `ss` or `lsof` on Linux/macOS for local integration checks

Install dependencies and run the full local checks:

```bash
pnpm install
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm build
pnpm audit
```

Keep changes focused, add tests for behavior changes, and update the README
when a command or supported platform changes.

## Pull requests

Explain the user-visible behavior, include verification commands, and call out
platform-specific limitations. Do not include process dumps, credentials, or
machine-specific paths in fixtures or documentation.
