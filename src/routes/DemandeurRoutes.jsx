/* routes/DemandeurRoutes.jsx */
import { Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

import DemandeurDemandesList from "../pages/Demandeur/demandes/DemandeurDemandesList";
import DemandeurDemandeDetail from "../pages/Demandeur/demandes/DemandeurDemandeDetail";
import DemandeurDemandeEdit from "../pages/Demandeur/demandes/DemandeurDemandeEdit";
import DemandeurDemandeCreate from "../pages/Demandeur/demandes/DemandeurDemandeCreate";
import DemandeurDemandePaymentPage from "../pages/Demandeur/demandes/DemandeurDemandePaymentPage";
import DemandeurDemandeDocuments from "../pages/Demandeur/demandes/DemandeurDemandeDocuments";
import DemandeurUserProfile from "../pages/Demandeur/User-Profile/profile";
import DemandeurDashboard from "../pages/Demandeur/Dashboard/index";
import DemandeurOrganisationDetail from "../pages/Demandeur/Organisation/DetailOragisation";

export const demandeurRoutes = (
  <>
    <Route
      path="/demandeur"
      element={<ProtectedRoute allowedRoles={["DEMANDEUR"]} />}
    >
      {/* ✅ chemins RELATIFS ici */}
      <Route index element={<DemandeurDashboard />} />
      <Route path="dashboard" element={<DemandeurDashboard />} />
      <Route path="profile" element={<DemandeurUserProfile />} />

      {/* demandes */}
      <Route path="mes-demandes" element={<DemandeurDemandesList />} />
      <Route path="mes-demandes/create" element={<DemandeurDemandeCreate />} />
      <Route path="mes-demandes/:demandeId/details" element={<DemandeurDemandeDetail />} />
      <Route path="mes-demandes/:demandeId/edit" element={<DemandeurDemandeEdit />} />
      <Route path="mes-demandes/:demandeId/documents" element={<DemandeurDemandeDocuments />} />

      <Route path="mes-demandes/:demandeId/payer" element={<DemandeurDemandePaymentPage />} />

      {/* DemandeurOrganisationDetail */}
      <Route path="organisation/:id/details" element={<DemandeurOrganisationDetail />} />
    </Route>
  </>
);
