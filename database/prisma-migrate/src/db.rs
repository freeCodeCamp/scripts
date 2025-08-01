use mongodb::{Client, Collection, bson::doc, options::ClientOptions};
use serde::{Deserialize, Serialize};

pub async fn get_collection<'d, T>(client: &Client, collection_name: &str) -> Collection<T>
where
    T: Send + Sync + Deserialize<'d> + Serialize,
{
    let db = client.database("freecodecamp");

    let collection = db.collection::<T>(collection_name);
    collection
}

pub async fn create_client(uri: &str) -> mongodb::error::Result<Client> {
    let mut client_options = ClientOptions::parse(uri).await?;

    client_options.app_name = Some("exam-moderation-service".to_string());

    // Get a handle to the cluster
    let client = Client::with_options(client_options)?;

    // Ping the server to see if you can connect to the cluster
    client
        .database("freecodecamp")
        .run_command(doc! {"ping": 1})
        .await?;

    Ok(client)
}
