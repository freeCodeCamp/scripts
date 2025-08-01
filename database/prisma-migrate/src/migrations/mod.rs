use futures_util::StreamExt;
use mongodb::{
    Client,
    bson::{self, doc},
};

use crate::db;

pub mod v1;
pub mod v2;

pub async fn migrate(client: &Client) {
    v1_to_v2(&client).await;
}

/// Migrated Collections: `EnvExam`, `EnvExamAttempt`
/// TODO: _id cannot be used in $set
///       version 1 does not exist
pub async fn v1_to_v2(client: &Client) {
    let exam_collection = db::get_collection::<v1::V1EnvExam>(&client, "ExamEnvironmentExam").await;

    let mut exams = exam_collection
        .find(doc! {
          "version": 1
        })
        .await
        .unwrap();

    while let Some(exam) = exams.next().await {
        // Deserialize v1
        let v1 = exam.unwrap();
        let v1_id = v1.id.clone();
        let v2: v2::V2ExamEnvironmentExam = v1.into();

        let v2_update = bson::to_bson(&v2).unwrap();

        exam_collection
            .update_one(
                doc! {
                  "_id": v1_id
                },
                doc! {
                  "$set": v2_update
                },
            )
            .await
            .unwrap();
    }

    let attempt_collection =
        db::get_collection::<v1::V1EnvExamAttempt>(&client, "ExamEnvironmentExamAttempt").await;

    let mut attempts = attempt_collection
        .find(doc! {
          "version": 1
        })
        .await
        .unwrap();

    while let Some(attempt) = attempts.next().await {
        // Deserialize v1
        let v1 = attempt.unwrap();
        let v1_id = v1.id.clone();
        let v2: v2::V2ExamEnvironmentExamAttempt = v1.into();

        let v2_update = bson::to_bson(&v2).unwrap();

        exam_collection
            .update_one(
                doc! {
                  "_id": v1_id
                },
                doc! {
                  "$set": v2_update
                },
            )
            .await
            .unwrap();
    }

    unimplemented!("create temp collection? or just overwrite? probably just overwrite.")
}
