use mongodb::bson::{self, oid::ObjectId, Document};

use crate::record::User;

#[derive(Debug)]
pub enum NormalizeError {
    UnhandledType { id: ObjectId, doc: Document },
    ConfusedId { doc: Document },
}

pub fn normalize_user(user: Document) -> Result<Document, NormalizeError> {
    let normal_user: User = bson::from_document(user).unwrap();
    let new_user_document: Document = bson::to_document(&normal_user).unwrap();
    Ok(new_user_document)
}

// fn _unused(user: &Document) -> Result<Document, NormalizeError> {
//     let empty_vec: mongodb::bson::Array = Vec::new();
//     let mut normalize_error = vec![];
//     let mut update_op = doc! {};
//     let user_id = if user.get_object_id("_id").is_ok() {
//         user.get_object_id("_id").unwrap()
//     } else {
//         normalize_error.push(NormalizeError::UnhandledType {
//             id: ObjectId::new(),
//             doc: user.clone(),
//         });
//         return Err(normalize_error);
//     };
//     if user.get("savedChallenges").is_none() {
//         update_op.insert("savedChallenges", empty_vec.clone());
//     }
//     if user.get("partiallyCompletedChallenges").is_none() {
//         update_op.insert("partiallyCompletedChallenges", empty_vec.clone());
//     }
//     if let Some(completed_challenges) = user.get("completedChallenges") {
//         match completed_challenges {
//             Bson::Array(arr) => {
//                 let mut new_arr: Vec<Bson> = Vec::with_capacity(arr.len());
//                 for c in arr {
//                     match c {
//                         Bson::Document(completed_challenge) => {
//                             let mut new_completed_challenge = completed_challenge.clone();
//                             if new_completed_challenge.get("files").is_none() {
//                                 new_completed_challenge.insert("files", empty_vec.clone());
//                             }
//                             new_arr.push(Bson::Document(new_completed_challenge));
//                         }
//                         Bson::Null | Bson::Undefined => {
//                             // NO-OP
//                         }
//                         _ => {
//                             normalize_error.push(NormalizeError::UnhandledType {
//                                 id: user_id,
//                                 doc: doc! {
//                                     "completedChallenges": completed_challenges.clone()
//                                 },
//                             });
//                             break;
//                         }
//                     }
//                 }
//                 update_op.insert("completedChallenges", new_arr);
//             }
//             Bson::Null | Bson::Undefined => {
//                 update_op.insert("completedChallenges", empty_vec.clone());
//             }
//             _ => {
//                 normalize_error.push(NormalizeError::UnhandledType {
//                     id: user_id,
//                     doc: doc! {
//                         "completedChallenges": completed_challenges.clone()
//                     },
//                 });
//             }
//         }
//     } else {
//         update_op.insert("completedChallenges", empty_vec.clone());
//     }
//     if let Some(progress_timestamps) = user.get("progressTimestamps") {
//         match progress_timestamps {
//             Bson::Array(arr) => {
//                 let mut new_arr = Vec::with_capacity(arr.len());
//                 for e in arr {
//                     match e {
//                         Bson::Double(v) => {
//                             new_arr.push(Bson::Double(*v));
//                         }
//                         Bson::Int32(v) => {
//                             new_arr.push(Bson::Double(*v as f64));
//                         }
//                         Bson::Int64(v) => {
//                             new_arr.push(Bson::Double(*v as f64));
//                         }
//                         Bson::String(v) => {
//                             if let Ok(v) = v.parse::<f64>() {
//                                 new_arr.push(Bson::Double(v));
//                             } else {
//                                 normalize_error.push(NormalizeError::UnhandledType {
//                                     id: user_id,
//                                     doc: doc! {
//                                         "progressTimestamps": progress_timestamps.clone()
//                                     },
//                                 });
//                                 break;
//                             }
//                         }
//                         Bson::Timestamp(ts) => {
//                             new_arr.push(Bson::Double(ts.time.into()));
//                         }
//                         Bson::Document(v) => {
//                             if let Some(v) = v.get("timestamp") {
//                                 let Ok(millis) = match v {
//                                     Bson::Double(v) => {
//                                         Ok(*v as i64)
//                                     }
//                                     Bson::Int32(v) => {
//                                         todo!()
//                                     }
//                                     Bson::Int64(v) => {
//                                         todo!()
//                                     }
//                                     Bson::String(v) => {
//                                         if let Ok(v) = v.parse::<f64>() {
//                                             new_arr.push(Bson::Double(v));
//                                         } else {
//                                             normalize_error.push(NormalizeError::UnhandledType {
//                                                 id: user_id,
//                                                 doc: doc! {
//                                                     "progressTimestamps": progress_timestamps.clone()
//                                                 },
//                                             });
//                                             break;
//                                         }
//                                         todo!()
//                                     }
//                                     Bson::Timestamp(ts) => {
//                                         new_arr.push(Bson::Double(ts.time.into()));
//                                         todo!()
//                                     }
//                                     _ => {
//                                         normalize_error.push(NormalizeError::UnhandledType {
//                                             id: user_id,
//                                             doc: doc! {
//                                                 "progressTimestamps": progress_timestamps.clone()
//                                             },
//                                         });
//                                         break;
//                                     }
//                                 } else {
//                                     normalize_error.push(NormalizeError::UnhandledType {
//                                         id: user_id,
//                                         doc: doc! {
//                                             "progressTimestamps": progress_timestamps.clone()
//                                         },
//                                     });
//                                     break;
//                                 }
//                             } else {
//                                 normalize_error.push(NormalizeError::UnhandledType {
//                                     id: user_id,
//                                     doc: doc! {
//                                         "progressTimestamps": progress_timestamps.clone()
//                                     },
//                                 });
//                                 break;
//                             }
//                         }
//                         Bson::Null | Bson::Undefined => {
//                             // NO-OP
//                         }
//                         _ => {
//                             normalize_error.push(NormalizeError::UnhandledType {
//                                 id: user_id,
//                                 doc: doc! {
//                                     "progressTimestamps": progress_timestamps.clone()
//                                 },
//                             });
//                             break;
//                         }
//                     }
//                 }
//                 update_op.insert("progressTimestamps", new_arr);
//             }
//             Bson::Null | Bson::Undefined => {
//                 update_op.insert("progressTimestamps", empty_vec.clone());
//             }
//             _ => {
//                 normalize_error.push(NormalizeError::UnhandledType {
//                     id: user_id,
//                     doc: doc! {
//                         "progressTimestamps": progress_timestamps.clone()
//                     },
//                 });
//             }
//         }
//     } else {
//         update_op.insert("progressTimestamps", empty_vec.clone());
//     }
//     if let Some(years_top_contributor) = user.get("yearsTopContributor") {
//         // Handle years top contributor format
//         match years_top_contributor {
//             Bson::Array(arr) => {
//                 // Convert `[Bson::String]` to `[Bson::Double]`
//                 let mut new_arr = Vec::with_capacity(arr.len());
//                 for year in arr {
//                     match year {
//                         Bson::String(year) => {
//                             if let Ok(year) = year.parse::<f64>() {
//                                 new_arr.push(Bson::Double(year));
//                             } else {
//                                 normalize_error.push(NormalizeError::UnhandledType {
//                                     id: user_id,
//                                     doc: doc! {
//                                         "yearsTopContributor": years_top_contributor.clone()
//                                     },
//                                 });
//                                 break;
//                             }
//                         }
//                         Bson::Double(year) => {
//                             new_arr.push(Bson::Double(*year));
//                         }
//                         Bson::Int32(year) => {
//                             new_arr.push(Bson::Double(*year as f64));
//                         }
//                         Bson::Int64(year) => {
//                             new_arr.push(Bson::Double(*year as f64));
//                         }
//                         Bson::Undefined | Bson::Null => {
//                             // NO-OP
//                         }
//                         _ => {
//                             normalize_error.push(NormalizeError::UnhandledType {
//                                 id: user_id,
//                                 doc: doc! {
//                                     "yearsTopContributor": years_top_contributor.clone()
//                                 },
//                             });
//                             break;
//                         }
//                     };
//                 }
//                 update_op.insert("yearsTopContributor", new_arr);
//             }
//             Bson::Null | Bson::Undefined => {
//                 update_op.insert("yearsTopContributor", empty_vec);
//             }
//             _ => {
//                 normalize_error.push(NormalizeError::UnhandledType {
//                     id: user_id,
//                     doc: doc! {
//                         "yearsTopContributor": years_top_contributor.clone()
//                     },
//                 });
//             }
//         };
//     } else {
//         update_op.insert("yearsTopContributor", empty_vec);
//     }
//     let profile_ui_default = doc! {
//         "isLocked": false,
//         "showAbout": false,
//         "showCerts": false,
//         "showDonation": false,
//         "showHeatMap": false,
//         "showLocation": false,
//         "showName": false,
//         "showPoints": false,
//         "showPortfolio": false,
//         "showTimeLine": false,
//     };
//     if let Some(profile_ui) = user.get("profileUI") {
//         match profile_ui {
//             Bson::Document(ui) => {
//                 let mut new_ui = ui.clone();
//                 if is_undefined_or_null(&new_ui, "isLocked") {
//                     new_ui.insert("isLocked", Bson::Boolean(false));
//                 }
//                 if is_undefined_or_null(&new_ui, "showAbout") {
//                     new_ui.insert("showAbout", Bson::Boolean(false));
//                 }
//                 if is_undefined_or_null(&new_ui, "showCerts") {
//                     new_ui.insert("showCerts", Bson::Boolean(false));
//                 }
//                 if is_undefined_or_null(&new_ui, "showDonation") {
//                     new_ui.insert("showDonation", Bson::Boolean(false));
//                 }
//                 if is_undefined_or_null(&new_ui, "showHeatMap") {
//                     new_ui.insert("showHeatMap", Bson::Boolean(false));
//                 }
//                 if is_undefined_or_null(&new_ui, "showLocation") {
//                     new_ui.insert("showLocation", Bson::Boolean(false));
//                 }
//                 if is_undefined_or_null(&new_ui, "showName") {
//                     new_ui.insert("showName", Bson::Boolean(false));
//                 }
//                 if is_undefined_or_null(&new_ui, "showPoints") {
//                     new_ui.insert("showPoints", Bson::Boolean(false));
//                 }
//                 if is_undefined_or_null(&new_ui, "showPortfolio") {
//                     new_ui.insert("showPortfolio", Bson::Boolean(false));
//                 }
//                 if is_undefined_or_null(&new_ui, "showTimeLine") {
//                     new_ui.insert("showTimeLine", Bson::Boolean(false));
//                 }
//                 update_op.insert("profileUI", new_ui);
//             }
//             Bson::Null | Bson::Undefined => {
//                 update_op.insert("profileUI", profile_ui_default);
//             }
//             _ => {
//                 normalize_error.push(NormalizeError::UnhandledType {
//                     id: user_id,
//                     doc: doc! {
//                         "profileUI": profile_ui.clone()
//                     },
//                 });
//             }
//         }
//     } else {
//         update_op.insert("profileUI", profile_ui_default);
//     }
//     if !normalize_error.is_empty() {
//         Err(normalize_error)
//     } else {
//         let update_op = doc! {
//             "$set": update_op,
//             "$unset": doc! {
//                 "badges": "",
//                 "isGithub": "",
//                 "isLinkedIn": "",
//                 "isTwitter": "",
//                 "isWebsite": "",
//                 "password": "",
//                 "timezone": "",
//                 "completedChallenges.$[el].__cachedRelations": "",
//                 "completedChallenges.$[el].__data": "",
//                 "completedChallenges.$[el].__dataSource": "",
//                 "completedChallenges.$[el].__persisted": "",
//                 "completedChallenges.$[el].__strict": "",
//                 "profileUI.__cachedRelations": "",
//                 "profileUI.__data": "",
//                 "profileUI.__dataSource": "",
//                 "profileUI.__persisted": "",
//                 "profileUI.__strict": "",
//             },
//         };
//         Ok(update_op)
//     }
// }
