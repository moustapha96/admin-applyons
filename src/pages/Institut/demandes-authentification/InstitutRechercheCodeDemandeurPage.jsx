"use client";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Input, Button, Table, Tag, message, Descriptions, Spin, Modal, Space, Alert } from "antd";
import { SearchOutlined, UserOutlined, FileTextOutlined, EyeOutlined } from "@ant-design/icons";
import demandeAuthentificationService from "@/services/demandeAuthentification.service";
import abonnementService from "@/services/abonnement.service";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import dayjs from "dayjs";

const statusColors = { EN_ATTENTE: "blue", DOCUMENTS_RECUS: "gold", TRAITEE: "green", ANNULEE: "red" };
const DOC_TYPE_KEYS = ["DIPLOMA", "TRANSCRIPT", "ID_CARD", "BIRTH_CERTIFICATE", "PASSPORT", "CERTIFICATE", "LETTER", "OTHER"];

const SubscriptionAlert = ({ userOrgId, t }) => (
  <Alert
    type="warning"
    message={t("demandesAuthentification.codeADN.subscriptionRequired")}
    description={
      <>
        <p className="mb-2">{t("demandesAuthentification.byDemandeurCode.subscriptionRequiredDesc")}</p>
        {userOrgId && (
          <Link to={`/organisations/${userOrgId}/abonnement`} className="font-medium text-[var(--applyons-blue)] hover:underline">
            {t("demandesAuthentification.codeADN.subscriptionRequiredLink")}
          </Link>
        )}
      </>
    }
    className="mb-4"
    showIcon
  />
);

export default function InstitutRechercheCodeDemandeurPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userOrgId = user?.organization?.id ?? user?.organizationId ?? null;

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [detailModalDemande, setDetailModalDemande] = useState(null);
  const [openingDoc, setOpeningDoc] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    if (!userOrgId) {
      setSubscriptionChecked(true);
      setHasActiveSubscription(false);
      return;
    }
    let cancelled = false;
    abonnementService
      .getActiveForOrg(userOrgId)
      .then((res) => {
        if (cancelled) return;
        const hasActive = !!(res?.abonnement ?? res?.data?.abonnement);
        setHasActiveSubscription(hasActive);
      })
      .catch(() => {
        if (!cancelled) setHasActiveSubscription(false);
      })
      .finally(() => {
        if (!cancelled) setSubscriptionChecked(true);
      });
    return () => { cancelled = true; };
  }, [userOrgId]);

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

  const getTypeLabel = (v) => {
    if (!v) return "—";
    if (DOC_TYPE_KEYS.includes(v)) return t(`demandesAuthentification.documentTypes.${v}`);
    return v;
  };

  const onSearch = async () => {
    if (!hasActiveSubscription) {
      message.warning(t("demandesAuthentification.codeADN.subscriptionRequired"));
      return;
    }
    const trimmed = (code || "").trim().toUpperCase();
    if (!trimmed) {
      message.warning(t("demandesAuthentification.byDemandeurCode.enterCode"));
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await demandeAuthentificationService.getByDemandeurCode(trimmed);
      const data = res?.data ?? res;
      setResult({
        demandeur: data.demandeur,
        demandes: Array.isArray(data.demandes) ? data.demandes : [],
      });
      if (!data.demandeur) {
        message.info(t("demandesAuthentification.byDemandeurCode.notFound"));
      }
    } catch (e) {
      const codeErr = e?.response?.data?.code;
      if (codeErr === "SUBSCRIPTION_REQUIRED") {
        setHasActiveSubscription(false);
        message.error(t("demandesAuthentification.codeADN.subscriptionRequired"));
      } else {
        const msg = e?.response?.data?.message || e?.message || t("demandesAuthentification.toasts.loadError");
        message.error(msg);
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: t("demandesAuthentification.columns.codeADN"),
      dataIndex: "codeADN",
      width: 180,
      render: (v, r) => (
        <Link to={`/organisations/demandes-authentification/${r.id}`}>
          <FileTextOutlined className="mr-1" />
          {v || "—"}
        </Link>
      ),
    },
    {
      title: t("demandesAuthentification.columns.objet"),
      dataIndex: "objet",
      ellipsis: true,
      render: (v) => v || "—",
    },
    {
      title: t("demandesAuthentification.columns.status"),
      dataIndex: "status",
      width: 130,
      render: (s) => (
        <Tag color={statusColors[s] || "default"}>{t(`demandesAuthentification.status.${s || "EN_ATTENTE"}`)}</Tag>
      ),
    },
    {
      title: t("demandesAuthentification.fields.createdAt"),
      dataIndex: "createdAt",
      width: 120,
      render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
    },
    // {
    //   title: t("demandesAuthentification.documentsTitle"),
    //   key: "documents",
    //   width: 100,
    //   render: (_, r) => {
    //     const docs = Array.isArray(r.documents) ? r.documents : [];
    //     return docs.length > 0 ? `${docs.length} document(s)` : "—";
    //   },
    // },
    {
      title: t("demandesAuthentification.actions.detail"),
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, r) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => setDetailModalDemande(r)}
        >
          {t("demandesAuthentification.byDemandeurCode.viewDetails")}
        </Button>
      ),
    },
  ];

  if (!subscriptionChecked) {
    return (
      <div className="container-fluid relative px-3 py-4">
        <div className="layout-specing flex justify-center items-center min-h-[200px]">
          <Spin size="large" tip={t("demandesAuthentification.loading")} />
        </div>
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return (
      <div className="container-fluid relative px-3 py-4">
        <div className="layout-specing">
          <SubscriptionAlert userOrgId={userOrgId} t={t} />
          <Card title={t("demandesAuthentification.byDemandeurCode.title")} className="mb-4">
            <p className="text-gray-500 dark:text-gray-400 mb-0">
              {t("demandesAuthentification.byDemandeurCode.subscriptionRequiredDesc")}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid relative px-3 py-4">
      <div className="layout-specing">
        <Card
          title={t("demandesAuthentification.byDemandeurCode.title")}
          className="mb-4"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t("demandesAuthentification.byDemandeurCode.description")}
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder={t("demandesAuthentification.byDemandeurCode.placeholder")}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onPressEnter={onSearch}
              style={{ maxWidth: 280 }}
              prefix={<UserOutlined className="text-gray-400" />}
              allowClear
            />
            <Button type="primary" icon={<SearchOutlined />} loading={loading} onClick={onSearch}>
              {t("demandesAuthentification.byDemandeurCode.search")}
            </Button>
          </div>
        </Card>

        {loading && (
          <div className="flex justify-center py-8">
            <Spin size="large" tip={t("demandesAuthentification.loading")} />
          </div>
        )}

        {!loading && result && (
          <>
            {result.demandeur && (
              <Card
                title={
                  <span>
                    <UserOutlined className="mr-2" />
                    {t("demandesAuthentification.byDemandeurCode.demandeurInfo")}
                  </span>
                }
                className="mb-4"
              >
                <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered>
                  <Descriptions.Item label={t("demandesAuthentification.fields.demandeurCode")}>
                    <strong>{result.demandeur.demandeurCode}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label={t("demandesAuthentification.fields.demandeur")}>
                    {[result.demandeur.firstName, result.demandeur.lastName].filter(Boolean).join(" ") || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label={t("demandesAuthentification.byDemandeurCode.email")}>
                    {result.demandeur.email || "—"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            <Card title={t("demandesAuthentification.byDemandeurCode.demandesList")}>
              {result.demandes.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 mb-0">
                  {result.demandeur
                    ? t("demandesAuthentification.byDemandeurCode.noDemandes")
                    : t("demandesAuthentification.byDemandeurCode.notFound")}
                </p>
              ) : (
                <Table
                  rowKey="id"
                  columns={columns}
                  dataSource={result.demandes}
                  pagination={false}
                  size="small"
                  scroll={{ x: 700 }}
                />
              )}
            </Card>
          </>
        )}

        {/* Popup détail d'une demande */}
        <Modal
          title={detailModalDemande ? `${t("demandesAuthentification.detailTitle")} — ${detailModalDemande.codeADN || ""}` : ""}
          open={!!detailModalDemande}
          onCancel={() => setDetailModalDemande(null)}
          footer={[
            <Button key="close" onClick={() => setDetailModalDemande(null)}>
              {t("demandesAuthentification.cancel")}
            </Button>,
            detailModalDemande && (
              <Link key="full" to={`/organisations/demandes-authentification/${detailModalDemande.id}`}>
                <Button type="primary">{t("demandesAuthentification.byDemandeurCode.openFullPage")}</Button>
              </Link>
            ),
          ]}
          width={640}
          destroyOnClose
        >
          {detailModalDemande && (
            <>
              <Descriptions bordered column={1} size="small" className="mb-4">
                <Descriptions.Item label={t("demandesAuthentification.fields.codeADN")}>
                  <strong>{detailModalDemande.codeADN}</strong>
                </Descriptions.Item>
                <Descriptions.Item label={t("demandesAuthentification.fields.objet")}>
                  {detailModalDemande.objet || "—"}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandesAuthentification.fields.status")}>
                  <Tag color={statusColors[detailModalDemande.status] || "default"}>
                    {t(`demandesAuthentification.status.${detailModalDemande.status || "EN_ATTENTE"}`)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t("demandesAuthentification.fields.createdAt")}>
                  {detailModalDemande.createdAt ? dayjs(detailModalDemande.createdAt).format("DD/MM/YYYY") : "—"}
                </Descriptions.Item>
                {/* <Descriptions.Item label={t("demandesAuthentification.fields.observation")}>
                  {detailModalDemande.observation || "—"}
                </Descriptions.Item> */}
                {detailModalDemande.attributedOrganization && (
                  <Descriptions.Item label={t("demandesAuthentification.fields.attributedOrg")}>
                    {detailModalDemande.attributedOrganization.name}
                  </Descriptions.Item>
                )}
              </Descriptions>

              <div className="mt-3">
                <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("demandesAuthentification.documentsTitle")}
                </div>
                {Array.isArray(detailModalDemande.documents) && detailModalDemande.documents.length > 0 ? (
                  <div className="space-y-3">
                    {detailModalDemande.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50"
                      >
                        <Descriptions size="small" column={1} bordered>
                          <Descriptions.Item label={t("demandesAuthentification.doc.type")}>
                            {getTypeLabel(doc.type)}
                          </Descriptions.Item>
                          {doc.mention && (
                            <Descriptions.Item label={t("demandesAuthentification.doc.mention")}>
                              {doc.mention}
                            </Descriptions.Item>
                          )}
                          {doc.organization?.name && (
                            <Descriptions.Item label={t("demandesAuthentification.doc.orgName")}>
                              {doc.organization.name}
                            </Descriptions.Item>
                          )}
                          <Descriptions.Item label={t("demandesAuthentification.doc.date")}>
                            {doc.createdAt ? dayjs(doc.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
                          </Descriptions.Item>
                        </Descriptions>
                        <Button
                          type="primary"
                          size="small"
                          icon={<FileTextOutlined />}
                          loading={openingDoc === doc.urlOriginal}
                          onClick={() => openDocument(doc.urlOriginal)}
                          className="mt-2"
                        >
                          {t("demandesAuthentification.doc.viewFile")}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 mb-0">{t("demandesAuthentification.noDocuments")}</p>
                )}
              </div>
            </>
          )}
        </Modal>

        {/* Popup affichage document PDF */}
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
