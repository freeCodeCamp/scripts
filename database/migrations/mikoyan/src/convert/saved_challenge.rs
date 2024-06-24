use mongodb::bson::{self, Bson, DateTime};
use serde::Deserialize;

use crate::{
    normalize::ToMillis,
    record::{File, SavedChallenge},
};

struct SavedChallengeVisitor;

impl<'de> serde::de::Visitor<'de> for SavedChallengeVisitor {
    type Value = SavedChallenge;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("struct SavedChallenge")
    }

    fn visit_map<A>(self, mut map: A) -> Result<Self::Value, A::Error>
    where
        A: serde::de::MapAccess<'de>,
    {
        let mut challenge_type = None;
        let mut files = None;
        let mut id = None;
        let mut last_saved_date = None;

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
                        Bson::String(v) => {
                            if let Ok(v) = v.parse() {
                                Some(v)
                            } else {
                                None
                            }
                        }
                        _ => None,
                    };
                }
                "files" => {
                    if files.is_some() {
                        return Err(serde::de::Error::duplicate_field("files"));
                    }

                    files = match map.next_value()? {
                        Bson::Array(array) => {
                            let mut files = vec![];
                            for file in array {
                                let file: File = bson::from_bson(file).map_err(|e| {
                                    serde::de::Error::invalid_value(
                                        serde::de::Unexpected::Other(&e.to_string()),
                                        &"a valid File",
                                    )
                                })?;
                                files.push(file);
                            }
                            Some(files)
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
                "lastSavedDate" => {
                    if last_saved_date.is_some() {
                        return Err(serde::de::Error::duplicate_field("lastSavedDate"));
                    }

                    last_saved_date = match map.next_value()? {
                        Bson::Double(v) => Some(v.to_millis()),
                        Bson::DateTime(v) => Some(v.to_millis()),
                        Bson::Int32(v) => Some(v.to_millis()),
                        Bson::Int64(v) => Some(v.to_millis()),
                        Bson::Timestamp(v) => Some(v.to_millis()),
                        _ => None,
                    };
                }
                _ => {
                    // println!("Skipping {key:?}");
                }
            }
        }

        let challenge_type = challenge_type.unwrap_or_default();
        let files = files.unwrap_or_default();
        let id = id.unwrap_or_default();
        let last_saved_date = last_saved_date.unwrap_or(DateTime::now().timestamp_millis());

        Ok(SavedChallenge {
            challenge_type,
            files,
            id,
            last_saved_date,
        })
    }
}

impl<'de> Deserialize<'de> for SavedChallenge {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        deserializer.deserialize_any(SavedChallengeVisitor)
    }
}
