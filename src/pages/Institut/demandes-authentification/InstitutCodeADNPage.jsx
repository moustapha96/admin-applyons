"use client";
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, Input, Button, message, Descriptions, Tag, Form, Upload, Alert, Modal, Spin, Select, Tabs } from "antd";
import { UploadOutlined, DeleteOutlined, FileAddOutlined, SearchOutlined } from "@ant-design/icons";
import demandeAuthentificationService from "@/services/demandeAuthentification.service";
import abonnementService from "@/services/abonnement.service";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { PDF_ACCEPT_MIME, createPdfBeforeUpload } from "@/utils/uploadValidation";
import dayjs from "dayjs";

const statusColors = { EN_ATTENTE: "blue", DOCUMENTS_RECUS: "gold", TRAITEE: "green", ANNULEE: "red" };

const DOC_TYPE_OTHER = "__OTHER__";
const DOC_TYPE_KEYS = ["DIPLOMA", "TRANSCRIPT", "ID_CARD", "BIRTH_CERTIFICATE", "PASSPORT", "CERTIFICATE", "LETTER", "OTHER"];

const SubscriptionAlert = ({ userOrgId, t }) => (
  <Alert
    type="warning"
    message={t("demandesAuthentification.codeADN.subscriptionRequired")}
    description={
      <>
        <p className="mb-2">{t("demandesAuthentification.codeADN.subscriptionRequiredDesc")}</p>
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

export default function InstitutCodeADNPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const userOrgId = user?.organization?.id ?? user?.organizationId ?? null;

  const codeFromUrl = searchParams.get("code")?.trim() || "";

  // Onglet "Ajouter un document" : état propre
  const [codeAddDoc, setCodeAddDoc] = useState(codeFromUrl);
  const [demandeAddDoc, setDemandeAddDoc] = useState(null);
  const [loadingAddDoc, setLoadingAddDoc] = useState(false);
  const [subscriptionRequiredAddDoc, setSubscriptionRequiredAddDoc] = useState(false);

  // Onglet "Infos et document" : état propre
  const [codeConsult, setCodeConsult] = useState(codeFromUrl);
  const [demandeConsult, setDemandeConsult] = useState(null);
  const [loadingConsult, setLoadingConsult] = useState(false);
  const [subscriptionRequiredConsult, setSubscriptionRequiredConsult] = useState(false);

  const [noActiveSubscription, setNoActiveSubscription] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const [openingDoc, setOpeningDoc] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);

  useEffect(() => {
    if (!userOrgId) {
      setNoActiveSubscription(false);
      return;
    }
    let cancelled = false;
    abonnementService
      .getActiveForOrg(userOrgId)
      .then((res) => {
        if (cancelled) return;
        const hasActive = !!(res?.abonnement ?? res?.data?.abonnement);
        setNoActiveSubscription(!hasActive);
      })
      .catch(() => {
        if (!cancelled) setNoActiveSubscription(false);
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

  const fetchByCode = async (code, { setDemande, setLoading, setSubscriptionRequired, requireSubscription = true }) => {
    const trimmed = (code || "").trim();
    if (!trimmed) {
      message.warning(t("demandesAuthentification.codeADN.enterCode"));
      return;
    }
    if (requireSubscription && noActiveSubscription) return;
    setLoading(true);
    setDemande(null);
    setSubscriptionRequired(false);
    try {
      const res = await demandeAuthentificationService.getByCode(trimmed);
      const d = res?.data ?? res;
      if (d?.id) setDemande(d);
      else message.error(t("demandesAuthentification.codeADN.notFound"));
    } catch (e) {
      const codeErr = e?.response?.data?.code;
      if (codeErr === "SUBSCRIPTION_REQUIRED") {
        setSubscriptionRequired(true);
        message.error(t("demandesAuthentification.codeADN.subscriptionRequired"));
      } else if (codeErr === "NO_ORGANIZATION") {
        message.error(t("demandesAuthentification.codeADN.noOrganization"));
      } else {
        message.error(e?.response?.data?.message || e?.message || t("demandesAuthentification.codeADN.notFound"));
      }
    } finally {
      setLoading(false);
    }
  };

  const onAccessAddDoc = () =>
    fetchByCode(codeAddDoc, {
      setDemande: setDemandeAddDoc,
      setLoading: setLoadingAddDoc,
      setSubscriptionRequired: setSubscriptionRequiredAddDoc,
      requireSubscription: false,
    });

  const onAccessConsult = () =>
    fetchByCode(codeConsult, {
      setDemande: setDemandeConsult,
      setLoading: setLoadingConsult,
      setSubscriptionRequired: setSubscriptionRequiredConsult,
    });

  const reloadAddDoc = () =>
    fetchByCode(codeAddDoc, {
      setDemande: setDemandeAddDoc,
      setLoading: setLoadingAddDoc,
      setSubscriptionRequired: setSubscriptionRequiredAddDoc,
      requireSubscription: false,
    });

  const reloadConsult = () =>
    fetchByCode(codeConsult, {
      setDemande: setDemandeConsult,
      setLoading: setLoadingConsult,
      setSubscriptionRequired: setSubscriptionRequiredConsult,
    });

  const onUpload = async (values) => {
    const file = values?.file?.file || values?.file;
    if (!file || !demandeAddDoc?.codeADN) {
      message.warning(t("demandesAuthentification.upload.selectFile"));
      return;
    }
    const typeValue = values.type === DOC_TYPE_OTHER ? (values.typeCustom || "").trim() : values.type;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file.originFileObj || file);
      if (typeValue) formData.append("type", typeValue);
      if (values.mention) formData.append("mention", values.mention);
      await demandeAuthentificationService.addDocumentByCode(demandeAddDoc.codeADN, formData);
      message.success(t("demandesAuthentification.upload.success"));
      form.resetFields();
      reloadAddDoc();
    } catch (e) {
      const codeErr = e?.response?.data?.code;
      if (codeErr === "ONE_DOCUMENT_MAX") {
        message.error(t("demandesAuthentification.upload.oneDocumentMax"));
        reloadAddDoc();
      } else {
        message.error(e?.response?.data?.message || e?.message || t("demandesAuthentification.upload.error"));
      }
    } finally {
      setUploading(false);
    }
  };

  const getTypeLabel = (v) => {
    if (!v) return "—";
    if (DOC_TYPE_KEYS.includes(v)) return t(`demandesAuthentification.documentTypes.${v}`);
    return v;
  };

  const handleDeleteDocument = (demande, reload) => {
    const docs = Array.isArray(demande?.documents) ? demande.documents : [];
    const single = docs.length > 0 ? docs[0] : null;
    if (!demande?.id || !single) return;
    Modal.confirm({
      title: t("demandesAuthentification.doc.deleteConfirm"),
      okText: t("common.delete") || "Supprimer",
      okType: "danger",
      cancelText: t("demandesAuthentification.cancel"),
      onOk: async () => {
        try {
          await demandeAuthentificationService.deleteDocumentByDemandeId(demande.id);
          message.success(t("demandesAuthentification.doc.deleteSuccess"));
          reload();
        } catch (e) {
          message.error(e?.response?.data?.message || e?.message || t("demandesAuthentification.upload.error"));
        }
      },
    });
  };

  const documentsAddDoc = demandeAddDoc ? (Array.isArray(demandeAddDoc.documents) ? demandeAddDoc.documents : []) : [];
  const singleDocAddDoc = documentsAddDoc.length > 0 ? documentsAddDoc[0] : null;

  const documentsConsult = demandeConsult ? (Array.isArray(demandeConsult.documents) ? demandeConsult.documents : []) : [];
  const singleDocConsult = documentsConsult.length > 0 ? documentsConsult[0] : null;

  const canAddDoc = demandeAddDoc && userOrgId === demandeAddDoc.attributedOrganizationId && !singleDocAddDoc;
  const isAttributedAndHasDocAdd = demandeAddDoc && userOrgId === demandeAddDoc.attributedOrganizationId && singleDocAddDoc;
  const isNotAttributedAdd = demandeAddDoc && userOrgId && userOrgId !== demandeAddDoc.attributedOrganizationId;

  const tabItems = [
    {
      key: "addDocument",
      label: (
        <span>
          <FileAddOutlined className="mr-1" />
          {t("demandesAuthentification.tabs.addDocument")}
        </span>
      ),
      children: (
        <div className="pt-2">
          <Card size="small" className="mb-4">
            <p className="mb-3 text-gray-600 text-sm">{t("demandesAuthentification.codeADN.description")}</p>
            <Input
              placeholder={t("demandesAuthentification.codeADN.placeholderNoDash")}
              value={codeAddDoc}
              onChange={(e) => setCodeAddDoc(e.target.value)}
              onPressEnter={onAccessAddDoc}
              size="large"
              className="mb-3"
            />
            <Button type="primary" size="large" onClick={onAccessAddDoc} loading={loadingAddDoc} block>
              {t("demandesAuthentification.codeADN.submit")}
            </Button>
          </Card>

          {loadingAddDoc && <div className="flex justify-center py-4"><Spin /></div>}

          {!loadingAddDoc && !demandeAddDoc && (
            <Alert type="info" message={t("demandesAuthentification.tabsCodeHint")} showIcon />
          )}

          {!loadingAddDoc && demandeAddDoc && canAddDoc && (
            <Card title={t("demandesAuthentification.addDocumentTitle")}>
              <Form form={form} onFinish={onUpload} layout="vertical">
                <Form.Item name="file" label={t("demandesAuthentification.upload.file")} valuePropName="file" rules={[{ required: true }]} extra={t("demandesAuthentification.upload.pdfOnlyExtra", "PDF uniquement, 5 Mo max.")}>
                  <Upload maxCount={1} beforeUpload={createPdfBeforeUpload(message.error, t, Upload.LIST_IGNORE)} accept={PDF_ACCEPT_MIME}>
                    <Button icon={<UploadOutlined />}>{t("demandesAuthentification.upload.select")}</Button>
                  </Upload>
                </Form.Item>
                <Form.Item name="type" label={t("demandesAuthentification.doc.type")}>
                  <Select
                    placeholder={t("demandesAuthentification.upload.typePlaceholder")}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={DOC_TYPE_KEYS.map((key) => ({
                      value: key === "OTHER" ? DOC_TYPE_OTHER : key,
                      label: t(`demandesAuthentification.documentTypes.${key}`),
                    }))}
                  />
                </Form.Item>
                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
                  {({ getFieldValue }) =>
                    getFieldValue("type") === DOC_TYPE_OTHER ? (
                      <Form.Item name="typeCustom" label={t("demandesAuthentification.upload.typeOtherPlaceholder")} rules={[{ required: true, message: t("demandesAuthentification.upload.typeOtherPlaceholder") }]}>
                        <Input placeholder={t("demandesAuthentification.upload.typeOtherPlaceholder")} />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>
                <Form.Item name="mention" label={t("demandesAuthentification.doc.mention")}>
                  <Input placeholder={t("demandesAuthentification.upload.mentionPlaceholder")} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={uploading}>{t("demandesAuthentification.upload.submit")}</Button>
                </Form.Item>
              </Form>
            </Card>
          )}

          {!loadingAddDoc && demandeAddDoc && isAttributedAndHasDocAdd && (
            <Alert
              type="success"
              message={t("demandesAuthentification.documentAlreadyAdded")}
              description={
                <Button type="link" size="small" className="p-0 h-auto" loading={openingDoc === singleDocAddDoc?.urlOriginal} onClick={() => openDocument(singleDocAddDoc?.urlOriginal)}>
                  {t("demandesAuthentification.doc.viewFile")}
                </Button>
              }
              showIcon
            />
          )}

          {!loadingAddDoc && demandeAddDoc && isNotAttributedAdd && (
            <Alert type="info" message={t("demandesAuthentification.onlyAttributedOrgCanAdd")} description={t("demandesAuthentification.viewDocumentsReadOnly")} showIcon />
          )}
        </div>
      ),
    },
    {
      key: "consultInfoAndDoc",
      label: (
        <span>
          <SearchOutlined className="mr-1" />
          {t("demandesAuthentification.tabs.consultInfoAndDoc")}
        </span>
      ),
      children: (
        <div className="pt-2">
          {(noActiveSubscription || subscriptionRequiredConsult) && (
            <SubscriptionAlert userOrgId={userOrgId} t={t} />
          )}

          <Card size="small" className="mb-4">
            <p className="mb-3 text-gray-600 text-sm">{t("demandesAuthentification.codeADN.description")}</p>
            <Input
              placeholder={t("demandesAuthentification.codeADN.placeholderNoDash")}
              value={codeConsult}
              onChange={(e) => setCodeConsult(e.target.value)}
              onPressEnter={onAccessConsult}
              size="large"
              className="mb-3"
            />
            <Button type="primary" size="large" onClick={onAccessConsult} loading={loadingConsult} block disabled={noActiveSubscription}>
              {t("demandesAuthentification.codeADN.submit")}
            </Button>
          </Card>

          {loadingConsult && <div className="flex justify-center py-4"><Spin /></div>}

          {!loadingConsult && !demandeConsult && (
            <Alert type="info" message={t("demandesAuthentification.tabsCodeHint")} showIcon />
          )}

          {!loadingConsult && demandeConsult && (
            <>
              <Card title={t("demandesAuthentification.detailTitle")}>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label={t("demandesAuthentification.fields.codeADN")}><strong>{demandeConsult.codeADN}</strong></Descriptions.Item>
                  <Descriptions.Item label={t("demandesAuthentification.fields.objet")}>{demandeConsult.objet || "—"}</Descriptions.Item>
                  <Descriptions.Item label={t("demandesAuthentification.fields.demandeur")}>
                    {demandeConsult.user ? [demandeConsult.user.firstName, demandeConsult.user.lastName].filter(Boolean).join(" ") || demandeConsult.user.email : "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label={t("demandesAuthentification.fields.attributedOrg")}>
                    {demandeConsult.attributedOrganization?.name ?? "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label={t("demandesAuthentification.fields.status")}>
                    <Tag color={statusColors[demandeConsult.status] || "default"}>{t(`demandesAuthentification.status.${demandeConsult.status}`)}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={t("demandesAuthentification.fields.observation")}>{demandeConsult.observation || "—"}</Descriptions.Item>
                </Descriptions>
              </Card>
              {singleDocConsult ? (
                <Card title={t("demandesAuthentification.documentsTitle")} className="mt-4">
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label={t("demandesAuthentification.doc.type")}>{getTypeLabel(singleDocConsult.type)}</Descriptions.Item>
                    <Descriptions.Item label={t("demandesAuthentification.doc.mention")}>{singleDocConsult.mention || "—"}</Descriptions.Item>
                    <Descriptions.Item label={t("demandesAuthentification.doc.addedBy")}>{singleDocConsult.organization?.name ?? "—"}</Descriptions.Item>
                    <Descriptions.Item label={t("demandesAuthentification.doc.date")}>{singleDocConsult.createdAt ? dayjs(singleDocConsult.createdAt).format("DD/MM/YYYY HH:mm") : "—"}</Descriptions.Item>
                    <Descriptions.Item label={t("demandesAuthentification.doc.file")}>
                      <Button type="link" size="small" loading={openingDoc === singleDocConsult.urlOriginal} onClick={() => openDocument(singleDocConsult.urlOriginal)}>
                        {t("demandesAuthentification.doc.viewFile")}
                      </Button>
                    </Descriptions.Item>
                  </Descriptions>
                  {userOrgId === demandeConsult.attributedOrganizationId && (
                    <div className="mt-3">
                      <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleDeleteDocument(demandeConsult, reloadConsult)}>
                        {t("demandesAuthentification.doc.deleteDocument")}
                      </Button>
                    </div>
                  )}
                </Card>
              ) : (
                <Alert type="info" message={t("demandesAuthentification.noDocuments")} className="mt-4" showIcon />
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing max-w-3xl mx-auto">
        <Card title={t("demandesAuthentification.codeADN.title")}>
          <Tabs defaultActiveKey="addDocument" items={tabItems} />
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
