"use client";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Descriptions, Tag, Button, Table, message, Modal, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import demandeAuthentificationService from "@/services/demandeAuthentification.service";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const statusColors = { EN_ATTENTE: "blue", DOCUMENTS_RECUS: "gold", TRAITEE: "green", ANNULEE: "red" };

export default function InstitutDemandeAuthentificationDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
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
          footer={[<Button key="close" onClick={closeDocumentModal}>{t("demandesAuthentification.cancel")}</Button>]}
          width="90vw"
          style={{ top: 24 }}
          destroyOnClose
        >
          <div style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {viewingDoc?.blobUrl ? (
              <iframe src={`${viewingDoc.blobUrl}#toolbar=0`} title={t("demandesAuthentification.doc.viewFile")} style={{ width: "100%", height: "75vh", border: "none" }} />
            ) : (
              <Spin size="large" />
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
