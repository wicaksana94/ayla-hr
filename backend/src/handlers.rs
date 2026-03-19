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
    page: Option<i32>,
    limit: Option<i32>,
}

pub async fn list_employees(
    State(pool): State<PgPool>,
    Query(params): Query<ListEmployeesQuery>,
) -> Json<serde_json::Value> {
    let page = params.page.unwrap_or(1).max(1);
    let limit = params.limit.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * limit;

    let query = if params.search.is_some() {
        let search = params.search.unwrap();
        sqlx::query_as::<_, User>(
            "SELECT id, clerk_id, email, name, role, department_id, position_id, manager_id, language, is_active 
             FROM users 
             WHERE name LIKE $1 OR email LIKE $1
             ORDER BY name LIMIT $2 OFFSET $3"
        )
        .bind(format!("%{}%", search))
        .bind(limit)
        .bind(offset)
    } else {
        sqlx::query_as::<_, User>(
            "SELECT id, clerk_id, email, name, role, department_id, position_id, manager_id, language, is_active 
             FROM users 
             ORDER BY name LIMIT $1 OFFSET $2"
        )
        .bind(limit)
        .bind(offset)
    };
    
    match query.fetch_all(&pool).await {
        Ok(users) => Json(serde_json::json!({
            "data": users,
            "page": page,
            "limit": limit
        })),
        Err(e) => {
            eprintln!("Error fetching employees: {}", e);
            Json(serde_json::json!({"error": "Failed to fetch employees", "details": e.to_string()}))
        }
    }
}

pub async fn get_employee(
    State(pool): State<PgPool>,
    Path(id): Path<i32>,
) -> Result<Json<User>, (StatusCode, String)> {
    match sqlx::query_as::<_, User>(
        "SELECT id, clerk_id, email, name, role, department_id, position_id, manager_id, language, is_active 
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
    // Basic validation
    if payload.email.trim().is_empty() {
        return Err((StatusCode::BAD_REQUEST, "Email is required".to_string()));
    }
    if payload.name.trim().is_empty() {
        return Err((StatusCode::BAD_REQUEST, "Name is required".to_string()));
    }
    if !payload.email.contains('@') {
        return Err((StatusCode::BAD_REQUEST, "Invalid email format".to_string()));
    }
    
    let role = payload.role.unwrap_or_else(|| "employee".to_string());
    
    match sqlx::query_as::<_, User>(
        "INSERT INTO users (clerk_id, email, name, role, department_id, position_id, manager_id, language, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'en', true)
         RETURNING id, clerk_id, email, name, role, department_id, position_id, manager_id, language, is_active"
    )
    .bind(payload.clerk_id)
    .bind(payload.email.trim())
    .bind(payload.name.trim())
    .bind(role)
    .bind(payload.department_id)
    .bind(payload.position_id)
    .bind(payload.manager_id)
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
         department_id = $4, position_id = $5, manager_id = $6, is_active = COALESCE($7, is_active)
         WHERE id = $8 
         RETURNING id, clerk_id, email, name, role, department_id, position_id, manager_id, language, is_active"
    )
    .bind(payload.name)
    .bind(payload.email)
    .bind(payload.role)
    .bind(payload.department_id)
    .bind(payload.position_id)
    .bind(payload.manager_id)
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
        "SELECT id, name, code FROM departments ORDER BY name"
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
    // Basic validation
    if payload.name.trim().is_empty() {
        return Err((StatusCode::BAD_REQUEST, "Department name is required".to_string()));
    }
    if payload.code.trim().is_empty() {
        return Err((StatusCode::BAD_REQUEST, "Department code is required".to_string()));
    }

    match sqlx::query_as::<_, Department>(
        "INSERT INTO departments (name, code)
         VALUES ($1, $2)
         RETURNING id, name, code"
    )
    .bind(payload.name.trim())
    .bind(payload.code.trim().to_uppercase())
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
        "UPDATE departments SET name = COALESCE($1, name), code = COALESCE($2, code)
         WHERE id = $3
         RETURNING id, name, code"
    )
    .bind(payload.name)
    .bind(payload.code)
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

#[derive(Debug, Deserialize)]
pub struct ListPositionsQuery {
    department_id: Option<i32>,
    page: Option<i32>,
    limit: Option<i32>,
}

pub async fn list_positions(
    State(pool): State<PgPool>,
    Query(params): Query<ListPositionsQuery>,
) -> Json<serde_json::Value> {
    let page = params.page.unwrap_or(1).max(1);
    let limit = params.limit.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * limit;

    let query = if let Some(dept_id) = params.department_id {
        sqlx::query_as::<_, Position>(
            "SELECT id, name, department_id, level, access_level 
             FROM positions WHERE department_id = $1 ORDER BY name LIMIT $2 OFFSET $3"
        )
        .bind(dept_id)
        .bind(limit)
        .bind(offset)
    } else {
        sqlx::query_as::<_, Position>(
            "SELECT id, name, department_id, level, access_level 
             FROM positions ORDER BY name LIMIT $1 OFFSET $2"
        )
        .bind(limit)
        .bind(offset)
    };
    
    match query.fetch_all(&pool).await {
        Ok(positions) => Json(serde_json::json!({
            "data": positions,
            "page": page,
            "limit": limit
        })),
        Err(e) => {
            eprintln!("Error fetching positions: {}", e);
            Json(serde_json::json!({"error": "Failed to fetch positions", "details": e.to_string()}))
        }
    }
}

pub async fn create_position(
    State(pool): State<PgPool>,
    Json(payload): Json<CreatePositionRequest>,
) -> Result<Json<Position>, (StatusCode, String)> {
    // Basic validation
    if payload.name.trim().is_empty() {
        return Err((StatusCode::BAD_REQUEST, "Position name is required".to_string()));
    }

    match sqlx::query_as::<_, Position>(
        "INSERT INTO positions (name, department_id, level, access_level)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, department_id, level, access_level"
    )
    .bind(payload.name.trim())
    .bind(payload.department_id)
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
    page: Option<i32>,
    limit: Option<i32>,
    search: Option<String>,
}

pub async fn list_leaves(
    State(pool): State<PgPool>,
    Query(params): Query<ListLeavesQuery>,
) -> Json<serde_json::Value> {
    let page = params.page.unwrap_or(1).max(1);
    let limit = params.limit.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * limit;
    let search = params.search.clone().unwrap_or_default();
    let search_pattern = format!("%{}%", search);

    let (count_query, data_query) = if let (Some(user_id), Some(status)) = (params.user_id, params.status.clone()) {
        if !search.is_empty() {
            (
                "SELECT COUNT(*) as total FROM leaves WHERE user_id = $1 AND status = $2 AND (reason ILIKE $3 OR leave_type ILIKE $3)",
                "SELECT id, user_id, leave_type, start_date, end_date, total_days, reason, attachment, status, approved_by, approved_at FROM leaves WHERE user_id = $1 AND status = $2 AND (reason ILIKE $3 OR leave_type ILIKE $3) ORDER BY id DESC LIMIT $4 OFFSET $5"
            )
        } else {
            (
                "SELECT COUNT(*) as total FROM leaves WHERE user_id = $1 AND status = $2",
                "SELECT id, user_id, leave_type, start_date, end_date, total_days, reason, attachment, status, approved_by, approved_at FROM leaves WHERE user_id = $1 AND status = $2 ORDER BY id DESC LIMIT $3 OFFSET $4"
            )
        }
    } else if let Some(user_id) = params.user_id {
        if !search.is_empty() {
            (
                "SELECT COUNT(*) as total FROM leaves WHERE user_id = $1 AND (reason ILIKE $2 OR leave_type ILIKE $2)",
                "SELECT id, user_id, leave_type, start_date, end_date, total_days, reason, attachment, status, approved_by, approved_at FROM leaves WHERE user_id = $1 AND (reason ILIKE $2 OR leave_type ILIKE $2) ORDER BY id DESC LIMIT $3 OFFSET $4"
            )
        } else {
            (
                "SELECT COUNT(*) as total FROM leaves WHERE user_id = $1",
                "SELECT id, user_id, leave_type, start_date, end_date, total_days, reason, attachment, status, approved_by, approved_at FROM leaves WHERE user_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3"
            )
        }
    } else if let Some(status) = &params.status {
        if !search.is_empty() {
            (
                "SELECT COUNT(*) as total FROM leaves WHERE status = $1 AND (reason ILIKE $2 OR leave_type ILIKE $2)",
                "SELECT id, user_id, leave_type, start_date, end_date, total_days, reason, attachment, status, approved_by, approved_at FROM leaves WHERE status = $1 AND (reason ILIKE $2 OR leave_type ILIKE $2) ORDER BY id DESC LIMIT $3 OFFSET $4"
            )
        } else {
            (
                "SELECT COUNT(*) as total FROM leaves WHERE status = $1",
                "SELECT id, user_id, leave_type, start_date, end_date, total_days, reason, attachment, status, approved_by, approved_at FROM leaves WHERE status = $1 ORDER BY id DESC LIMIT $2 OFFSET $3"
            )
        }
    } else if !search.is_empty() {
        (
            "SELECT COUNT(*) as total FROM leaves WHERE reason ILIKE $1 OR leave_type ILIKE $1",
            "SELECT id, user_id, leave_type, start_date, end_date, total_days, reason, attachment, status, approved_by, approved_at FROM leaves WHERE reason ILIKE $1 OR leave_type ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3"
        )
    } else {
        (
            "SELECT COUNT(*) as total FROM leaves",
            "SELECT id, user_id, leave_type, start_date, end_date, total_days, reason, attachment, status, approved_by, approved_at FROM leaves ORDER BY id DESC LIMIT $1 OFFSET $2"
        )
    };

    // Get total count
    let total: i64 = match (params.user_id, params.status.clone(), search.as_str()) {
        (Some(uid), Some(st), s) if !s.is_empty() => {
            sqlx::query_scalar(count_query)
                .bind(uid).bind(st).bind(&search_pattern)
                .fetch_one(&pool).await.unwrap_or(0)
        },
        (Some(uid), Some(st), _) => {
            sqlx::query_scalar(count_query)
                .bind(uid).bind(st)
                .fetch_one(&pool).await.unwrap_or(0)
        },
        (Some(uid), None, s) if !s.is_empty() => {
            sqlx::query_scalar(count_query)
                .bind(uid).bind(&search_pattern)
                .fetch_one(&pool).await.unwrap_or(0)
        },
        (Some(uid), None, _) => {
            sqlx::query_scalar(count_query)
                .bind(uid)
                .fetch_one(&pool).await.unwrap_or(0)
        },
        (None, Some(st), s) if !s.is_empty() => {
            sqlx::query_scalar(count_query)
                .bind(st).bind(&search_pattern)
                .fetch_one(&pool).await.unwrap_or(0)
        },
        (None, Some(st), _) => {
            sqlx::query_scalar(count_query)
                .bind(st)
                .fetch_one(&pool).await.unwrap_or(0)
        },
        (None, None, s) if !s.is_empty() => {
            sqlx::query_scalar(count_query)
                .bind(&search_pattern)
                .fetch_one(&pool).await.unwrap_or(0)
        },
        _ => {
            sqlx::query_scalar(count_query)
                .fetch_one(&pool).await.unwrap_or(0)
        }
    };

    // Get data
    let leaves: Vec<Leave> = match (params.user_id, params.status.clone(), search.as_str()) {
        (Some(uid), Some(st), s) if !s.is_empty() => {
            sqlx::query_as::<_, Leave>(data_query)
                .bind(uid).bind(st).bind(&search_pattern).bind(limit).bind(offset)
                .fetch_all(&pool).await.unwrap_or_default()
        },
        (Some(uid), Some(st), _) => {
            sqlx::query_as::<_, Leave>(data_query)
                .bind(uid).bind(st).bind(limit).bind(offset)
                .fetch_all(&pool).await.unwrap_or_default()
        },
        (Some(uid), None, s) if !s.is_empty() => {
            sqlx::query_as::<_, Leave>(data_query)
                .bind(uid).bind(&search_pattern).bind(limit).bind(offset)
                .fetch_all(&pool).await.unwrap_or_default()
        },
        (Some(uid), None, _) => {
            sqlx::query_as::<_, Leave>(data_query)
                .bind(uid).bind(limit).bind(offset)
                .fetch_all(&pool).await.unwrap_or_default()
        },
        (None, Some(st), s) if !s.is_empty() => {
            sqlx::query_as::<_, Leave>(data_query)
                .bind(st).bind(&search_pattern).bind(limit).bind(offset)
                .fetch_all(&pool).await.unwrap_or_default()
        },
        (None, Some(st), _) => {
            sqlx::query_as::<_, Leave>(data_query)
                .bind(st).bind(limit).bind(offset)
                .fetch_all(&pool).await.unwrap_or_default()
        },
        (None, None, s) if !s.is_empty() => {
            sqlx::query_as::<_, Leave>(data_query)
                .bind(&search_pattern).bind(limit).bind(offset)
                .fetch_all(&pool).await.unwrap_or_default()
        },
        _ => {
            sqlx::query_as::<_, Leave>(data_query)
                .bind(limit).bind(offset)
                .fetch_all(&pool).await.unwrap_or_default()
        }
    };

    Json(serde_json::json!({
        "data": leaves,
        "page": page,
        "limit": limit,
        "total": total,
        "totalPages": (total as f64 / limit as f64).ceil() as i32
    }))
}

pub async fn create_leave(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateLeaveRequest>,
) -> Result<Json<Leave>, (StatusCode, String)> {
    // Basic validation
    if payload.leave_type.trim().is_empty() {
        return Err((StatusCode::BAD_REQUEST, "Leave type is required".to_string()));
    }
    if payload.start_date.trim().is_empty() || payload.end_date.trim().is_empty() {
        return Err((StatusCode::BAD_REQUEST, "Start and end dates are required".to_string()));
    }

    match sqlx::query_as::<_, Leave>(
        "INSERT INTO leaves (user_id, leave_type, start_date, end_date, total_days, reason, attachment, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
         RETURNING id, user_id, leave_type, start_date, end_date, total_days, reason, attachment, status, approved_by, approved_at"
    )
    .bind(payload.user_id)
    .bind(payload.leave_type.trim())
    .bind(payload.start_date.trim())
    .bind(payload.end_date.trim())
    .bind(payload.total_days)
    .bind(payload.reason)
    .bind(payload.attachment)
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
         RETURNING id, user_id, leave_type, start_date, end_date, total_days, reason, attachment, status, approved_by, approved_at"
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
