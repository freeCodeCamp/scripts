use futures_util::StreamExt;
use mongodb::{Client, bson::doc};

use crate::db;

pub mod v0;
pub mod v1;

pub async fn migrate(client: &Client) {
    v0_to_v1(&client).await;
}

/// Migrated Collections: `EnvExamTemp`
///       version: 0 does not exist
pub async fn v0_to_v1(client: &Client) {
    let exam_collection_v0 = db::get_collection::<v0::V0EnvExamTemp>(&client, "EnvExamTemp").await;
    let exam_collection_v1 =
        db::get_collection::<v1::V1ExamCreatorExam>(&client, "ExamCreatorExam").await;

    let mut exams_v0 = exam_collection_v0.find(doc! {}).await.unwrap();

    while let Some(exam_v0) = exams_v0.next().await {
        let v0 = exam_v0.unwrap();
        let v1: v1::V1ExamCreatorExam = v0.into();

        let _ = exam_collection_v1.insert_one(v1);
    }
}
