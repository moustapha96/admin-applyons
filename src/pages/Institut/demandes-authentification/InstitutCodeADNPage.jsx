"use client";
import { useState } from "react";
import { Card, Input, Button, message, Descriptions, Tag, Table, Form, Upload, Alert, Modal, Spin, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import demandeAuthentificationService from "@/services/demandeAuthentification.service";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { PDF_ACCEPT, PDF_ACCEPT_MIME, createPdfBeforeUpload } from "@/utils/uploadValidation";
import dayjs from "dayjs";

const statusColors = { EN_ATTENTE: "blue", DOCUMENTS_RECUS: "gold", TRAITEE: "green", ANNULEE: "red" };

const DOC_TYPE_OTHER = "__OTHER__";
const DOC_TYPE_KEYS = ["DIPLOMA", "TRANSCRIPT", "ID_CARD", "BIRTH_CERTIFICATE", "PASSPORT", "CERTIFICATE", "LETTER", "OTHER"];

export default function InstitutCodeADNPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userOrgId = user?.organization?.id ?? user?.organizationId ?? null;

  const [codeADN, setCodeADN] = useState("");
  const [loading, setLoading] = useState(false);
  const [demande, setDemande] = useState(null);
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

  const onAccess = async () => {
    const code = (codeADN || "").trim();
    if (!code) {
      message.warning(t("demandesAuthentification.codeADN.enterCode"));
      return;
    }
    setLoading(true);
    setDemande(null);
    try {
      const res = await demandeAuthentificationService.getByCode(code);
      const d = res?.data ?? res;
      if (d?.id) setDemande(d);
      else message.error(t("demandesAuthentification.codeADN.notFound"));
    } catch (e) {
      message.error(e?.message || t("demandesAuthentification.codeADN.notFound"));
    } finally {
      setLoading(false);
    }
  };

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
      message.error(e?.message || t("demandesAuthentification.upload.error"));
    } finally {
      setUploading(false);
    }
  };

  const documentsList = demande ? (Array.isArray(demande.documents) ? demande.documents : []) : [];

  const getTypeLabel = (v) => {
    if (!v) return "—";
    if (DOC_TYPE_KEYS.includes(v)) return t(`demandesAuthentification.documentTypes.${v}`);
    return v;
  };

  const docColumns = [
    { title: t("demandesAuthentification.doc.type"), dataIndex: "type", render: getTypeLabel },
    { title: t("demandesAuthentification.doc.mention"), dataIndex: "mention", render: (v) => v || "—" },
    { title: t("demandesAuthentification.doc.addedBy"), dataIndex: ["organization", "name"], render: (v) => v || "—" },
    { title: t("demandesAuthentification.doc.date"), dataIndex: "createdAt", render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—") },
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
      <div className="layout-specing max-w-3xl mx-auto">
        <Card title={t("demandesAuthentification.codeADN.title")}>
          <p className="mb-4 text-gray-600">{t("demandesAuthentification.codeADN.description")}</p>
          <Input
            placeholder={t("demandesAuthentification.codeADN.placeholder")}
            value={codeADN}
            onChange={(e) => setCodeADN(e.target.value)}
            onPressEnter={onAccess}
            size="large"
            className="mb-4"
          />
          <Button type="primary" size="large" onClick={onAccess} loading={loading} block>
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
            <Card title={t("demandesAuthentification.documentsTitle")} className="mt-4">
              <Table rowKey="id" dataSource={documentsList} columns={docColumns} pagination={false} size="small" locale={{ emptyText: t("demandesAuthentification.noDocuments") }} />
            </Card>
            {userOrgId && userOrgId === demande.attributedOrganizationId ? (
              <Alert type="info" message={t("demandesAuthentification.attributedOrgCannotAdd")} className="mt-4" showIcon />
            ) : (
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
            )}
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
          </>
        )}
      </div>
    </div>
  );
}
