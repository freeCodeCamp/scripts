use mongodb::bson::{self, de::Error, oid::ObjectId, Document};

use crate::record::User;

#[derive(Debug)]
pub enum NormalizeError {
    UnhandledType { id: ObjectId, error: Error },
    ConfusedId { doc: Document },
}

pub fn normalize_user(user: Document) -> Result<Document, NormalizeError> {
    if let Ok(id) = user.get_object_id("_id") {
        let normal_user: User = bson::from_document(user)
            .map_err(|e| NormalizeError::UnhandledType { id, error: e })?;
        let new_user_document: Document = bson::to_document(&normal_user).unwrap();
        Ok(new_user_document)
    } else {
        Err(NormalizeError::ConfusedId { doc: user })
    }
}
