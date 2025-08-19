use tracing::{error, info};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod db;
mod migrations;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| format!("{}=debug", env!("CARGO_CRATE_NAME")).into()),
        )
        // Log to stdout
        .with(tracing_subscriber::fmt::layer().pretty())
        .init();

    let uri = std::env::var("MONGODB_URI").unwrap();
    let client = db::create_client(&uri).await.unwrap();
    let migration = migrations::migrate(&client);

    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
        info!("Received SIGINT (Ctrl+C), starting graceful shutdown...");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to install SIGTERM handler")
            .recv()
            .await;
        info!("Received SIGTERM, starting graceful shutdown...");
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        r = migration => {
            match r {
                Ok(_) => {},
                Err(e) => {
                    error!("{e}");
                }
            }
            info!("Migration completed - exiting.");
        },
        _ = ctrl_c => {
            // Migration future dropped here (cancelled)
        },
        _ = terminate => {
            // Migration future dropped here (cancelled)
        },
    };
}
