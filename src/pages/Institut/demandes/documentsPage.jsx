
/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, Table, Tag, Space, Typography, Button, message, Breadcrumb, Modal, Spin } from "antd";
import dayjs from "dayjs";
import demandeService from "@/services/demandeService";
import documentService from "@/services/documentService";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { normalizeDocument } from "@/utils/documentUtils";

const { Title, Text } = Typography;

function fmtDate(v, withTime = false) {
  if (!v) return "—";
  const d = dayjs(v);
  return withTime ? d.format("DD/MM/YYYY HH:mm") : d.format("YYYY");
}

// Corrige les URLs sans "/" après le host
function normalizeUrl(u) { return u; }

function fileNameFromUrl(u) {
  try {
    const url = new URL(normalizeUrl(u));
    const last = url.pathname.split("/").filter(Boolean).pop();
    return last || "—";
  } catch {
    return "—";
  }
}

export default function DemandeDocumentsPage() {
  const { t } = useTranslation();
  const { id } = useParams(); // demandePartageId
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [demande, setDemande] = useState(null);
  const [preview, setPreview] = useState({ open: false, url: "", title: "", loading: false });

  const normalizeItems = (res) => {
    // Supporte: tableau brut | {items: []} | {documents: []}
    const list = Array.isArray(res) ? res : (res?.items ?? res?.documents ?? []);
    if (!Array.isArray(list)) return [];
    return list.map((doc) => {
      // Normaliser le document pour utiliser la nouvelle structure
      const normalized = normalizeDocument(doc);
      return {
        ...normalized,
        // Garder les anciennes propriétés pour compatibilité
        urlOriginal: doc.urlOriginal || normalized.original?.url,
        urlChiffre: doc.urlChiffre || normalized.original?.urlChiffre,
        urlTraduit: doc.urlTraduit || normalized.traduit?.url,
        urlChiffreTraduit: doc.urlChiffreTraduit || normalized.traduit?.urlChiffre,
        _urlOriginal: normalizeUrl(doc.urlOriginal || normalized.original?.url),
        _urlChiffre: normalizeUrl(doc.urlChiffre || normalized.original?.urlChiffre),
        _filename: fileNameFromUrl(doc.urlOriginal || normalized.original?.url),
      };
    });
  };

  const fetchDemande = async () => {
    setLoading(true);
    try {
      const res = await demandeService.getById(id);
      const d = res?.demande ?? res;
      setDemande(d);
    } catch (e) {
      message.error(e?.message || t("demandeDocuments.toasts.loadDemandeError"));
    } finally {
      setLoading(false);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await demandeService.listDocuments(id);
      setRows(normalizeItems(res));
    } catch (e) {
      message.error(e?.message || t("demandeDocuments.toasts.loadDocsError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    fetchDemande();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openUrl = async (doc, type = "original") => {
    try {
      if (!doc?.id) {
        message.warning(t("demandeDocuments.toasts.urlMissing"));
        return;
      }
      setPreview({ open: true, url: "", title: "", loading: true });
      
      // Utiliser getContent pour obtenir le blob avec authentification
      const blob = await documentService.getContent(doc.id, { type, display: true });
      const url = URL.createObjectURL(blob);
      
      const title = type === "original" 
        ? t("demandeDocuments.preview.titleOriginal", { id: doc.id })
        : t("demandeDocuments.preview.titleTranslated", { id: doc.id });
      
      setPreview({ open: true, url, title, loading: false });
    } catch (error) {
      setPreview({ open: false, url: "", title: "", loading: false });
      if (error.response?.status === 401) {
        message.error(t("demandeDocuments.toasts.sessionExpired") || "Session expirée. Veuillez vous reconnecter.");
      } else if (error.response?.status === 403) {
        message.error(t("demandeDocuments.toasts.accessDenied") || "Vous n'avez pas accès à ce document.");
      } else {
        message.error(error?.response?.data?.message || error?.message || t("demandeDocuments.toasts.openError"));
      }
    }
  };

  const handleClosePreview = () => {
    if (preview.url) {
      URL.revokeObjectURL(preview.url);
    }
    setPreview({ open: false, url: "", title: "", loading: false });
  };

  const columns = useMemo(() => ([
    {
      title: t("demandeDocuments.table.institute"),
      key: "owner",
      width: 260,
      render: (_v, r) => {
        const org = r.ownerOrg || {};
        return (
          <Space size={6} wrap>
            <span>{org.name || t("demandeDocuments.table.dash")}</span>
            {org.type ? <Tag>{org.type}</Tag> : null}
            {org.slug ? <Tag color="default">{org.slug}</Tag> : null}
          </Space>
        );
      },
    },
    { title: t("demandeDocuments.table.type"), dataIndex: "type", width: 140, render: (v) => v || t("demandeDocuments.table.dash") },
    { title: t("demandeDocuments.table.mention"), dataIndex: "mention", render: (v) => v || t("demandeDocuments.table.dash") },
    { title: t("demandeDocuments.table.obtainedAt"), dataIndex: "dateObtention", width: 160, render: (v) => fmtDate(v) },
    {
      title: t("demandeDocuments.table.doc"),
      key: "openOriginal",
      width: 120,
      render: (_v, r) =>
        r.id ? (
          <Button size="small" onClick={() => openUrl(r, "original")}>{t("demandeDocuments.buttons.open")}</Button>
        ) : (
          <Tag>{t("demandeDocuments.table.dash")}</Tag>
        ),
    },
    {
      title: t("demandeDocuments.table.translated"),
      key: "openTranslated",
      width: 120,
      render: (_v, r) =>
        r.id && r.estTraduit ? (
          <Button size="small" onClick={() => openUrl(r, "traduit")}>{t("demandeDocuments.buttons.open")}</Button>
        ) : (
          <Tag>{t("demandeDocuments.table.dash")}</Tag>
        ),
    },
  ]), [t]);

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              {t("demandeDocuments.buttons.back")}
            </Button>
          </Space>

          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("demandeDocuments.breadcrumbs.dashboard")}</Link> },
              { title: <Link to="/organisations/demandes">{t("demandeDocuments.breadcrumbs.demandes")}</Link> },
              { title: <Link to={`/organisations/demandes/${id}/details`}>{t("demandeDocuments.breadcrumbs.details")}</Link> },
              { title: t("demandeDocuments.breadcrumbs.docs") }
            ]}
          />
        </div>

        <div className="p-2 md:p-4">
          <Space align="center" className="mb-3" wrap>
            <Title level={3} className="!mb-0">
              {t("demandeDocuments.title")}{" "}
              <Text copyable={{ text: demande?.code }}>
                <Tag>{demande?.code}</Tag>
              </Text>
            </Title>
          </Space>

          <Card>
            <Table
              rowKey={(r) => r.id}
              loading={loading}
              columns={columns}
              dataSource={rows}
              scroll={{ x: true }}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              locale={{ emptyText: t("demandeDocuments.table.empty") }}
            />
          </Card>
        </div>
      </div>

      {/* Modal Preview PDF */}
      <Modal
        open={preview.open}
        title={preview.title || t("demandeDocuments.preview.title")}
        onCancel={handleClosePreview}
        footer={
          <Space>
            {preview.url && (
              <a href={preview.url} target="_blank" rel="noreferrer">
                <Button type="default">{t("demandeDocuments.preview.openInNewTab")}</Button>
              </a>
            )}
            <Button type="primary" onClick={handleClosePreview}>
              {t("demandeDocuments.preview.close")}
            </Button>
          </Space>
        }
        width="95vw"
        style={{ top: 20, paddingBottom: 0 }}
        bodyStyle={{ height: "calc(95vh - 110px)", padding: 0 }}
        destroyOnClose
      >
        {preview.loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <Spin size="large" />
          </div>
        ) : preview.url ? (
          <iframe
            src={preview.url}
            title="aperçu-pdf"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        ) : (
          <div style={{ padding: 16 }}>
            <Text type="secondary">{t("demandeDocuments.preview.noContent")}</Text>
          </div>
        )}
      </Modal>
    </div>
  );
}
