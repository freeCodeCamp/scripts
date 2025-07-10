# Prisma Migrate

Migrate from one schema to another.

All migrations live in `src/migrations` as `v<i>.rs`. In order for a migration to happen, `From<PreviousVersion>` must be implemented for `NextVersion`:

```rust
impl From<V1MyCollection> for V2MyCollection {}
```

The migrations can be simple removals / additions, where defaults just need to be set:

```rust
impl From<V1> for V2 {
    fn from(v1: V1) -> Self {
        let json: Value = serde_json::to_value(&v1).unwrap();
        let v2: Self = serde_json::from_value(json).unwrap();
        v2
    }
}
```

However, if the migrations involve data manipulation, then this _hack_ will not work. Instead, a full conversion should be implemented.
