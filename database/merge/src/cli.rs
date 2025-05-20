use std::path::PathBuf;

use clap::{Parser, Subcommand};

/// CLI that adds challenges to the freeCodeCamp database.
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct Args {
    /// MongoDB connection string
    #[arg(
        long,
        default_value = "mongodb://127.0.0.1:27017/freecodecamp?directConnection=true"
    )]
    pub uri: String,

    /// Email of user in the database
    #[arg(long)]
    pub email: String,

    #[command(subcommand)]
    pub sub_commands: SubCommand,
}

#[derive(Debug, Subcommand)]
pub enum SubCommand {
    /// Merge all records using default algorithm
    Default,
}
