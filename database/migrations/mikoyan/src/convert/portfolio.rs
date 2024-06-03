use mongodb::bson::Bson;
use serde::{de::Visitor, Deserialize};

use crate::record::Portfolio;

struct PortfolioVisitor;

impl<'de> Visitor<'de> for PortfolioVisitor {
    type Value = Portfolio;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("struct Portfolio")
    }

    fn visit_map<A>(self, mut map: A) -> Result<Self::Value, A::Error>
    where
        A: serde::de::MapAccess<'de>,
    {
        let mut description = None;
        let mut id = None;
        let mut image = None;
        let mut title = None;
        let mut url = None;

        while let Some(key) = map.next_key::<String>()? {
            match key.as_str() {
                "description" => {
                    if description.is_some() {
                        return Err(serde::de::Error::duplicate_field("description"));
                    }

                    description = match map.next_value()? {
                        Bson::String(v) => Some(v),
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
                "image" => {
                    if image.is_some() {
                        return Err(serde::de::Error::duplicate_field("image"));
                    }

                    image = match map.next_value()? {
                        Bson::String(v) => Some(v),
                        _ => None,
                    };
                }
                "title" => {
                    if title.is_some() {
                        return Err(serde::de::Error::duplicate_field("title"));
                    }

                    title = match map.next_value()? {
                        Bson::String(v) => Some(v),
                        _ => None,
                    };
                }
                "url" => {
                    if url.is_some() {
                        return Err(serde::de::Error::duplicate_field("url"));
                    }

                    url = match map.next_value()? {
                        Bson::String(v) => Some(v),
                        _ => None,
                    };
                }
                _ => {
                    println!("Skipping {key:?}");
                }
            }
        }

        let description = description.unwrap_or_default();
        let id = id.unwrap_or_default();
        let image = image.unwrap_or_default();
        let title = title.unwrap_or_default();
        let url = url.unwrap_or_default();

        Ok(Portfolio {
            description,
            id,
            image,
            title,
            url,
        })
    }
}

impl<'de> Deserialize<'de> for Portfolio {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        deserializer.deserialize_any(PortfolioVisitor)
    }
}
