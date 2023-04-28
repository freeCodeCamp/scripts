use clap::Parser;
use db::get_collection;
use futures_util::TryStreamExt;
use mongodb::{bson::doc, options::FindOptions};
use tokio;

mod clapper;
mod db;

use clapper::Args;

#[tokio::main]
async fn main() -> mongodb::error::Result<()> {
    let args = Args::parse();
    // Parse your connection string into an options struct
    let collection = get_collection(&args.uri, &args.db, &args.collection).await?;

    // Only use `.limit` if `num_docs` is provided
    let find_ops = if let Some(num_docs) = args.num_docs {
        FindOptions::builder().limit(num_docs).build()
    } else {
        FindOptions::builder().build()
    };
    let mut cursor = collection.find(doc! {}, find_ops).await?;

    let mut count = 0;
    while let Some(_user) = cursor.try_next().await? {
        // Progress
        todo!("TRANSFORM USER HERE");

        count += 1;
        if count % 100_000 == 0 {
            println!("Docs processed: {}", count);
        }
    }
    todo!("THINK ABOUT MULTI-THREADING THIS");
    Ok(())
}
