/* routes/TraducteurRoutes.jsx */
import { Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import OrganizationDetails from "../pages/Traducteur/Organization/OrganizationDetails";
import TranslatorDemandesList from "../pages/Traducteur/Demandes/TranslatorDemandesList";
import TranslatorDemandeDetails from "../pages/Traducteur/Demandes/TranslatorDemandeDetails";
import TranslatorDemandeDocuments from "../pages/Traducteur/Demandes/TranslatorDemandeDocuments";
import UserListTraducteur from "../pages/Traducteur/Users/UserListTraducteur";
import UserCreateTraducteur from "../pages/Traducteur/Users/UserCreateTraducteur";
import TraducteurUserProfile from "../pages/Traducteur/User-Profile/profile";
import DossierATraiterTraducteur from "../pages/Institut/dossier/DossierATraiter";
import UserDetailTraducteur from "../pages/Traducteur/Users/UserDetailTraducteur";
import UserEditTraducteur from "../pages/Traducteur/Users/UserEditTraducteur";
import TraducteurDashboard from "../pages/Traducteur/Dashboard";
import TraducteurDemandeurDetails from "../pages/Traducteur/Demandeur/demandeur-details";

export const traducteurRoutes = (
  <>
    <Route
      path="/traducteur"
      element={<ProtectedRoute allowedRoles={["TRADUCTEUR"]} />}
    >
      {/* ✅ relatifs */}
      <Route path="dashboard" element={<TraducteurDashboard />} />
            
      <Route path="profile" element={<TraducteurUserProfile />} />

      {/* lecture organisations (exemple) */}
      <Route element={<ProtectedRoute requiredPermissions={["organizations.read"]} />}>
        <Route path="organizations" element={<OrganizationDetails />} />
      </Route>

      {/* Demandes assignées */}
      <Route path="demandes" element={<TranslatorDemandesList />} />
      <Route path="demandes/:id" element={<TranslatorDemandeDetails />} />
      <Route path="demandes/:demandeId/documents" element={<TranslatorDemandeDocuments />} />

      {/* Users */}
      <Route path="users" element={<UserListTraducteur />} />
      <Route path="users/create" element={<UserCreateTraducteur />} />
      <Route path="users/:id/details" element={<UserDetailTraducteur />} />
      <Route path="users/:id/edit" element={<UserEditTraducteur />} />

       <Route path="dossiers-a-traiter" element={<DossierATraiterTraducteur />} />
       {/*  */}
       <Route path="demandeur/:id/details" element={<TraducteurDemandeurDetails />} />


    </Route>
  </>
);
