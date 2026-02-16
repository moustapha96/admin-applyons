"use client";
import { useParams } from "react-router-dom";
import DemandeurDemandeCreate from "./DemandeurDemandeCreate";

/**
 * Page dédiée d'édition de candidature : affiche le formulaire de modification
 * à l'URL /demandeur/mes-demandes/:demandeId/edit. Les informations peuvent être
 * modifiées sans nouveau paiement.
 */
export default function DemandeurDemandeEdit() {
  const { demandeId } = useParams();
  return <DemandeurDemandeCreate editDemandeIdFromRoute={demandeId} />;
}
