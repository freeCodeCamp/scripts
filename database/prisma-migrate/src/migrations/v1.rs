//! # V0 -> V1
//!
//! ## Changes
//!
//! ### `EnvExamTemp` -> `ExamCreatorExam`
//!
//! #### Add
//!
//! - `version` as Int
//!   - `1`

use mongodb::bson;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::migrations::v0::V0EnvExamTemp;

prisma_rust_schema::import_types!(
    schema_path = "https://raw.githubusercontent.com/freeCodeCamp/freeCodeCamp/main/api/prisma/schema.prisma",
    prefix = "V1",
    derive = [Clone, Debug, Serialize, Deserialize, PartialEq],
    patch = [
      struct V1ExamCreatorExam {
        #[serde(default = "version")]
        pub version: i64
      },
    ],
    include = [
        "ExamCreatorExam",
        "ExamEnvironmentQuestionSet",
        "ExamEnvironmentMultipleChoiceQuestion",
        "ExamEnvironmentConfig",
        "ExamEnvironmentQuestionType",
        "ExamEnvironmentAudio",
        "ExamEnvironmentAnswer",
        "ExamEnvironmentTagConfig",
        "ExamEnvironmentQuestionSetConfig"
    ]
);

pub fn version() -> i64 {
    1
}

impl From<V0EnvExamTemp> for V1ExamCreatorExam {
    fn from(v0_env_exam: V0EnvExamTemp) -> Self {
        let json: Value = serde_json::to_value(&v0_env_exam).unwrap();
        let v1: Self = serde_json::from_value(json).unwrap();
        v1
    }
}

#[cfg(test)]
mod v1_to_v2 {
    use cmp::compare_structs;
    use mongodb::bson::oid::ObjectId;

    use crate::migrations::{
        v0::{V0EnvConfig, V0EnvExamTemp},
        v1::{V1ExamCreatorExam, V1ExamEnvironmentConfig},
    };

    #[test]
    fn env_exam_temp_to_exam_creator_exam() {
        let v0 = V0EnvExamTemp {
            id: ObjectId::new(),
            question_sets: vec![],
            config: V0EnvConfig {
                name: String::from("Test"),
                note: String::new(),
                tags: vec![],
                total_time_in_m_s: 100,
                question_sets: vec![],
                retake_time_in_m_s: 100,
                passing_percent: 80.0,
            },
            prerequisites: vec![],
            deprecated: false,
        };

        let v0_cop = v0.clone();
        let v1 = V1ExamCreatorExam {
            id: v0_cop.id,
            question_sets: vec![],
            config: V1ExamEnvironmentConfig {
                name: v0_cop.config.name,
                note: v0_cop.config.note,
                tags: vec![],
                total_time_in_m_s: v0_cop.config.total_time_in_m_s,
                question_sets: vec![],
                retake_time_in_m_s: v0_cop.config.retake_time_in_m_s,
                passing_percent: v0_cop.config.passing_percent,
            },
            prerequisites: vec![],
            deprecated: v0_cop.deprecated,
            version: 1,
        };

        let new: V1ExamCreatorExam = v0.into();

        compare_structs!(
            v1,
            new,
            id,
            question_sets,
            config,
            prerequisites,
            deprecated,
            version
        );
    }
}
