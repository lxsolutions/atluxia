


use anyhow::Result;
use libp2p::{floodsub, identity, mdns, PeerId};
use log::info;
use std::env;

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    env_logger::init();

    info!("Starting OpenGrid Daemon");

    // Load provider ID from environment or generate one
    let provider_id = env::var("PROVIDER_ID").unwrap_or_else(|_| "default".to_string());

    // Set up libp2p identity and peer ID
    let local_key = identity::Keypair::generate_ed25519();
    let local_peer_id = PeerId::from(local_key.public());

    info!("Local peer id: {}", local_peer_id);

    // Build the libp2p transport
    let transport = libp2p::build_development_transport(local_key).await?;

    // Create a Floodsub topic for job offers
    let floodsub_topic = floodsub::Topic::new("og-jobs");

    // Set up Floodsub network behavior
    let mut floodsub = floodsub::Floodsub::new(local_peer_id.clone());
    floodsub.subscribe(floodsub_topic);

    // Set up MDNS for local peer discovery
    let mdns = mdns::tokio::Mdns::new().await?;

    // Build the network behavior
    let mut network = libp2p::NetworkBehavior::new(
        transport,
        floodsub,
        mdns,
    );

    info!("Daemon {} is running with peer id {}", provider_id, local_peer_id);

    Ok(())
}

