use std::fmt::Debug;

pub enum Error {
    MongoDB(mongodb::error::Error),
    FileSystem(std::io::Error),
}

impl From<mongodb::error::Error> for Error {
    fn from(e: mongodb::error::Error) -> Self {
        Error::MongoDB(e)
    }
}

impl From<std::io::Error> for Error {
    fn from(e: std::io::Error) -> Self {
        Error::FileSystem(e)
    }
}

impl Debug for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            Error::MongoDB(e) => write!(f, "MongoDB Error: {}", e),
            Error::FileSystem(e) => write!(f, "FileSystem Error: {}", e),
        }
    }
}
