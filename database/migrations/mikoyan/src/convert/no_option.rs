use serde::{ser::SerializeStruct, Deserialize, Serialize};

use crate::record::NOption;

impl<'de, T> Deserialize<'de> for NOption<T>
where
    T: Deserialize<'de>,
{
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        struct NOptionVisitor<T>(std::marker::PhantomData<T>);

        impl<'de, T> serde::de::Visitor<'de> for NOptionVisitor<T>
        where
            T: Deserialize<'de>,
        {
            type Value = NOption<T>;

            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str("NOption")
            }

            fn visit_unit<E>(self) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                Ok(NOption::Null)
            }

            fn visit_none<E>(self) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                // TODO: Confirm this is all that is wanted
                Ok(NOption::Null)
            }

            fn visit_some<D>(self, deserializer: D) -> Result<Self::Value, D::Error>
            where
                D: serde::Deserializer<'de>,
            {
                Ok(NOption::Some(T::deserialize(deserializer)?))
            }
        }

        deserializer.deserialize_option(NOptionVisitor(std::marker::PhantomData))
    }
}

impl<T: Serialize> Serialize for NOption<T> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        match self {
            NOption::Null => serializer.serialize_unit(),
            NOption::Some(t) => t.serialize(serializer),
            // `bson` serializes all `unit` values as `Bson::Null`, and
            // turns `Undefined` into a struct
            NOption::Undefined => {
                let mut state = serializer.serialize_struct("$undefined", 1)?;
                state.serialize_field("$undefined", &true)?;
                state.end()
            }
        }
    }
}

#[derive(Debug)]
enum Error {
    SerializationError { message: String },
}

impl std::fmt::Display for Error {
    fn fmt(&self, fmt: &mut std::fmt::Formatter) -> std::fmt::Result {
        match *self {
            Error::SerializationError { ref message } => message.fmt(fmt),
        }
    }
}

impl std::error::Error for Error {
    fn cause(&self) -> Option<&dyn std::error::Error> {
        // TODO: Is this method useful?
        None
    }
}

impl serde::ser::Error for Error {
    fn custom<T: std::fmt::Display>(msg: T) -> Error {
        Error::SerializationError {
            message: msg.to_string(),
        }
    }
}

#[cfg(test)]
mod test {
    use mongodb::bson;

    use super::*;

    #[test]
    fn ser() {
        let undefined = NOption::<String>::Undefined;
        let some = NOption::Some("a string");
        let null = NOption::<String>::Null;

        let u_bson = bson::to_bson(&undefined).unwrap();
        assert_eq!(u_bson, bson::Bson::Undefined);
        let s_bson = bson::to_bson(&some).unwrap();
        assert_eq!(s_bson, bson::Bson::String("a string".to_string()));
        let n_bson = bson::to_bson(&null).unwrap();
        assert_eq!(n_bson, bson::Bson::Null);
    }
}
