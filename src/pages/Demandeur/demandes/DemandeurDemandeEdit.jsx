"use client";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { useTranslation } from "react-i18next";

/**
 * Page d'édition de candidature : redirige vers le formulaire de création
 * avec l'ID de la demande en state pour préremplir et appeler update au submit.
 */
export default function DemandeurDemandeEdit() {
  const { t } = useTranslation();
  const { demandeId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (demandeId) {
      navigate("/demandeur/mes-demandes/create", {
        replace: true,
        state: { editDemandeId: demandeId },
      });
    }
  }, [demandeId, navigate]);

  return (
    <div className="container-fluid relative px-2 sm:px-3 overflow-x-hidden max-w-full">
      <div className="layout-specing py-4 sm:py-6 flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Spin size="large" />
          <p className="text-sm sm:text-base text-gray-500">
            {t("demandeDetail.actions.editRedirect", "Redirection vers le formulaire de modification...")}
          </p>
        </div>
      </div>
    </div>
  );
}
