use mongodb::bson::{Bson, DateTime};
use serde::Deserialize;

use crate::{normalize::ToMillis, record::PartiallyCompletedChallenge};

struct PartiallyCompletedChallengeVisitor;

impl<'de> serde::de::Visitor<'de> for PartiallyCompletedChallengeVisitor {
    type Value = PartiallyCompletedChallenge;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("struct PartiallyCompletedChallenge")
    }

    fn visit_map<A>(self, mut map: A) -> Result<Self::Value, A::Error>
    where
        A: serde::de::MapAccess<'de>,
    {
        let mut completed_date = None;
        let mut id = None;

        while let Some(key) = map.next_key::<String>()? {
            match key.as_str() {
                "completedDate" => {
                    if completed_date.is_some() {
                        return Err(serde::de::Error::duplicate_field("completedDate"));
                    }

                    completed_date = match map.next_value()? {
                        Bson::Double(v) => Some(v.to_millis()),
                        Bson::DateTime(v) => Some(v.to_millis()),
                        Bson::Int32(v) => Some(v.to_millis()),
                        Bson::Int64(v) => Some(v.to_millis()),
                        Bson::Timestamp(v) => Some(v.to_millis()),
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
                    // println!("Skipping {key:?}");
                }
            }
        }

        let completed_date = completed_date.unwrap_or(DateTime::now().timestamp_millis());
        let id = id.unwrap_or_default();

        Ok(PartiallyCompletedChallenge { completed_date, id })
    }
}

impl<'de> Deserialize<'de> for PartiallyCompletedChallenge {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        deserializer.deserialize_any(PartiallyCompletedChallengeVisitor)
    }
}
