use axum::{
    extract::{Query, Path},
    Json,
    http::StatusCode,
};
use serde::{Deserialize, Serialize};

use crate::models::*;

pub async fn root() -> &'static str {
    "Welcome to AylaHR API"
}

pub async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "healthy",
        "service": "ayla-hr-backend"
    }))
}

// ============ Employee Handlers ============

#[derive(Debug, Deserialize)]
pub struct ListEmployeesQuery {
    department_id: Option<i64>,
    position_id: Option<i64>,
}

pub async fn list_employees(
    Query(params): Query<ListEmployeesQuery>,
) -> Json<Vec<User>> {
    // TODO: Implement with database query
    Json(vec![])
}

#[derive(Debug, Deserialize)]
pub struct CreateEmployeeRequest {
    pub clerk_id: String,
    pub email: String,
    pub name: String,
    pub role: UserRole,
    pub department_id: Option<i64>,
    pub position_id: Option<i64>,
}

pub async fn create_employee(
    Json(payload): Json<CreateEmployeeRequest>,
) -> Result<Json<User>, (StatusCode, String)> {
    // TODO: Implement with database insert
    Ok(Json(User {
        id: 1,
        clerk_id: payload.clerk_id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        department_id: payload.department_id,
        position_id: payload.position_id,
        language: "en".to_string(),
        created_at: chrono::Utc::now(),
    }))
}

// ============ Department Handlers ============

pub async fn list_departments() -> Json<Vec<Department>> {
    // TODO: Implement with database query
    Json(vec![])
}

#[derive(Debug, Deserialize)]
pub struct CreateDepartmentRequest {
    pub name: String,
    pub code: String,
    pub description: Option<String>,
}

pub async fn create_department(
    Json(payload): Json<CreateDepartmentRequest>,
) -> Result<Json<Department>, (StatusCode, String)> {
    // TODO: Implement with database insert
    Ok(Json(Department {
        id: 1,
        name: payload.name,
        code: payload.code,
        description: payload.description,
        is_active: true,
        created_at: chrono::Utc::now(),
    }))
}

// ============ Position Handlers ============

pub async fn list_positions() -> Json<Vec<Position>> {
    // TODO: Implement with database query
    Json(vec![])
}

#[derive(Debug, Deserialize)]
pub struct CreatePositionRequest {
    pub name: String,
    pub level: i32,
    pub department_id: i64,
    pub access_level: AccessLevel,
}

pub async fn create_position(
    Json(payload): Json<CreatePositionRequest>,
) -> Result<Json<Position>, (StatusCode, String)> {
    // TODO: Implement with database insert
    Ok(Json(Position {
        id: 1,
        name: payload.name,
        level: payload.level,
        department_id: payload.department_id,
        access_level: payload.access_level,
        created_at: chrono::Utc::now(),
    }))
}

// ============ Leave Handlers ============

#[derive(Debug, Deserialize)]
pub struct ListLeavesQuery {
    user_id: Option<i64>,
    status: Option<LeaveStatus>,
    leave_type: Option<LeaveType>,
}

pub async fn list_leaves(
    Query(params): Query<ListLeavesQuery>,
) -> Json<Vec<Leave>> {
    // TODO: Implement with database query
    Json(vec![])
}

#[derive(Debug, Deserialize)]
pub struct CreateLeaveRequest {
    pub user_id: i64,
    pub leave_type: LeaveType,
    pub start_date: String,
    pub end_date: String,
    pub reason: Option<String>,
}

pub async fn create_leave(
    Json(payload): Json<CreateLeaveRequest>,
) -> Result<Json<Leave>, (StatusCode, String)> {
    // Parse dates
    let start_date = chrono::NaiveDate::parse_from_str(&payload.start_date, "%Y-%m-%d")
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid start_date format".to_string()))?;
    let end_date = chrono::NaiveDate::parse_from_str(&payload.end_date, "%Y-%m-%d")
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid end_date format".to_string()))?;

    let total_days = (end_date - start_date).num_days() as f32 + 1.0;

    // TODO: Implement with database insert
    Ok(Json(Leave {
        id: 1,
        user_id: payload.user_id,
        leave_type: payload.leave_type,
        start_date,
        end_date,
        total_days,
        reason: payload.reason,
        status: LeaveStatus::Pending,
        approved_by: None,
        created_at: chrono::Utc::now(),
    }))
}

pub async fn approve_leave(
    Path(id): Path<i64>,
) -> Result<Json<Leave>, (StatusCode, String)> {
    // TODO: Implement with database update
    Ok(Json(Leave {
        id,
        user_id: 1,
        leave_type: LeaveType::Annual,
        start_date: chrono::NaiveDate::from_ymd_opt(2024, 1, 1).unwrap(),
        end_date: chrono::NaiveDate::from_ymd_opt(2024, 1, 3).unwrap(),
        total_days: 3.0,
        reason: Some("Vacation".to_string()),
        status: LeaveStatus::Approved,
        approved_by: Some(1),
        created_at: chrono::Utc::now(),
    }))
}

pub async fn reject_leave(
    Path(id): Path<i64>,
) -> Result<Json<Leave>, (StatusCode, String)> {
    // TODO: Implement with database update
    Ok(Json(Leave {
        id,
        user_id: 1,
        leave_type: LeaveType::Annual,
        start_date: chrono::NaiveDate::from_ymd_opt(2024, 1, 1).unwrap(),
        end_date: chrono::NaiveDate::from_ymd_opt(2024, 1, 3).unwrap(),
        total_days: 3.0,
        reason: Some("Vacation".to_string()),
        status: LeaveStatus::Rejected,
        approved_by: Some(1),
        created_at: chrono::Utc::now(),
    }))
}

// ============ Settings Handlers ============

#[derive(Debug, Deserialize)]
pub struct UpdateLanguageRequest {
    pub user_id: i64,
    pub language: String,
}

pub async fn update_language(
    Json(payload): Json<UpdateLanguageRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    // TODO: Implement with database update
    Ok(Json(serde_json::json!({
        "success": true,
        "language": payload.language
    })))
}
