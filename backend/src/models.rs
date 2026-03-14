use serde::{Deserialize, Serialize};
use chrono::NaiveDate;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: i64,
    pub clerk_id: String,
    pub email: String,
    pub name: String,
    pub role: UserRole,
    pub department_id: Option<i64>,
    pub position_id: Option<i64>,
    pub language: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum UserRole {
    Admin,
    HrManager,
    Manager,
    Employee,
}

impl UserRole {
    pub fn as_str(&self) -> &str {
        match self {
            UserRole::Admin => "admin",
            UserRole::HrManager => "hr_manager",
            UserRole::Manager => "manager",
            UserRole::Employee => "employee",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Department {
    pub id: i64,
    pub name: String,
    pub code: String,
    pub description: Option<String>,
    pub is_active: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub id: i64,
    pub name: String,
    pub level: i32,
    pub department_id: i64,
    pub access_level: AccessLevel,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum AccessLevel {
    Full,
    ManageTeam,
    ReadOnly,
    OwnOnly,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Leave {
    pub id: i64,
    pub user_id: i64,
    pub leave_type: LeaveType,
    pub start_date: NaiveDate,
    pub end_date: NaiveDate,
    pub total_days: f32,
    pub reason: Option<String>,
    pub status: LeaveStatus,
    pub approved_by: Option<i64>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum LeaveType {
    Annual,
    Sick,
    Paid,
    Unpaid,
}

impl LeaveType {
    pub fn as_str(&self) -> &str {
        match self {
            LeaveType::Annual => "annual",
            LeaveType::Sick => "sick",
            LeaveType::Paid => "paid",
            LeaveType::Unpaid => "unpaid",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum LeaveStatus {
    Pending,
    Approved,
    Rejected,
    Cancelled,
}
