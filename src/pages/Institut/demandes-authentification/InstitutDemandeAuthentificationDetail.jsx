"use client";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, Descriptions, Tag, Button, message, Modal, Spin, Alert, Space } from "antd";
import { ArrowLeftOutlined, PlusOutlined, FileTextOutlined, DeleteOutlined } from "@ant-design/icons";
import demandeAuthentificationService from "@/services/demandeAuthentification.service";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { useAuth } from "@/hooks/useAuth";

const statusColors = { EN_ATTENTE: "blue", DOCUMENTS_RECUS: "gold", TRAITEE: "green", ANNULEE: "red" };
const DOC_TYPE_KEYS = ["DIPLOMA", "TRANSCRIPT", "ID_CARD", "BIRTH_CERTIFICATE", "PASSPORT", "CERTIFICATE", "LETTER", "OTHER"];

export default function InstitutDemandeAuthentificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const userOrgId = user?.organization?.id ?? user?.organizationId ?? null;
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openingDoc, setOpeningDoc] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const isAttributedOrg = Boolean(userOrgId && userOrgId === demande?.attributedOrganizationId);
  const [viewingDoc, setViewingDoc] = useState(null); // { url, blobUrl }

  const openDocument = async (urlOriginal) => {
    if (!urlOriginal) return;
    setOpeningDoc(urlOriginal);
    setViewingDoc({ url: urlOriginal, blobUrl: null });
    try {
      const blob = await demandeAuthentificationService.getDocumentFileBlob(urlOriginal);
      const blobUrl = URL.createObjectURL(blob);
      setViewingDoc({ url: urlOriginal, blobUrl });
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("demandesAuthentification.toasts.loadError"));
      setViewingDoc(null);
    } finally {
      setOpeningDoc(null);
    }
  };

  const closeDocumentModal = () => {
    if (viewingDoc?.blobUrl) URL.revokeObjectURL(viewingDoc.blobUrl);
    setViewingDoc(null);
  };

  const handleDeleteDocument = () => {
    if (!id) return;
    Modal.confirm({
      title: t("demandesAuthentification.doc.deleteConfirm"),
      okText: t("demandesAuthentification.doc.deleteDocument"),
      okType: "danger",
      cancelText: t("demandesAuthentification.cancel"),
      onOk: async () => {
        setDeleting(true);
        try {
          await demandeAuthentificationService.deleteDocumentByDemandeId(id);
          message.success(t("demandesAuthentification.doc.deleteSuccess"));
          fetchData();
        } catch (e) {
          message.error(e?.response?.data?.message || e?.message || t("demandesAuthentification.toasts.loadError"));
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await demandeAuthentificationService.getById(id);
      const d = res?.data ?? res;
      setDemande(d?.id ? d : null);
    } catch (e) {
      message.error(e?.message || t("demandesAuthentification.toasts.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, t]);

  if (loading && !demande) {
    return <div className="p-4">{t("demandesAuthentification.loading")}</div>;
  }
  if (!demande) {
    return (
      <div className="p-4">
        {t("demandesAuthentification.notFound")}
        <Link to="/organisations/demandes-authentification" className="ml-2"><Button size="small">{t("demandesAuthentification.backToList")}</Button></Link>
      </div>
    );
  }

  const documentsList = Array.isArray(demande?.documents) ? demande.documents : [];
  const singleDocument = documentsList.length > 0 ? documentsList[0] : null;

  const getTypeLabel = (v) => {
    if (!v) return "—";
    if (DOC_TYPE_KEYS.includes(v)) return t(`demandesAuthentification.documentTypes.${v}`);
    return v;
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="mb-4">
          <Link to="/organisations/demandes-authentification">
            <Button icon={<ArrowLeftOutlined />} type="text">{t("demandesAuthentification.backToList")}</Button>
          </Link>
        </div>
        <Card title={t("demandesAuthentification.detailTitle")}>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label={t("demandesAuthentification.fields.codeADN")}><strong>{demande.codeADN}</strong></Descriptions.Item>
            <Descriptions.Item label={t("demandesAuthentification.fields.objet")}>{demande.objet || "—"}</Descriptions.Item>
            <Descriptions.Item label={t("demandesAuthentification.fields.demandeur")}>
              {demande.user ? [demande.user.firstName, demande.user.lastName].filter(Boolean).join(" ") || demande.user.email : "—"}
            </Descriptions.Item>
            <Descriptions.Item label={t("demandesAuthentification.fields.attributedOrg")}>
              {demande.attributedOrganization?.name ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label={t("demandesAuthentification.fields.status")}>
              <Tag color={statusColors[demande.status] || "default"}>{t(`demandesAuthentification.status.${demande.status}`)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("demandesAuthentification.fields.observation")}>{demande.observation || "—"}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title={t("demandesAuthentification.documentsTitle")} className="mt-4">
          {singleDocument ? (
            <>
              <Descriptions bordered column={1} size="small" className="mb-4">
                <Descriptions.Item label={t("demandesAuthentification.doc.type")}>{getTypeLabel(singleDocument.type)}</Descriptions.Item>
                <Descriptions.Item label={t("demandesAuthentification.doc.mention")}>{singleDocument.mention || "—"}</Descriptions.Item>
                <Descriptions.Item label={t("demandesAuthentification.doc.date")}>
                  {singleDocument.createdAt ? dayjs(singleDocument.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
                </Descriptions.Item>
              </Descriptions>
              <Space>
                <Button
                  type="primary"
                  icon={<FileTextOutlined />}
                  loading={openingDoc === singleDocument.urlOriginal}
                  onClick={() => openDocument(singleDocument.urlOriginal)}
                >
                  {t("demandesAuthentification.doc.viewFile")}
                </Button>
                {isAttributedOrg && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    loading={deleting}
                    onClick={handleDeleteDocument}
                  >
                    {t("demandesAuthentification.doc.deleteDocument")}
                  </Button>
                )}
              </Space>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-4">{t("demandesAuthentification.noDocuments")}</p>
              {isAttributedOrg ? (
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => navigate(`/organisations/code-adn?code=${encodeURIComponent(demande.codeADN || "")}`)}
                >
                  {t("demandesAuthentification.actions.addDocument")}
                </Button>
              ) : (
                <Alert
                  type="info"
                  message={t("demandesAuthentification.onlyAttributedOrgCanAdd")}
                  description={t("demandesAuthentification.viewDocumentsReadOnly")}
                  showIcon
                />
              )}
            </>
          )}
        </Card>

        <Modal
          title={t("demandesAuthentification.doc.viewFile")}
          open={!!viewingDoc}
          onCancel={closeDocumentModal}
          footer={[<Button key="close" onClick={closeDocumentModal}>{t("demandesAuthentification.cancel")}</Button>]}
          width="90vw"
          style={{ top: 24 }}
          destroyOnHidden
        >
          <div style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {viewingDoc?.blobUrl ? (
              <embed
                src={`${viewingDoc.blobUrl}#toolbar=0`}
                type="application/pdf"
                style={{ width: "100%", height: "75vh", border: "none" }}
                title={t("demandesAuthentification.doc.viewFile")}
              />
            ) : (
              <Spin size="large" />
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
