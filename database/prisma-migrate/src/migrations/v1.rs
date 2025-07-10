use mongodb::bson;
use serde::{Deserialize, Serialize};

prisma_rust_schema::import_types!(
    schema_path = "./prisma/v1-schema.prisma",
    prefix = "V1",
    derive = [Clone, Debug, Serialize, Deserialize, PartialEq],
);
