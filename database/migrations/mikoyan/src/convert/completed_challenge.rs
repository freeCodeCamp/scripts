use mongodb::bson::{self, Bson, DateTime};
use serde::Deserialize;

use crate::record::{CompletedChallenge, File, NOption};

struct CompletedChallengeVisitor;

impl<'de> serde::de::Visitor<'de> for CompletedChallengeVisitor {
    type Value = CompletedChallenge;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("struct CompletedChallenge")
    }

    fn visit_map<A>(self, mut map: A) -> Result<Self::Value, A::Error>
    where
        A: serde::de::MapAccess<'de>,
    {
        let mut challenge_type = None;
        let mut completed_date = None;
        let mut files = None;
        let mut github_link = None;
        let mut id = None;
        let mut is_manually_approved = None;
        let mut solution = None;

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
                "completedDate" => {
                    if completed_date.is_some() {
                        return Err(serde::de::Error::duplicate_field("completedDate"));
                    }

                    completed_date = match map.next_value()? {
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
                "githubLink" => {
                    if github_link.is_some() {
                        return Err(serde::de::Error::duplicate_field("githubLink"));
                    }

                    github_link = match map.next_value()? {
                        Bson::String(v) => Some(NOption::Some(v)),
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
                "isManuallyApproved" => {
                    if is_manually_approved.is_some() {
                        return Err(serde::de::Error::duplicate_field("isManuallyApproved"));
                    }

                    is_manually_approved = match map.next_value()? {
                        Bson::Boolean(v) => Some(NOption::Some(v)),
                        _ => Some(NOption::Undefined),
                    };
                }
                "solution" => {
                    if solution.is_some() {
                        return Err(serde::de::Error::duplicate_field("solution"));
                    }

                    solution = match map.next_value()? {
                        Bson::String(v) => Some(NOption::Some(v)),
                        _ => Some(NOption::Undefined),
                    };
                }
                _ => {
                    println!("Skipping {key:?}");
                }
            }
        }

        let challenge_type = challenge_type.unwrap_or_default();
        let completed_date = completed_date.unwrap_or(DateTime::now());
        let files = files.unwrap_or_default();
        let github_link = github_link.unwrap_or_default();
        let id = id.unwrap_or_default();
        let is_manually_approved = is_manually_approved.unwrap_or_default();
        let solution = solution.unwrap_or_default();

        Ok(CompletedChallenge {
            challenge_type,
            completed_date,
            files,
            github_link,
            id,
            is_manually_approved,
            solution,
        })
    }
}

impl<'de> Deserialize<'de> for CompletedChallenge {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        deserializer.deserialize_any(CompletedChallengeVisitor)
    }
}
