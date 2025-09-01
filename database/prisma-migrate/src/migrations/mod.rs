use futures_util::StreamExt;
use mongodb::{Client, bson::doc};
use tracing::{error, info, instrument};

use crate::db;

pub mod v0;
pub mod v1;

pub async fn migrate(client: &Client) -> Result<(), String> {
    info!("Running v0 -> v1 migration...");
    v0_to_v1(&client).await?;
    info!("v0 -> v1 migration complete.");
    Ok(())
}

/// Migrated Collections: `EnvExamTemp` -> `ExamCreatorExam`
#[instrument(skip_all)]
pub async fn v0_to_v1(client: &Client) -> Result<(), String> {
    let exam_collection_v0 = db::get_collection::<v0::V0EnvExamTemp>(&client, "EnvExamTemp").await;
    let exam_collection_v1 =
        db::get_collection::<v1::V1ExamCreatorExam>(&client, "ExamCreatorExam").await;

    let mut exams_v0 = match exam_collection_v0.find(doc! {}).await {
        Ok(e) => e,
        Err(e) => {
            error!("Unable to find EnvExamTemp collection");
            return Err(e.to_string());
        }
    };

    while let Some(exam_v0) = exams_v0.next().await {
        let v0 = exam_v0.map_err(|e| {
            error!("unable to get next exam from cursor.");
            e.to_string()
        })?;
        info!("migrating {}", v0.id);
        let v1: v1::V1ExamCreatorExam = v0.into();

        exam_collection_v1.insert_one(v1).await.map_err(|e| {
            error!("unable to insert exam");
            e.to_string()
        })?;
    }

    Ok(())
}
