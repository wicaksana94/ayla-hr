use axum::{
    routing::{get, post, put, delete},
    Router,
};
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use std::env;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber;

mod handlers;
mod models;

#[tokio::main]
async fn main() {
    // Initialize logging
    tracing_subscriber::fmt::init();

    // Load environment variables
    dotenv::dotenv().ok();

    // Get database URL
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    // Create database connection pool
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to create pool");

    println!("Connected to database!");

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
        .route("/api/employees/:id", get(handlers::get_employee))
        .route("/api/employees/:id", put(handlers::update_employee))
        .route("/api/employees/:id", delete(handlers::delete_employee))
        
        // Department routes
        .route("/api/departments", get(handlers::list_departments))
        .route("/api/departments", post(handlers::create_department))
        .route("/api/departments/:id", put(handlers::update_department))
        .route("/api/departments/:id", delete(handlers::delete_department))
        
        // Position routes
        .route("/api/positions", get(handlers::list_positions))
        .route("/api/positions", post(handlers::create_position))
        .route("/api/positions/:id", delete(handlers::delete_position))
        
        // Leave type routes
        .route("/api/leave-types", get(handlers::list_leave_types))
        
        // Leave routes
        .route("/api/leaves", get(handlers::list_leaves))
        .route("/api/leaves", post(handlers::create_leave))
        .route("/api/leaves/:id/status", put(handlers::update_leave_status))
        
        .layer(cors)
        .with_state(pool);

    let port = env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse()
        .unwrap_or(8080);
    
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("Server running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
