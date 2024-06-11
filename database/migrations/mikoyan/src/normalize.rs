use mongodb::bson::{self, de::Error, oid::ObjectId, DateTime, Document, Timestamp};

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

    DateTime::from_millis(num)
}

pub trait ToMillis: ToString {
    fn to_millis(&self) -> i64 {
        let s = self.to_string();

        // If float, remove the decimal part
        let s = if let Some(pos) = s.find('.') {
            &s[..pos]
        } else {
            &s
        };

        // If the string contains any non-numeric characters, return 0
        if s.chars().any(|c| !c.is_numeric()) || s.is_empty() {
            return 0;
        }

        // Handle seconds, but assume milliseconds
        if s.len() == 10 {
            let num = s.parse::<i64>().unwrap();
            num * 1000
        } else {
            s.parse::<i64>().unwrap()
        }
    }
}

impl ToMillis for i64 {}
impl ToMillis for i32 {}
impl ToMillis for f64 {}
impl ToMillis for f32 {}
impl ToMillis for DateTime {
    fn to_millis(&self) -> i64 {
        let millis = self.timestamp_millis();
        if millis < 10_000_000_000 {
            return millis * 1000;
        }
        millis
    }
}
impl ToMillis for Timestamp {
    fn to_millis(&self) -> i64 {
        let millis = (self.time as i64) * 1000;
        if millis < 10_000_000_000 {
            return millis * 1000;
        }
        millis
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_num_to_datetime() {
        let num = 1614556800;
        let dt = num_to_datetime(num);
        assert_eq!(dt.timestamp_millis(), 1614556800000);
    }

    #[test]
    fn test_to_millis() {
        let num = 1614556800;
        assert_eq!(num.to_millis(), 1614556800000);
    }

    #[test]
    fn test_to_millis_float() {
        let num_1 = 1614556800.0;
        let num_2 = 1614556800.123;
        assert_eq!(num_1.to_millis(), 1614556800000);
        assert_eq!(num_2.to_millis(), 1614556800000);
    }

    #[test]
    fn test_to_millis_datetime() {
        let num = 1614556800;
        let dt = DateTime::from_millis(num);
        assert_eq!(dt.to_millis(), 1614556800000);
    }

    #[test]
    fn test_to_millis_timestamp() {
        let num = 1614556800;
        let ts = Timestamp {
            time: num,
            increment: 0,
        };
        assert_eq!(ts.to_millis(), 1614556800000);
    }
}
