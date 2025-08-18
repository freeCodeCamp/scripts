use mongodb::bson;
use serde::{Deserialize, Serialize};

prisma_rust_schema::import_types!(
    schema_path = "./prisma/v0-schema.prisma",
    prefix = "V0",
    derive = [Clone, Debug, Serialize, Deserialize, PartialEq],
    include = [
        "EnvExamTemp",
        "EnvQuestionSet",
        "EnvMultipleChoiceQuestion",
        "EnvConfig",
        "EnvQuestionType",
        "EnvAudio",
        "EnvAnswer",
        "EnvTagConfig",
        "EnvQuestionSetConfig"
    ]
);
