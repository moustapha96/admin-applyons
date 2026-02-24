"use client";
import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Card, Descriptions, Tag, Button, message, Space, Alert, Modal, Spin } from "antd";
import { ArrowLeftOutlined, CopyOutlined, DollarOutlined, FileTextOutlined } from "@ant-design/icons";
import demandeAuthentificationService from "@/services/demandeAuthentification.service";
import paymentService from "@/services/paymentService";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const statusColors = { EN_ATTENTE: "blue", DOCUMENTS_RECUS: "gold", TRAITEE: "green", ANNULEE: "red" };

export default function DemandeurDemandeAuthentificationDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { t } = useTranslation();
  const [demande, setDemande] = useState(null);
  const justCreated = location.state?.justCreated;
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
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
    })();
  }, [id, t]);

  useEffect(() => {
    if (!id || !demande) return;
    (async () => {
      try {
        const res = await paymentService.getForDemandeAuthentification(id);
        const data = res?.data ?? res;
        setPaymentInfo(data);
      } catch {
        setPaymentInfo(null);
      }
    })();
  }, [id, demande?.id]);

  const copyCode = () => {
    if (!demande?.codeADN) return;
    navigator.clipboard?.writeText(demande.codeADN).then(() => message.success(t("demandesAuthentification.copied")));
  };

  const [openingDoc, setOpeningDoc] = useState(null);
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

  if (loading || !demande) {
    return <div className="p-4">{loading ? t("demandesAuthentification.loading") : t("demandesAuthentification.notFound")}</div>;
  }

  const documentsList = Array.isArray(demande?.documents) ? demande.documents : [];
  const singleDocument = documentsList.length > 0 ? documentsList[0] : null;

  const docTypeKeys = ["DIPLOMA", "TRANSCRIPT", "ID_CARD", "BIRTH_CERTIFICATE", "PASSPORT", "CERTIFICATE", "LETTER", "OTHER"];
  const getTypeLabel = (v) => {
    if (!v) return "—";
    if (docTypeKeys.includes(v)) return t(`demandesAuthentification.documentTypes.${v}`);
    return v;
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="mb-4">
          <Link to="/demandeur/demandes-authentification">
            <Button icon={<ArrowLeftOutlined />} type="text">{t("demandesAuthentification.backToList")}</Button>
          </Link>
        </div>
        {justCreated && (
          <Alert
            type="success"
            showIcon
            message={t("demandesAuthentification.justCreatedMessage")}
            description={
              <Space>
                <strong>{demande.codeADN}</strong>
                <Button size="small" icon={<CopyOutlined />} onClick={copyCode}>{t("demandesAuthentification.copyCode")}</Button>
              </Space>
            }
            className="mb-4"
          />
        )}
        <Card title={t("demandesAuthentification.detailTitle")} loading={loading}>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label={t("demandesAuthentification.fields.codeADN")}>
              <Space>
                <strong>{demande.codeADN}</strong>
                <Button type="text" size="small" icon={<CopyOutlined />} onClick={copyCode} />
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t("demandesAuthentification.fields.objet")}>{demande.objet || "—"}</Descriptions.Item>
            <Descriptions.Item label={t("demandesAuthentification.fields.attributedOrg")}>
              <div>
                {demande.attributedOrganization ? (
                  <>
                    <div>{demande.attributedOrganization.name}</div>
                    {demande.attributedOrganization.email && (
                      <div className="text-gray-600 text-sm mt-0.5">
                        <a href={`mailto:${demande.attributedOrganization.email}`}>{demande.attributedOrganization.email}</a>
                      </div>
                    )}
                  </>
                ) : (() => {
                  const pending = Array.isArray(demande.pendingInvitations) ? demande.pendingInvitations : [];
                  const first = pending[0];
                  if (!first) return "—";
                  const displayName = first.organization?.name || first.name || first.email;
                  const displayEmail = first.organization?.email || first.email;
                  return (
                    <>
                      <div>{displayName}</div>
                      {displayEmail && (
                        <div className="text-gray-600 text-sm mt-0.5">
                          <a href={`mailto:${displayEmail}`}>{displayEmail}</a>
                        </div>
                      )}
                      {first.status === "PENDING" && (
                        <div className="text-xs text-amber-600 mt-0.5">{t("demandesAuthentification.invitedInstitutPending")}</div>
                      )}
                    </>
                  );
                })()}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label={t("demandesAuthentification.fields.status")}>
              <Tag color={statusColors[demande.status] || "default"}>{t(`demandesAuthentification.status.${demande.status}`)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("demandesAuthentification.fields.observation")}>{demande.observation || "—"}</Descriptions.Item>
            <Descriptions.Item label={t("demandesAuthentification.fields.createdAt")}>
              {demande.createdAt ? dayjs(demande.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Paiement */}
        <Card title={t("demandesAuthentification.payment.title")} className="mt-4">
          {paymentInfo && (
            <>
              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label={t("demandesAuthentification.payment.status")}>
                  <Tag color={paymentInfo?.statusPayment === "PAID" ? "green" : "orange"}>
                    {paymentInfo?.statusPayment === "PAID"
                      ? t("demandesAuthentification.payment.paid")
                      : t("demandesAuthentification.payment.unpaid")}
                  </Tag>
                </Descriptions.Item>
                {paymentInfo?.payment && (
                  <Descriptions.Item label={t("demandesAuthentification.payment.amount")}>
                    {paymentInfo.payment.amount} {paymentInfo.payment.currency}
                  </Descriptions.Item>
                )}
              </Descriptions>
              <div className="mt-3">
                {paymentInfo?.statusPayment === "PAID" ? (
                  <Alert type="success" showIcon message={t("demandesAuthentification.payment.alreadyPaid")} />
                ) : (
                  <Link to={`/demandeur/demandes-authentification/${id}/payer`}>
                    <Button type="primary" icon={<DollarOutlined />}>{t("demandesAuthentification.payment.payButton")}</Button>
                  </Link>
                )}
              </div>
            </>
          )}
          {!paymentInfo && !loading && <p className="text-gray-500">{t("demandesAuthentification.payment.loading")}</p>}
        </Card>

        <Card title={t("demandesAuthentification.documentsTitle")} className="mt-4">
          {singleDocument ? (
            <>
              <Descriptions bordered column={1} size="small" className="mb-4">
                <Descriptions.Item label={t("demandesAuthentification.doc.type")}>{getTypeLabel(singleDocument.type)}</Descriptions.Item>
                <Descriptions.Item label={t("demandesAuthentification.doc.mention")}>{singleDocument.mention || "—"}</Descriptions.Item>
                <Descriptions.Item label={t("demandesAuthentification.doc.addedBy")}>
                  {singleDocument.organization?.name ?? "—"}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandesAuthentification.doc.date")}>
                  {singleDocument.createdAt ? dayjs(singleDocument.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
                </Descriptions.Item>
              </Descriptions>
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                loading={openingDoc === singleDocument.urlOriginal}
                onClick={() => openDocument(singleDocument.urlOriginal)}
              >
                {t("demandesAuthentification.doc.viewFile")}
              </Button>
            </>
          ) : (
            <p className="text-gray-600 mb-0">{t("demandesAuthentification.noDocuments")}</p>
          )}
        </Card>

        <Modal
          title={t("demandesAuthentification.doc.viewFile")}
          open={!!viewingDoc}
          onCancel={closeDocumentModal}
          footer={[
            <Button key="close" onClick={closeDocumentModal}>
              {t("demandesAuthentification.cancel")}
            </Button>,
          ]}
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
