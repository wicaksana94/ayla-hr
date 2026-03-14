use axum::{
    routing::{get, post},
    Router,
};
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber;

mod db;
mod handlers;
mod models;

#[tokio::main]
async fn main() {
    // Initialize logging
    tracing_subscriber::fmt::init();

    // Load environment variables
    dotenv::dotenv().ok();

    // CORS configuration
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build application
    let app = Router::new()
        .route("/", get(handlers::root))
        .route("/api/health", get(handlers::health))
        // Employee routes
        .route("/api/employees", get(handlers::list_employees))
        .route("/api/employees", post(handlers::create_employee))
        // Department routes
        .route("/api/departments", get(handlers::list_departments))
        .route("/api/departments", post(handlers::create_department))
        // Position routes
        .route("/api/positions", get(handlers::list_positions))
        .route("/api/positions", post(handlers::create_position))
        // Leave routes
        .route("/api/leaves", get(handlers::list_leaves))
        .route("/api/leaves", post(handlers::create_leave))
        .route("/api/leaves/:id/approve", post(handlers::approve_leave))
        .route("/api/leaves/:id/reject", post(handlers::reject_leave))
        // Settings routes
        .route("/api/settings/language", post(handlers::update_language))
        .layer(cors);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    tracing::info!("Server running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
