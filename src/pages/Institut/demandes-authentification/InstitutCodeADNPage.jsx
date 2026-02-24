"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, Input, Button, message, Descriptions, Tag, Form, Upload, Alert, Modal, Spin, Select } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import demandeAuthentificationService from "@/services/demandeAuthentification.service";
import abonnementService from "@/services/abonnement.service";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { PDF_ACCEPT, PDF_ACCEPT_MIME, createPdfBeforeUpload } from "@/utils/uploadValidation";
import dayjs from "dayjs";

const statusColors = { EN_ATTENTE: "blue", DOCUMENTS_RECUS: "gold", TRAITEE: "green", ANNULEE: "red" };

const DOC_TYPE_OTHER = "__OTHER__";
const DOC_TYPE_KEYS = ["DIPLOMA", "TRANSCRIPT", "ID_CARD", "BIRTH_CERTIFICATE", "PASSPORT", "CERTIFICATE", "LETTER", "OTHER"];

export default function InstitutCodeADNPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const userOrgId = user?.organization?.id ?? user?.organizationId ?? null;

  const codeFromUrl = searchParams.get("code")?.trim() || "";
  const [codeADN, setCodeADN] = useState(codeFromUrl);
  const [loading, setLoading] = useState(false);
  const [demande, setDemande] = useState(null);
  const autoLoadDoneRef = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
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

  const [subscriptionRequired, setSubscriptionRequired] = useState(false);
  const [noActiveSubscription, setNoActiveSubscription] = useState(false);

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

  const onAccess = async () => {
    if (noActiveSubscription) return;
    const code = (codeADN || "").trim();
    if (!code) {
      message.warning(t("demandesAuthentification.codeADN.enterCode"));
      return;
    }
    setLoading(true);
    setDemande(null);
    setSubscriptionRequired(false);
    try {
      const res = await demandeAuthentificationService.getByCode(code);
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

  useEffect(() => {
    if (!codeFromUrl || autoLoadDoneRef.current) return;
    setCodeADN(codeFromUrl);
    autoLoadDoneRef.current = true;
    setLoading(true);
    setDemande(null);
    setSubscriptionRequired(false);
    demandeAuthentificationService
      .getByCode(codeFromUrl)
      .then((res) => {
        const d = res?.data ?? res;
        if (d?.id) setDemande(d);
        else message.error(t("demandesAuthentification.codeADN.notFound"));
      })
      .catch((e) => {
        if (e?.response?.data?.code === "SUBSCRIPTION_REQUIRED") setSubscriptionRequired(true);
        message.error(e?.response?.data?.message || e?.message || t("demandesAuthentification.codeADN.notFound"));
      })
      .finally(() => setLoading(false));
  }, [codeFromUrl, t]);

  const onUpload = async (values) => {
    const file = values?.file?.file || values?.file;
    if (!file || !demande?.codeADN) {
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
      // organizationId est récupéré côté backend depuis l'utilisateur connecté (token)
      await demandeAuthentificationService.addDocumentByCode(demande.codeADN, formData);
      message.success(t("demandesAuthentification.upload.success"));
      form.resetFields();
      onAccess();
    } catch (e) {
      const codeErr = e?.response?.data?.code;
      if (codeErr === "ONE_DOCUMENT_MAX") {
        message.error(t("demandesAuthentification.upload.oneDocumentMax"));
        onAccess();
      } else {
        message.error(e?.response?.data?.message || e?.message || t("demandesAuthentification.upload.error"));
      }
    } finally {
      setUploading(false);
    }
  };

  const documentsList = demande ? (Array.isArray(demande.documents) ? demande.documents : []) : [];
  const singleDoc = documentsList.length > 0 ? documentsList[0] : null;

  const getTypeLabel = (v) => {
    if (!v) return "—";
    if (DOC_TYPE_KEYS.includes(v)) return t(`demandesAuthentification.documentTypes.${v}`);
    return v;
  };

  const handleDeleteDocument = () => {
    if (!demande?.id || !singleDoc) return;
    Modal.confirm({
      title: t("demandesAuthentification.doc.deleteConfirm"),
      okText: t("common.delete") || "Supprimer",
      okType: "danger",
      cancelText: t("demandesAuthentification.cancel"),
      onOk: async () => {
        try {
          await demandeAuthentificationService.deleteDocumentByDemandeId(demande.id);
          message.success(t("demandesAuthentification.doc.deleteSuccess"));
          onAccess();
        } catch (e) {
          message.error(e?.response?.data?.message || e?.message || t("demandesAuthentification.upload.error"));
        }
      },
    });
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing max-w-3xl mx-auto">
        {(subscriptionRequired || noActiveSubscription) && (
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
        )}
        <Card title={t("demandesAuthentification.codeADN.title")}>
          <p className="mb-4 text-gray-600">{t("demandesAuthentification.codeADN.description")}</p>
          <Input
            placeholder={t("demandesAuthentification.codeADN.placeholderNoDash")}
            value={codeADN}
            onChange={(e) => setCodeADN(e.target.value)}
            onPressEnter={onAccess}
            size="large"
            className="mb-4"
          />
          <Button type="primary" size="large" onClick={onAccess} loading={loading} block disabled={noActiveSubscription}>
            {t("demandesAuthentification.codeADN.submit")}
          </Button>
        </Card>

        {demande && (
          <>
            <Card title={t("demandesAuthentification.detailTitle")} className="mt-4">
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
            {singleDoc ? (
              <Card title={t("demandesAuthentification.documentsTitle")} className="mt-4">
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label={t("demandesAuthentification.doc.type")}>{getTypeLabel(singleDoc.type)}</Descriptions.Item>
                  <Descriptions.Item label={t("demandesAuthentification.doc.mention")}>{singleDoc.mention || "—"}</Descriptions.Item>
                  <Descriptions.Item label={t("demandesAuthentification.doc.addedBy")}>
                    {singleDoc.organization?.name ?? "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label={t("demandesAuthentification.doc.date")}>{singleDoc.createdAt ? dayjs(singleDoc.createdAt).format("DD/MM/YYYY HH:mm") : "—"}</Descriptions.Item>
                  <Descriptions.Item label={t("demandesAuthentification.doc.file")}>
                    <Button type="link" size="small" loading={openingDoc === singleDoc.urlOriginal} onClick={() => openDocument(singleDoc.urlOriginal)}>
                      {t("demandesAuthentification.doc.viewFile")}
                    </Button>
                  </Descriptions.Item>
                </Descriptions>
                {userOrgId === demande.attributedOrganizationId && (
                  <div className="mt-3">
                    <Button type="primary" danger icon={<DeleteOutlined />} onClick={handleDeleteDocument}>
                      {t("demandesAuthentification.doc.deleteDocument")}
                    </Button>
                  </div>
                )}
              </Card>
            ) : null}
            {userOrgId && userOrgId === demande.attributedOrganizationId && !singleDoc ? (
              <Card title={t("demandesAuthentification.addDocumentTitle")} className="mt-4">
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
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.type !== curr.type}
                  >
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
            ) : null}
            {userOrgId && userOrgId !== demande.attributedOrganizationId && !singleDoc ? (
              <Alert
                type="info"
                message={t("demandesAuthentification.onlyAttributedOrgCanAdd")}
                description={t("demandesAuthentification.viewDocumentsReadOnly")}
                className="mt-4"
                showIcon
              />
            ) : null}
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
          </>
        )}
      </div>
    </div>
  );
}
