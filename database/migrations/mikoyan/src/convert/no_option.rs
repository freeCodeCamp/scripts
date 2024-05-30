#![allow(unused_variables)]
use mongodb::bson::Bson;
use serde::{ser::SerializeStruct, Deserialize, Serialize, Serializer};

use crate::record::NOption;

impl<'a, T: Serialize> Default for NOption<T> {
    fn default() -> Self {
        NOption::Undefined
    }
}

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
                Ok(NOption::Undefined)
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
        match *self {
            _ => None,
        }
    }
}

impl serde::ser::Error for Error {
    fn custom<T: std::fmt::Display>(msg: T) -> Error {
        Error::SerializationError {
            message: msg.to_string(),
        }
    }
}

// struct NOptionSerializer<T>(std::marker::PhantomData<T>);

// impl<T> Serializer for NOptionSerializer<T> {
//     type Ok = NOption<T>;

//     type SerializeSeq = SeqSerializer<T>;
//     type SerializeTuple = TupleSerializer<T>;
//     type SerializeTupleStruct = TupleStructSerializer<T>;
//     type SerializeTupleVariant = TupleVariantSerializer<T>;
//     type SerializeMap = MapSerializer<T>;
//     type SerializeStruct = StructSerializer<T>;
//     type SerializeStructVariant = StructVariantSerializer<T>;

//     // The error type when some error occurs during serialization.
//     type Error = Error;

//     fn serialize_bool(self, v: bool) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }

//     fn serialize_i8(self, v: i8) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }

//     fn serialize_i16(self, v: i16) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }

//     fn serialize_i32(self, v: i32) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }

//     fn serialize_i64(self, v: i64) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }

//     fn serialize_u8(self, v: u8) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }

//     fn serialize_u16(self, v: u16) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }

//     fn serialize_u32(self, v: u32) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }

//     fn serialize_u64(self, v: u64) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }

//     fn serialize_f32(self, v: f32) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }

//     fn serialize_f64(self, v: f64) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }

//     fn serialize_char(self, v: char) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }

//     fn serialize_str(self, v: &str) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }

//     fn serialize_bytes(self, v: &[u8]) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }

//     fn serialize_none(self) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }

//     fn serialize_some<N>(self, value: &N) -> Result<Self::Ok, Self::Error>
//     where
//         N: ?Sized + Serialize,
//     {
//         todo!()
//     }

//     fn serialize_unit(self) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }

//     fn serialize_unit_struct(self, name: &'static str) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }

//     fn serialize_unit_variant(
//         self,
//         name: &'static str,
//         variant_index: u32,
//         variant: &'static str,
//     ) -> Result<Self::Ok, Self::Error> {
//         println!(
//             "serialize_unit_variant: {}, {}, {}",
//             name, variant_index, variant
//         );
//         match variant {
//             "Null" => Ok(NOption::Null),
//             "Undefined" => Ok(NOption::Undefined),
//             other => Err(Error::SerializationError {
//                 message: format!("No such variant name: {other}"),
//             }),
//         }
//     }

//     fn serialize_newtype_struct<N>(
//         self,
//         name: &'static str,
//         value: &N,
//     ) -> Result<Self::Ok, Self::Error>
//     where
//         N: ?Sized + Serialize,
//     {
//         todo!()
//     }

//     fn serialize_newtype_variant<N>(
//         self,
//         name: &'static str,
//         variant_index: u32,
//         variant: &'static str,
//         value: &N,
//     ) -> Result<Self::Ok, Self::Error>
//     where
//         N: ?Sized + Serialize,
//     {
//         todo!()
//     }

//     fn serialize_seq(self, len: Option<usize>) -> Result<Self::SerializeSeq, Self::Error> {
//         todo!()
//     }

//     fn serialize_tuple(self, len: usize) -> Result<Self::SerializeTuple, Self::Error> {
//         todo!()
//     }

//     fn serialize_tuple_struct(
//         self,
//         name: &'static str,
//         len: usize,
//     ) -> Result<Self::SerializeTupleStruct, Self::Error> {
//         todo!()
//     }

//     fn serialize_tuple_variant(
//         self,
//         name: &'static str,
//         variant_index: u32,
//         variant: &'static str,
//         len: usize,
//     ) -> Result<Self::SerializeTupleVariant, Self::Error> {
//         todo!()
//     }

//     fn serialize_map(self, len: Option<usize>) -> Result<Self::SerializeMap, Self::Error> {
//         todo!()
//     }

//     fn serialize_struct(
//         self,
//         name: &'static str,
//         len: usize,
//     ) -> Result<Self::SerializeStruct, Self::Error> {
//         todo!()
//     }

//     fn serialize_struct_variant(
//         self,
//         name: &'static str,
//         variant_index: u32,
//         variant: &'static str,
//         len: usize,
//     ) -> Result<Self::SerializeStructVariant, Self::Error> {
//         todo!()
//     }
// }

// struct SeqSerializer<T>(std::marker::PhantomData<T>);
// struct TupleSerializer<T>(std::marker::PhantomData<T>);
// struct TupleStructSerializer<T>(std::marker::PhantomData<T>);
// struct TupleVariantSerializer<T>(std::marker::PhantomData<T>);
// struct MapSerializer<T>(std::marker::PhantomData<T>);
// struct StructSerializer<T>(std::marker::PhantomData<T>);
// struct StructVariantSerializer<T>(std::marker::PhantomData<T>);

// impl<N> serde::ser::SerializeSeq for SeqSerializer<N> {
//     type Ok = NOption<N>;
//     type Error = Error;

//     fn serialize_element<T: ?Sized + Serialize>(&mut self, value: &T) -> Result<(), Self::Error> {
//         todo!()
//     }

//     fn end(self) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }
// }

// impl<N> serde::ser::SerializeTuple for TupleSerializer<N> {
//     type Ok = NOption<N>;
//     type Error = Error;

//     fn serialize_element<T: ?Sized + Serialize>(&mut self, value: &T) -> Result<(), Self::Error> {
//         todo!()
//     }

//     fn end(self) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }
// }

// impl<N> serde::ser::SerializeTupleStruct for TupleStructSerializer<N> {
//     type Ok = NOption<N>;
//     type Error = Error;

//     fn serialize_field<T: ?Sized + Serialize>(&mut self, value: &T) -> Result<(), Self::Error> {
//         todo!()
//     }

//     fn end(self) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }
// }

// impl<N> serde::ser::SerializeTupleVariant for TupleVariantSerializer<N> {
//     type Ok = NOption<N>;
//     type Error = Error;

//     fn serialize_field<T: ?Sized + Serialize>(&mut self, value: &T) -> Result<(), Self::Error> {
//         todo!()
//     }

//     fn end(self) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }
// }

// impl<N> serde::ser::SerializeMap for MapSerializer<N> {
//     type Ok = NOption<N>;
//     type Error = Error;

//     fn serialize_key<T: ?Sized + Serialize>(&mut self, key: &T) -> Result<(), Self::Error> {
//         todo!()
//     }

//     fn serialize_value<T: ?Sized + Serialize>(&mut self, value: &T) -> Result<(), Self::Error> {
//         todo!()
//     }

//     fn end(self) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }
// }

// impl<N> serde::ser::SerializeStruct for StructSerializer<N> {
//     type Ok = NOption<N>;
//     type Error = Error;

//     fn serialize_field<T: ?Sized + Serialize>(
//         &mut self,
//         key: &'static str,
//         value: &T,
//     ) -> Result<(), Self::Error> {
//         todo!()
//     }

//     fn end(self) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }
// }

// impl<N> serde::ser::SerializeStructVariant for StructVariantSerializer<N> {
//     type Ok = NOption<N>;
//     type Error = Error;

//     fn serialize_field<T: ?Sized + Serialize>(
//         &mut self,
//         key: &'static str,
//         value: &T,
//     ) -> Result<(), Self::Error> {
//         todo!()
//     }

//     fn end(self) -> Result<Self::Ok, Self::Error> {
//         todo!()
//     }
// }

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
