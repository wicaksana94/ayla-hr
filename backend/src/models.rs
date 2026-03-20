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
    pub manager_id: Option<i32>,
    pub language: String,
    pub is_active: bool,
    pub theme: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Department {
    pub id: i32,
    pub name: String,
    pub code: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Position {
    pub id: i32,
    pub name: String,
    pub department_id: Option<i32>,
    pub level: Option<i32>,
    pub access_level: Option<String>,
    pub is_active: Option<bool>,
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
    pub attachment: Option<String>,
    pub status: String,
    pub approved_by: Option<i32>,
    pub approved_at: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_user_model_serialization() {
        let user = User {
            id: 1,
            clerk_id: "test_clerk_123".to_string(),
            email: "test@example.com".to_string(),
            name: "Test User".to_string(),
            role: "employee".to_string(),
            department_id: Some(1),
            position_id: Some(1),
            language: "en".to_string(),
            is_active: true,
        };
        
        let json = serde_json::to_string(&user).unwrap();
        assert!(json.contains("test@example.com"));
    }
    
    #[test]
    fn test_department_model_serialization() {
        let dept = Department {
            id: 1,
            name: "Engineering".to_string(),
            code: Some("ENG".to_string()),
        };
        
        let json = serde_json::to_string(&dept).unwrap();
        assert!(json.contains("Engineering"));
    }
    
    #[test]
    fn test_create_employee_request() {
        let req = CreateEmployeeRequest {
            clerk_id: "clerk_abc123".to_string(),
            email: "employee@company.com".to_string(),
            name: "John Doe".to_string(),
            role: Some("manager".to_string()),
            department_id: Some(1),
            position_id: Some(2),
        };
        
        assert_eq!(req.clerk_id, "clerk_abc123");
        assert_eq!(req.role, Some("manager".to_string()));
    }
    
    #[test]
    fn test_create_department_request() {
        let req = CreateDepartmentRequest {
            name: "Finance".to_string(),
            code: "FIN".to_string(),
        };
        
        assert_eq!(req.name, "Finance");
        assert_eq!(req.code, "FIN");
    }
    
    #[test]
    fn test_create_position_request() {
        let req = CreatePositionRequest {
            name: "Senior Engineer".to_string(),
            department_id: Some(1),
            level: Some(3),
            access_level: Some("manage_team".to_string()),
        };
        
        assert_eq!(req.name, "Senior Engineer");
        assert_eq!(req.level, Some(3));
    }
    
    #[test]
    fn test_create_leave_request() {
        let req = CreateLeaveRequest {
            user_id: 5,
            leave_type: "sick".to_string(),
            start_date: "2024-02-01".to_string(),
            end_date: "2024-02-02".to_string(),
            total_days: Some(2),
            reason: Some("Not feeling well".to_string()),
            attachment: Some("https://example.com/file.pdf".to_string()),
        };
        
        assert_eq!(req.user_id, 5);
        assert_eq!(req.attachment, Some("https://example.com/file.pdf".to_string()));
        assert_eq!(req.leave_type, "sick");
        assert_eq!(req.total_days, Some(2));
    }
    
    #[test]
    fn test_update_leave_status_request() {
        let req = UpdateLeaveStatusRequest {
            status: "approved".to_string(),
            approved_by: 1,
        };
        
        assert_eq!(req.status, "approved");
        assert_eq!(req.approved_by, 1);
    }
    
    #[test]
    fn test_leave_type_model() {
        let lt = LeaveType {
            id: 1,
            name: "Annual Leave".to_string(),
            code: "annual".to_string(),
            is_paid: true,
            annual_limit: 12,
            is_active: true,
        };
        
        assert!(lt.is_paid);
        assert_eq!(lt.annual_limit, 12);
    }
    
    #[test]
    fn test_leave_model() {
        let leave = Leave {
            id: 1,
            user_id: Some(1),
            leave_type: "annual".to_string(),
            start_date: "2024-01-01".to_string(),
            end_date: "2024-01-05".to_string(),
            total_days: 5,
            reason: Some("Holiday".to_string()),
            attachment: Some("https://example.com/medical-cert.pdf".to_string()),
            status: "pending".to_string(),
            approved_by: None,
            approved_at: None,
        };
        
        assert_eq!(leave.total_days, 5);
        assert_eq!(leave.status, "pending");
        assert_eq!(leave.attachment, Some("https://example.com/medical-cert.pdf".to_string()));
    }
    
    #[test]
    fn test_position_model() {
        let pos = Position {
            id: 1,
            name: "Test Position".to_string(),
            department_id: Some(1),
            level: Some(1),
            access_level: Some("own_only".to_string()),
        };
        
        assert_eq!(pos.name, "Test Position");
        assert_eq!(pos.level, Some(1));
    }
    
    #[test]
    fn test_json_serialization_roundtrip_user() {
        let user = User {
            id: 1,
            clerk_id: "test".to_string(),
            email: "test@test.com".to_string(),
            name: "Test User".to_string(),
            role: "employee".to_string(),
            department_id: None,
            position_id: None,
            language: "en".to_string(),
            is_active: true,
        };
        
        let json = serde_json::to_string(&user).unwrap();
        let decoded: User = serde_json::from_str(&json).unwrap();
        assert_eq!(decoded.email, "test@test.com");
    }
    
    #[test]
    fn test_json_serialization_roundtrip_department() {
        let dept = Department {
            id: 1,
            name: "Test".to_string(),
            code: Some("TST".to_string()),
        };
        
        let json = serde_json::to_string(&dept).unwrap();
        let decoded: Department = serde_json::from_str(&json).unwrap();
        assert_eq!(decoded.name, "Test");
    }
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
    pub manager_id: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateEmployeeRequest {
    pub name: Option<String>,
    pub email: Option<String>,
    pub role: Option<String>,
    pub department_id: Option<i32>,
    pub position_id: Option<i32>,
    pub manager_id: Option<i32>,
    pub is_active: Option<bool>,
    pub theme: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateDepartmentRequest {
    pub name: String,
    pub code: String,
}

impl CreateDepartmentRequest {
    pub fn validate(&self) -> Result<(), String> {
        if self.code.trim().len() > 3 {
            return Err("Department code must be maximum 3 characters".to_string());
        }
        Ok(())
    }
}

#[derive(Debug, Deserialize)]
pub struct UpdateDepartmentRequest {
    pub name: Option<String>,
    pub code: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreatePositionRequest {
    pub name: String,
    pub department_id: Option<i32>,
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
    pub attachment: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateLeaveStatusRequest {
    pub status: String,
    pub approved_by: i32,
}
