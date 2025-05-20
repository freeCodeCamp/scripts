//! A script to merge two or more MongoDB records into one.
//!
//! This is expected to be used for when duplicate accounts are created. Any records with the same email are found and merged.
//!
//! The default algorithm takes the oldest record as the record to keep, then:
//! - For all lists, concatenate ignoring duplicates
//! - All boolean values (except for `isBanned` and `isCheater`) are merged as true
//! - Values are preferred over `Undefined`, `Null`, and empty strings
use clap::Parser;
use futures_util::stream::StreamExt;

mod cli;
mod record;

use cli::Args;
use mongodb::{
    Client,
    bson::{Document, doc},
    options::ClientOptions,
};
use record::merge_records;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args = Args::parse();

    let mut client_options = ClientOptions::parse(&args.uri)
        .await
        .expect("Failed to parse client options");

    client_options.app_name = Some("Merge Records".to_string());

    let client = Client::with_options(client_options)?;

    let database = client.database("freecodecamp");

    database.run_command(doc! { "ping": 1 }).await?;

    let collection = database.collection::<Document>("user");

    // Find records with the same email
    let filter = doc! { "email": &args.email };

    let mut cursor = collection.find(filter).await?;

    let mut records = Vec::new();

    while let Some(result) = cursor.next().await {
        match result {
            Ok(record) => {
                records.push(record);
            }
            Err(e) => {
                eprintln!("Error retrieving record: {}", e);
            }
        }
    }

    if records.len() < 2 {
        println!("No duplicate records found for email: {}", args.email);
        return Ok(());
    }

    let combined_record = merge_records(records)?;

    // Update oldest record, delete all others
    collection
        .update_one(
            doc! {"_id": combined_record.get_object_id("_id").unwrap()},
            combined_record,
        )
        .await?;

    Ok(())
}
