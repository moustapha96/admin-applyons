
/* routes/AppRoutes.jsx */
import { Routes, Route } from "react-router-dom";
import { publicRoutes } from "./PublicRoutes";
import { adminRoutes } from "./AdminRoutes";
import { organizationRoutes } from "./OrganizationRoutes";
import { demandeurRoutes } from "./DemandeurRoutes";
import { traducteurRoutes } from "./TraducteurRoutes";
import ErrorPage from "../pages/error";
import ProfileRedirect from "./ProfileRoutes";
import { ProtectedRoute } from "./ProtectedRoute";
import RoleBasedHomeRedirect from "./RoleBasedHomeRedirect";

export const AppRoutes = () => (
  <Routes>
    {publicRoutes}
    {adminRoutes}
    {organizationRoutes}
    {demandeurRoutes}
    {traducteurRoutes}

     <Route element={<ProtectedRoute />}>
      <Route index element={<RoleBasedHomeRedirect />} />
      <Route path="/profile" element={<ProfileRedirect />} />
      <Route path="*" element={<ErrorPage />} />
    </Route>

  </Routes>
);
