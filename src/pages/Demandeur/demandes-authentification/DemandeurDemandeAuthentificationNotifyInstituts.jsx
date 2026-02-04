"use client";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, Select, Button, message, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import demandeAuthentificationService from "@/services/demandeAuthentification.service";
import organizationService from "@/services/organizationService";
import { useTranslation } from "react-i18next";

export default function DemandeurDemandeAuthentificationNotifyInstituts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [demande, setDemande] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const [demRes, orgRes] = await Promise.all([
          demandeAuthentificationService.getById(id),
          organizationService.list({ limit: 500 }),
        ]);
        setDemande(demRes?.id ? demRes : demRes?.data);
        const list = orgRes?.organizations ?? orgRes?.data?.organizations ?? [];
        setOrganizations(list.filter((o) => ["INSTITUT", "UNIVERSITE", "LYCEE", "COLLEGE"].includes(o.type)));
      } catch (e) {
        message.error(e?.message || t("demandesAuthentification.toasts.loadError"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, t]);

  const onSend = async () => {
    if (!selectedIds.length) {
      message.warning(t("demandesAuthentification.notify.selectAtLeastOne"));
      return;
    }
    setSubmitting(true);
    try {
      await demandeAuthentificationService.notifyInstituts(id, selectedIds);
      message.success(t("demandesAuthentification.notify.success"));
      navigate(`/demandeur/demandes-authentification/${id}`);
    } catch (e) {
      message.error(e?.message || t("demandesAuthentification.notify.error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !demande) {
    return (
      <div className="p-4 flex justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="mb-4">
          <Link to={`/demandeur/demandes-authentification/${id}`}>
            <Button icon={<ArrowLeftOutlined />} type="text">{t("demandesAuthentification.backToList")}</Button>
          </Link>
        </div>
        <Card title={t("demandesAuthentification.notify.title")}>
          <p className="mb-4">{t("demandesAuthentification.notify.description")}</p>
          <p className="mb-2 font-medium">Code ADN : {demande.codeADN}</p>
          <Select
            mode="multiple"
            placeholder={t("demandesAuthentification.notify.placeholder")}
            style={{ width: "100%", maxWidth: 500 }}
            options={organizations.map((o) => ({ value: o.id, label: `${o.name} (${o.type})` }))}
            value={selectedIds}
            onChange={setSelectedIds}
            filterOption={(input, opt) => (opt?.label ?? "").toLowerCase().includes(input.toLowerCase())}
          />
          <div className="mt-4">
            <Button type="primary" onClick={onSend} loading={submitting}>
              {t("demandesAuthentification.notify.send")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
