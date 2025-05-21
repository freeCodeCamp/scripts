# Merge

This executable merges two or more `user` records into one.

## Usage

### Prerequisites

Requires Rust: https://www.rust-lang.org/tools/install

### Recommended

Install the binary locally:

```bash
scripts/database/merge $ cargo install --path .
```

Use anywhere:

```bash
merge --uri <MONGO_URI> --email <USER_EMAIL> default
```

### Development and Testing

Build and run it directly:

```bash
scripts/database/merge $ cargo run --release -- --uri <MONGO_URI> --email <USER_EMAIL> default
```

## Notes

Currently, only a default option (algorithm) exists to merge records. One day, a feature may be added whereby the CLI prompts how different fields are to be resolved.

### Algorithm

The default algorithm takes the oldest record as the record to keep, then:

- For all lists, concatenate ignoring duplicates
- All boolean values (except for `isBanned` and `isCheater`) are merged as true
- Values are preferred over `Undefined`, `Null`, and empty strings
