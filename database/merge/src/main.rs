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
use inquire::prompt_confirmation;
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

    if records.is_empty() {
        println!("No records found for email: {}", args.email);
        return Ok(());
    }

    if records.len() < 2 {
        println!("No duplicate records found for email: {}", args.email);
        return Ok(());
    }

    match prompt_confirmation(&format!(
        "This will merge {} records with the same email. Do you want to continue?",
        records.len(),
    )) {
        Ok(true) => println!("Continuing..."),
        Ok(false) => {
            println!("Aborting...");
            return Ok(());
        }
        Err(e) => {
            eprintln!("Error: {}", e);
            return Ok(());
        }
    }

    let combined_record = merge_records(records)?;

    let combined_id = combined_record
        .get_object_id("_id")
        .expect("all records should have an _id field");

    let mut cloned_doc = combined_record.clone();
    cloned_doc
        .remove("_id")
        .expect("Failed to remove _id for update document");
    let update = doc! { "$set": cloned_doc };

    // Update oldest record
    collection
        .update_one(doc! {"_id": combined_id}, update)
        .await?;

    // Delete all other records
    let delete_filter = doc! { "email": &args.email, "_id": { "$ne": combined_id } };
    let delete_result = collection.delete_many(delete_filter).await?;
    if delete_result.deleted_count > 0 {
        println!("Deleted {} duplicate records", delete_result.deleted_count);
    } else {
        println!("No duplicate records found to delete");
    }
    println!("Merged records for email: {}", args.email);

    Ok(())
}
