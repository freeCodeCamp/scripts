use clap::Parser;
use db::get_collection;
use futures_util::TryStreamExt;
use mongodb::{
    bson::doc,
    options::{FindOptions, UpdateOptions},
};
use tokio::{self, io::AsyncWriteExt, task::JoinHandle};

use indicatif::{MultiProgress, ProgressBar, ProgressStyle};

mod clapper;
mod db;
mod normalize;

use normalize::{normalize_user, NormalizeError};

use clapper::Args;

#[tokio::main]
async fn main() -> mongodb::error::Result<()> {
    let args = Args::parse();

    let num_threads = if let Some(num_threads) = args.num_threads {
        num_threads
    } else {
        1
    };

    let mut handles = Vec::new();

    let num_docs_in_collection = {
        let collection = get_collection(&args.uri, &args.db, &args.collection).await?;
        collection.estimated_document_count(None).await? as usize
    };

    println!("Docs in {}: {}", args.collection, num_docs_in_collection);

    // Split the database into `num_threads` chunks
    // Any remainder will be handled by the last thread
    let num_docs_per_thread = if let Some(num_docs) = args.num_docs {
        num_docs / num_threads
    } else {
        num_docs_in_collection / num_threads
    };

    let m = MultiProgress::new();
    for thread_id in 0..num_threads {
        let num_docs_to_handle = if thread_id == num_threads - 1 {
            // Handle any remainder
            num_docs_per_thread + num_docs_in_collection % num_threads
        } else {
            num_docs_per_thread
        };

        println!("Thread {}: {:?}", thread_id, num_docs_to_handle);

        let args = args.clone();

        let m_clone = m.clone();
        let handle: JoinHandle<Result<(), mongodb::error::Error>> = tokio::spawn(async move {
            match connect_and_process(args, num_docs_to_handle, thread_id, m_clone).await {
                Ok(_) => Ok(()),
                Err(e) => Err(e),
            }
        });

        handles.push(handle);
    }

    let mut file = tokio::fs::OpenOptions::new()
        .append(true)
        .create(true)
        .open(args.logs)
        .await?;

    for handle in handles {
        if let Err(e) = handle.await {
            // Write errors to logs file
            file.write(format!("{}\n", e).as_bytes()).await?;
        }
    }
    Ok(())
}

async fn connect_and_process(
    args: Args,
    num_docs_to_handle: usize,
    thread_id: usize,
    m: MultiProgress,
) -> Result<(), mongodb::error::Error> {
    let collection = get_collection(&args.uri, &args.db, &args.collection).await?;

    let find_ops = FindOptions::builder()
        .limit(num_docs_to_handle as i64)
        .skip((thread_id * num_docs_to_handle) as u64)
        .projection(doc! {
            "_id": 1,
            "completedChallenges": 1,
            "progressTimestamps": 1,
            "partiallyCompletedChallenges": 1,
            "yearsTopContributor": 1,
            "savedChallenges": 1,
            "badges": 1,
        })
        .build();
    let mut cursor = collection.find(doc! {}, find_ops).await?;

    let sty = ProgressStyle::with_template(
        "[{elapsed_precise}] {bar:40.cyan/blue} {pos:>7}/{len:7} {msg}",
    )
    .unwrap()
    .progress_chars("##-");

    let pb = m.add(ProgressBar::new(num_docs_to_handle as u64));
    pb.set_style(sty);

    let mut logs_file = tokio::fs::OpenOptions::new()
        .append(true)
        .create(true)
        .open(args.logs)
        .await?;

    let mut count: usize = 0;
    let epoch = (num_docs_to_handle / 1000).max(1);
    while let Some(user) = cursor.try_next().await? {
        match normalize_user(&user) {
            Ok(normalized_user) => {
                let id = user.get_object_id("_id").unwrap();
                let filter = doc! {"_id": id};
                let update_options = UpdateOptions::builder()
                    .array_filters(vec![doc! {
                        "el": {"$exists": true},
                    }])
                    .build();
                collection
                    .update_one(filter, normalized_user, update_options)
                    .await
                    .unwrap();
            }
            Err(normalize_error) => {
                // Write to logs file
                // Format: <user_id>: <error>
                for e in normalize_error.iter() {
                    match e {
                        NormalizeError::UnhandledType { id, doc } => {
                            logs_file
                                .write(format!("{}: {}\n", id, doc).as_bytes())
                                .await?;
                        }
                    }
                }
            }
        }

        count += 1;
        if count % epoch == 0 {
            pb.set_message(format!("{}%", count / num_docs_to_handle * 100));
            pb.inc(epoch as u64);
        }
    }

    pb.finish_with_message("done");
    Ok(())
}
