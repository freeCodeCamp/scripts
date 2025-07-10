use mongodb::Client;

pub mod v1;
pub mod v2;

/// Migrated Collections: `EnvExam`, `EnvExamAttempt`
pub async fn v1_to_v2(client: &Client) {
    unimplemented!("create temp collection? or just overwrite? probably just overwrite.")
}
