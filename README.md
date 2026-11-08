# PortPilot

A fast, cross-platform CLI for finding, inspecting, monitoring, and managing processes listening on local TCP ports.

## Install

```bash
npm install -g portpilot
```

## Quick start

```bash
# What is using port 3000?
portpilot 3000
# same as: portpilot find 3000
```

## Commands

| Command                    | Description                                           |
| -------------------------- | ----------------------------------------------------- |
| `portpilot find <port>`    | Find processes listening on a port.                   |
| `portpilot inspect <port>` | Show detailed information about a port.               |
| `portpilot kill <port>`    | Terminate a process listening on a port.              |
| `portpilot free <port>`    | Find, confirm, and terminate every process on a port. |
| `portpilot list`           | List all listening TCP ports.                         |
| `portpilot watch`          | Continuously monitor listening ports.                 |

## Options

| Option              | Applies to     | Description                                    |
| ------------------- | -------------- | ---------------------------------------------- |
| `--force`           | `kill`, `free` | Skip confirmation prompts.                     |
| `--json`            | most commands  | Emit machine-readable JSON.                    |
| `--quiet`           | most commands  | Output only the most useful value (e.g. PIDs). |
| `--verbose`         | most commands  | Show debug information.                        |
| `--interval <ms>`   | `watch`        | Polling interval (default 1000).               |
| `-p, --port <port>` | global         | Shortcut for `find <port>`.                    |

## Examples

```bash
portpilot list --process node
portpilot find 3000 --json
portpilot free 5173 --force
portpilot watch --interval 500
```

## Exit codes

| Code | Meaning                    |
| ---- | -------------------------- |
| 0    | Success                    |
| 1    | General error              |
| 2    | Invalid arguments          |
| 3    | Port or process not found  |
| 4    | Permission error           |
| 5    | Process termination failed |

## Cross-platform support

PortPilot runs on Linux, macOS, and Windows. Linux and macOS use the installed
`ss`/`lsof` and `ps` utilities; Windows uses `netstat` and process-management
utilities. If discovery tools are unavailable, the command reports an error
instead of returning fabricated data.

`kill` and `free` ask for confirmation by default. Use `--force` in scripts or
non-interactive terminals. `watch` keeps polling until interrupted with Ctrl-C
and emits a new snapshot only when the listening-process set changes.

## Programmatic API

```ts
import { findPort, listPorts } from 'portpilot';

const processes = await findPort(3000);
```

## Development

```bash
pnpm install
pnpm dev        # build in watch mode
pnpm build      # production build
pnpm test       # run tests
pnpm test:coverage # run tests with coverage
pnpm lint       # lint source
pnpm format:check # verify formatting
pnpm typecheck  # type-check without emitting
pnpm audit      # audit all dependencies
```

PortPilot does not require environment variables or external services.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](./LICENSE)
