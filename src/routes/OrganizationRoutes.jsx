/* routes/OrganizationRoutes.jsx */
import { Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import InstitutDashboard from "../pages/Institut/Dashboard/InstitutDashboard.jsx";
import DemandeDocumentsPage from "../pages/Institut/demandes/DocumentsPage.jsx";
import UserListInstitut from "../pages/Institut/Users/UserListInstitut.jsx";
import UserCreateInstitut from "../pages/Institut/Users/UserCreateInstitut.jsx";
import UserDetailInstitut from "../pages/Institut/Users/UserDetailInstitut.jsx";
import UserEditInstitut from "../pages/Institut/Users/UserEditInstitut.jsx";
import DepartmentListInstitut from "../pages/Institut/Departments/DepartmentListInstitut.jsx";
import DepartmentCreateInstitut from "../pages/Institut/Departments/DepartmentCreateInstitut.jsx";
import DepartmentDetailInstitut from "../pages/Institut/Departments/DepartmentDetailInstitut.jsx";
import DepartmentEditInstitut from "../pages/Institut/Departments/DepartmentEditInstitut.jsx";
import FiliereListInstitut from "../pages/Institut/Filieres/FiliereListInstitut.jsx";
import FiliereCreateInstitut from "../pages/Institut/Filieres/FiliereCreateInstitut.jsx";
import FiliereDetailInstitut from "../pages/Institut/Filieres/FiliereDetailInstitut.jsx";
import FiliereEditInstitut from "../pages/Institut/Filieres/FiliereEditInstitut.jsx";
import InstitutUserProfile from "../pages/Institut/User-Profile/profile.jsx";
import InstitutDemandesList from "../pages/Institut/demandes/InstitutDemandesList.jsx";
import DocumentCreate from "../pages/Institut/documents/DocumentCreate.jsx";
import DemandeDocumentCreate from "../pages/Institut/documents/DocumentCreate.jsx";
import InstitutDemandeDetails from "../pages/Institut/demandes/InstitutDemandeDetails.jsx";
import DemandeurDetails from "../pages/Institut/demandes/demandeurDetail.jsx";
import AbonnementInstitutSouscription from "../pages/Institut/abonnement/InstitutAbonnementSouscription.jsx";
import InstitutAbonnementsListe from "../pages/Institut/abonnement/InstitutAbonnementsListe.jsx";
import DemandeDocumentAdd from "../pages/Institut/demandes/DemandeDocumentAdd.jsx";

export const organizationRoutes = (
  <>
    <Route path="/organisations" element={<ProtectedRoute />}>
      
      <Route index element={<InstitutDashboard />} />
      <Route path="dashboard" element={<InstitutDashboard />} />
      <Route path="profile" element={<InstitutUserProfile />} />

      <Route path=":orgId/abonnement" element={<AbonnementInstitutSouscription />} />
      <Route path="abonnements" element={<InstitutAbonnementsListe />} />

      <Route path="demandes" element={<InstitutDemandesList />} />
      <Route path="demandes/:id/details" element={<InstitutDemandeDetails />} />
      <Route path="demandes/:id/documents" element={<DemandeDocumentsPage />} />
      <Route path="demandes/:id/documents/add" element={<DemandeDocumentCreate />} />
      <Route path="demandes/ajoute-document" element={<DemandeDocumentAdd />} />

      {/* Documents génériques (rattachement par code de demande ou ?demandeId=) */}
      <Route path="documents/add" element={<DocumentCreate />} />

      <Route path="users" element={<UserListInstitut />} />
      <Route path="users/create" element={<UserCreateInstitut />} />
      <Route path="users/:id/details" element={<UserDetailInstitut />} />
      <Route path="users/:id/edit" element={<UserEditInstitut />} />

      <Route path="departements" element={<DepartmentListInstitut />} />
      <Route path="departements/create" element={<DepartmentCreateInstitut />} />
      <Route path="departements/:id" element={<DepartmentDetailInstitut />} />
      <Route path="departements/:id/edit" element={<DepartmentEditInstitut />} />

      <Route path="filieres" element={<FiliereListInstitut />} />
      <Route path="filieres/create" element={<FiliereCreateInstitut />} />
      <Route path="filieres/:id" element={<FiliereDetailInstitut />} />
      <Route path="filieres/:id/edit" element={<FiliereEditInstitut />} />


      <Route path="demandeur/:id/details" element={<DemandeurDetails />} />


      
    </Route>
  </>
);
