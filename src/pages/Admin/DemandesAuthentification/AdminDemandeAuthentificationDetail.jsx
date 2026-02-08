"use client";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, Descriptions, Tag, Table, Button, Select, message, Breadcrumb, Modal, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import demandeAuthentificationService from "@/services/demandeAuthentification.service";
import paymentService from "@/services/paymentService";

const statusColors = { EN_ATTENTE: "blue", DOCUMENTS_RECUS: "gold", TRAITEE: "green", ANNULEE: "red" };
const STATUS_OPTIONS = ["EN_ATTENTE", "DOCUMENTS_RECUS", "TRAITEE", "ANNULEE"];

export default function AdminDemandeAuthentificationDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
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
      message.error(e?.response?.data?.message || e?.message || t("adminDemandesAuthentification.toasts.loadError"));
      setViewingDoc(null);
    } finally {
      setOpeningDoc(null);
    }
  };

  const closeDocumentModal = () => {
    if (viewingDoc?.blobUrl) URL.revokeObjectURL(viewingDoc.blobUrl);
    setViewingDoc(null);
  };

  const fetchDemande = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await demandeAuthentificationService.getById(id);
      const d = res?.data ?? res;
      setDemande(d?.id ? d : null);
    } catch (e) {
      message.error(e?.response?.data?.message || t("adminDemandesAuthentification.toasts.loadError"));
      setDemande(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemande();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await paymentService.getForDemandeAuthentification(id);
        const data = res?.data ?? res;
        if (!cancelled && data) setPaymentInfo(data);
        else if (!cancelled) setPaymentInfo(null);
      } catch {
        if (!cancelled) setPaymentInfo(null);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const onStatusChange = async (newStatus) => {
    if (!id || !newStatus) return;
    setSavingStatus(true);
    try {
      await demandeAuthentificationService.updateStatus(id, { status: newStatus });
      message.success(t("adminDemandesAuthentification.statusUpdateSuccess"));
      setDemande((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (e) {
      message.error(e?.response?.data?.message || t("adminDemandesAuthentification.statusUpdateError"));
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading && !demande) {
    return <div className="p-4">{t("demandesAuthentification.loading")}</div>;
  }
  if (!demande) {
    return (
      <div className="p-4">
        {t("demandesAuthentification.notFound")}
        <Link to="/admin/demandes-authentification" className="ml-2">
          <Button size="small">{t("demandesAuthentification.backToList")}</Button>
        </Link>
      </div>
    );
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
      title: t("adminDemandesAuthentification.docAddedBy"),
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
      render: (url) =>
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

  const demandeurName = demande.user
    ? [demande.user.firstName, demande.user.lastName].filter(Boolean).join(" ") || demande.user.email
    : "—";

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <Breadcrumb
          className="mb-4"
          items={[
            { title: <Link to="/admin/dashboard">{t("adminDemandesAuthentification.breadcrumb.dashboard")}</Link> },
            { title: <Link to="/admin/demandes-authentification">{t("adminDemandesAuthentification.breadcrumb.list")}</Link> },
            { title: demande.codeADN },
          ]}
        />

        <Link to="/admin/demandes-authentification">
          <Button icon={<ArrowLeftOutlined />} type="text" className="mb-2">
            {t("demandesAuthentification.backToList")}
          </Button>
        </Link>

        <Card title={t("adminDemandesAuthentification.detailTitle")} loading={loading} className="mb-4">
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label={t("demandesAuthentification.fields.codeADN")}>
              <strong>{demande.codeADN}</strong>
            </Descriptions.Item>
            <Descriptions.Item label={t("demandesAuthentification.fields.objet")}>
              {demande.objet || "—"}
            </Descriptions.Item>
            <Descriptions.Item label={t("demandesAuthentification.fields.demandeur")}>
              {demandeurName}
              {demande.user?.email ? ` (${demande.user.email})` : ""}
            </Descriptions.Item>
            <Descriptions.Item label={t("demandesAuthentification.fields.attributedOrg")}>
              {demande.attributedOrganization?.name ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label={t("adminDemandesAuthentification.statusLabel")}>
              <Select
                value={demande.status}
                onChange={onStatusChange}
                loading={savingStatus}
                options={STATUS_OPTIONS.map((s) => ({
                  value: s,
                  label: t(`demandesAuthentification.status.${s}`),
                }))}
                style={{ width: 180 }}
              />
            </Descriptions.Item>
            <Descriptions.Item label={t("demandesAuthentification.fields.observation")}>
              {demande.observation || "—"}
            </Descriptions.Item>
            <Descriptions.Item label={t("demandesAuthentification.fields.createdAt")}>
              {demande.createdAt ? dayjs(demande.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {paymentInfo && (
          <Card title={t("demandesAuthentification.payment.title")} className="mb-4">
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label={t("demandesAuthentification.payment.status")}>
                <Tag color={paymentInfo?.statusPayment === "PAID" ? "green" : "orange"}>
                  {paymentInfo?.statusPayment === "PAID"
                    ? t("demandesAuthentification.payment.paid")
                    : t("demandesAuthentification.payment.unpaid")}
                </Tag>
              </Descriptions.Item>
              {paymentInfo?.payment && (
                <>
                  <Descriptions.Item label={t("demandesAuthentification.payment.amount")}>
                    {paymentInfo.payment.amount} {paymentInfo.payment.currency}
                  </Descriptions.Item>
                  <Descriptions.Item label={t("adminPayments.columns.provider")}>
                    {paymentInfo.payment.provider}
                  </Descriptions.Item>
                  <Descriptions.Item label={t("adminPayments.columns.date")}>
                    {paymentInfo.payment.createdAt ? dayjs(paymentInfo.payment.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </Card>
        )}

        <Card title={t("adminDemandesAuthentification.documentsTitle")} className="mb-4">
          <Table
            rowKey="id"
            dataSource={documentsList}
            columns={docColumns}
            pagination={false}
            locale={{ emptyText: t("adminDemandesAuthentification.noDocuments") }}
            expandable={{
              expandedRowRender: (record) => renderInstitutDetails(record.organization),
              rowExpandable: (record) => !!record?.organization,
            }}
          />
        </Card>

        {demande.notifiedOrganizations?.length > 0 && (
          <Card title={t("adminDemandesAuthentification.notifiedInstitutsTitle")} className="mb-4">
            <ul className="list-disc pl-5">
              {demande.notifiedOrganizations.map((inv) => (
                <li key={inv.id}>
                  {inv.organization?.name ?? inv.organizationId}
                  {inv.emailSentAt ? ` — ${t("adminDemandesAuthentification.notifiedAt")} ${dayjs(inv.emailSentAt).format("DD/MM/YYYY HH:mm")}` : ""}
                </li>
              ))}
            </ul>
          </Card>
        )}

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
