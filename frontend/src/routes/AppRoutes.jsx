import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';

// Dashboard pages
import DashboardPage from '../pages/dashboard/DashboardPage';

// Content pages
import ContentListPage from '../pages/content/ContentListPage';
const ContentDetailPage = () => <div>Content Detail Page</div>;
const ContentEditPage = () => <div>Content Edit Page</div>;
const ContentCreatePage = () => <div>Content Create Page</div>;

// HRMS pages
import EmployeesPage from '../pages/hrms/EmployeesPage';
import EmployeeCreatePage from '../pages/hrms/EmployeeCreatePage';
import EmployeeDetailPage from '../pages/hrms/EmployeeDetailPage';
import EmployeeEditPage from '../pages/hrms/EmployeeEditPage';

import DepartmentsPage from '../pages/hrms/DepartmentsPage';
import DepartmentDetailPage from '../pages/hrms/DepartmentDetailPage';
import DepartmentEditPage from '../pages/hrms/DepartmentEditPage';
import DepartmentCreatePage from '../pages/hrms/DepartmentCreatePage';

import DesignationsPage from '../pages/hrms/DesignationsPage';

import LeaveManagementPage from '../pages/leave/LeaveManagementPage';
import LeaveApprovalPage from '../pages/leave/LeaveApprovalPage';
import LeaveDetailPage from '../pages/leave/LeaveDetailPage';
const LeaveCreatePage = () => <div>Leave Request Page</div>;

import AttendanceHistoryPage from '../pages/hrms/AttendanceHistoryPage';
import AdminAttendancePage from '../pages/hrms/AdminAttendancePage';
import AttendanceClockPage from '../pages/hrms/AttendanceClockPage';
import AttendanceReportPage from '../pages/hrms/AttendanceReportPage';

import PerformancePage from '../pages/hrms/PerformancePage';
const PerformanceDetailPage = () => <div>Performance Review Detail Page</div>;
const PerformanceCreatePage = () => <div>Create Performance Review Page</div>;

// PMS pages
import ProjectManagementPage from '../pages/project/ProjectManagementPage';
import ProjectTimelinePage from '../pages/project/ProjectTimelinePage';
import ResourceAllocationPage from '../pages/project/ResourceAllocationPage';
const ProjectDetailPage = () => <div>Project Detail Page</div>;
const ProjectEditPage = () => <div>Project Edit Page</div>;
const ProjectCreatePage = () => <div>Project Create Page</div>;
const ProjectTeamPage = () => <div>Project Team Page</div>;

import TaskManagementPage from '../pages/task/TaskManagementPage';
import TaskDetailPage from '../pages/task/TaskDetailPage';
const TaskEditPage = () => <div>Task Edit Page</div>;
const TaskCreatePage = () => <div>Task Create Page</div>;

import TimeEntriesPage from '../pages/timeTracking/TimeEntriesPage';
const TimeEntryDetailPage = () => <div>Time Entry Detail Page</div>;
const TimeEntryCreatePage = () => <div>Time Entry Create Page</div>;

const ReportsPage = () => <div>Reports Page</div>;
const ProjectReportPage = () => <div>Project Report Page</div>;
const TimeReportPage = () => <div>Time Report Page</div>;
const EmployeeReportPage = () => <div>Employee Report Page</div>;

// Admin pages
import UserManagementPage from '../pages/admin/UserManagementPage';
import UserListPage from '../pages/UserListPage';
const UserDetailPage = () => <div>User Detail Page</div>;
const UserEditPage = () => <div>User Edit Page</div>;
const UserCreatePage = () => <div>User Create Page</div>;

import RoleManagementPage from '../pages/admin/RoleManagementPage';
import RoleListPage from '../pages/RoleListPage';
const RoleDetailPage = () => <div>Role Detail Page</div>;
const RoleEditPage = () => <div>Role Edit Page</div>;
const RoleCreatePage = () => <div>Role Create Page</div>;

// Time Tracking pages
import TimeTrackingPage from '../pages/timeTracking/TimeTrackingPage';

// Settings page
import SettingsPage from '../pages/SettingsPage';

// Notifications page
import NotificationsPage from '../pages/notifications/NotificationsPage';

// Not found page
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Content routes */}
          <Route element={<ProtectedRoute requiredPermission="content:read" />}>
            <Route path="/content" element={<ContentListPage />} />
            <Route path="/content/:id" element={<ContentDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="content:create" />}>
            <Route path="/content/new" element={<ContentCreatePage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="content:update" />}>
            <Route path="/content/:id/edit" element={<ContentEditPage />} />
          </Route>

          {/* User routes - redirect to admin section */}
          <Route path="/users" element={<Navigate to="/admin/users" replace />} />
          <Route path="/users/:id" element={<Navigate to="/admin/users/:id" replace />} />

          <Route path="/users/new" element={<Navigate to="/admin/users/new" replace />} />
          <Route path="/users/:id/edit" element={<Navigate to="/admin/users/:id/edit" replace />} />

          {/* Role routes - redirect to admin section */}
          <Route path="/roles" element={<Navigate to="/admin/roles" replace />} />
          <Route path="/roles/:id" element={<Navigate to="/admin/roles/:id" replace />} />

          <Route path="/roles/new" element={<Navigate to="/admin/roles/new" replace />} />
          <Route path="/roles/:id/edit" element={<Navigate to="/admin/roles/:id/edit" replace />} />

          {/* HRMS routes */}
          <Route element={<ProtectedRoute requiredPermission="employee:read" />}>
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="employee:create" />}>
            <Route path="/employees/new" element={<EmployeeCreatePage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="employee:update" />}>
            <Route path="/employees/:id/edit" element={<EmployeeEditPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="department:read" />}>
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/departments/:id" element={<DepartmentDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="department:create" />}>
            <Route path="/departments/new" element={<DepartmentCreatePage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="department:update" />}>
            <Route path="/departments/:id/edit" element={<DepartmentEditPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="designation:read" />}>
            <Route path="/designations" element={<DesignationsPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="leave:read" />}>
            <Route path="/leaves" element={<LeaveManagementPage />} />
            <Route path="/leaves/:id" element={<LeaveDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="leave:approve" />}>
            <Route path="/leaves/approval" element={<LeaveApprovalPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="leave:create" />}>
            <Route path="/leaves/new" element={<LeaveCreatePage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="attendance:read" />}>
            <Route path="/attendance" element={<AttendanceHistoryPage />} />
            <Route path="/attendance/clock" element={<AttendanceClockPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="attendance:manage" />}>
            <Route path="/attendance/admin" element={<AdminAttendancePage />} />
            <Route path="/attendance/report" element={<AttendanceReportPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="performance:read" />}>
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/performance/:id" element={<PerformanceDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="performance:create" />}>
            <Route path="/performance/new" element={<PerformanceCreatePage />} />
          </Route>

          {/* PMS routes */}
          <Route element={<ProtectedRoute requiredPermission="project:read" />}>
            <Route path="/projects" element={<ProjectManagementPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/projects/:id/team" element={<ProjectTeamPage />} />
            <Route path="/projects/:projectId/tasks" element={<TaskManagementPage />} />
            <Route path="/projects/:projectId/timeline" element={<ProjectTimelinePage />} />
            <Route path="/resource-allocation" element={<ResourceAllocationPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="project:create" />}>
            <Route path="/projects/new" element={<ProjectCreatePage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="project:update" />}>
            <Route path="/projects/:id/edit" element={<ProjectEditPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="task:read" />}>
            <Route path="/tasks" element={<TaskManagementPage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="task:create" />}>
            <Route path="/tasks/new" element={<TaskCreatePage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="task:update" />}>
            <Route path="/tasks/:id/edit" element={<TaskEditPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="time_entry:read" />}>
            <Route path="/time-entries" element={<TimeEntriesPage />} />
            <Route path="/time-entries/:id" element={<TimeEntryDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="time_entry:create" />}>
            <Route path="/time-entries/new" element={<TimeEntryCreatePage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="reports:read" />}>
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/projects" element={<ProjectReportPage />} />
            <Route path="/reports/time" element={<TimeReportPage />} />
            <Route path="/reports/employees" element={<EmployeeReportPage />} />
          </Route>

          {/* Time Tracking */}
          <Route path="/time-tracking" element={<TimeTrackingPage />} />

          {/* Admin Section */}
          <Route element={<ProtectedRoute requiredPermission="user:read" />}>
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/users/:id" element={<UserDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="user:create" />}>
            <Route path="/admin/users/new" element={<UserCreatePage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="user:update" />}>
            <Route path="/admin/users/:id/edit" element={<UserEditPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="role:read" />}>
            <Route path="/admin/roles" element={<RoleManagementPage />} />
            <Route path="/admin/roles/:id" element={<RoleDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="role:create" />}>
            <Route path="/admin/roles/new" element={<RoleCreatePage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="role:update" />}>
            <Route path="/admin/roles/:id/edit" element={<RoleEditPage />} />
          </Route>

          {/* Notifications */}
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Redirect root to dashboard or login */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;