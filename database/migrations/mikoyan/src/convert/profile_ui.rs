use mongodb::bson::Bson;
use serde::{
    de::{self, MapAccess, SeqAccess, Visitor},
    Deserialize, Deserializer,
};

use crate::record::ProfileUI;

struct ProfileUIVisitor;

impl<'de> Visitor<'de> for ProfileUIVisitor {
    type Value = ProfileUI;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("struct ProfileUI")
    }

    fn visit_seq<V>(self, mut seq: V) -> Result<ProfileUI, V::Error>
    where
        V: SeqAccess<'de>,
    {
        let is_locked = seq
            .next_element()?
            .ok_or_else(|| de::Error::invalid_length(0, &self))?;
        let show_about = seq
            .next_element()?
            .ok_or_else(|| de::Error::invalid_length(1, &self))?;
        let show_certs = seq
            .next_element()?
            .ok_or_else(|| de::Error::invalid_length(2, &self))?;
        let show_donation = seq
            .next_element()?
            .ok_or_else(|| de::Error::invalid_length(3, &self))?;
        let show_heat_map = seq
            .next_element()?
            .ok_or_else(|| de::Error::invalid_length(4, &self))?;
        let show_location = seq
            .next_element()?
            .ok_or_else(|| de::Error::invalid_length(5, &self))?;
        let show_name = seq
            .next_element()?
            .ok_or_else(|| de::Error::invalid_length(6, &self))?;
        let show_points = seq
            .next_element()?
            .ok_or_else(|| de::Error::invalid_length(7, &self))?;
        let show_portfolio = seq
            .next_element()?
            .ok_or_else(|| de::Error::invalid_length(8, &self))?;
        let show_time_line = seq
            .next_element()?
            .ok_or_else(|| de::Error::invalid_length(9, &self))?;

        Ok(ProfileUI {
            is_locked,
            show_about,
            show_certs,
            show_donation,
            show_heat_map,
            show_location,
            show_name,
            show_points,
            show_portfolio,
            show_time_line,
        })
    }

    fn visit_map<V>(self, mut map: V) -> Result<ProfileUI, V::Error>
    where
        V: MapAccess<'de>,
    {
        let mut is_locked = None;
        let mut show_about = None;
        let mut show_certs = None;
        let mut show_donation = None;
        let mut show_heat_map = None;
        let mut show_location = None;
        let mut show_name = None;
        let mut show_points = None;
        let mut show_portfolio = None;
        let mut show_time_line = None;

        while let Some(key) = map.next_key::<String>()? {
            match key.as_str() {
                "isLocked" => {
                    if is_locked.is_some() {
                        return Err(de::Error::duplicate_field("isLocked"));
                    }

                    is_locked = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    }
                }
                "showAbout" => {
                    if show_about.is_some() {
                        return Err(de::Error::duplicate_field("showAbout"));
                    }

                    show_about = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    }
                }
                "showCerts" => {
                    if show_certs.is_some() {
                        return Err(de::Error::duplicate_field("showCerts"));
                    }

                    show_certs = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    }
                }
                "showDonation" => {
                    if show_donation.is_some() {
                        return Err(de::Error::duplicate_field("showDonation"));
                    }

                    show_donation = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    }
                }
                "showHeatMap" => {
                    if show_heat_map.is_some() {
                        return Err(de::Error::duplicate_field("showHeatMap"));
                    }

                    show_heat_map = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    }
                }
                "showLocation" => {
                    if show_location.is_some() {
                        return Err(de::Error::duplicate_field("showLocation"));
                    }

                    show_location = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    }
                }
                "showName" => {
                    if show_name.is_some() {
                        return Err(de::Error::duplicate_field("showName"));
                    }

                    show_name = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    }
                }
                "showPoints" => {
                    if show_points.is_some() {
                        return Err(de::Error::duplicate_field("showPoints"));
                    }

                    show_points = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    }
                }
                "showPortfolio" => {
                    if show_portfolio.is_some() {
                        return Err(de::Error::duplicate_field("showPortfolio"));
                    }

                    show_portfolio = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    }
                }
                "showTimeLine" => {
                    if show_time_line.is_some() {
                        return Err(de::Error::duplicate_field("showTimeLine"));
                    }

                    show_time_line = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    }
                }
                _ => {
                    // println!("Skipping {key:?}");
                }
            }
        }

        let is_locked = is_locked.unwrap_or(true);
        let show_about = show_about.unwrap_or_default();
        let show_certs = show_certs.unwrap_or_default();
        let show_donation = show_donation.unwrap_or_default();
        let show_heat_map = show_heat_map.unwrap_or_default();
        let show_location = show_location.unwrap_or_default();
        let show_name = show_name.unwrap_or_default();
        let show_points = show_points.unwrap_or_default();
        let show_portfolio = show_portfolio.unwrap_or_default();
        let show_time_line = show_time_line.unwrap_or_default();

        Ok(ProfileUI {
            is_locked,
            show_about,
            show_certs,
            show_donation,
            show_heat_map,
            show_location,
            show_name,
            show_points,
            show_portfolio,
            show_time_line,
        })
    }
}

impl<'de> Deserialize<'de> for ProfileUI {
    fn deserialize<D>(deserializer: D) -> Result<ProfileUI, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserializer.deserialize_seq(ProfileUIVisitor)
    }
}

#[cfg(test)]
mod test {
    use mongodb::bson::{self, doc};

    use super::*;

    #[test]
    fn deserialize_profile_ui() {
        let doc = doc! {
            "isLocked": true,
            "showAbout": true,
            "showCerts": true,
            "showDonation": true,
            "showHeatMap": true,
            "showLocation": true,
            "showName": true,
            "showPoints": true,
            "showPortfolio": true,
            "showTimeLine": true,
        };

        let profile_ui: ProfileUI = bson::from_document(doc).unwrap();

        assert_eq!(profile_ui.is_locked, true);
        assert_eq!(profile_ui.show_about, true);
        assert_eq!(profile_ui.show_certs, true);
        assert_eq!(profile_ui.show_donation, true);
        assert_eq!(profile_ui.show_heat_map, true);
        assert_eq!(profile_ui.show_location, true);
        assert_eq!(profile_ui.show_name, true);
        assert_eq!(profile_ui.show_points, true);
        assert_eq!(profile_ui.show_portfolio, true);
        assert_eq!(profile_ui.show_time_line, true);
    }

    #[test]
    fn default_profile_ui() {
        let doc = doc! {};

        let profile_ui: ProfileUI = bson::from_document(doc).unwrap();

        assert_eq!(profile_ui.is_locked, true);
        assert_eq!(profile_ui.show_about, false);
        assert_eq!(profile_ui.show_certs, false);
        assert_eq!(profile_ui.show_donation, false);
        assert_eq!(profile_ui.show_heat_map, false);
        assert_eq!(profile_ui.show_location, false);
        assert_eq!(profile_ui.show_name, false);
        assert_eq!(profile_ui.show_points, false);
        assert_eq!(profile_ui.show_portfolio, false);
        assert_eq!(profile_ui.show_time_line, false);
    }

    #[test]
    fn bad_profile_ui() {
        let doc = doc! {
            "unknownField": ["a", "b", "c"],
        };

        let profile_ui: ProfileUI = bson::from_document(doc).unwrap();

        assert_eq!(profile_ui.is_locked, true);
        assert_eq!(profile_ui.show_about, false);
        assert_eq!(profile_ui.show_certs, false);
        assert_eq!(profile_ui.show_donation, false);
        assert_eq!(profile_ui.show_heat_map, false);
        assert_eq!(profile_ui.show_location, false);
        assert_eq!(profile_ui.show_name, false);
        assert_eq!(profile_ui.show_points, false);
        assert_eq!(profile_ui.show_portfolio, false);
        assert_eq!(profile_ui.show_time_line, false);
    }
}
