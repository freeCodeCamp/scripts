use mongodb::bson::{Bson, Document};

pub fn merge_records(records: Vec<Document>) -> Result<Document, Box<dyn std::error::Error>> {
    if records.is_empty() {
        return Err("No records to merge".into());
    }

    // Use the oldest record as the base
    let mut base = get_oldest_record(&records).clone();

    let records_to_merge = records
        .iter()
        .filter(|record| record.get_object_id("_id") != base.get_object_id("_id"))
        .collect::<Vec<_>>();

    for record in records_to_merge {
        for (key, value) in record.iter() {
            match key.as_str() {
                "_id" => continue,
                "email" => continue,
                "isBanned" | "isCheater" => continue,
                _ => match value {
                    // Concatenate lists, discard duplicates
                    Bson::Array(arr) => {
                        if let Some(existing) = base.get(key) {
                            if let Bson::Array(existing_arr) = existing {
                                let mut new_arr = existing_arr.clone();
                                for item in arr {
                                    if !new_arr.contains(item) {
                                        new_arr.push(item.clone());
                                    }
                                }
                                base.insert(key.clone(), Bson::Array(new_arr));
                            }
                        } else {
                            base.insert(key.clone(), Bson::Array(arr.clone()));
                        }
                    }
                    // OR boolean values
                    Bson::Boolean(b) => {
                        if let Some(existing) = base.get(key) {
                            if let Bson::Boolean(existing_b) = existing {
                                if *existing_b == false && *b == true {
                                    base.insert(key.clone(), Bson::Boolean(true));
                                }
                            }
                        } else {
                            base.insert(key.clone(), Bson::Boolean(*b));
                        }
                    }
                    Bson::Null => {
                        if !base.contains_key(key) {
                            base.insert(key.clone(), Bson::Null);
                        }
                    }
                    Bson::Undefined => {
                        if !base.contains_key(key) {
                            base.insert(key.clone(), Bson::Undefined);
                        }
                    }
                    Bson::String(s) => {
                        if let Some(existing) = base.get(key) {
                            if let Bson::String(existing_s) = existing {
                                if existing_s.is_empty() && !s.is_empty() {
                                    base.insert(key.clone(), Bson::String(s.clone()));
                                }
                            }
                        } else {
                            base.insert(key.clone(), Bson::String(s.clone()));
                        }
                    }
                    // For all other types, prefer the value from the record
                    v => {
                        if !base.contains_key(key) {
                            base.insert(key.clone(), v.clone());
                        }
                    }
                },
            }
        }
    }

    Ok(base)
}

/// Gets the `_id` from all records, and returns the oldest one.
/// Each ObjectId contains a timestamp, so we can use that to determine the oldest record.
pub fn get_oldest_record(records: &[Document]) -> &Document {
    records
        .iter()
        .min_by_key(|record| record.get_object_id("_id").unwrap().timestamp())
        .expect("No records found")
}

#[cfg(test)]
mod tests {
    use super::*;
    use mongodb::bson::{doc, oid::ObjectId};

    #[test]
    fn merge_big_records() {
        let base_record = doc! {
            "_id": ObjectId::new(),
            "email": "some@freecodecamp.org",
            "isBanned": false,
            "isCheater": false,
            "name": "John Doe",
            "username": "",
            "progressTimestamps": [0, 1, 5, 6],
            "profileUI": {
                "isLocked": true,
                "showName": false
            }
        };
        let record2 = doc! {
            "_id": ObjectId::new(),
            "email": "some@freecodecamp.org",
            "isBanned": false,
            "isCheater": false,
            "name": "",
            "username": "some",
            "progressTimestamps": [0, 1, 2, 3, {"timestamp": 4}],
            "profileUI": {
                "showName": true
            }
        };

        let merged_record = merge_records(vec![base_record.clone(), record2.clone()]).unwrap();

        assert_eq!(
            merged_record.get_object_id("_id").unwrap(),
            base_record.get_object_id("_id").unwrap()
        );
        assert_eq!(
            merged_record.get_str("email").unwrap(),
            "some@freecodecamp.org"
        );
        assert_eq!(merged_record.get_bool("isBanned").unwrap(), false);
        assert_eq!(merged_record.get_bool("isCheater").unwrap(), false);
        assert_eq!(merged_record.get_str("name").unwrap(), "John Doe");
        assert_eq!(merged_record.get_str("username").unwrap(), "some");
        assert_eq!(
            merged_record.get_array("progressTimestamps").unwrap().len(),
            7
        );
        // No duplicates in the array
        assert_eq!(
            merged_record
                .get_array("progressTimestamps")
                .unwrap()
                .iter()
                .filter(|x| *x == &Bson::Int32(0))
                .count(),
            1
        );
        let profile_ui = merged_record.get_document("profileUI").unwrap();
        assert_eq!(profile_ui.get_bool("isLocked").unwrap(), true);
        assert_eq!(profile_ui.get_bool("showName").unwrap(), false);
    }

    #[test]
    fn is_banned_no_change() {
        let mut base = doc! {
            "_id": ObjectId::new(),
            "email": "some@freecodecamp.org",
            "isBanned": false,
        };

        let mut other = doc! {
            "_id": ObjectId::new(),
            "email": "some@freecodecamp.org",
            "isBanned": true
        };

        let merged = merge_records(vec![base.clone(), other.clone()]).unwrap();
        assert_eq!(
            merged.get_object_id("_id").unwrap(),
            base.get_object_id("_id").unwrap()
        );
        assert_eq!(merged.get_bool("isBanned").unwrap(), false);

        base.insert("isBanned", true);
        other.insert("isBanned", false);

        let merged = merge_records(vec![base.clone(), other.clone()]).unwrap();
        assert_eq!(merged.get_bool("isBanned").unwrap(), true);
    }

    #[test]
    fn is_cheater_no_change() {
        let mut base = doc! {
            "_id": ObjectId::new(),
            "email": "some@freecodecamp.org",
            "isCheater": false,
        };

        let mut other = doc! {
            "_id": ObjectId::new(),
            "email": "some@freecodecamp.org",
            "isCheater": true
        };

        let merged = merge_records(vec![base.clone(), other.clone()]).unwrap();

        assert_eq!(
            merged.get_object_id("_id").unwrap(),
            base.get_object_id("_id").unwrap()
        );
        assert_eq!(merged.get_bool("isCheater").unwrap(), false);

        base.insert("isCheater", true);
        other.insert("isCheater", false);
        let merged = merge_records(vec![base.clone(), other.clone()]).unwrap();

        assert_eq!(merged.get_bool("isCheater").unwrap(), true);
    }

    #[test]
    fn undefined_base_records_added() {
        let base = doc! {
            "_id": ObjectId::new(),
            "email": "some@freecodecamp.org",
        };

        let other = doc! {
          "_id": ObjectId::new(),
          "email": "some@freecodecamp.org",
          "progressTimestamps": [0, 1, 2],
          "profileUI": {
              "isLocked": true,
          },
          "emailVerified": null,
          "isResponsiveWebDesignCert": false
        };

        let merged = merge_records(vec![base.clone(), other.clone()]).unwrap();
        assert_eq!(
            merged.get_object_id("_id").unwrap(),
            base.get_object_id("_id").unwrap()
        );

        assert_eq!(merged.get_str("email").unwrap(), "some@freecodecamp.org");
        assert_eq!(merged.get_array("progressTimestamps").unwrap().len(), 3);
        assert_eq!(
            merged
                .get_document("profileUI")
                .unwrap()
                .get_bool("isLocked")
                .unwrap(),
            true
        );
        assert_eq!(merged.get_bool("isResponsiveWebDesignCert").unwrap(), false);
        assert_eq!(merged.get("emailVerified").unwrap(), &Bson::Null);
        assert_eq!(
            merged.get("isResponsiveWebDesignCert").unwrap(),
            &Bson::Boolean(false)
        );
    }

    #[test]
    fn test_get_oldest_record() {
        let record1 = doc! {
            "_id": ObjectId::new(),
            "email": "some@freecodecamp.org"
        };
        let record2 = doc! {
            "_id": ObjectId::new(),
            "email": "some@freecodecamp.org",
        };

        let records = vec![record1.clone(), record2.clone()];

        let oldest_record = get_oldest_record(&records);
        assert_eq!(
            oldest_record.get_object_id("_id").unwrap(),
            record1.get_object_id("_id").unwrap()
        );
    }
}
