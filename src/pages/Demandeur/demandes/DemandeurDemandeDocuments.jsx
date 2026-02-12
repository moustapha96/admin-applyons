
"use client";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card, Table, Tag,  Button, message,
  Breadcrumb, Tabs, Descriptions, Divider, Modal, Space, Typography, Spin
} from "antd";
import dayjs from "dayjs";
import documentService from "@/services/documentService";
import demandeService from "@/services/demandeService";
import { useTranslation } from "react-i18next";
import { buildImageUrl } from "@/utils/imageUtils";
import { hasTranslation, normalizeDocument } from "@/utils/documentUtils";

const { Text } = Typography;


const statusColor = (s) =>
  s === "VALIDATED" ? "green" :
  s === "REJECTED" ? "red" :
  s === "IN_PROGRESS" ? "gold" : "blue";

export default function DemandeurDemandeDocuments() {
  const { t, i18n } = useTranslation();
  const { demandeId } = useParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [demande, setDemande] = useState(null);
  
  // Modal preview PDF
  const [preview, setPreview] = useState({ open: false, url: "", title: "" });
  
  // Cleanup URL when preview closes
  useEffect(() => {
    return () => {
      if (preview.url && preview.url.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview.url]);

  useEffect(() => {
    (async () => {
      try {
        const res = await demandeService.getById(demandeId);
        setDemande(res?.demande || null);
      } catch (e) {
        message.error(e?.message || t("demandeDocuments.toasts.loadDemandeError"));
      }
    })();
  }, [demandeId, t]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await documentService.listByDemande(demandeId);
      const docs = res || [];
      // Normaliser les documents pour utiliser la nouvelle structure
      setRows(docs.map(doc => normalizeDocument(doc)));
    } catch (e) {
      message.error(e?.message || t("demandeDocuments.toasts.loadDocsError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [demandeId]);

  const openDoc = async (doc, type = "original") => {
    try {
      // Pour les traductions, vérifier d'abord si le document a vraiment une traduction disponible
      if (type === "traduit") {
        try {
          const info = await documentService.getInfo(doc.id);
          const docInfo = info?.document || info;
          const hasTranslated = docInfo?.traduit?.hasFile || docInfo?.estTraduit;
          
          if (!hasTranslated) {
            message.warning(t("demandeDocuments.toasts.translationNotReady") || "La traduction n'est pas encore disponible. Veuillez rafraîchir la page.");
            return;
          }
        } catch (infoError) {
          console.warn("Impossible de vérifier les infos du document:", infoError);
          // Continuer quand même, peut-être que le fichier existe
        }
      }
      
      // Utiliser getContent pour obtenir le blob avec authentification
      const blob = await documentService.getContent(doc.id, { type, display: true });
      const url = URL.createObjectURL(blob);
      setPreview({
        open: true,
        url: url,
        title: type === "traduit" 
          ? t("demandeDocuments.preview.titleTranslated", { id: doc.id }) 
          : t("demandeDocuments.preview.titleOriginal", { id: doc.id }),
      });
    } catch (error) {
      if (error.response?.status === 401) {
        message.error(t("demandeDocuments.toasts.sessionExpired") || "Session expirée. Veuillez vous reconnecter.");
      } else if (error.response?.status === 403) {
        message.error(t("demandeDocuments.toasts.accessDenied") || "Vous n'avez pas accès à ce document.");
      } else if (error.response?.status === 404) {
        if (type === "traduit") {
          message.error(t("demandeDocuments.toasts.translationNotFound") || "Le fichier traduit n'est pas encore disponible. Le fichier peut être en cours de traitement. Veuillez rafraîchir la page dans quelques instants.");
        } else {
          message.error(t("demandeDocuments.toasts.noFileAvailable") || "Le fichier n'est pas disponible.");
        }
      } else {
        message.error(error?.response?.data?.message || error?.message || t("demandeDocuments.toasts.openError"));
      }
    }
  };

  const fmtDateTime = (v) =>
    v ? dayjs(v).locale(i18n.language || "fr").format("DD/MM/YYYY HH:mm") : t("demandeDocuments.common.na");

  const columns = [
    {
      title: t("demandeDocuments.columns.ownerOrg"),
      dataIndex: "ownerOrg",
      render: (v) => v?.name || t("demandeDocuments.common.na"),
      width: 220
    },
    { title: t("demandeDocuments.columns.mention"), dataIndex: "mention" },
    {
      title: t("demandeDocuments.columns.type"),
      dataIndex: "type",
      render: (v) => (v && String(v).toUpperCase() === "LETTRE_ACCEPTATION"
        ? t("demandeDocuments.types.lettreAcceptation")
        : (v || t("demandeDocuments.common.na"))),
    },
    {
      title: t("demandeDocuments.columns.createdAt"),
      dataIndex: "createdAt",
      render: (v) => fmtDateTime(v),
      width: 180
    },
   
    {
      title: t("demandeDocuments.columns.original"),
      dataIndex: "urlOriginal",
      render: (v, r) =>
        v ? (
          <Button size="small" onClick={() => openDoc(r, "original")}>
            {t("demandeDocuments.actions.open")}
          </Button>
        ) : (
          <Tag>{t("demandeDocuments.common.na")}</Tag>
        ),
      width: 120
    },
    {
      title: t("demandeDocuments.columns.translated"),
      dataIndex: "urlTraduit",
      render: (v, r) =>
        hasTranslation(r) ? (
          <Button size="small" onClick={() => openDoc(r, "traduit")}>
            {t("demandeDocuments.actions.open")}
          </Button>
        ) : (
          <Tag>{t("demandeDocuments.common.na")}</Tag>
        ),
      width: 120
    }
  ];

  // Sections info de la demande
  const renderDemandeInfo = () => (
    <Card className="overflow-hidden">
      <Descriptions title={t("demandeDocuments.info.general")} bordered size="small" column={{ xs: 1, sm: 2 }}>
        <Descriptions.Item label={t("demandeDocuments.fields.code")}>
          <span className="break-words">{demande?.code || t("demandeDocuments.common.na")}</span>
        </Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.date")}>{fmtDateTime(demande?.dateDemande)}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.status")}>
          {demande?.status ? <Tag color={statusColor(demande.status)}>{t(`demandeurDemandes.status.${demande.status}`)}</Tag> : t("demandeDocuments.common.na")}
        </Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.periode")}>
          {demande?.periode ? t(`demandeurDemandes.periods.${demande.periode}`) : t("demandeDocuments.common.na")}
        </Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.year")}>{demande?.year || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.observation")}>
          <span className="break-words">{demande?.observation || t("demandeDocuments.common.na")}</span>
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions title={t("demandeDocuments.info.academic")} bordered size="small" column={{ xs: 1, sm: 2 }}>
        <Descriptions.Item label={t("demandeDocuments.fields.serie")}>{demande?.serie || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.niveau")}>{demande?.niveau || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.mention")}>{demande?.mention || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.schoolYear")}>{demande?.annee || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.countryOfSchool")}>{demande?.countryOfSchool || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.secondarySchoolName")}>{demande?.secondarySchoolName || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.graduationDate")}>
          {demande?.graduationDate ? dayjs(demande.graduationDate).format("DD/MM/YYYY") : t("demandeDocuments.common.na")}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions title={t("demandeDocuments.info.personal")} bordered size="small" column={{ xs: 1, sm: 2 }}>
        <Descriptions.Item label={t("demandeDocuments.fields.dob")}>
          {demande?.dob ? dayjs(demande.dob).format("DD/MM/YYYY") : t("demandeDocuments.common.na")}
        </Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.citizenship")}>{demande?.citizenship || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.passport")}>{demande?.passport || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.isEnglishFirstLanguage")}>
          {demande?.isEnglishFirstLanguage ? t("demandeDocuments.common.yes") : t("demandeDocuments.common.no")}
        </Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.testScores")}>{demande?.testScores || t("demandeDocuments.common.na")}</Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions title={t("demandeDocuments.info.finance")} bordered size="small" column={{ xs: 1, sm: 2 }}>
        <Descriptions.Item label={t("demandeDocuments.fields.willApplyForFinancialAid")}>
          {demande?.willApplyForFinancialAid ? t("demandeDocuments.common.yes") : t("demandeDocuments.common.no")}
        </Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.hasExternalSponsorship")}>
          {demande?.hasExternalSponsorship ? t("demandeDocuments.common.yes") : t("demandeDocuments.common.no")}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions title={t("demandeDocuments.info.visa")} bordered size="small" column={{ xs: 1, sm: 2 }}>
        <Descriptions.Item label={t("demandeDocuments.fields.visaType")}>{demande?.visaType || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.hasPreviouslyStudiedInUS")}>
          {demande?.hasPreviouslyStudiedInUS ? t("demandeDocuments.common.yes") : t("demandeDocuments.common.no")}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions title={t("demandeDocuments.info.orgs")} bordered size="small" column={{ xs: 1, sm: 2 }}>
        <Descriptions.Item label={t("demandeDocuments.fields.targetOrg")}>{demande?.targetOrg?.name || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.assignedOrg")}>{demande?.assignedOrg?.name || t("demandeDocuments.common.na")}</Descriptions.Item>
      </Descriptions>
    </Card>
  );

  return (
    <div className="container-fluid relative px-2 sm:px-3 overflow-x-hidden max-w-full">
      <div className="layout-specing py-4 sm:py-6">
        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
          <h5 className="text-base sm:text-lg font-semibold order-2 sm:order-1">{t("demandeDocuments.title")}</h5>
          <Breadcrumb
            className="order-1 sm:order-2"
            items={[
              { title: <Link to="/demandeur/dashboard">{t("demandeDocuments.breadcrumb.dashboard")}</Link> },
              { title: <Link to={`/demandeur/mes-demandes/${demandeId}/details`}>{t("demandeDocuments.breadcrumb.detail")}</Link> },
              { title: <span className="break-words">{t("demandeDocuments.breadcrumb.documents")}</span> },
            ]}
          />
        </div>

        <Tabs
          defaultActiveKey="1"
          className="demande-documents-tabs"
          items={[
            {
              key: "1",
              label: t("demandeDocuments.tabs.documents"),
              children: (
                <Card className="overflow-hidden">
                  <Table
                    rowKey={(r) => r.id}
                    loading={loading}
                    columns={columns}
                    dataSource={rows}
                    scroll={{ x: "max-content" }}
                    size="small"
                  />
                </Card>
              ),
            },
            {
              key: "2",
              label: t("demandeDocuments.tabs.info"),
              children: renderDemandeInfo(),
            },
          ]}
        />
      </div>

      {/* Modal Preview PDF */}
      <Modal
        open={preview.open}
        title={preview.title || t("demandeDocuments.preview.title")}
        onCancel={() => {
          if (preview.url && preview.url.startsWith('blob:')) {
            URL.revokeObjectURL(preview.url);
          }
          setPreview({ open: false, url: "", title: "" });
        }}
        footer={
          <Space wrap size="small">
            {preview.url && (
              <a href={preview.url} target="_blank" rel="noreferrer">
                <Button type="default" className="w-full sm:w-auto">{t("demandeDocuments.preview.openInNewTab")}</Button>
              </a>
            )}
            <Button type="primary" className="w-full sm:w-auto" onClick={() => {
              if (preview.url && preview.url.startsWith('blob:')) {
                URL.revokeObjectURL(preview.url);
              }
              setPreview({ open: false, url: "", title: "" });
            }}>
              {t("demandeDocuments.preview.close")}
            </Button>
          </Space>
        }
        width="95vw"
        style={{ top: 20, paddingBottom: 0, maxWidth: "1200px" }}
        styles={{ body: { height: "calc(95vh - 110px)", padding: 0 } }}
        className="preview-modal-responsive"
        destroyOnHidden
      >
        {preview.url ? (
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
