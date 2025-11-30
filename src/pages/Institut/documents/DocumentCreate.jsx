/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, Typography, Breadcrumb, Button } from "antd";
import DemandeAddDocumentModal from "../../../components/DemandeAddDocumentModal";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

export default function DemandeDocumentCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const demandeId = searchParams.get("demandeId") || null;

  const [open, setOpen] = useState(true);

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("institutDocuments.create.pageTitle")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("institutDocuments.create.breadcrumbs.dashboard")}</Link> },
              { title: <Link to="/organisations/demandes">{t("institutDocuments.create.breadcrumbs.demandes")}</Link> },
              { title: t("institutDocuments.create.breadcrumbs.add") },
            ]}
          />
        </div>

        <div className="p-2 md:p-4">
          <Card>
            <Title level={3} className="!mb-2">
              {demandeId ? t("institutDocuments.create.title") : t("institutDocuments.create.titleWithCode")}
            </Title>
            <p className="text-gray-500">
              {t("institutDocuments.create.description")}
            </p>
            <div className="mt-4" />
            <Button onClick={() => navigate(-1)}>{t("institutDocuments.create.back")}</Button>
          </Card>
        </div>
      </div>

      <DemandeAddDocumentModal
        open={open}
        onClose={() => {
          setOpen(false);
          navigate(-1);
        }}
        demandeId={demandeId || undefined}
        onSuccess={() => {
          setOpen(false);
          if (demandeId) navigate(`/organisations/demandes/${demandeId}`);
          else navigate("/organisations/demandes");
        }}
      />
    </div>
  );
}
