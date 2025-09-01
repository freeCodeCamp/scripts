use std::time::Duration;
use tracing::{error, info, warn};
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

    // Optional timeout (in seconds) for the migration to finish.
    // If MIGRATION_TIMEOUT_SECS is not set or invalid, proceed without a timeout.
    let timeout_secs = match std::env::var("MIGRATION_TIMEOUT_SECS") {
        Ok(val) => match val.parse::<u64>() {
            Ok(secs) if secs > 0 => Some(secs),
            Ok(_) => {
                warn!("MIGRATION_TIMEOUT_SECS provided but not > 0; ignoring");
                None
            }
            Err(e) => {
                warn!("Failed to parse MIGRATION_TIMEOUT_SECS ('{val}'): {e}; ignoring");
                None
            }
        },
        Err(_) => None,
    };

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

    let migration_task = async move {
        if let Some(secs) = timeout_secs {
            match tokio::time::timeout(Duration::from_secs(secs), migration).await {
                Ok(migration_result) => {
                    match migration_result {
                        Ok(_) => {}
                        Err(e) => {
                            error!("Error migrating: {e}");
                        }
                    }
                    info!("Migration completed - exiting.");
                }
                Err(_) => {
                    error!("Migration timed out after {secs} seconds");
                }
            }
        } else {
            if let Err(e) = migration.await {
                error!("{e}");
            }
            info!("Migration completed - exiting.");
        }
    };

    tokio::select! {
        _ = migration_task => { },
        _ = ctrl_c => {
            // Migration future dropped here (cancelled)
        },
        _ = terminate => {
            // Migration future dropped here (cancelled)
        },
    };
}
