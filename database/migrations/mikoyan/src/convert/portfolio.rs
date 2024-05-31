use serde::de::Visitor;

use crate::record::Portfolio;

struct PortfolioVisitor;

impl<'de> Visitor<'de> for PortfolioVisitor {
    type Value = Portfolio

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        todo!()
    }
}
