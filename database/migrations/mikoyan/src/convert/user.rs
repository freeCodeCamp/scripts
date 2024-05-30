use mongodb::bson::{self, Bson};
use serde::Deserialize;

use crate::record::{CompletedChallenge, CompletedExam, NOption, User};

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
        let mut current_challenge_id = None;
        let mut donation_emails = None;
        let mut email = None;
        let mut email_auth_link_ttl = None;
        let mut email_verified = None;
        let mut email_verify_ttl = None;
        let mut external_id = None;
        let mut github_profile = None;
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
                "currentChallengeId" => {
                    if current_challenge_id.is_some() {
                        return Err(serde::de::Error::duplicate_field("currentChallengeId"));
                    }

                    current_challenge_id = match map.next_value()? {
                        Bson::String(v) => Some(v),
                        Bson::ObjectId(v) => Some(v.to_hex()),
                        _ => None,
                    };
                }
                "donationEmails" => {
                    if donation_emails.is_some() {
                        return Err(serde::de::Error::duplicate_field("donationEmails"));
                    }

                    donation_emails = match map.next_value()? {
                        Bson::Array(array) => {
                            let mut donation_emails = vec![];
                            for email in array {
                                if let Bson::String(email) = email {
                                    donation_emails.push(email.to_ascii_lowercase());
                                }
                            }
                            Some(donation_emails)
                        }
                        _ => None,
                    };
                }
                "email" => {
                    if email.is_some() {
                        return Err(serde::de::Error::duplicate_field("email"));
                    }

                    email = match map.next_value()? {
                        Bson::String(v) => Some(v.to_ascii_lowercase()),
                        _ => None,
                    };
                }
                "emailAuthLinkTTL" => {
                    if email_auth_link_ttl.is_some() {
                        return Err(serde::de::Error::duplicate_field("email_auth_link_ttl"));
                    }

                    email_auth_link_ttl = match map.next_value()? {
                        Bson::DateTime(v) => Some(NOption::Some(v)),
                        Bson::String(s) => {
                            let t = bson::DateTime::parse_rfc3339_str(&s).unwrap();
                            let nullable = NOption::Some(t);
                            Some(nullable)
                        }
                        _ => Some(NOption::Null),
                    };
                }
                "emailVerified" => {
                    if email_verified.is_some() {
                        return Err(serde::de::Error::duplicate_field("email_verified"));
                    }

                    email_verified = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "emailVerifyTTL" => {
                    if email_verify_ttl.is_some() {
                        return Err(serde::de::Error::duplicate_field("email_verify_ttl"));
                    }

                    email_verify_ttl = match map.next_value()? {
                        Bson::DateTime(v) => Some(NOption::Some(v)),
                        _ => Some(NOption::Null),
                    };
                }
                "externalId" => {
                    if external_id.is_some() {
                        return Err(serde::de::Error::duplicate_field("external_id"));
                    }

                    external_id = match map.next_value()? {
                        Bson::String(v) => Some(NOption::Some(v)),
                        _ => Some(NOption::Undefined),
                    };
                }
                "githubProfile" => {
                    if github_profile.is_some() {
                        return Err(serde::de::Error::duplicate_field("github_profile"));
                    }

                    github_profile = match map.next_value()? {
                        Bson::String(v) => Some(v),
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
        let current_challenge_id = current_challenge_id.unwrap_or_default();
        let donation_emails = donation_emails.unwrap_or_default();
        let email = email.unwrap_or_default();
        let email_auth_link_ttl = email_auth_link_ttl.unwrap_or_default();
        // TODO: default to false or true?
        let email_verified = email_verified.unwrap_or_default();
        let email_verify_ttl = email_verify_ttl.unwrap_or_default();
        let external_id = external_id.unwrap_or_default();
        let github_profile = github_profile.unwrap_or_default();
        let name = name.unwrap_or_default();

        Ok(User {
            _id,
            about,
            accepted_privacy_terms,
            completed_challenges,
            completed_exams,
            current_challenge_id,
            donation_emails,
            email,
            email_auth_link_ttl,
            email_verified,
            email_verify_ttl,
            external_id,
            github_profile,
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
        let email_auth_link_ttl = NOption::Some(bson::DateTime::now());
        let email_verify_ttl = NOption::Some(bson::DateTime::now());
        let user = User {
            _id: object_id,
            about: "about".to_string(),
            accepted_privacy_terms: true,
            completed_challenges: vec![],
            completed_exams: vec![],
            current_challenge_id: object_id.to_hex(),
            donation_emails: vec!["fcc@freecodecamp.org".to_string()],
            email: "fcc@freecodecamp.org".to_string(),
            email_auth_link_ttl,
            email_verified: true,
            email_verify_ttl,
            external_id: NOption::Undefined,
            github_profile: "".to_string(),
            name: "name".to_string(),
        };

        let doc = mongodb::bson::to_document(&user).unwrap();

        assert_eq!(doc.get_object_id("id").unwrap(), object_id);
        assert_eq!(doc.get_str("about").unwrap(), "about");
        assert_eq!(doc.get_bool("acceptedPrivacyTerms").unwrap(), true);
        assert_eq!(doc.get_array("completedChallenges").unwrap().len(), 0);
        assert_eq!(doc.get_array("completedExams").unwrap().len(), 0);
        assert_eq!(
            doc.get_str("currentChallengeId").unwrap(),
            object_id.to_hex()
        );
        assert_eq!(
            doc.get_array("donationEmails")
                .unwrap()
                .first()
                .unwrap()
                .as_str()
                .unwrap(),
            "fcc@freecodecamp.org".to_string()
        );
        assert_eq!(doc.get_str("email").unwrap(), "fcc@freecodecamp.org");
        // TODO
        // assert_eq!(
        //     doc.get_datetime("email_auth_link_ttl").unwrap(),
        //     &email_auth_link_ttl
        // );
        assert_eq!(doc.get_bool("email_verified").unwrap(), true);
        // assert_eq!(
        //     doc.get_datetime("email_verify_ttl").unwrap(),
        //     &email_verify_ttl
        // );
        // assert_eq!(doc.get_str("externalId").unwrap(), "");
        assert_eq!(doc.get_str("githubProfile").unwrap(), "");
        assert_eq!(doc.get_str("name").unwrap(), "name");
    }
}
