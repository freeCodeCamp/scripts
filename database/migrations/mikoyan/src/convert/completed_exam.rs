use mongodb::bson::{self, Bson, DateTime};
use serde::Deserialize;

use crate::record::{CompletedExam, ExamResults};

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
                        Bson::String(v) => Some(v.parse().unwrap()),
                        _ => None,
                    };
                }
                "completedDate" => {
                    if completed_date.is_some() {
                        return Err(serde::de::Error::duplicate_field("completedDate"));
                    }

                    completed_date = match map.next_value()? {
                        Bson::Double(v) => Some(DateTime::from_millis(v as i64)),
                        Bson::DateTime(v) => Some(v),
                        Bson::Int32(v) => Some(DateTime::from_millis(v as i64)),
                        Bson::Int64(v) => Some(DateTime::from_millis(v)),
                        Bson::Decimal128(v) => {
                            Some(DateTime::from_millis(v.to_string().parse().unwrap()))
                        }
                        Bson::Timestamp(v) => Some(DateTime::from_millis((v.time * 1000) as i64)),
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
                                bson::from_bson(Bson::Document(doc)).expect("Error");
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
                    println!("Skipping {key:?}");
                }
            }
        }

        let challenge_type = challenge_type.unwrap_or_default();
        let completed_date = completed_date.unwrap_or(DateTime::now());
        let exam_results = todo!("Discuss with Tom what is needed if such a case occurs");
        let id = id.unwrap_or_default();

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
