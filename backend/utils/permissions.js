// utils/permissions.js
module.exports = [
  // CMS Module
  {
    feat: "user",
    label: "User",
    acts: ["create", "read", "update", "delete"]
  },
  {
    feat: "role",
    label: "Role",
    acts: ["create", "read", "update", "delete"]
  },
  {
    feat: "permission",
    label: "Permission",
    acts: ["create", "read", "update", "delete"]
  },
  {
    feat: "content",
    label: "Content",
    acts: ["create", "read", "update", "delete"]
  },

  // HRMS Module
  {
    feat: "employee",
    label: "Employee",
    acts: ["create", "read", "update", "delete", "import", "export"]
  },
  {
    feat: "department",
    label: "Department",
    acts: ["create", "read", "update", "delete"]
  },
  {
    feat: "leave",
    label: "Leave Management",
    acts: ["create", "read", "update", "delete", "approve", "reject"]
  },
  {
    feat: "attendance",
    label: "Attendance",
    acts: ["create", "read", "update", "delete", "approve"]
  },
  {
    feat: "performance",
    label: "Performance Reviews",
    acts: ["create", "read", "update", "delete", "approve", "self_review", "manager_review"]
  },

  // PMS Module
  {
    feat: "project",
    label: "Project",
    acts: ["create", "read", "update", "delete", "manage_team", "view_reports"]
  },
  {
    feat: "task",
    label: "Task",
    acts: ["create", "read", "update", "delete", "assign", "change_status"]
  },
  {
    feat: "time_entry",
    label: "Time Tracking",
    acts: ["create", "read", "update", "delete", "approve", "report"]
  },

  // System Settings
  {
    feat: "settings",
    label: "System Settings",
    acts: ["read", "update"]
  },
  {
    feat: "reports",
    label: "Reports",
    acts: ["generate", "read", "export"]
  },
  {
    feat: "notifications",
    label: "Notifications",
    acts: ["create", "read", "update", "delete"]
  }
];
