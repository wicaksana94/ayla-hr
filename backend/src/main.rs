use axum::{
    routing::{get, post, put, delete},
    Router,
};
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use std::env;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber;

mod handlers;
mod models;

async fn run_migrations(pool: &sqlx::PgPool) {
    // Add name column to leave_types if it doesn't exist
    let result = sqlx::query(
        "ALTER TABLE leave_types ADD COLUMN IF NOT EXISTS name VARCHAR(100)"
    )
    .execute(pool)
    .await;
    
    match result {
        Ok(_) => println!("Migration: Added name column to leave_types"),
        Err(e) => println!("Migration note: {}", e),
    }

    // Update leave types with names if they don't have names
    let update_result = sqlx::query(
        "UPDATE leave_types SET name = CASE 
            WHEN code = 'annual' THEN 'Cuti Tahunan'
            WHEN code = 'sick' THEN 'Cuti Sakit'
            WHEN code = 'maternity' THEN 'Cuti Melahirkan'
            WHEN code = 'marriage' THEN 'Cuti Pernikahan'
            WHEN code = 'bereavement' THEN 'Cuti Kematian'
            WHEN code = 'baptism' THEN 'Cuti Baptis/Sunatan'
            WHEN code = 'paid_leave' THEN 'Cuti Berbayar'
            WHEN code = 'unpaid_leave' THEN 'Cuti Tidak Berbayar'
            WHEN code = 'paid' THEN 'Cuti Dibayar'
            WHEN code = 'unpaid' THEN 'Cuti Tidak Dibayar'
            ELSE code
        END WHERE name IS NULL OR name = ''"
    )
    .execute(pool)
    .await;

    match update_result {
        Ok(_) => println!("Migration: Updated leave type names"),
        Err(e) => println!("Migration note: {}", e),
    }

    // Add level column to positions if it doesn't exist
    let pos_result = sqlx::query(
        "ALTER TABLE positions ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1"
    )
    .execute(pool)
    .await;
    
    match pos_result {
        Ok(_) => println!("Migration: Added level column to positions"),
        Err(e) => println!("Migration note: {}", e),
    }
}

#[tokio::main]
async fn main() {
    // Initialize logging
    tracing_subscriber::fmt::init();

    // Load environment variables
    dotenv::dotenv().ok();

    // Get database URL
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    // Create database connection pool (increased from 5 to 20)
    let pool = PgPoolOptions::new()
        .max_connections(20)
        .min_connections(5)
        .acquire_timeout(std::time::Duration::from_secs(30))
        .connect(&database_url)
        .await
        .expect("Failed to create pool");

    println!("Connected to database!");

    // Run migrations to fix any schema issues
    run_migrations(&pool).await;

    // CORS configuration - use environment variable for allowed origins
    let allowed_origins_str = env::var("ALLOWED_ORIGINS")
        .unwrap_or_else(|_| "http://localhost:3000".to_string());
    
    let allowed_origins: Vec<&str> = allowed_origins_str
        .split(',')
        .map(|s| s.trim())
        .collect();

    let cors = CorsLayer::new()
        .allow_origin(allowed_origins.iter().map(|s| s.parse().unwrap()).collect::<Vec<_>>())
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
        .route("/api/positions/:id", put(handlers::update_position))
        .route("/api/positions/:id", delete(handlers::delete_position))
        
        // Leave type routes
        .route("/api/leave-types", get(handlers::list_leave_types))
        
        // Leave routes
        .route("/api/leaves", get(handlers::list_leaves))
        .route("/api/leaves", post(handlers::create_leave))
        .route("/api/leaves/:id/status", put(handlers::update_leave_status))
        
        .layer(cors)
        .layer(TraceLayer::new_for_http())
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
