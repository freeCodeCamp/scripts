use mongodb::bson::Bson;
use serde::Deserialize;

use crate::record::File;

struct FileVisitor;

impl<'de> serde::de::Visitor<'de> for FileVisitor {
    type Value = File;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("struct File")
    }

    fn visit_seq<A>(self, mut seq: A) -> Result<Self::Value, A::Error>
    where
        A: serde::de::SeqAccess<'de>,
    {
        // TODO
        let file: File = seq.next_element()?.unwrap();
        Ok(file)
    }

    fn visit_map<A>(self, mut map: A) -> Result<Self::Value, A::Error>
    where
        A: serde::de::MapAccess<'de>,
    {
        let mut contents = None;
        let mut ext = None;
        let mut val_key = None;
        let mut name = None;
        let mut path = None;

        while let Some(key) = map.next_key::<String>()? {
            match key.as_str() {
                "contents" => {
                    if contents.is_some() {
                        return Err(serde::de::Error::duplicate_field("contents"));
                    }

                    contents = match map.next_value()? {
                        Bson::String(v) => Some(v),
                        _ => None,
                    };
                }
                "ext" => {
                    if ext.is_some() {
                        return Err(serde::de::Error::duplicate_field("ext"));
                    }

                    ext = match map.next_value()? {
                        Bson::String(v) => Some(v),
                        _ => None,
                    };
                }
                "key" => {
                    if val_key.is_some() {
                        return Err(serde::de::Error::duplicate_field("key"));
                    }

                    val_key = match map.next_value()? {
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
                "path" => {
                    if path.is_some() {
                        return Err(serde::de::Error::duplicate_field("path"));
                    }

                    path = match map.next_value()? {
                        Bson::String(v) => Some(v),
                        _ => None,
                    };
                }
                _ => {
                    println!("Skipping {key:?}");
                }
            }
        }

        let contents = contents.unwrap_or_default();
        let ext = ext.unwrap_or_default();
        let key = val_key.unwrap_or_default();
        let name = name.unwrap_or_default();
        let path = path.unwrap_or_default();

        Ok(File {
            contents,
            ext,
            key,
            name,
            path,
        })
    }
}

impl<'de> Deserialize<'de> for File {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        deserializer.deserialize_any(FileVisitor)
    }
}
