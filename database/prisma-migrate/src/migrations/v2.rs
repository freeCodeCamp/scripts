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
    schema_path = "./prisma/v2-schema.prisma",
    prefix = "V2",
    derive = [Clone, Debug, Serialize, Deserialize, PartialEq],
    patch = [
      struct V2EnvConfig {
        #[serde(default)]
        pub passing_percent: f64
      }
    ]
);

impl From<V1EnvExam> for V2EnvExam {
    fn from(v1_env_exam: V1EnvExam) -> Self {
        let json: Value = serde_json::to_value(&v1_env_exam).unwrap();
        let v2: Self = serde_json::from_value(json).unwrap();
        v2
    }
}

impl From<V1EnvExamAttempt> for V2EnvExamAttempt {
    fn from(value: V1EnvExamAttempt) -> Self {
        let json: Value = serde_json::to_value(&value).unwrap();
        let v2: Self = serde_json::from_value(json).unwrap();
        v2
    }
}

impl From<V1EnvGeneratedExam> for V2EnvGeneratedExam {
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
        v2::{V2EnvConfig, V2EnvExam, V2EnvExamAttempt},
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
        let v2 = V2EnvExam {
            id: v1_cop.id,
            question_sets: vec![],
            config: V2EnvConfig {
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
        };

        let new: V2EnvExam = v1.into();

        compare_structs!(
            v2,
            new,
            id,
            question_sets,
            config,
            prerequisites,
            deprecated
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

        let v2 = V2EnvExamAttempt {
            id: v1_cop.id,
            user_id: v1_cop.user_id,
            exam_id: v1_cop.exam_id,
            generated_exam_id: v1_cop.generated_exam_id,
            question_sets: vec![],
            start_time_in_m_s: v1_cop.start_time_in_m_s,
        };

        let new: V2EnvExamAttempt = v1.into();

        compare_structs!(
            v2,
            new,
            id,
            user_id,
            exam_id,
            generated_exam_id,
            question_sets,
            start_time_in_m_s
        );
    }
}
