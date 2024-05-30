use mongodb::bson::{self, Bson};
use serde::Deserialize;

use crate::record::{CompletedChallenge, CompletedExam, User};

struct UserVisitor;

impl<'de> serde::de::Visitor<'de> for UserVisitor {
    type Value = User;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("struct User")
    }

    fn visit_map<A>(self, mut map: A) -> Result<Self::Value, A::Error>
    where
        A: serde::de::MapAccess<'de>,
    {
        let mut _id = None;
        let mut about = None;
        let mut accepted_privacy_terms = None;
        let mut completed_challenges = None;
        let mut completed_exams = None;
        let mut name = None;

        while let Some(key) = map.next_key::<String>()? {
            match key.as_str() {
                "id" => {
                    if _id.is_some() {
                        return Err(serde::de::Error::duplicate_field("id"));
                    }

                    _id = match map.next_value()? {
                        Bson::ObjectId(v) => Some(v),
                        _ => None,
                    };
                }
                "about" => {
                    if about.is_some() {
                        return Err(serde::de::Error::duplicate_field("about"));
                    }

                    about = match map.next_value()? {
                        Bson::String(v) => Some(v),
                        Bson::Array(a) => {
                            let mut about = String::new();
                            for s in a {
                                if let Bson::String(s) = s {
                                    about.push_str(&s);
                                }
                            }
                            Some(about)
                        }
                        _ => None,
                    };
                }
                "acceptedPrivacyTerms" => {
                    if accepted_privacy_terms.is_some() {
                        return Err(serde::de::Error::duplicate_field("acceptedPrivacyTerms"));
                    }

                    accepted_privacy_terms = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "completedChallenges" => {
                    if completed_challenges.is_some() {
                        return Err(serde::de::Error::duplicate_field("completedChallenges"));
                    }

                    completed_challenges = match map.next_value()? {
                        Bson::Array(array) => {
                            let mut completed_challenges = vec![];
                            for challenge in array {
                                let challenge: CompletedChallenge =
                                    bson::from_bson(challenge).expect("Error");
                                completed_challenges.push(challenge);
                            }
                            Some(completed_challenges)
                        }
                        _ => None,
                    };
                }
                "completedExams" => {
                    if completed_exams.is_some() {
                        return Err(serde::de::Error::duplicate_field("completedExams"));
                    }

                    completed_exams = match map.next_value()? {
                        Bson::Array(array) => {
                            let mut completed_exams = vec![];
                            for exam in array {
                                let exam: CompletedExam = bson::from_bson(exam).expect("Error");
                                completed_exams.push(exam);
                            }
                            Some(completed_exams)
                        }
                        _ => None,
                    };
                }
                "name" => {
                    if name.is_some() {
                        return Err(serde::de::Error::duplicate_field("name"));
                    }

                    name = match map.next_value()? {
                        Bson::String(v) => Some(v),
                        _ => None,
                    };
                }
                _ => {
                    println!("Skipping {key:?}");
                }
            }
        }

        let _id = _id.ok_or(serde::de::Error::missing_field("id"))?;
        let about = about.unwrap_or_default();
        let accepted_privacy_terms = accepted_privacy_terms.unwrap_or_default();
        let completed_challenges = completed_challenges.unwrap_or_default();
        let completed_exams = completed_exams.unwrap_or_default();
        let name = name.unwrap_or_default();

        Ok(User {
            _id,
            about,
            accepted_privacy_terms,
            completed_challenges,
            completed_exams,
            name,
        })
    }

    fn visit_unit<E>(self) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        unimplemented!()
    }
}

impl<'de> Deserialize<'de> for User {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        deserializer.deserialize_any(UserVisitor)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use bson::oid::ObjectId;

    #[test]
    fn empty_document_to_user() {
        let object_id = ObjectId::new();
        let doc_1 = mongodb::bson::doc! {
            "id": object_id,
        };

        let user_1: User = mongodb::bson::from_document(doc_1).unwrap();

        assert_eq!(user_1._id, object_id);
    }

    #[test]
    fn bad_document_to_user() {
        let doc_3 = mongodb::bson::doc! {
        "id": ObjectId::new(),
        "name": "John",
        "completedChallenges": [
            {
                "challengeType": Bson::Null,
                "completedDate": Bson::Double(1620000000.0),
                "files": [

                    {
                        "__cachedRelations": [{}],
                        "__data": [
                            {
                                "contents": "test __data",
                                "ext": "test __data",
                                "key": "test __data",
                                "name": "test __data",
                                "path": ""
                            }
                            ],
                            "__dataSource": Bson::Null,
                            "__persisted": true,
                            "__strict": false,
                            "contents": "String",
                            "ext": "String",
                            "key": "String",
                            "name": "String",
                            "path": "String"
                        }
                        ],
                "id": "1234"
            }
            ]
        };

        let user_3: User = mongodb::bson::from_document(doc_3).unwrap();
        println!("user3: {:?}", user_3);
    }

    #[test]
    fn user_to_document() {
        let object_id = ObjectId::new();
        let user = User {
            _id: object_id,
            about: "about".to_string(),
            accepted_privacy_terms: true,
            completed_challenges: vec![],
            completed_exams: vec![],
            name: "name".to_string(),
        };

        let doc = mongodb::bson::to_document(&user).unwrap();

        assert_eq!(doc.get_object_id("id").unwrap(), object_id);
        assert_eq!(doc.get_str("about").unwrap(), "about");
        assert_eq!(doc.get_bool("acceptedPrivacyTerms").unwrap(), true);
        assert_eq!(doc.get_array("completedChallenges").unwrap().len(), 0);
        assert_eq!(doc.get_array("completedExams").unwrap().len(), 0);
        assert_eq!(doc.get_str("name").unwrap(), "name");
    }
}
