use mongodb::bson::{self, Bson, DateTime};
use serde::Deserialize;

use crate::{
    normalize::{num_to_datetime, ToMillis},
    record::{
        CompletedChallenge, CompletedExam, NOption, PartiallyCompletedChallenge, Portfolio,
        ProfileUI, SavedChallenge, User,
    },
};

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
        let mut is_2018_data_vis_cert = None;
        let mut is_2018_full_stack_cert = None;
        let mut is_apis_microservices_cert = None;
        let mut is_back_end_cert = None;
        let mut is_banned = None;
        let mut is_cheater = None;
        let mut is_classroom_account = None;
        let mut is_college_algebra_py_cert_v8 = None;
        let mut is_data_analysis_py_cert_v7 = None;
        let mut is_data_vis_cert = None;
        let mut is_donating = None;
        let mut is_foundational_c_sharp_cert_v8 = None;
        let mut is_front_end_cert = None;
        let mut is_front_end_libs_cert = None;
        let mut is_full_stack_cert = None;
        let mut is_honest = None;
        let mut is_infosec_cert_v7 = None;
        let mut is_infosec_qa_cert = None;
        let mut is_js_algo_data_struct_cert = None;
        let mut is_js_algo_data_struct_cert_v8 = None;
        let mut is_machine_learning_py_cert_v7 = None;
        let mut is_qa_cert_v7 = None;
        let mut is_relational_database_cert_v8 = None;
        let mut is_resp_web_design_cert = None;
        let mut is_sci_comp_py_cert_v7 = None;
        let mut keyboard_shortcuts = None;
        let mut linkedin = None;
        let mut location = None;
        let mut name = None;
        let mut needs_moderation = None;
        let mut new_email = None;
        let mut partially_completed_challenges = None;
        let mut picture = None;
        let mut portfolio = None;
        let mut profile_ui = None;
        let mut progress_timestamps = None;
        let mut rand = None;
        let mut saved_challenges = None;
        let mut send_quincy_email = None;
        let mut theme = None;
        let mut twitter = None;
        let mut unsubscribe_id = None;
        let mut username = None;
        let mut username_display = None;
        let mut website = None;
        let mut years_top_contributor = None;

        while let Some(key) = map.next_key::<String>()? {
            match key.as_str() {
                "_id" => {
                    if _id.is_some() {
                        return Err(serde::de::Error::duplicate_field("_id"));
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
                                let challenge: CompletedChallenge = bson::from_bson(challenge)
                                    .map_err(|e| {
                                        serde::de::Error::invalid_value(
                                            serde::de::Unexpected::Other(&e.to_string()),
                                            &"a valid CompletedChallenge",
                                        )
                                    })?;
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
                                let exam: CompletedExam = bson::from_bson(exam).map_err(|e| {
                                    serde::de::Error::invalid_value(
                                        serde::de::Unexpected::Other(&e.to_string()),
                                        &"a valid CompletedExam",
                                    )
                                })?;
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
                        Bson::String(v) => {
                            if v.is_empty() {
                                None
                            } else {
                                Some(v.to_ascii_lowercase())
                            }
                        }
                        _ => None,
                    };
                }
                "emailAuthLinkTTL" => {
                    if email_auth_link_ttl.is_some() {
                        return Err(serde::de::Error::duplicate_field("emailAuthLinkTTL"));
                    }

                    email_auth_link_ttl = match map.next_value()? {
                        Bson::DateTime(v) => Some(NOption::Some(v)),
                        Bson::String(s) => {
                            if let Ok(t) = DateTime::parse_rfc3339_str(&s) {
                                let nullable = NOption::Some(t);
                                Some(nullable)
                            } else if let Ok(t) = s.parse::<i64>() {
                                let nullable = NOption::Some(num_to_datetime(t));
                                Some(nullable)
                            } else {
                                Some(NOption::Null)
                            }
                        }
                        Bson::Int32(i) => {
                            let t = num_to_datetime(i);
                            Some(NOption::Some(t))
                        }
                        Bson::Int64(i) => {
                            let t = num_to_datetime(i);
                            Some(NOption::Some(t))
                        }
                        Bson::Double(i) => {
                            let t = num_to_datetime(i);
                            Some(NOption::Some(t))
                        }
                        Bson::Timestamp(i) => {
                            let t = num_to_datetime(i.time);
                            Some(NOption::Some(t))
                        }
                        _ => Some(NOption::Null),
                    };
                }
                "emailVerified" => {
                    if email_verified.is_some() {
                        return Err(serde::de::Error::duplicate_field("emailVerified"));
                    }

                    email_verified = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "emailVerifyTTL" => {
                    if email_verify_ttl.is_some() {
                        return Err(serde::de::Error::duplicate_field("emailVerifyTTL"));
                    }

                    email_verify_ttl = match map.next_value()? {
                        Bson::DateTime(v) => Some(NOption::Some(v)),
                        Bson::String(s) => {
                            if let Ok(t) = DateTime::parse_rfc3339_str(&s) {
                                let nullable = NOption::Some(t);
                                Some(nullable)
                            } else if let Ok(t) = s.parse::<i64>() {
                                let nullable = NOption::Some(num_to_datetime(t));
                                Some(nullable)
                            } else {
                                Some(NOption::Null)
                            }
                        }
                        Bson::Int32(i) => {
                            let t = num_to_datetime(i);
                            Some(NOption::Some(t))
                        }
                        Bson::Int64(i) => {
                            let t = num_to_datetime(i);
                            Some(NOption::Some(t))
                        }
                        Bson::Double(i) => {
                            let t = num_to_datetime(i);
                            Some(NOption::Some(t))
                        }
                        Bson::Timestamp(i) => {
                            let t = num_to_datetime(i.time);
                            Some(NOption::Some(t))
                        }
                        _ => Some(NOption::Null),
                    };
                }
                "externalId" => {
                    if external_id.is_some() {
                        return Err(serde::de::Error::duplicate_field("externalId"));
                    }

                    external_id = match map.next_value()? {
                        Bson::String(v) => Some(NOption::Some(v)),
                        _ => Some(NOption::Null),
                    };
                }
                "githubProfile" => {
                    if github_profile.is_some() {
                        return Err(serde::de::Error::duplicate_field("githubProfile"));
                    }

                    github_profile = match map.next_value()? {
                        Bson::String(v) => Some(v),
                        _ => None,
                    };
                }
                "is2018DataVisCert" => {
                    if is_2018_data_vis_cert.is_some() {
                        return Err(serde::de::Error::duplicate_field("is2018DataVisCert"));
                    }

                    is_2018_data_vis_cert = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "is2018FullStackCert" => {
                    if is_2018_full_stack_cert.is_some() {
                        return Err(serde::de::Error::duplicate_field("is2018FullStackCert"));
                    }

                    is_2018_full_stack_cert = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isApisMicroservicesCert" => {
                    if is_apis_microservices_cert.is_some() {
                        return Err(serde::de::Error::duplicate_field("isApisMicroservicesCert"));
                    }

                    is_apis_microservices_cert = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isBackEndCert" => {
                    if is_back_end_cert.is_some() {
                        return Err(serde::de::Error::duplicate_field("isBackEndCert"));
                    }

                    is_back_end_cert = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isBanned" => {
                    if is_banned.is_some() {
                        return Err(serde::de::Error::duplicate_field("isBanned"));
                    }

                    is_banned = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isCheater" => {
                    if is_cheater.is_some() {
                        return Err(serde::de::Error::duplicate_field("isCheater"));
                    }

                    is_cheater = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isClassroomAccount" => {
                    if is_classroom_account.is_some() {
                        return Err(serde::de::Error::duplicate_field("isClassroomAccount"));
                    }

                    is_classroom_account = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isCollegeAlgebraPyCertV8" => {
                    if is_college_algebra_py_cert_v8.is_some() {
                        return Err(serde::de::Error::duplicate_field(
                            "isCollegeAlgebraPyCertV8",
                        ));
                    }

                    is_college_algebra_py_cert_v8 = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isDataAnalysisPyCertV7" => {
                    if is_data_analysis_py_cert_v7.is_some() {
                        return Err(serde::de::Error::duplicate_field("isDataAnalysisPyCertV7"));
                    }

                    is_data_analysis_py_cert_v7 = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isDataVisCert" => {
                    if is_data_vis_cert.is_some() {
                        return Err(serde::de::Error::duplicate_field("isDataVisCert"));
                    }

                    is_data_vis_cert = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isDonating" => {
                    if is_donating.is_some() {
                        return Err(serde::de::Error::duplicate_field("isDonating"));
                    }

                    is_donating = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isFoundationalCSharpCertV8" => {
                    if is_foundational_c_sharp_cert_v8.is_some() {
                        return Err(serde::de::Error::duplicate_field(
                            "isFoundationalCSharpCertV8",
                        ));
                    }

                    is_foundational_c_sharp_cert_v8 = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isFrontEndCert" => {
                    if is_front_end_cert.is_some() {
                        return Err(serde::de::Error::duplicate_field("isFrontEndCert"));
                    }

                    is_front_end_cert = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isFrontEndLibsCert" => {
                    if is_front_end_libs_cert.is_some() {
                        return Err(serde::de::Error::duplicate_field("isFrontEndLibsCert"));
                    }

                    is_front_end_libs_cert = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isFullStackCert" => {
                    if is_full_stack_cert.is_some() {
                        return Err(serde::de::Error::duplicate_field("isFullStackCert"));
                    }

                    is_full_stack_cert = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isHonest" => {
                    if is_honest.is_some() {
                        return Err(serde::de::Error::duplicate_field("isHonest"));
                    }

                    is_honest = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isInfosecCertV7" => {
                    if is_infosec_cert_v7.is_some() {
                        return Err(serde::de::Error::duplicate_field("isInfosecCertV7"));
                    }

                    is_infosec_cert_v7 = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isInfosecQaCert" => {
                    if is_infosec_qa_cert.is_some() {
                        return Err(serde::de::Error::duplicate_field("isInfosecQACert"));
                    }

                    is_infosec_qa_cert = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isJsAlgoDataStructCert" => {
                    if is_js_algo_data_struct_cert.is_some() {
                        return Err(serde::de::Error::duplicate_field("isJsAlgoDataStructCert"));
                    }

                    is_js_algo_data_struct_cert = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isJsAlgoDataStructCertV8" => {
                    if is_js_algo_data_struct_cert_v8.is_some() {
                        return Err(serde::de::Error::duplicate_field(
                            "isJsAlgoDataStructCertV8",
                        ));
                    }

                    is_js_algo_data_struct_cert_v8 = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isMachineLearningPyCertV7" => {
                    if is_machine_learning_py_cert_v7.is_some() {
                        return Err(serde::de::Error::duplicate_field(
                            "isMachineLearningPyCertV7",
                        ));
                    }

                    is_machine_learning_py_cert_v7 = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isQaCertV7" => {
                    if is_qa_cert_v7.is_some() {
                        return Err(serde::de::Error::duplicate_field("isQaCertV7"));
                    }

                    is_qa_cert_v7 = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isRelationalDatabaseCertV8" => {
                    if is_relational_database_cert_v8.is_some() {
                        return Err(serde::de::Error::duplicate_field(
                            "isRelationalDatabaseCertV8",
                        ));
                    }

                    is_relational_database_cert_v8 = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isRespWebDesignCert" => {
                    if is_resp_web_design_cert.is_some() {
                        return Err(serde::de::Error::duplicate_field("isRespWebDesignCert"));
                    }

                    is_resp_web_design_cert = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "isSciCompPyCertV7" => {
                    if is_sci_comp_py_cert_v7.is_some() {
                        return Err(serde::de::Error::duplicate_field("isSciCompPyCertV7"));
                    }

                    is_sci_comp_py_cert_v7 = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "keyboardShortcuts" => {
                    if keyboard_shortcuts.is_some() {
                        return Err(serde::de::Error::duplicate_field("keyboardShortcuts"));
                    }

                    keyboard_shortcuts = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "linkedin" => {
                    if linkedin.is_some() {
                        return Err(serde::de::Error::duplicate_field("linkedin"));
                    }

                    linkedin = match map.next_value()? {
                        Bson::String(v) => Some(v),
                        _ => None,
                    };
                }
                "location" => {
                    if location.is_some() {
                        return Err(serde::de::Error::duplicate_field("location"));
                    }

                    location = match map.next_value()? {
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
                "needsModeration" => {
                    if needs_moderation.is_some() {
                        return Err(serde::de::Error::duplicate_field("needsModeration"));
                    }

                    needs_moderation = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "newEmail" => {
                    if new_email.is_some() {
                        return Err(serde::de::Error::duplicate_field("newEmail"));
                    }

                    new_email = match map.next_value()? {
                        Bson::String(v) => Some(NOption::Some(v)),
                        _ => None,
                    };
                }
                "partiallyCompletedChallenges" => {
                    if partially_completed_challenges.is_some() {
                        return Err(serde::de::Error::duplicate_field(
                            "partiallyCompletedChallenges",
                        ));
                    }

                    partially_completed_challenges = match map.next_value()? {
                        Bson::Array(array) => {
                            let mut partially_completed_challenges = vec![];
                            for challenge in array {
                                let challenge: PartiallyCompletedChallenge =
                                    bson::from_bson(challenge).map_err(|e| {
                                        serde::de::Error::invalid_value(
                                            serde::de::Unexpected::Other(&e.to_string()),
                                            &"a valid PartiallyCompletedChallenge",
                                        )
                                    })?;
                                partially_completed_challenges.push(challenge);
                            }
                            Some(partially_completed_challenges)
                        }
                        _ => None,
                    };
                }
                "picture" => {
                    if picture.is_some() {
                        return Err(serde::de::Error::duplicate_field("picture"));
                    }

                    picture = match map.next_value()? {
                        Bson::String(v) => Some(v),
                        _ => None,
                    };
                }
                "portfolio" => {
                    if portfolio.is_some() {
                        return Err(serde::de::Error::duplicate_field("portfolio"));
                    }

                    portfolio = match map.next_value()? {
                        Bson::Array(array) => {
                            let mut portfolio = vec![];
                            for item in array {
                                let item: Portfolio = bson::from_bson(item).unwrap_or_default();
                                portfolio.push(item);
                            }
                            Some(portfolio)
                        }
                        _ => None,
                    };
                }
                "profileUI" => {
                    if profile_ui.is_some() {
                        return Err(serde::de::Error::duplicate_field("profileUI"));
                    }

                    profile_ui = match map.next_value()? {
                        Bson::Document(doc) => {
                            let profile_ui: ProfileUI =
                                bson::from_bson(Bson::Document(doc)).unwrap_or_default();
                            Some(profile_ui)
                        }
                        _ => None,
                    };
                }
                "progressTimestamps" => {
                    if progress_timestamps.is_some() {
                        return Err(serde::de::Error::duplicate_field("progressTimestamps"));
                    }

                    progress_timestamps = match map.next_value()? {
                        Bson::Document(doc) => {
                            let mut progress_timestamps = vec![];
                            for (_, value) in doc {
                                match value {
                                    Bson::Double(v) => {
                                        progress_timestamps.push(v.to_millis());
                                    }
                                    Bson::Int32(v) => {
                                        progress_timestamps.push(v.to_millis());
                                    }
                                    Bson::Int64(v) => {
                                        progress_timestamps.push(v.to_millis());
                                    }
                                    Bson::String(v) => {
                                        if let Ok(v) = v.parse::<i64>() {
                                            progress_timestamps.push(v.to_millis());
                                        }
                                    }
                                    Bson::Timestamp(v) => {
                                        progress_timestamps.push(v.to_millis());
                                    }
                                    _ => {
                                        // No-Op
                                    }
                                };
                            }
                            Some(progress_timestamps)
                        }
                        Bson::Array(arr) => {
                            let mut progress_timestamps = vec![];
                            for value in arr {
                                match value {
                                    Bson::Double(v) => {
                                        progress_timestamps.push(v.to_millis());
                                    }
                                    Bson::DateTime(v) => {
                                        progress_timestamps.push(v.to_millis());
                                    }
                                    Bson::Int32(v) => {
                                        progress_timestamps.push(v as i64);
                                    }
                                    Bson::Int64(v) => {
                                        progress_timestamps.push(v);
                                    }
                                    Bson::String(v) => {
                                        if let Ok(v) = v.parse::<i64>() {
                                            progress_timestamps.push(v.to_millis());
                                        }
                                    }
                                    Bson::Timestamp(v) => {
                                        progress_timestamps.push(v.to_millis());
                                    }
                                    Bson::Document(doc) => {
                                        let mut pts = vec![];
                                        for (_, value) in doc {
                                            match value {
                                                Bson::Double(v) => {
                                                    pts.push(v.to_millis());
                                                }
                                                Bson::Int32(v) => {
                                                    pts.push(v.to_millis());
                                                }
                                                Bson::Int64(v) => {
                                                    pts.push(v.to_millis());
                                                }
                                                Bson::String(v) => {
                                                    if let Ok(v) = v.parse::<i64>() {
                                                        pts.push(v.to_millis());
                                                    }
                                                }
                                                Bson::Timestamp(v) => {
                                                    pts.push(v.to_millis());
                                                }
                                                _ => {
                                                    // No-Op
                                                }
                                            };
                                        }
                                        progress_timestamps.append(&mut pts);
                                    }
                                    _ => {
                                        // No-Op
                                    }
                                };
                            }
                            Some(progress_timestamps)
                        }
                        _ => None,
                    }
                }
                // This is left in because it will continue to be added to new user records as long as we use loopback
                "rand" => {
                    if rand.is_some() {
                        return Err(serde::de::Error::duplicate_field("rand"));
                    }

                    rand = match map.next_value()? {
                        Bson::Double(v) => Some(v),
                        Bson::Int32(v) => Some(v as f64),
                        Bson::Int64(v) => Some(v as f64),
                        Bson::String(v) => {
                            if let Ok(v) = v.parse::<f64>() {
                                Some(v)
                            } else {
                                None
                            }
                        }
                        _ => None,
                    };
                }
                "savedChallenges" => {
                    if saved_challenges.is_some() {
                        return Err(serde::de::Error::duplicate_field("savedChallenges"));
                    }

                    saved_challenges = match map.next_value()? {
                        Bson::Array(array) => {
                            let mut saved_challenges = vec![];
                            for challenge in array {
                                let challenge: SavedChallenge = bson::from_bson(challenge)
                                    .map_err(|e| {
                                        serde::de::Error::invalid_value(
                                            serde::de::Unexpected::Other(&e.to_string()),
                                            &"a valid SavedChallenge",
                                        )
                                    })?;
                                saved_challenges.push(challenge);
                            }
                            Some(saved_challenges)
                        }
                        _ => None,
                    };
                }
                "sendQuincyEmail" => {
                    if send_quincy_email.is_some() {
                        return Err(serde::de::Error::duplicate_field("sendQuincyEmail"));
                    }

                    send_quincy_email = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "theme" => {
                    if theme.is_some() {
                        return Err(serde::de::Error::duplicate_field("theme"));
                    }

                    theme = match map.next_value()? {
                        Bson::String(v) => Some(v),
                        _ => Some("default".to_string()),
                    };
                }
                "twitter" => {
                    if twitter.is_some() {
                        return Err(serde::de::Error::duplicate_field("twitter"));
                    }

                    twitter = match map.next_value()? {
                        Bson::String(v) => Some(v),
                        _ => None,
                    };
                }
                "unsubscribeId" => {
                    if unsubscribe_id.is_some() {
                        return Err(serde::de::Error::duplicate_field("unsubscribeId"));
                    }

                    unsubscribe_id = match map.next_value()? {
                        Bson::String(v) => Some(v),
                        _ => None,
                    };
                }
                "username" => {
                    if username.is_some() {
                        return Err(serde::de::Error::duplicate_field("username"));
                    }

                    username = match map.next_value()? {
                        Bson::String(v) => Some(v),
                        _ => None,
                    };
                }
                "usernameDisplay" => {
                    if username_display.is_some() {
                        return Err(serde::de::Error::duplicate_field("usernameDisplay"));
                    }

                    username_display = match map.next_value()? {
                        Bson::String(v) => Some(v),
                        _ => None,
                    };
                }
                "website" => {
                    if website.is_some() {
                        return Err(serde::de::Error::duplicate_field("website"));
                    }

                    website = match map.next_value()? {
                        Bson::String(v) => Some(v),
                        _ => None,
                    };
                }
                "yearsTopContributor" => {
                    if years_top_contributor.is_some() {
                        return Err(serde::de::Error::duplicate_field("yearsTopContributor"));
                    }

                    years_top_contributor = match map.next_value()? {
                        Bson::Array(array) => {
                            let mut years_top_contributor = vec![];
                            for year in array {
                                match year {
                                    Bson::String(v) => {
                                        if let Ok(v) = v.parse::<i32>() {
                                            years_top_contributor.push(v);
                                        }
                                    }
                                    Bson::Int32(v) => years_top_contributor.push(v),
                                    Bson::Int64(v) => years_top_contributor.push(v as i32),
                                    Bson::Double(v) => years_top_contributor.push(v as i32),
                                    _ => {}
                                }
                            }
                            Some(years_top_contributor)
                        }
                        _ => None,
                    };
                }
                _ => {
                    // println!("Skipping {key:?}");
                }
            }
        }

        let _id = _id.ok_or(serde::de::Error::missing_field("_id"))?;
        let about = about.unwrap_or_default();
        let accepted_privacy_terms = accepted_privacy_terms.unwrap_or_default();
        let completed_challenges = completed_challenges.unwrap_or_default();
        let completed_exams = completed_exams.unwrap_or_default();
        let current_challenge_id = current_challenge_id.unwrap_or_default();
        let donation_emails = donation_emails.unwrap_or_default();
        let email = email.ok_or(serde::de::Error::invalid_value(
            serde::de::Unexpected::Other("bad email"),
            &"a non-empty string email",
        ))?;
        let email_auth_link_ttl = email_auth_link_ttl.unwrap_or_default();
        let email_verified = email_verified.unwrap_or_default();
        let email_verify_ttl = email_verify_ttl.unwrap_or_default();
        let external_id = external_id.unwrap_or_default();
        let github_profile = github_profile.unwrap_or_default();
        let is_2018_data_vis_cert = is_2018_data_vis_cert.unwrap_or_default();
        let is_2018_full_stack_cert = is_2018_full_stack_cert.unwrap_or_default();
        let is_apis_microservices_cert = is_apis_microservices_cert.unwrap_or_default();
        let is_back_end_cert = is_back_end_cert.unwrap_or_default();
        let is_banned = is_banned.unwrap_or_default();
        let is_cheater = is_cheater.unwrap_or_default();
        let is_classroom_account = is_classroom_account.unwrap_or_default();
        let is_college_algebra_py_cert_v8 = is_college_algebra_py_cert_v8.unwrap_or_default();
        let is_data_analysis_py_cert_v7 = is_data_analysis_py_cert_v7.unwrap_or_default();
        let is_data_vis_cert = is_data_vis_cert.unwrap_or_default();
        let is_donating = is_donating.unwrap_or_default();
        let is_foundational_c_sharp_cert_v8 = is_foundational_c_sharp_cert_v8.unwrap_or_default();
        let is_front_end_cert = is_front_end_cert.unwrap_or_default();
        let is_front_end_libs_cert = is_front_end_libs_cert.unwrap_or_default();
        let is_full_stack_cert = is_full_stack_cert.unwrap_or_default();
        let is_honest = is_honest.unwrap_or_default();
        let is_infosec_cert_v7 = is_infosec_cert_v7.unwrap_or_default();
        let is_infosec_qa_cert = is_infosec_qa_cert.unwrap_or_default();
        let is_js_algo_data_struct_cert = is_js_algo_data_struct_cert.unwrap_or_default();
        let is_js_algo_data_struct_cert_v8 = is_js_algo_data_struct_cert_v8.unwrap_or_default();
        let is_machine_learning_py_cert_v7 = is_machine_learning_py_cert_v7.unwrap_or_default();
        let is_qa_cert_v7 = is_qa_cert_v7.unwrap_or_default();
        let is_relational_database_cert_v8 = is_relational_database_cert_v8.unwrap_or_default();
        let is_resp_web_design_cert = is_resp_web_design_cert.unwrap_or_default();
        let is_sci_comp_py_cert_v7 = is_sci_comp_py_cert_v7.unwrap_or_default();
        let keyboard_shortcuts = keyboard_shortcuts.unwrap_or_default();
        let linkedin = linkedin.unwrap_or_default();
        let location = location.unwrap_or_default();
        let name = name.unwrap_or_default();
        let needs_moderation = needs_moderation.unwrap_or_default();
        let new_email = new_email.unwrap_or_default();
        let partially_completed_challenges = partially_completed_challenges.unwrap_or_default();
        let picture = picture.unwrap_or_default();
        let portfolio = portfolio.unwrap_or_default();
        let profile_ui = profile_ui.unwrap_or_default();
        let progress_timestamps = progress_timestamps.unwrap_or_default();
        let rand = rand.unwrap_or_default();
        let saved_challenges = saved_challenges.unwrap_or_default();
        let send_quincy_email = send_quincy_email.unwrap_or_default();
        let theme = theme.unwrap_or("default".to_string());
        let twitter = twitter.unwrap_or_default();
        let unsubscribe_id =
            unsubscribe_id.ok_or(serde::de::Error::missing_field("unsubscribeId"))?;
        let username = username.ok_or(serde::de::Error::missing_field("username"))?;
        let username_display = username_display.unwrap_or_default();
        let website = website.unwrap_or_default();
        let years_top_contributor = years_top_contributor.unwrap_or_default();

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
            is_2018_data_vis_cert,
            is_2018_full_stack_cert,
            is_apis_microservices_cert,
            is_back_end_cert,
            is_banned,
            is_cheater,
            is_classroom_account,
            is_college_algebra_py_cert_v8,
            is_data_analysis_py_cert_v7,
            is_data_vis_cert,
            is_donating,
            is_foundational_c_sharp_cert_v8,
            is_front_end_cert,
            is_front_end_libs_cert,
            is_full_stack_cert,
            is_honest,
            is_infosec_cert_v7,
            is_infosec_qa_cert,
            is_js_algo_data_struct_cert,
            is_js_algo_data_struct_cert_v8,
            is_machine_learning_py_cert_v7,
            is_qa_cert_v7,
            is_relational_database_cert_v8,
            is_resp_web_design_cert,
            is_sci_comp_py_cert_v7,
            keyboard_shortcuts,
            linkedin,
            location,
            name,
            needs_moderation,
            new_email,
            partially_completed_challenges,
            picture,
            portfolio,
            profile_ui,
            rand,
            progress_timestamps,
            saved_challenges,
            send_quincy_email,
            theme,
            twitter,
            unsubscribe_id,
            username,
            username_display,
            website,
            years_top_contributor,
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
    use crate::record::{File, ProfileUI};

    use super::*;
    use bson::oid::ObjectId;
    use cmp::compare_structs;

    #[test]
    fn empty_document_to_user() {
        let object_id = ObjectId::new();
        let unsubscribe_id = "some-uuid".to_string();
        let username = "username".to_string();
        let doc_1 = mongodb::bson::doc! {
            "_id": object_id,
            "unsubscribeId": &unsubscribe_id,
            "username": &username,
            "email": "non-empty string"
        };

        let actual_user: User = mongodb::bson::from_document(doc_1).unwrap();

        let expected_user = User {
            _id: object_id,
            about: String::default(),
            accepted_privacy_terms: bool::default(),
            completed_challenges: Vec::default(),
            completed_exams: Vec::default(),
            current_challenge_id: String::default(),
            donation_emails: Vec::default(),
            email: "non-empty string".to_string(),
            email_auth_link_ttl: NOption::default(),
            email_verified: bool::default(),
            email_verify_ttl: NOption::default(),
            external_id: NOption::default(),
            github_profile: String::default(),
            is_2018_data_vis_cert: bool::default(),
            is_2018_full_stack_cert: bool::default(),
            is_apis_microservices_cert: bool::default(),
            is_back_end_cert: bool::default(),
            is_banned: bool::default(),
            is_cheater: bool::default(),
            is_classroom_account: bool::default(),
            is_college_algebra_py_cert_v8: bool::default(),
            is_data_analysis_py_cert_v7: bool::default(),
            is_data_vis_cert: bool::default(),
            is_donating: bool::default(),
            is_foundational_c_sharp_cert_v8: bool::default(),
            is_front_end_cert: bool::default(),
            is_front_end_libs_cert: bool::default(),
            is_full_stack_cert: bool::default(),
            is_honest: bool::default(),
            is_infosec_cert_v7: bool::default(),
            is_infosec_qa_cert: bool::default(),
            is_js_algo_data_struct_cert: bool::default(),
            is_js_algo_data_struct_cert_v8: bool::default(),
            is_machine_learning_py_cert_v7: bool::default(),
            is_qa_cert_v7: bool::default(),
            is_relational_database_cert_v8: bool::default(),
            is_resp_web_design_cert: bool::default(),
            is_sci_comp_py_cert_v7: bool::default(),
            keyboard_shortcuts: bool::default(),
            linkedin: String::default(),
            location: String::default(),
            name: String::default(),
            needs_moderation: bool::default(),
            new_email: NOption::default(),
            partially_completed_challenges: Vec::default(),
            picture: String::default(),
            portfolio: Vec::default(),
            profile_ui: ProfileUI::default(),
            progress_timestamps: Vec::default(),
            rand: f64::default(),
            saved_challenges: Vec::default(),
            send_quincy_email: bool::default(),
            theme: "default".to_string(),
            twitter: String::default(),
            unsubscribe_id,
            username,
            username_display: String::default(),
            website: String::default(),
            years_top_contributor: Vec::default(),
        };

        compare_structs!(
            actual_user,
            expected_user,
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
            is_2018_data_vis_cert,
            is_2018_full_stack_cert,
            is_apis_microservices_cert,
            is_back_end_cert,
            is_banned,
            is_cheater,
            is_classroom_account,
            is_college_algebra_py_cert_v8,
            is_data_analysis_py_cert_v7,
            is_data_vis_cert,
            is_donating,
            is_foundational_c_sharp_cert_v8,
            is_front_end_cert,
            is_front_end_libs_cert,
            is_full_stack_cert,
            is_honest,
            is_infosec_cert_v7,
            is_infosec_qa_cert,
            is_js_algo_data_struct_cert,
            is_js_algo_data_struct_cert_v8,
            is_machine_learning_py_cert_v7,
            is_qa_cert_v7,
            is_relational_database_cert_v8,
            is_resp_web_design_cert,
            is_sci_comp_py_cert_v7,
            keyboard_shortcuts,
            linkedin,
            location,
            name,
            needs_moderation,
            new_email,
            partially_completed_challenges,
            picture,
            portfolio,
            profile_ui,
            progress_timestamps,
            rand,
            saved_challenges,
            send_quincy_email,
            theme,
            twitter,
            unsubscribe_id,
            username,
            username_display,
            website,
            years_top_contributor
        );
    }

    #[test]
    fn bad_document_to_user() {
        let object_id = ObjectId::new();
        let email_verify_datetime = DateTime::now();
        let email_verify_ttl = NOption::Some(email_verify_datetime);
        let doc_1 = mongodb::bson::doc! {
            "_id": object_id,
            "about": ["ab", "out"],
            "email": "fCC@freecodecamp.org",
            "emailVerifyTTL": email_verify_datetime.clone(),
            "unsubscribeId": "some-uuid".to_string(),
            "name": "name",
            "username": "UsErNaMe",
            "currentChallengeId": object_id,
            "completedChallenges": [
                {
                    "challengeType": Bson::Undefined,
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
                            }
                            ],
                    "id": "1234"
                }
            ],
            "partiallyCompletedChallenges": [
                {
                    "completedDate": 10_000_000_000.0,
                }
            ],
            "portfolio": [
                {
                    "bad":"document"
                }
            ],
            "profileUI": {
                "showAbout": false,
                "showCerts": Bson::Null,
                "showName": "test",
            },
            "progressTimestamps": [
                Bson::Double(1620000000.0),
                DateTime::from_millis(10_000_000_000),
                {
                    "timestamp": 16890000000i64
                },
                {
                    "stamp": 16890000001i64
                }
            ],
            "savedChallenges": [
                {
                    "files": [],
                    "id": "1234",
                    "lastSavedDate": DateTime::from_millis(10_000_000_000)
                }
            ],
            "yearsTopContributor": [
                "2020",
                Bson::Int32(2021),
                Bson::Int64(2022),
                Bson::Double(2023.1),
                "bad-2024"
            ]
        };

        let actual_user: User = mongodb::bson::from_document(doc_1).unwrap();

        let profile_ui = ProfileUI {
            is_locked: true,
            show_about: false,
            show_certs: false,
            show_donation: false,
            show_heat_map: false,
            show_location: false,
            show_name: false,
            show_points: false,
            show_portfolio: false,
            show_time_line: false,
        };

        let expected_user = User {
            _id: object_id,
            about: "about".to_string(),
            accepted_privacy_terms: false,
            completed_challenges: vec![CompletedChallenge {
                challenge_type: NOption::Undefined,
                completed_date: 1_620_000_000_000,
                files: vec![File {
                    contents: "String".to_string(),
                    ext: "String".to_string(),
                    key: "String".to_string(),
                    name: "String".to_string(),
                    path: "".to_string(),
                }],
                github_link: NOption::Null,
                id: "1234".to_string(),
                is_manually_approved: NOption::Null,
                solution: NOption::Null,
            }],
            completed_exams: vec![],
            current_challenge_id: object_id.to_hex(),
            donation_emails: vec![],
            email: "fcc@freecodecamp.org".to_string(),
            email_auth_link_ttl: NOption::Null,
            email_verified: false,
            email_verify_ttl: email_verify_ttl.clone(),
            external_id: NOption::Null,
            github_profile: "".to_string(),
            is_2018_data_vis_cert: false,
            is_2018_full_stack_cert: false,
            is_apis_microservices_cert: false,
            is_back_end_cert: false,
            is_banned: false,
            is_cheater: false,
            is_classroom_account: false,
            is_college_algebra_py_cert_v8: false,
            is_data_analysis_py_cert_v7: false,
            is_data_vis_cert: false,
            is_donating: false,
            is_foundational_c_sharp_cert_v8: false,
            is_front_end_cert: false,
            is_front_end_libs_cert: false,
            is_full_stack_cert: false,
            is_honest: false,
            is_infosec_cert_v7: false,
            is_infosec_qa_cert: false,
            is_js_algo_data_struct_cert: false,
            is_js_algo_data_struct_cert_v8: false,
            is_machine_learning_py_cert_v7: false,
            is_qa_cert_v7: false,
            is_relational_database_cert_v8: false,
            is_resp_web_design_cert: false,
            is_sci_comp_py_cert_v7: false,
            keyboard_shortcuts: false,
            linkedin: "".to_string(),
            location: "".to_string(),
            name: "name".to_string(),
            needs_moderation: false,
            new_email: NOption::Null,
            partially_completed_challenges: vec![PartiallyCompletedChallenge {
                completed_date: 10_000_000_000,
                id: String::new(),
            }],
            picture: "".to_string(),
            portfolio: vec![Portfolio::default()],
            profile_ui,
            progress_timestamps: vec![
                1620000000 * 1000,
                10_000_000_000,
                16890000000i64,
                16890000001i64,
            ],
            rand: f64::default(),
            saved_challenges: vec![SavedChallenge {
                challenge_type: 0,
                files: vec![],
                id: "1234".to_string(),
                last_saved_date: 10_000_000_000,
            }],
            send_quincy_email: false,
            theme: "default".to_string(),
            twitter: "".to_string(),
            unsubscribe_id: "some-uuid".to_string(),
            username: "username".to_string(),
            username_display: "".to_string(),
            website: "".to_string(),
            years_top_contributor: vec![2020, 2021, 2022, 2023],
        };

        compare_structs!(
            actual_user,
            expected_user,
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
            is_2018_data_vis_cert,
            is_2018_full_stack_cert,
            is_apis_microservices_cert,
            is_back_end_cert,
            is_banned,
            is_cheater,
            is_classroom_account,
            is_college_algebra_py_cert_v8,
            is_data_analysis_py_cert_v7,
            is_data_vis_cert,
            is_donating,
            is_foundational_c_sharp_cert_v8,
            is_front_end_cert,
            is_front_end_libs_cert,
            is_full_stack_cert,
            is_honest,
            is_infosec_cert_v7,
            is_infosec_qa_cert,
            is_js_algo_data_struct_cert,
            is_js_algo_data_struct_cert_v8,
            is_machine_learning_py_cert_v7,
            is_qa_cert_v7,
            is_relational_database_cert_v8,
            is_resp_web_design_cert,
            is_sci_comp_py_cert_v7,
            keyboard_shortcuts,
            linkedin,
            location,
            name,
            needs_moderation,
            new_email,
            partially_completed_challenges,
            picture,
            portfolio,
            profile_ui,
            progress_timestamps,
            rand,
            saved_challenges,
            send_quincy_email,
            theme,
            twitter,
            unsubscribe_id,
            username_display,
            website,
            years_top_contributor
        );
    }

    #[test]
    fn user_to_document() {
        let object_id = ObjectId::new();
        let email_auth_link_ttl = NOption::Some(bson::DateTime::now());
        let email_verify_ttl = NOption::Some(bson::DateTime::now());
        let profile_ui = ProfileUI {
            is_locked: true,
            show_about: false,
            show_certs: false,
            show_donation: false,
            show_heat_map: false,
            show_location: false,
            show_name: false,
            show_points: false,
            show_portfolio: false,
            show_time_line: false,
        };

        let user = User {
            _id: object_id,
            about: "about".to_string(),
            accepted_privacy_terms: true,
            completed_challenges: vec![],
            completed_exams: vec![],
            current_challenge_id: object_id.to_hex(),
            donation_emails: vec!["fcc@freecodecamp.org".to_string()],
            email: "fcc@freecodecamp.org".to_string(),
            email_auth_link_ttl: email_auth_link_ttl.clone(),
            email_verified: true,
            email_verify_ttl: email_verify_ttl.clone(),
            external_id: NOption::Null,
            github_profile: "".to_string(),
            is_2018_data_vis_cert: false,
            is_2018_full_stack_cert: false,
            is_apis_microservices_cert: false,
            is_back_end_cert: false,
            is_banned: false,
            is_cheater: false,
            is_classroom_account: false,
            is_college_algebra_py_cert_v8: false,
            is_data_analysis_py_cert_v7: false,
            is_data_vis_cert: false,
            is_donating: false,
            is_foundational_c_sharp_cert_v8: false,
            is_front_end_cert: false,
            is_front_end_libs_cert: false,
            is_full_stack_cert: false,
            is_honest: false,
            is_infosec_cert_v7: false,
            is_infosec_qa_cert: false,
            is_js_algo_data_struct_cert: false,
            is_js_algo_data_struct_cert_v8: false,
            is_machine_learning_py_cert_v7: false,
            is_qa_cert_v7: false,
            is_relational_database_cert_v8: false,
            is_resp_web_design_cert: false,
            is_sci_comp_py_cert_v7: false,
            keyboard_shortcuts: false,
            linkedin: "".to_string(),
            location: "".to_string(),
            name: "name".to_string(),
            needs_moderation: false,
            new_email: NOption::Null,
            partially_completed_challenges: vec![],
            picture: "".to_string(),
            portfolio: vec![],
            profile_ui,
            progress_timestamps: vec![],
            rand: 0.123456789,
            saved_challenges: vec![],
            send_quincy_email: false,
            theme: "light".to_string(),
            twitter: "".to_string(),
            unsubscribe_id: "some-uuid-string".to_string(),
            username: "my-username".to_string(),
            username_display: "".to_string(),
            website: "".to_string(),
            years_top_contributor: vec![],
        };

        let doc = mongodb::bson::to_document(&user).unwrap();

        assert_eq!(doc.get_object_id("_id").unwrap(), object_id);
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
        assert_eq!(
            NOption::Some(*doc.get_datetime("emailAuthLinkTTL").unwrap()),
            email_auth_link_ttl
        );
        assert_eq!(doc.get_bool("emailVerified").unwrap(), true);
        assert_eq!(
            NOption::Some(*doc.get_datetime("emailVerifyTTL").unwrap()),
            email_verify_ttl
        );
        assert_eq!(doc.get("externalId").unwrap(), &Bson::Null);
        assert_eq!(doc.get_str("githubProfile").unwrap(), "");
        assert_eq!(doc.get_bool("is2018DataVisCert").unwrap(), false);
        assert_eq!(doc.get_bool("is2018FullStackCert").unwrap(), false);
        assert_eq!(doc.get_bool("isApisMicroservicesCert").unwrap(), false);
        assert_eq!(doc.get_bool("isBackEndCert").unwrap(), false);
        assert_eq!(doc.get_bool("isBanned").unwrap(), false);
        assert_eq!(doc.get_bool("isCheater").unwrap(), false);
        assert_eq!(doc.get_bool("isClassroomAccount").unwrap(), false);
        assert_eq!(doc.get_bool("isCollegeAlgebraPyCertV8").unwrap(), false);
        assert_eq!(doc.get_bool("isDataAnalysisPyCertV7").unwrap(), false);
        assert_eq!(doc.get_bool("isDataVisCert").unwrap(), false);
        assert_eq!(doc.get_bool("isDonating").unwrap(), false);
        assert_eq!(doc.get_bool("isFoundationalCSharpCertV8").unwrap(), false);
        assert_eq!(doc.get_bool("isFrontEndCert").unwrap(), false);
        assert_eq!(doc.get_bool("isFrontEndLibsCert").unwrap(), false);
        assert_eq!(doc.get_bool("isFullStackCert").unwrap(), false);
        assert_eq!(doc.get_bool("isHonest").unwrap(), false);
        assert_eq!(doc.get_bool("isInfosecCertV7").unwrap(), false);
        assert_eq!(doc.get_bool("isInfosecQaCert").unwrap(), false);
        assert_eq!(doc.get_bool("isJsAlgoDataStructCert").unwrap(), false);
        assert_eq!(doc.get_bool("isJsAlgoDataStructCertV8").unwrap(), false);
        assert_eq!(doc.get_bool("isMachineLearningPyCertV7").unwrap(), false);
        assert_eq!(doc.get_bool("isQaCertV7").unwrap(), false);
        assert_eq!(doc.get_bool("isRelationalDatabaseCertV8").unwrap(), false);
        assert_eq!(doc.get_bool("isRespWebDesignCert").unwrap(), false);
        assert_eq!(doc.get_bool("isSciCompPyCertV7").unwrap(), false);
        assert_eq!(doc.get_bool("keyboardShortcuts").unwrap(), false);
        assert_eq!(doc.get_str("linkedin").unwrap(), "");
        assert_eq!(doc.get_str("location").unwrap(), "");
        assert_eq!(doc.get_str("name").unwrap(), "name");
        assert_eq!(doc.get_bool("needsModeration").unwrap(), false);
        assert_eq!(doc.get("newEmail").unwrap(), &Bson::Null);
        assert_eq!(
            doc.get_array("partiallyCompletedChallenges").unwrap().len(),
            0
        );
        assert_eq!(doc.get_str("picture").unwrap(), "");
        assert_eq!(doc.get_array("portfolio").unwrap().len(), 0);
        assert_eq!(
            doc.get_document("profileUI").unwrap(),
            &mongodb::bson::doc! {
                "isLocked": true,
                "showAbout": false,
                "showCerts": false,
                "showDonation": false,
                "showHeatMap": false,
                "showLocation": false,
                "showName": false,
                "showPoints": false,
                "showPortfolio": false,
                "showTimeLine": false,
            }
        );
        assert_eq!(doc.get_array("progressTimestamps").unwrap().len(), 0);
        assert_eq!(doc.get_f64("rand").unwrap(), 0.123456789);
        assert_eq!(doc.get_array("savedChallenges").unwrap().len(), 0);
        assert_eq!(doc.get_bool("sendQuincyEmail").unwrap(), false);
        assert_eq!(doc.get_str("theme").unwrap(), "light");
        assert_eq!(doc.get_str("twitter").unwrap(), "");
        assert_eq!(doc.get_str("unsubscribeId").unwrap(), "some-uuid-string");
        assert_eq!(doc.get_str("username").unwrap(), "my-username");
        assert_eq!(doc.get_str("usernameDisplay").unwrap(), "");
        assert_eq!(doc.get_str("website").unwrap(), "");
        assert_eq!(doc.get_array("yearsTopContributor").unwrap().len(), 0);
    }
}
