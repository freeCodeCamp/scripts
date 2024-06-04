use mongodb::bson::{self, de::Error, oid::ObjectId, DateTime, Document};

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

pub fn num_to_datetime<N>(num: N) -> DateTime
where
    N: ToString,
{
    let s = num.to_string();

    // If float, remove the decimal part
    let s = if let Some(pos) = s.find('.') {
        &s[..pos]
    } else {
        &s
    };

    // Handle seconds, but assume milliseconds
    let num = if s.len() == 10 {
        let num = s.parse::<i64>().unwrap();
        num * 1000
    } else {
        s.parse::<i64>().unwrap()
    };

    DateTime::from_millis(num as i64)
}
