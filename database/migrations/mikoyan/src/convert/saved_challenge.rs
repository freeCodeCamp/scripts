use mongodb::bson::{self, Bson, DateTime};
use serde::Deserialize;

use crate::record::{File, NOption, SavedChallenge};

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
                        Bson::String(v) => Some(v.parse().unwrap()),
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
                                let file: File = bson::from_bson(file).expect("Error");
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
                _ => {
                    println!("Skipping {key:?}");
                }
            }
        }

        let challenge_type = challenge_type.unwrap_or_default();
        let files = files.unwrap_or_default();
        let id = id.unwrap_or_default();
        let last_saved_date = last_saved_date.unwrap_or(DateTime::now());

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
