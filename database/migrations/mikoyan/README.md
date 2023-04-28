# MikoyanisHonest

## Desired Schema

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
  - remove all `__<>` properties
- `currentChallengeId`
  - `Undefined` -> `Null`
- `emailAuthLinkTTL`
  - `Undefined` -> `Null`
- `emailVerifyTTL`
  - `Undefined` -> `Null`
- `isHonest`
  - `Undefined` -> `false`
- `isRespWebDesignCert`
  - `Undefined` -> `false`
- `linkedin`
  - `Undefined` -> `Null`
- `profileUI`
  - `Undefined` -> `ProfileUI::default()`
- `progressTimestamps`
  - `[{ timestamp: Double }]` -> `[Double]`
  - `[Null]` -> `[]`
  - `[Int64]` -> `[Double]`
- `twitter`
  - `Undefined` -> `Null`
- `website`
  - `Undefined` -> `Null`
- `githubProfile`
  - `Undefined` -> `Null`
- `isBackEndCert`
  - `Undefined` -> `false`
- `isBanned`
  - `Undefined` -> `false`
- `isCheater`
  - `Undefined` -> `false`
- `isFullStackCert`
  - `Undefined` -> `false`
- `theme`
  - `Undefined` -> `"default"`
- `newEmail`
  - `Undefined` -> `Null`
- `isJsAlgoDataStructCert`
  - `Undefined` -> `false`
- `isFrontEndCert`
  - `Undefined` -> `false`
- `is2018DataVisCert`
  - `Undefined` -> `false`
- `is2018FullStackCert`
  - `Undefined` -> `false`
- `isApisMicroservicesCert`
  - `Undefined` -> `false`
- `isDataVisCert`
  - `Undefined` -> `false`
- `isInfosecQaCert`
  - `Undefined` -> `false`
- `partiallyCompletedChallenges`
  - `Undefined` -> `[]`
  - `[[]]` -> `[]`
  - Does this have any actual values?
- `sound`
  - `Undefined` -> `false`
- `yearsTopContributor`
  - `Undefined` -> `[]`
  - `[String]` -> `[Double]`
    - A string of length 4 takes 24 bytes, a double takes 8 bytes
- `keyboardShortcuts`
  - `Undefined` -> `false`
- `usernameDisplay`
  - `Undefined` -> `Null`
- `isDataAnalysisPyCertV7`
  - `Undefined` -> `false`
- `needsModeration`
  - `Undefined` -> `false`
- `savedChallenges`
  - `Undefined` -> `[]`
- `isSciCompPyCertV7`
  - `Undefined` -> `false`
- `isInfosecCertV7`
  - `Undefined` -> `false`
- `isMachineLearningPyCertV7`
  - `Undefined` -> `false`
- `isQaCertV7`
  - `Undefined` -> `false`
- `isRelationalDatabaseCertV8`
  - `Undefined` -> `false`
- `badges`
  - `Undefined` -> `[]`
  - Remove?
- `rand`
  - `Undefined` -> `Null` or something random

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
