# Mikoyan

We have decided to not normalise the database to the point of one schema. Instead, all we **need** is all schemas to not have ambiguous data types.

- Fields posed as `[]?` should be normalised to `[]`
- Fields with similar structure but multiple data types should be normalised to one data type. E.g. `[String | Number]` -> `[String]`

## Desired Schema

<details>
  <summary>Click to expand</summary>

```rust
struct User {
  _id: ObjectId,
  about: String,
  accepted_privacy_terms: Boolean,
  badges: todo!(),
  completed_challenges: Vec<CompletedChallenge>,
  current_challenge_id: String,
  email: String,
  email_auth_link_ttl: bson::DateTime,
  email_verified: Boolean,
  email_verify_ttl: bson::DateTime,
  github_profile: String,
  is_honest: Boolean,
  is_resp_web_design_cert: Boolean,
  is_back_end_cert: Boolean,
  is_banned: Boolean,
  is_cheater: Boolean,
  is_full_stack_cert: Boolean,
  is_js_algo_data_struct_cert: Boolean,
  is_front_end_cert: Boolean,
  is_2018_data_vis_cert: Boolean,
  is_2018_full_stack_cert: Boolean,
  is_apis_microservices_cert: Boolean,
  is_data_vis_cert: Boolean,
  is_infosec_qa_cert: Boolean,
  is_data_analysis_py_cert_v7: Boolean,
  is_sci_comp_py_cert_v7: Boolean,
  is_infosec_cert_v7: Boolean,
  is_machine_learning_py_cert_v7: Boolean,
  is_qa_cert_v7: Boolean,
  is_relational_database_cert_v8: Boolean,
  keyboard_shortcuts: Boolean,
  linkedin: String,
  location: String,
  name: String,
  needs_moderation: Boolean,
  new_email: String,
  partially_completed_challenges: Vec<PartiallyCompletedChallenge>,
  points: Vec<u64>,
  profile_ui: ProfileUI,
  progress_timestamps: Vec<u64>,
  rand: String,
  saved_challenges: Vec<SavedChallenge>,
  sound: Boolean,
  theme: String,
  twitter: String,
  username_display: String,
  website: String,
  years_top_contributor: Vec<u64>,
}
```

</details>

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
  // Still created in LB, but never used
- `rand`
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
    - A string of length 4 takes 24 bytes, a double takes 8 bytes
- `profileUI`
  - `Undefined` -> `ProfileUI::default()`
  - Any `undefined` field -> `false` value
- `email`
  - Lowercase all email addresses

```rust
ProfileUI {
  isLocked: false,
  showAbout: false,
  showCerts: false,
  showDonation: false,
  showHeatMap: false,
  showLocation: false,
  showName: false,
  showPoints: false,
  showPortfolio: false,
  showTimeLine: false,
}
```

## Run the Script

```bash
cargo run --release -- --url <url> --num-threads <num-threads> --num_docs <num-docs> --logs <logs-path>
```

Example:

```bash
cargo run --release -- --num-threads 4
```

More info:

```bash
cargo run -- --help
```
