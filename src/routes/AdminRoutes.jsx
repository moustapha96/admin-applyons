

/* routes/AdminRoutes.jsx */
/* eslint-disable no-unused-vars */
import { Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

/* --- Admin dashboard/profile --- */
import AdminDashboard from "../pages/Admin/Dashboard";
import Profile from "../pages/User-Profile/profile";

/* --- Users (globaux) --- */
import UserList from "../pages/Admin/Users/user-list";
import UserDetails from "../pages/Admin/Users/user-details";
import UserEdit from "../pages/Admin/Users/user-edit";
import UserCreate from "../pages/Admin/Users/user-create";

/* --- Departments & Filieres (globaux côté admin) --- */
import DepartmentList from "../pages/Admin/Departments/DepartmentList";
import DepartmentDetail from "../pages/Admin/Departments/DepartmentDetail";
import DepartmentForm from "../pages/Admin/Departments/DepartmentForm";
import DepartmentFilieresList from "../pages/Admin/Filieres/DepartmentFilieresList";
import DepartmentFiliereCreate from "../pages/Admin/Filieres/DepartmentFiliereCreate";
import FiliereEdit from "../pages/Admin/Filieres/FiliereEdit";

/* --- Organizations (pages côté admin) --- */
import OrganizationList from "../pages/Admin/organizations/organization-list.jsx";
import OrganizationCreate from "../pages/Admin/organizations/org-create.jsx";
import OrganizationDetail from "../pages/Admin/organizations/org-details.jsx";
import OrganizationEdit from "../pages/Admin/organizations/org-edit.jsx";

/* Organizations - Departments */
import OrganizationDepartmentsList from "../pages/Admin/organizations/OrganizationDepartmentsList.jsx";
import OrganizationDepartmentCreate from "../pages/Admin/organizations/OrganizationDepartmentCreate.jsx";
import OrganizationDepartmentDetail from "../pages/Admin/organizations/OrganizationDepartmentDetail.jsx";
import OrganizationDepartmentEdit from "../pages/Admin/organizations/OrganizationDepartmentEdit.jsx";

/* Organizations - Filieres */
import OrganizationFilieresList from "../pages/Admin/organizations/OrganizationFilieresList.jsx";
import OrganizationFiliereCreate from "../pages/Admin/organizations/OrganizationFiliereCreate.jsx";
import OrganizationFiliereDetail from "../pages/Admin/organizations/OrganizationFiliereDetail.jsx";
import OrganizationFiliereEdit from "../pages/Admin/organizations/OrganizationFiliereEdit.jsx";

/* Organizations - Demandes */
import OrganizationDemandesList from "../pages/Admin/organizations/OrganizationDemandesList.jsx";
import OrganizationDemandeDetail from "../pages/Admin/organizations/OrganizationDemandeDetail.jsx";
import OrganizationDemandeCreate from "../pages/Admin/organizations/OrganizationDemandeCreate.jsx";
import OrganizationDemandeEdit from "../pages/Admin/organizations/OrganizationDemandeEdit.jsx";

/* Organizations - Documents d'une Demande */
import OrganizationDemandeDocuments from "../pages/Admin/organizations/OrganizationDemandeDocuments.jsx";

/* Organizations - Abonnements */
import OrganizationAbonnementsList from "../pages/Admin/organizations/OrganizationAbonnementsList.jsx";
import OrganizationAbonnementDetail from "../pages/Admin/organizations/OrganizationAbonnementDetail.jsx";
import OrganizationAbonnementCreate from "../pages/Admin/organizations/OrganizationAbonnementCreate.jsx";
import OrganizationAbonnementEdit from "../pages/Admin/organizations/OrganizationAbonnementEdit.jsx";

/* Organizations - Users d'organisation */
import OrganizationUserAdd from "../pages/Admin/organizations/OrganizationUserAdd.jsx";
import FilieresList from "../pages/Admin/Filieres/FilieresList";
import OrganizationUsersList from "../pages/Admin/organizations/OrganizationUsersList.jsx";
import UserDemandesList from "../pages/Admin/Demandes/UserDemandesList";
import UserDemandeEdit from "../pages/Admin/Demandes/UserDemandeEdit";
import UserDemandeDetail from "../pages/Admin/Demandes/UserDemandeDetail";
import UserDemandeCreate from "../pages/Admin/Demandes/UserDemandeCreate";
import DocumentsList from "../pages/Admin/Documents/DocumentsList";
import AdminAbonnementsList from "../pages/Admin/Abonnements/AdminAbonnementsList";
import AdminAbonnementDetails from "../pages/Admin/Abonnements/AdminAbonnementDetails";
import AdminAbonnementCreate from "../pages/Admin/Abonnements/AdminAbonnementCreate";
import AdminAbonnementEdit from "../pages/Admin/Abonnements/AdminAbonnementEdit";
import AdminAbonnementsStats from "../pages/Admin/Abonnements/AdminAbonnementsStats";
import AdminPaymentsList from "../pages/Admin/Payments/AdminPaymentsList";
import AdminPaymentsStats from "../pages/Admin/Payments/AdminPaymentsStats";
import AdminAbonnementRenew from "../pages/Admin/Abonnements/AdminAbonnementRenew";
import AdminTransactionsList from "../pages/Admin/Transactions/AdminTransactionsList";
import AdminTransactionDetails from "../pages/Admin/Transactions/AdminTransactionDetails";
import AdminTransactionCreate from "../pages/Admin/Transactions/AdminTransactionCreate";
import AdminTransactionsStats from "../pages/Admin/Transactions/AdminTransactionsStats";
import AdminContactList from "../pages/Admin/contacts/contact";
import AuditLogManagement from "../pages/Settings/audit-log";
import MailerManagement from "../pages/Settings/mailer";
import SettingsPage from "../pages/Settings/settings";
import OrganizationInviteList from "../pages/Admin/OrganizationInvites/OrganizationInviteList.jsx";
import OrganizationInviteCreate from "../pages/Admin/OrganizationInvites/OrganizationInviteCreate.jsx";
import AdminOrganizationNotificationsList from "../pages/Admin/OrganizationNotifications/AdminOrganizationNotificationsList.jsx";
import AdminOrganizationNotificationDetail from "../pages/Admin/OrganizationNotifications/AdminOrganizationNotificationDetail.jsx";
import OrganizationNotificationsList from "../pages/Admin/organizations/OrganizationNotificationsList.jsx";
import PermissionsList from "../pages/Admin/Permissions/PermissionsList.jsx";
import ApiRoutesList from "../pages/Admin/ApiRoutes/ApiRoutesList.jsx";

export const adminRoutes = (
  <>
    {/* Scope Admin protégé */}
    <Route path="/admin" element={<ProtectedRoute />}>
      {/* Dashboard & profil */}
      <Route index element={<AdminDashboard />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="profile" element={<Profile />} />

      {/* ===================== USERS (globaux) ===================== */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "SUPER_ADMIN"]}
            requiredPermissions={["users.read"]}
          />
        }
      >
        <Route path="users" element={<UserList />} />
        <Route path="users/:id/details" element={<UserDetails />} />
      </Route>
      <Route
        element={
          <ProtectedRoute
              allowedRoles={["ADMIN", "SUPER_ADMIN"]}
            requiredPermissions={["users.manage", "users.create"]}
          />
        }
      >
        <Route path="users/create" element={<UserCreate />} />
        <Route path="users/:id/edit" element={<UserEdit />} />
      </Route>

      {/* ========== DEPARTMENTS & FILIERES (globaux côté admin) ========== */}
      <Route element={<ProtectedRoute requiredPermissions={["departments.read"]} />}>
        <Route path="departments" element={<DepartmentList />} />
        <Route path="departments/:id" element={<DepartmentDetail />} />
        <Route path="departments/:id/filieres" element={<DepartmentFilieresList />} />
      </Route>

      <Route element={<ProtectedRoute requiredPermissions={["departments.manage"]} />}>
        <Route path="departments/create" element={<DepartmentForm mode="create" />} />
        <Route path="departments/:id/edit" element={<DepartmentForm mode="edit" />} />
        <Route path="departments/:id/filieres/create" element={<DepartmentFiliereCreate />} />
        <Route path="filieres/:id/edit" element={<FiliereEdit />} />
        <Route path="filieres" element={<FilieresList />} />
        <Route path="documents" element={<DocumentsList />} />
      </Route>

      {/* ===================== ORGANIZATIONS (CRUD de base) ===================== */}
      <Route element={<ProtectedRoute />}>
        <Route path="organisations" element={<OrganizationList />} />
        <Route path="organisations/create" element={<OrganizationCreate />} />
        <Route path="organisations/:id/edit" element={<OrganizationEdit />} />
        <Route path="organisations/:id/details" element={<OrganizationDetail />} />
      </Route>


      {/* -------- Organizations - Departments -------- */}
      <Route element={<ProtectedRoute requiredPermissions={["departments.read"]} />}>
        <Route path="organisations/:id/departments" element={<OrganizationDepartmentsList />} />
        <Route
          path="organisations/:id/departments/:deptId/details"
          element={<OrganizationDepartmentDetail />}
        />
      </Route>
      <Route element={<ProtectedRoute requiredPermissions={["departments.manage"]} />}>
        <Route
          path="organisations/:id/departments/create"
          element={<OrganizationDepartmentCreate />}
        />
        <Route
          path="organisations/:id/departments/:deptId/edit"
          element={<OrganizationDepartmentEdit />}
        />
      </Route>

      {/* -------- Organizations - Filieres -------- */}
      <Route element={<ProtectedRoute requiredPermissions={["filieres.read"]} />}>
        <Route path="organisations/:id/filieres" element={<OrganizationFilieresList />} />
        <Route
          path="organisations/:id/filieres/:filiereId/details"
          element={<OrganizationFiliereDetail />}
        />
      </Route>
      <Route element={<ProtectedRoute requiredPermissions={["filieres.manage"]} />}>
        <Route
          path="organisations/:id/filieres/create"
          element={<OrganizationFiliereCreate />}
        />
        <Route
          path="organisations/:id/filieres/:filiereId/edit"
          element={<OrganizationFiliereEdit />}
        />
      </Route>

      {/* -------- Organizations - Demandes -------- */}
      <Route element={<ProtectedRoute requiredPermissions={["demandes.read"]} />}>
        <Route path="organisations/:id/demandes" element={<OrganizationDemandesList />} />
        <Route
          path="organisations/:id/demandes/:demandeId/details"
          element={<OrganizationDemandeDetail />}
        />
      </Route>
      <Route element={<ProtectedRoute requiredPermissions={["demandes.manage"]} />}>
        <Route
          path="organisations/:id/demandes/create"
          element={<OrganizationDemandeCreate />}
        />
        <Route
          path="organisations/:id/demandes/:demandeId/edit"
          element={<OrganizationDemandeEdit />}
        />
      </Route>


      {/* -------- Organizations - Abonnements -------- */}
      <Route element={<ProtectedRoute requiredPermissions={["abonnements.read"]} />}>
        <Route
          path="organisations/:id/abonnements"
          element={<OrganizationAbonnementsList />}
        />
        <Route
          path="organisations/:id/abonnements/:abonnementId/details"
          element={<OrganizationAbonnementDetail />}
        />
      </Route>
      <Route element={<ProtectedRoute requiredPermissions={["abonnements.manage"]} />}>
        <Route
          path="organisations/:id/abonnements/create"
          element={<OrganizationAbonnementCreate />}
        />
        <Route
          path="organisations/:id/abonnements/:abonnementId/edit"
          element={<OrganizationAbonnementEdit />}
        />
      </Route>

      {/* -------- Organizations - Users d’organisation -------- */}
      <Route element={<ProtectedRoute requiredPermissions={["users.read"]} />}>
        <Route path="organisations/:id/users" element={<OrganizationUsersList />} />
      </Route>
      <Route element={<ProtectedRoute requiredPermissions={["users.manage"]} />}>
        <Route path="organisations/:id/users/add" element={<OrganizationUserAdd />} />
      </Route>

      {/* -------- Organizations - Invitations -------- */}
      <Route element={<ProtectedRoute requiredPermissions={["invites.read"]} />}>
        <Route path="organization-invites" element={<OrganizationInviteList />} />
      </Route>
      <Route element={<ProtectedRoute requiredPermissions={["invites.manage"]} />}>
        <Route path="organization-invites/create" element={<OrganizationInviteCreate />} />
      </Route>

      {/* -------- Organizations - Notifications -------- */}
      <Route element={<ProtectedRoute requiredPermissions={["notifications.read", "demandes.read"]} />}>
        <Route path="organisations/notifications" element={<AdminOrganizationNotificationsList />} />
        <Route path="organisations/notifications/:id/details" element={<AdminOrganizationNotificationDetail />} />
        <Route path="organisations/:id/notifications" element={<OrganizationNotificationsList />} />
      </Route>

      {/* Route générique pour les détails d'organisation (doit être en dernier) */}
      <Route element={<ProtectedRoute />}>
        <Route path="organisations/:id" element={<OrganizationDetail />} />
      </Route>

      {/* -------- Permissions -------- */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "SUPER_ADMIN"]}
            requiredPermissions={["permissions.read", "permissions.manage"]}
          />
        }
      >
        <Route path="permissions" element={<PermissionsList />} />
      </Route>

      {/* -------- Demandes -------- */}
      <Route element={<ProtectedRoute requiredPermissions={["demandes.read"]} />}>
        <Route path="demandes" element={<UserDemandesList />} />
        <Route path="demandes/:id/details" element={<UserDemandeDetail />} />
        <Route path="demandes/:id/documents" element={<OrganizationDemandeDocuments />} />

      </Route>

      <Route element={<ProtectedRoute requiredPermissions={["demandes.manage"]} />}>
        <Route path="demandes/create" element={<UserDemandeCreate />} />
        <Route path="demandes/:id/edit" element={<UserDemandeEdit />} />
      </Route>

      {/*  Abonnements */}
      <Route element={<ProtectedRoute requiredPermissions={["abonnements.read"]} />}>
        <Route path="abonnements" element={<AdminAbonnementsList />} />
        <Route path="abonnements/:id/details" element={<AdminAbonnementDetails />} />
        <Route path="abonnements/stats" element={<AdminAbonnementsStats />} />
      </Route>
      <Route element={<ProtectedRoute requiredPermissions={["abonnements.manage"]} />}>
        <Route path="abonnements/create" element={<AdminAbonnementCreate />} />
        <Route path="abonnements/:id/edit" element={<AdminAbonnementEdit />} />
        <Route path="abonnements/:id/renew" element={<AdminAbonnementRenew />} />
      </Route>

      {/*  Payments */}
      <Route element={<ProtectedRoute requiredPermissions={["payments.manage"]} />}>
        <Route path="payments" element={<AdminPaymentsList />} />
        <Route path="payments/stats" element={<AdminPaymentsStats />} />
      </Route>

      {/*  Transactions */}
      <Route element={<ProtectedRoute requiredPermissions={["transactions.read"]} />}>
        <Route path="transactions" element={<AdminTransactionsList />} />
        <Route path="transactions/:id/details" element={<AdminTransactionDetails />} />
      </Route>
      <Route element={<ProtectedRoute requiredPermissions={["transactions.manage"]} />}>
        <Route path="transactions/create" element={<AdminTransactionCreate />} />
        <Route path="transactions/stats" element={<AdminTransactionsStats />} />
      </Route>


      <Route element={<ProtectedRoute requiredPermissions={["contacts.manage"]} />}>
        <Route path="contacts" element={<AdminContactList />} />
      </Route>



      <Route element={<ProtectedRoute requiredPermissions={["config.manage"]} />}>
        <Route path="config" element={<SettingsPage />} />
        <Route path="audit-logs" element={<AuditLogManagement />} />
        <Route path="mailer" element={<MailerManagement />} />
        <Route path="api-routes" element={<ApiRoutesList />} />
      </Route>




    </Route>
  </>
);
