use clap::Parser;

/// Script to generate a schema for a MongoDB collection
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct Args {
    /// Name of database to use
    #[arg(short, long)]
    pub db: String,

    /// Name of collection to query
    #[arg(short, long)]
    pub collection: String,

    /// Output file path relative to current directory
    /// If not provided, will default to `schema.json`
    /// in the current directory
    #[arg(short, long, default_value = "schema.json")]
    pub output: String,

    /// MongoDB connection string
    /// If not provided, will default to `mongodb://127.0.0.1:27017`
    #[arg(short, long, default_value = "mongodb://127.0.0.1:27017")]
    pub uri: String,

    /// Number of documents to process
    #[arg(short, long, default_value = "None")]
    pub num_docs: Option<i64>,
}
