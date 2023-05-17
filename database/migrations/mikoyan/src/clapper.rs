use clap::Parser;

/// Script to generate a schema for a MongoDB collection
#[derive(Parser, Debug, Clone)]
#[command(author, version, about, long_about = None)]
pub struct Args {
    /// Log file to write to
    /// If not provided, will default to `logs.log`
    /// in the current directory
    #[arg(short, long, default_value = "logs.log")]
    pub logs: String,

    /// MongoDB connection string
    /// If not provided, will default to `mongodb://127.0.0.1:27017`
    #[arg(short, long, default_value = "mongodb://127.0.0.1:27017")]
    pub uri: String,

    /// Number of documents to process
    /// If not provided, all documents will be processed
    #[arg(short, long)]
    pub num_docs: Option<usize>,

    /// Number of threads to use
    /// If not provided, defaults to 1
    #[arg(short, long, default_value = "1")]
    pub num_threads: Option<usize>,
}
