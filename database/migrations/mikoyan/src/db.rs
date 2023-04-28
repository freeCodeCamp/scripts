use mongodb::{
    bson::{doc, Document},
    options::ClientOptions,
    Client, Collection,
};

pub async fn get_collection(
    uri: &str,
    db: &str,
    collection: &str,
) -> mongodb::error::Result<Collection<Document>> {
    let mut client_options = ClientOptions::parse(uri).await?;

    // Manually set an option
    client_options.app_name = Some("Rust Mongeese".to_string());

    // Get a handle to the cluster
    let client = Client::with_options(client_options)?;

    // Ping the server to see if you can connect to the cluster
    client
        .database(db)
        .run_command(doc! {"ping": 1}, None)
        .await?;
    println!("Connected successfully.");
    let db = client.database(db);

    let collection = db.collection::<Document>(collection);
    Ok(collection)
}
