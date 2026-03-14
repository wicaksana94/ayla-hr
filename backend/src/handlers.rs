use axum::{
    extract::{Query, Path, State},
    Json,
    http::StatusCode,
};
use sqlx::PgPool;
use serde::Deserialize;

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
    department_id: Option<i32>,
    position_id: Option<i32>,
    search: Option<String>,
}

pub async fn list_employees(
    State(pool): State<PgPool>,
    Query(params): Query<ListEmployeesQuery>,
) -> Json<Vec<User>> {
    let query = if params.search.is_some() {
        let search = params.search.unwrap();
        sqlx::query_as::<_, User>(
            "SELECT id, clerk_id, email, name, role, department_id, position_id, language, is_active 
             FROM users 
             WHERE name LIKE $1 OR email LIKE $1
             ORDER BY name"
        )
        .bind(format!("%{}%", search))
    } else {
        sqlx::query_as::<_, User>(
            "SELECT id, clerk_id, email, name, role, department_id, position_id, language, is_active 
             FROM users 
             ORDER BY name"
        )
    };
    
    match query.fetch_all(&pool).await {
        Ok(users) => Json(users),
        Err(e) => {
            eprintln!("Error fetching employees: {}", e);
            Json(vec![])
        }
    }
}

pub async fn get_employee(
    State(pool): State<PgPool>,
    Path(id): Path<i32>,
) -> Result<Json<User>, (StatusCode, String)> {
    match sqlx::query_as::<_, User>(
        "SELECT id, clerk_id, email, name, role, department_id, position_id, language, is_active 
         FROM users WHERE id = $1"
    )
    .bind(id)
    .fetch_one(&pool)
    .await
    {
        Ok(user) => Ok(Json(user)),
        Err(e) => Err((StatusCode::NOT_FOUND, e.to_string())),
    }
}

pub async fn create_employee(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateEmployeeRequest>,
) -> Result<Json<User>, (StatusCode, String)> {
    let role = payload.role.unwrap_or_else(|| "employee".to_string());
    
    match sqlx::query_as::<_, User>(
        "INSERT INTO users (clerk_id, email, name, role, department_id, position_id, language, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, 'en', true)
         RETURNING id, clerk_id, email, name, role, department_id, position_id, language, is_active"
    )
    .bind(payload.clerk_id)
    .bind(payload.email)
    .bind(payload.name)
    .bind(role)
    .bind(payload.department_id)
    .bind(payload.position_id)
    .fetch_one(&pool)
    .await
    {
        Ok(user) => Ok(Json(user)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

pub async fn update_employee(
    State(pool): State<PgPool>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateEmployeeRequest>,
) -> Result<Json<User>, (StatusCode, String)> {
    match sqlx::query_as::<_, User>(
        "UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), role = COALESCE($3, role), 
         department_id = $4, position_id = $5, is_active = COALESCE($6, is_active)
         WHERE id = $7 
         RETURNING id, clerk_id, email, name, role, department_id, position_id, language, is_active"
    )
    .bind(payload.name)
    .bind(payload.email)
    .bind(payload.role)
    .bind(payload.department_id)
    .bind(payload.position_id)
    .bind(payload.is_active)
    .bind(id)
    .fetch_one(&pool)
    .await
    {
        Ok(user) => Ok(Json(user)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

pub async fn delete_employee(
    State(pool): State<PgPool>,
    Path(id): Path<i32>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    match sqlx::query("DELETE FROM users WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await
    {
        Ok(_) => Ok(Json(serde_json::json!({"success": true, "message": "Employee deleted"}))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

// ============ Department Handlers ============

pub async fn list_departments(
    State(pool): State<PgPool>,
) -> Json<Vec<Department>> {
    match sqlx::query_as::<_, Department>(
        "SELECT id, name, code, description, is_active FROM departments ORDER BY name"
    )
    .fetch_all(&pool)
    .await
    {
        Ok(depts) => Json(depts),
        Err(e) => {
            eprintln!("Error fetching departments: {}", e);
            Json(vec![])
        }
    }
}

pub async fn create_department(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateDepartmentRequest>,
) -> Result<Json<Department>, (StatusCode, String)> {
    match sqlx::query_as::<_, Department>(
        "INSERT INTO departments (name, code, description, is_active)
         VALUES ($1, $2, $3, true)
         RETURNING id, name, code, description, is_active"
    )
    .bind(payload.name)
    .bind(payload.code)
    .bind(payload.description)
    .fetch_one(&pool)
    .await
    {
        Ok(dept) => Ok(Json(dept)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

pub async fn update_department(
    State(pool): State<PgPool>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateDepartmentRequest>,
) -> Result<Json<Department>, (StatusCode, String)> {
    match sqlx::query_as::<_, Department>(
        "UPDATE departments SET name = COALESCE($1, name), code = COALESCE($2, code), 
         description = $3, is_active = COALESCE($4, is_active)
         WHERE id = $5
         RETURNING id, name, code, description, is_active"
    )
    .bind(payload.name)
    .bind(payload.code)
    .bind(payload.description)
    .bind(payload.is_active)
    .bind(id)
    .fetch_one(&pool)
    .await
    {
        Ok(dept) => Ok(Json(dept)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

pub async fn delete_department(
    State(pool): State<PgPool>,
    Path(id): Path<i32>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    match sqlx::query("DELETE FROM departments WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await
    {
        Ok(_) => Ok(Json(serde_json::json!({"success": true}))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

// ============ Position Handlers ============

pub async fn list_positions(
    State(pool): State<PgPool>,
) -> Json<Vec<Position>> {
    match sqlx::query_as::<_, Position>(
        "SELECT id, name, departements, level, access_level FROM positions ORDER BY name"
    )
    .fetch_all(&pool)
    .await
    {
        Ok(positions) => Json(positions),
        Err(e) => {
            eprintln!("Error fetching positions: {}", e);
            Json(vec![])
        }
    }
}

pub async fn create_position(
    State(pool): State<PgPool>,
    Json(payload): Json<CreatePositionRequest>,
) -> Result<Json<Position>, (StatusCode, String)> {
    match sqlx::query_as::<_, Position>(
        "INSERT INTO positions (name, departements, level, access_level, is_active)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id, name, departements, level, access_level"
    )
    .bind(payload.name)
    .bind(payload.department_id.to_string()) // Convert to string due to user's schema
    .bind(payload.level)
    .bind(payload.access_level)
    .fetch_one(&pool)
    .await
    {
        Ok(pos) => Ok(Json(pos)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

pub async fn delete_position(
    State(pool): State<PgPool>,
    Path(id): Path<i32>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    match sqlx::query("DELETE FROM positions WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await
    {
        Ok(_) => Ok(Json(serde_json::json!({"success": true}))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

// ============ Leave Type Handlers ============

pub async fn list_leave_types(
    State(pool): State<PgPool>,
) -> Json<Vec<LeaveType>> {
    match sqlx::query_as::<_, LeaveType>(
        "SELECT id, name, code, is_paid, annual_limit, is_active FROM leave_types WHERE is_active = true"
    )
    .fetch_all(&pool)
    .await
    {
        Ok(types) => Json(types),
        Err(e) => Json(vec![]),
    }
}

// ============ Leave Handlers ============

#[derive(Debug, Deserialize)]
pub struct ListLeavesQuery {
    user_id: Option<i32>,
    status: Option<String>,
}

pub async fn list_leaves(
    State(pool): State<PgPool>,
    Query(params): Query<ListLeavesQuery>,
) -> Json<Vec<Leave>> {
    let query = if let (Some(user_id), Some(status)) = (params.user_id, params.status) {
        sqlx::query_as::<_, Leave>(
            "SELECT id, user_id, leave_type, start_date, end_date, total_days, reason, status, approved_by, approved_at
             FROM leaves WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC"
        )
        .bind(user_id)
        .bind(status)
    } else if let Some(user_id) = params.user_id {
        sqlx::query_as::<_, Leave>(
            "SELECT id, user_id, leave_type, start_date, end_date, total_days, reason, status, approved_by, approved_at
             FROM leaves WHERE user_id = $1 ORDER BY created_at DESC"
        )
        .bind(user_id)
    } else {
        sqlx::query_as::<_, Leave>(
            "SELECT id, user_id, leave_type, start_date, end_date, total_days, reason, status, approved_by, approved_at
             FROM leaves ORDER BY created_at DESC"
        )
    };
    
    match query.fetch_all(&pool).await {
        Ok(leaves) => Json(leaves),
        Err(e) => Json(vec![]),
    }
}

pub async fn create_leave(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateLeaveRequest>,
) -> Result<Json<Leave>, (StatusCode, String)> {
    match sqlx::query_as::<_, Leave>(
        "INSERT INTO leaves (user_id, leave_type, start_date, end_date, total_days, reason, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')
         RETURNING id, user_id, leave_type, start_date, end_date, total_days, reason, status, approved_by, approved_at"
    )
    .bind(payload.user_id)
    .bind(payload.leave_type)
    .bind(payload.start_date)
    .bind(payload.end_date)
    .bind(payload.total_days)
    .bind(payload.reason)
    .fetch_one(&pool)
    .await
    {
        Ok(leave) => Ok(Json(leave)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

pub async fn update_leave_status(
    State(pool): State<PgPool>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateLeaveStatusRequest>,
) -> Result<Json<Leave>, (StatusCode, String)> {
    let approved_at = if payload.status == "approved" {
        Some(chrono::Utc::now().to_rfc3339())
    } else {
        None
    };

    match sqlx::query_as::<_, Leave>(
        "UPDATE leaves SET status = $1, approved_by = $2, approved_at = $3
         WHERE id = $4
         RETURNING id, user_id, leave_type, start_date, end_date, total_days, reason, status, approved_by, approved_at"
    )
    .bind(payload.status)
    .bind(payload.approved_by)
    .bind(approved_at)
    .bind(id)
    .fetch_one(&pool)
    .await
    {
        Ok(leave) => Ok(Json(leave)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}
