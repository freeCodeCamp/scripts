# Mikoyan

## Desired Schema

```rust

```

## Actual Schema

[current-schema.json](./current-schema.json)

## Property Transformations

### Removal

- `__cachedRelations`
- `__data`
- `__dataSource`
- `__persisted`
- `__strict`
- `github`
- `isGihub`?
- `isLinkedIn`?
- `isTwitter`?
- `isWebsite`?
- `password`
- `timezone`?
- `verificationToken`?

### Transposition

- `completedChallenges`

### Miscellaneous

- `rand`?

## Run the Script

```bash
cargo run --release -- --db <db> --collection <collection> --url <url>
```

Example:

```bash
cargo run --release -- --db freecodecamp --collection user --url mongodb://localhost:27017
```

Run tests:

```bash
cargo test
```

More info:

```bash
cargo run -- --help
```
