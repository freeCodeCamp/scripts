//! # V1 -> V2
//!
//! ## Changes
//!
//! ### `ExamEnv`
//!
//! #### Add
//!
//! - `config.passingPercent` as Double
//!   - `0.0`
//!
//! ### `EnvExamAttempt`
//!
//! #### Remove
//!
//! - `needsRetake` Boolean

use mongodb::bson;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::migrations::v1::{V1EnvExam, V1EnvExamAttempt, V1EnvGeneratedExam};

prisma_rust_schema::import_types!(
    schema_path = "https://raw.githubusercontent.com/ShaunSHamilton/freeCodeCamp/41343853e6cfd17f11c51a675586b09ecbb0f91c/api/prisma/schema.prisma",
    prefix = "V2",
    derive = [Clone, Debug, Serialize, Deserialize, PartialEq],
    patch = [
      struct V2ExamEnvironmentExamAttempt {
        #[serde(default = "version")]
        pub version: i64
      },
      struct V2ExamEnvironmentExam {
        #[serde(default = "version")]
        pub version: i64
      },
      struct V2ExamEnvironmentConfig {
        #[serde(default)]
        pub passing_percent: f64
      }
    ]
);

pub fn version() -> i64 {
    2
}

impl From<V1EnvExam> for V2ExamEnvironmentExam {
    fn from(v1_env_exam: V1EnvExam) -> Self {
        let json: Value = serde_json::to_value(&v1_env_exam).unwrap();
        let v2: Self = serde_json::from_value(json).unwrap();
        v2
    }
}

impl From<V1EnvExamAttempt> for V2ExamEnvironmentExamAttempt {
    fn from(value: V1EnvExamAttempt) -> Self {
        let json: Value = serde_json::to_value(&value).unwrap();
        let v2: Self = serde_json::from_value(json).unwrap();
        v2
    }
}

impl From<V1EnvGeneratedExam> for V2ExamEnvironmentGeneratedExam {
    fn from(value: V1EnvGeneratedExam) -> Self {
        let json: Value = serde_json::to_value(&value).unwrap();
        let v2: Self = serde_json::from_value(json).unwrap();
        v2
    }
}

#[cfg(test)]
mod v1_to_v2 {
    use cmp::compare_structs;
    use mongodb::bson::oid::ObjectId;

    use crate::migrations::{
        v1::{V1EnvConfig, V1EnvExam, V1EnvExamAttempt},
        v2::{V2ExamEnvironmentConfig, V2ExamEnvironmentExam, V2ExamEnvironmentExamAttempt},
    };

    #[test]
    fn env_exam() {
        let v1 = V1EnvExam {
            id: ObjectId::new(),
            question_sets: vec![],
            config: V1EnvConfig {
                name: String::from("Test"),
                note: String::new(),
                tags: vec![],
                total_time_in_m_s: 100,
                question_sets: vec![],
                retake_time_in_m_s: 100,
            },
            prerequisites: vec![],
            deprecated: false,
        };

        let v1_cop = v1.clone();
        let v2 = V2ExamEnvironmentExam {
            id: v1_cop.id,
            question_sets: vec![],
            config: V2ExamEnvironmentConfig {
                name: v1_cop.config.name,
                note: v1_cop.config.note,
                tags: vec![],
                total_time_in_m_s: v1_cop.config.total_time_in_m_s,
                question_sets: vec![],
                retake_time_in_m_s: v1_cop.config.retake_time_in_m_s,
                passing_percent: 0.0,
            },
            prerequisites: vec![],
            deprecated: v1_cop.deprecated,
            version: 2,
        };

        let new: V2ExamEnvironmentExam = v1.into();

        compare_structs!(
            v2,
            new,
            id,
            question_sets,
            config,
            prerequisites,
            deprecated,
            version
        );
    }

    #[test]
    fn env_exam_attempt() {
        let v1 = V1EnvExamAttempt {
            id: ObjectId::new(),
            user_id: ObjectId::new(),
            exam_id: ObjectId::new(),
            generated_exam_id: ObjectId::new(),
            question_sets: vec![],
            start_time_in_m_s: 100,
            needs_retake: false,
        };

        let v1_cop = v1.clone();

        let v2 = V2ExamEnvironmentExamAttempt {
            id: v1_cop.id,
            user_id: v1_cop.user_id,
            exam_id: v1_cop.exam_id,
            generated_exam_id: v1_cop.generated_exam_id,
            question_sets: vec![],
            start_time_in_m_s: v1_cop.start_time_in_m_s,
            version: 2,
        };

        let new: V2ExamEnvironmentExamAttempt = v1.into();

        compare_structs!(
            v2,
            new,
            id,
            user_id,
            exam_id,
            generated_exam_id,
            question_sets,
            start_time_in_m_s,
            version
        );
    }
}
