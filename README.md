# Scripts

> Scripts for some one-off DevOps tasks. We use these for generating stats and other housekeeping.

## Requirements

- Node.js 26.13.1 (see `.node-version`)
- pnpm 12.21.0

Install the pinned pnpm version with the npm bundled with Node.js:

```bash
npm install --global pnpm@12.21.0
```

## Usage

> [!WARNING]
> Please validate and sanity check the scripts before use. Code and instructions can become stale or outdated over time.

Each script is an independent package, so install dependencies in its directory:

```bash
cd <folder name of script>
pnpm install --frozen-lockfile
```

The `news` script uses npm instead:

```bash
cd news
npm ci
```

Follow the instructions in the package's `README.md` or check the script code for details.
