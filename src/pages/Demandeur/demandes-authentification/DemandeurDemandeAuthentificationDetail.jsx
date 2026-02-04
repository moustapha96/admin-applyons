"use client";
import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Card, Descriptions, Tag, Button, Table, message, Space, Alert, Modal, Spin } from "antd";
import { ArrowLeftOutlined, CopyOutlined, MailOutlined, DollarOutlined } from "@ant-design/icons";
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

  const renderInstitutDetails = (org) => {
    if (!org) return null;
    return (
      <div className="py-2 px-3 bg-gray-50 rounded text-sm">
        <div className="font-medium text-gray-700 mb-2">{t("demandesAuthentification.doc.institutDetails")}</div>
        <Descriptions size="small" column={1} bordered>
          <Descriptions.Item label={t("demandesAuthentification.doc.orgName")}>{org.name || "—"}</Descriptions.Item>
          {org.type && <Descriptions.Item label={t("demandesAuthentification.doc.orgType")}>{org.type}</Descriptions.Item>}
          {org.email && <Descriptions.Item label={t("demandesAuthentification.doc.orgEmail")}><a href={`mailto:${org.email}`}>{org.email}</a></Descriptions.Item>}
          {org.phone && <Descriptions.Item label={t("demandesAuthentification.doc.orgPhone")}>{org.phone}</Descriptions.Item>}
          {org.address && <Descriptions.Item label={t("demandesAuthentification.doc.orgAddress")}>{org.address}</Descriptions.Item>}
          {org.website && <Descriptions.Item label={t("demandesAuthentification.doc.orgWebsite")}><a href={org.website.startsWith("http") ? org.website : `https://${org.website}`} target="_blank" rel="noopener noreferrer">{org.website}</a></Descriptions.Item>}
          {org.country && <Descriptions.Item label={t("demandesAuthentification.doc.orgCountry")}>{org.country}</Descriptions.Item>}
        </Descriptions>
      </div>
    );
  };

  const docColumns = [
    { title: t("demandesAuthentification.doc.type"), dataIndex: "type", render: (v) => v || "—" },
    { title: t("demandesAuthentification.doc.mention"), dataIndex: "mention", render: (v) => v || "—" },
    {
      title: t("demandesAuthentification.doc.addedBy"),
      dataIndex: ["organization", "name"],
      render: (v) => v || "—",
    },
    {
      title: t("demandesAuthentification.doc.date"),
      dataIndex: "createdAt",
      render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
    },
    {
      title: t("demandesAuthentification.doc.file"),
      dataIndex: "urlOriginal",
      render: (url, record) =>
        url ? (
          <Button
            type="link"
            size="small"
            loading={openingDoc === url}
            onClick={() => openDocument(url)}
          >
            {t("demandesAuthentification.doc.viewFile")}
          </Button>
        ) : "—",
    },
  ];

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
                <Link to={`/demandeur/demandes-authentification/${id}/notify-instituts`}>
                  <Button type="primary" size="small">{t("demandesAuthentification.notifyInstituts")}</Button>
                </Link>
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
                <div>{demande.attributedOrganization?.name ?? "—"}</div>
                {demande.attributedOrganization?.email && (
                  <div className="text-gray-600 text-sm mt-0.5">
                    <a href={`mailto:${demande.attributedOrganization.email}`}>{demande.attributedOrganization.email}</a>
                  </div>
                )}
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

        <div className="mt-4 flex gap-2">
          <Link to={`/demandeur/demandes-authentification/${id}/notify-instituts`}>
            <Button icon={<MailOutlined />}>{t("demandesAuthentification.notifyInstituts")}</Button>
          </Link>
        </div>
        <Card title={t("demandesAuthentification.documentsTitle")} className="mt-4">
          <Table
            rowKey="id"
            dataSource={documentsList}
            columns={docColumns}
            pagination={false}
            size="small"
            locale={{ emptyText: t("demandesAuthentification.noDocuments") }}
            expandable={{
              expandedRowRender: (record) => renderInstitutDetails(record.organization),
              rowExpandable: (record) => !!record?.organization,
            }}
          />
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
          destroyOnClose
        >
          <div style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {viewingDoc?.blobUrl ? (
              <iframe
                src={`${viewingDoc.blobUrl}#toolbar=0`}
                title={t("demandesAuthentification.doc.viewFile")}
                style={{ width: "100%", height: "75vh", border: "none" }}
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
