use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: i32,
    pub clerk_id: String,
    pub email: String,
    pub name: String,
    pub role: String,
    pub department_id: Option<i32>,
    pub position_id: Option<i32>,
    pub language: String,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Department {
    pub id: i32,
    pub name: String,
    pub code: Option<String>,
    pub description: Option<String>,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Position {
    pub id: i32,
    pub name: String,
    pub departements: Option<String>, // Typo from user's schema
    pub level: Option<i32>,
    pub access_level: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct LeaveType {
    pub id: i32,
    pub name: String,
    pub code: String,
    pub is_paid: bool,
    pub annual_limit: i32,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Leave {
    pub id: i32,
    pub user_id: Option<i32>,
    pub leave_type: String,
    pub start_date: String,
    pub end_date: String,
    pub total_days: i32,
    pub reason: Option<String>,
    pub status: String,
    pub approved_by: Option<i32>,
    pub approved_at: Option<String>,
}

// Request/Response types
#[derive(Debug, Deserialize)]
pub struct CreateEmployeeRequest {
    pub clerk_id: String,
    pub email: String,
    pub name: String,
    pub role: Option<String>,
    pub department_id: Option<i32>,
    pub position_id: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateEmployeeRequest {
    pub name: Option<String>,
    pub email: Option<String>,
    pub role: Option<String>,
    pub department_id: Option<i32>,
    pub position_id: Option<i32>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct CreateDepartmentRequest {
    pub name: String,
    pub code: String,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateDepartmentRequest {
    pub name: Option<String>,
    pub code: Option<String>,
    pub description: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct CreatePositionRequest {
    pub name: String,
    pub department_id: i32,
    pub level: Option<i32>,
    pub access_level: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePositionRequest {
    pub name: Option<String>,
    pub department_id: Option<i32>,
    pub level: Option<i32>,
    pub access_level: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct CreateLeaveRequest {
    pub user_id: i32,
    pub leave_type: String,
    pub start_date: String,
    pub end_date: String,
    pub total_days: Option<i32>,
    pub reason: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateLeaveStatusRequest {
    pub status: String,
    pub approved_by: i32,
}
