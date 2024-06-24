use mongodb::bson::{self, Bson};
use serde::Deserialize;

use crate::{
    normalize::ToMillis,
    record::{CompletedExam, ExamResults},
};

struct CompletedExamVisitor;

impl<'de> serde::de::Visitor<'de> for CompletedExamVisitor {
    type Value = CompletedExam;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("struct CompletedExam")
    }

    fn visit_map<A>(self, mut map: A) -> Result<Self::Value, A::Error>
    where
        A: serde::de::MapAccess<'de>,
    {
        let mut challenge_type = None;
        let mut completed_date = None;
        let mut exam_results = None;
        let mut id = None;

        while let Some(key) = map.next_key::<String>()? {
            match key.as_str() {
                "challengeType" => {
                    if challenge_type.is_some() {
                        return Err(serde::de::Error::duplicate_field("challengeType"));
                    }

                    challenge_type = match map.next_value()? {
                        Bson::Int32(v) => Some(v),
                        Bson::Int64(v) => Some(v as i32),
                        Bson::Double(v) => Some(v as i32),
                        _ => None,
                    };
                }
                "completedDate" => {
                    if completed_date.is_some() {
                        return Err(serde::de::Error::duplicate_field("completedDate"));
                    }

                    completed_date = match map.next_value()? {
                        Bson::Double(v) => Some(v.to_millis()),
                        Bson::DateTime(v) => Some(v.to_millis()),
                        Bson::Int32(v) => Some(v.to_millis()),
                        Bson::Int64(v) => Some(v.to_millis()),
                        Bson::Timestamp(v) => Some(v.to_millis()),
                        _ => None,
                    };
                }
                "examResults" => {
                    if exam_results.is_some() {
                        return Err(serde::de::Error::duplicate_field("examResults"));
                    }

                    exam_results = match map.next_value()? {
                        Bson::Document(doc) => {
                            let exam_results: ExamResults =
                                bson::from_document(doc).map_err(|e| {
                                    serde::de::Error::invalid_value(
                                        serde::de::Unexpected::Other(&e.to_string()),
                                        &"a valid ExamResults",
                                    )
                                })?;
                            Some(exam_results)
                        }
                        _ => None,
                    };
                }
                "id" => {
                    if id.is_some() {
                        return Err(serde::de::Error::duplicate_field("id"));
                    }

                    id = match map.next_value()? {
                        Bson::String(v) => Some(v),
                        _ => None,
                    };
                }
                _ => {
                    // println!("Skipping {key:?}");
                }
            }
        }

        // DEFAULTS should never happen. So, error should be returned to prevent any change to user record.
        let challenge_type =
            challenge_type.ok_or(serde::de::Error::missing_field("challengeType"))?;
        let completed_date =
            completed_date.ok_or(serde::de::Error::missing_field("completedDate"))?;
        let exam_results = exam_results.ok_or(serde::de::Error::missing_field("examResults"))?;
        let id = id.ok_or(serde::de::Error::missing_field("id"))?;

        Ok(CompletedExam {
            challenge_type,
            completed_date,
            exam_results,
            id,
        })
    }
}

impl<'de> Deserialize<'de> for CompletedExam {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        deserializer.deserialize_any(CompletedExamVisitor)
    }
}
