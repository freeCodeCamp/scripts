# Mikoyan

We have decided to not normalise the database to the point of one schema. Instead, all we **need** is all schemas to not have ambiguous data types.

- Fields posed as `[]?` should be normalised to `[]`
- Fields with similar structure but multiple data types should be normalised to one data type. E.g. `[String | Number]` -> `[String]`

## Actual Schema

[current-schema.json](./current-schema.json)

## Property Transformations

### Removal

- `badges`
- `isGithub`
- `isLinkedIn`
- `isTwitter`
- `isWebsite`
- `password`
- `timezone`
- `sound`
- `completedChallenges.$[el].files.$[el].history`

Nonesense created by LB:

- `completedChallenges.$[el].__cachedRelations`
- `completedChallenges.$[el].__data`
- `completedChallenges.$[el].__dataSource`
- `completedChallenges.$[el].__persisted`
- `completedChallenges.$[el].__strict`
- `profileUI.__cachedRelations`
- `profileUI.__data`
- `profileUI.__dataSource`
- `profileUI.__persisted`
- `profileUI.__strict`

Note: `rand` was planned to be removed, but, until the migration, new records will continue to be created with the field.

### Transposition

- `savedChallenges`
  - `Undefined` -> `[]`
- `partiallyCompletedChallenges`
  - `Undefined` -> `[]`
- `completedChallenges`
  - `[{ files: Undefined | Null }]` -> `[{ files: [] }]`
- `progressTimestamps`
  - `[{ timestamp: Double | Int32 | Int64 | String | Timestamp }]` -> `[i64]`
  - `[Null | Undefined]` -> `[]`
  - `[Int64 | Int32 | String]` -> `[i64]`
- `yearsTopContributor`
  - `Undefined` -> `[]`
  - `[String | Int32 | Int64]` -> `[Int32]`
    - A string of length 4 takes 24 bytes, an `i32` takes 4 bytes
- `profileUI`
  - `Undefined` -> `ProfileUI::default()`
  - Any `undefined` field -> `false` value
- `email`
  - Lowercase all email addresses

## Usage

### Testing

- Download sample dataset from MongoDB into `sample-users.json`:

```sh
db.getCollection("user").aggregate(
  [{ $sample: { size: 100 } }]
);
```

**Note**: Must be <5% of collection size

- Import into database

```sh
mongoimport --db=freeCodeCamp --collection=user --file=sample-users.json
```

- Run the migration (see below for more options)

```sh
mikoyan
```

- Confirm nothing went wrong in logs file
- Download normalized `user` collection to `normalized-users.json`
- Run differ to see changes:

```sh
differ/$ npm run comp
differ/$ npm run diff
differ/$ less diff.txt
```

### Use the Bin

```bash
mikoyan --url <url> --num-threads <num-threads> --num_docs <num-docs> --logs <logs-path>
```

Example:

```bash
mikoyan --release -- --num-threads 4
```

More info:

```bash
mikoyan --help
```
