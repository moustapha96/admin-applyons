/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  Divider,
  Space,
  Tag,
  Typography,
  Table,
  message,
  Modal,
  Form,
  Select,
  Input,
  Spin,
} from "antd";
import dayjs from "dayjs";
import { ArrowLeftOutlined, FileTextOutlined } from "@ant-design/icons";
import demandeService from "@/services/demandeService";
import documentService from "@/services/documentService";
import { useTranslation } from "react-i18next";
import { hasTranslation, normalizeDocument } from "@/utils/documentUtils";

const { Title, Text } = Typography;
const { TextArea } = Input;

const STATUS_COLOR = { VALIDATED: "green", REJECTED: "red", IN_PROGRESS: "blue", PENDING: "default" };

function fmtDate(v, withTime = false) {
  if (!v) return "—";
  const d = dayjs(v);
  return withTime ? d.format("DD/MM/YYYY HH:mm") : d.format("DD/MM/YYYY");
}
function normalizeUrl(u) { return u; }

export default function InstitutDemandeDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [demande, setDemande] = useState(null);
  const [docs, setDocs] = useState([]);

  // Modal workflow
  const [wfOpen, setWfOpen] = useState(false);
  const [wfSubmitting, setWfSubmitting] = useState(false);
  const [wfForm] = Form.useForm();
  const [wfPresetStatus, setWfPresetStatus] = useState(null);

  // Modal org (source doc)
  const [orgOpen, setOrgOpen] = useState(false);
  const [orgDoc, setOrgDoc] = useState(null);

  // Modal buyer (assignedOrg)
  const [buyerOpen, setBuyerOpen] = useState(false);

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

  const STATUS_OPTIONS = [
    { label: t("institutDemandeDetails.statuses.PENDING"), value: "PENDING" },
    { label: t("institutDemandeDetails.statuses.IN_PROGRESS"), value: "IN_PROGRESS" },
    { label: t("institutDemandeDetails.statuses.VALIDATED"), value: "VALIDATED" },
    { label: t("institutDemandeDetails.statuses.REJECTED"), value: "REJECTED" }
  ];

  const fmtBool = (v) => {
    if (v === true) return <Tag color="green">{t("institutDemandeDetails.tags.yes")}</Tag>;
    if (v === false) return <Tag color="volcano">{t("institutDemandeDetails.tags.no")}</Tag>;
    return t("institutDemandeDetails.tags.dash");
  };

  const fetchDemande = async () => {
    setLoading(true);
    try {
      const res = await demandeService.getById(id);
      const d = res?.demande ?? res;
      setDemande(d);
      const list = Array.isArray(d?.documents) ? d.documents : [];
      // Normaliser les documents pour utiliser la nouvelle structure
      const norm = list.map((doc) => normalizeDocument({
        ...doc,
        urlOriginal: normalizeUrl(doc.urlOriginal || doc.original?.url),
        urlChiffre: normalizeUrl(doc.urlChiffre || doc.original?.urlChiffre),
        urlTraduit: normalizeUrl(doc.urlTraduit || doc.traduit?.url),
        urlChiffreTraduit: normalizeUrl(doc.urlChiffreTraduit || doc.traduit?.urlChiffre),
      }));
      setDocs(norm);
    } catch (e) {
      message.error(e?.message || t("institutDemandeDetails.toasts.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDemande(); /* eslint-disable-next-line */ }, [id]);

  const statusTag = useMemo(() => {
    const s = demande?.status;
    if (!s) return <Tag>—</Tag>;
    return <Tag color={STATUS_COLOR[s] || "default"}>{t(`institutDemandeDetails.statuses.${s}`)}</Tag>;
  }, [demande, t]);

  const openUrl = async (doc, type = "original") => {
    try {
      if (!doc?.id) {
        message.warning(t("institutDemandeDetails.toasts.urlMissing") || "Document non disponible");
        return;
      }
      // Pour les traductions, vérifier d'abord si le document a vraiment une traduction disponible
      if (type === "traduit") {
        try {
          const info = await documentService.getInfo(doc.id);
          const docInfo = info?.document || info;
          const hasTranslated = docInfo?.traduit?.hasFile || docInfo?.estTraduit;
          
          if (!hasTranslated) {
            message.warning(t("institutDemandeDetails.toasts.translationNotReady") || "La traduction n'est pas encore disponible. Veuillez rafraîchir la page.");
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
          ? t("institutDemandeDetails.preview.titleTranslated", { id: doc.id }) 
          : t("institutDemandeDetails.preview.titleOriginal", { id: doc.id }),
      });
    } catch (error) {
      if (error.response?.status === 401) {
        message.error(t("institutDemandeDetails.toasts.sessionExpired") || "Session expirée. Veuillez vous reconnecter.");
      } else if (error.response?.status === 403) {
        message.error(t("institutDemandeDetails.toasts.accessDenied") || "Vous n'avez pas accès à ce document.");
      } else if (error.response?.status === 404) {
        if (type === "traduit") {
          message.error(t("institutDemandeDetails.toasts.translationNotFound") || "Le fichier traduit n'est pas encore disponible. Le fichier peut être en cours de traitement. Veuillez rafraîchir la page dans quelques instants.");
        } else {
          message.error(t("institutDemandeDetails.toasts.noFileAvailable") || "Le fichier n'est pas disponible.");
        }
      } else {
        message.error(error?.response?.data?.message || error?.message || t("institutDemandeDetails.toasts.openError") || "Erreur lors de l'ouverture du document");
      }
    }
  };

  const openUrlOld = (u) => {
    const url = normalizeUrl(u);
    if (!url) return message.warning(t("institutDemandeDetails.toasts.urlMissing"));
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const callUpdateStatusApi = async (status, observation) => {
    try {
      await demandeService.updateStatus(id, { status, observation });
      return;
    } catch (e) {
      if (typeof demandeService.changeStatus === "function") {
        await demandeService.changeStatus(id, status, observation);
        return;
      }
      throw e;
    }
  };

  const openWorkflowModal = (presetStatus = null) => {
    setWfPresetStatus(presetStatus);
    wfForm.setFieldsValue({
      status: presetStatus || demande?.status || "PENDING",
      observation: demande?.observation || "",
    });
    setWfOpen(true);
  };

  const submitWorkflow = async () => {
    try {
      const values = await wfForm.validateFields();
      const { status, observation } = values || {};
      setWfSubmitting(true);
      await callUpdateStatusApi(status, observation);
      message.success(t("institutDemandeDetails.toasts.statusSaved"));
      setWfOpen(false);
      await fetchDemande();
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.message || t("institutDemandeDetails.toasts.statusSaveError"));
    } finally {
      setWfSubmitting(false);
    }
  };

  const openOrgPopup = (doc) => { setOrgDoc(doc); setOrgOpen(true); };

  // Colonnes documents
  const docColumns = [
    {
      title: t("institutDemandeDetails.docs.ownerOrg"),
      key: "ownerOrg",
      width: 240,
      render: (_v, r) =>
        r.ownerOrg ? (
          <Space size={6} wrap>
            <Button size="small" type="link" onClick={() => openOrgPopup(r)}>
              <Tag>{r.ownerOrg.name}</Tag>
            </Button>
          </Space>
        ) : (
          <Tag>{t("institutDemandeDetails.tags.dash")}</Tag>
        ),
    },
    { title: t("institutDemandeDetails.docs.type"), dataIndex: "type", width: 140, render: (v) => v || t("institutDemandeDetails.tags.dash") },
    { title: t("institutDemandeDetails.docs.mention"), dataIndex: "mention", render: (v) => v || t("institutDemandeDetails.tags.dash") },
    { title: t("institutDemandeDetails.docs.obtainedAt"), dataIndex: "dateObtention", width: 160, render: (v) => fmtDate(v) },
    {
      title: t("institutDemandeDetails.docs.doc"),
      key: "openOriginal",
      width: 120,
      render: (_v, r) =>
        r.id ? (
          <Button size="small" onClick={() => openUrl(r, "original")}>{t("institutDemandeDetails.buttons.open")}</Button>
        ) : (
          <Tag>{t("institutDemandeDetails.tags.dash")}</Tag>
        ),
    },
    {
      title: t("institutDemandeDetails.docs.translated"),
      key: "openTranslated",
      width: 120,
      render: (_v, r) =>
        r.id && r.estTraduit ? (
          <Button size="small" onClick={() => openUrl(r, "traduit")}>{t("institutDemandeDetails.buttons.open")}</Button>
        ) : (
          <Tag>{t("institutDemandeDetails.tags.dash")}</Tag>
        ),
    },
    { title: t("institutDemandeDetails.docs.addedAt"), dataIndex: "createdAt", width: 170, render: (v) => fmtDate(v, true) },
  ];

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        {/* Header + fil d’ariane */}
        <div className="md:flex justify-between items-center mb-6">
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>{t("institutDemandeDetails.buttons.back")}</Button>
          </Space>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("institutDemandeDetails.breadcrumbs.dashboard")}</Link> },
              { title: <Link to="/organisations/demandes">{t("institutDemandeDetails.breadcrumbs.demandes")}</Link> },
              { title: t("institutDemandeDetails.breadcrumbs.details") },
            ]}
          />
        </div>

        <div className="p-2 md:p-4">
          <Title level={3} className="!mb-3">{t("institutDemandeDetails.title")}</Title>

          <Card loading={loading} className="mb-4">
            {demande && (
              <>
                <Descriptions bordered column={2} size="middle">
                  <Descriptions.Item label={t("institutDemandeDetails.fields.code")}>
                    <Typography.Text copyable={{ text: demande?.code }}>
                      <Tag>{demande.code || t("institutDemandeDetails.tags.dash")}</Tag>
                    </Typography.Text>
                  </Descriptions.Item>
                  <Descriptions.Item label={t("institutDemandeDetails.fields.status")}>{statusTag}</Descriptions.Item>

                  <Descriptions.Item label={t("institutDemandeDetails.fields.requestDate")}>{fmtDate(demande.dateDemande)}</Descriptions.Item>
                  <Descriptions.Item label={t("institutDemandeDetails.fields.updatedAt")}>{fmtDate(demande.updatedAt, true)}</Descriptions.Item>

                  <Descriptions.Item label={t("institutDemandeDetails.fields.createdAt")}>{fmtDate(demande.createdAt, true)}</Descriptions.Item>
                  <Descriptions.Item label={t("institutDemandeDetails.fields.deletedAt")}>
                    {demande.deletedAt ? fmtDate(demande.deletedAt, true) : t("institutDemandeDetails.tags.dash")}
                  </Descriptions.Item>

                  <Descriptions.Item label={t("institutDemandeDetails.fields.targetOrg")} span={1}>
                    {demande.targetOrg?.name || t("institutDemandeDetails.tags.dash")}{" "}
                    {demande.targetOrg?.type ? <Tag className="ml-2">{demande.targetOrg.type}</Tag> : null}
                  </Descriptions.Item>

                  <Descriptions.Item label={t("institutDemandeDetails.fields.assignedOrg")} span={1}>
                    <Space size={6} wrap>
                      {demande.assignedOrg ? (
                        <Button size="small" type="link" onClick={() => setBuyerOpen(true)}>
                          <span>
                            {demande.assignedOrg?.name || t("institutDemandeDetails.tags.dash")}{" "}
                            {demande.assignedOrg?.type ? <Tag className="ml-2">{demande.assignedOrg.type}</Tag> : null}
                          </span>
                        </Button>
                      ) : null}
                    </Space>
                  </Descriptions.Item>

                  <Descriptions.Item label={t("institutDemandeDetails.fields.requester")} span={2}>
                    <div className="flex flex-col">
                      <span>{demande.user?.firstName || t("institutDemandeDetails.tags.dash")} {demande.user?.lastName || ""}</span>
                      <span>{demande.user?.email || t("institutDemandeDetails.tags.dash")}</span>
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label={t("institutDemandeDetails.fields.serie")}>{demande.serie || t("institutDemandeDetails.tags.dash")}</Descriptions.Item>
                  <Descriptions.Item label={t("institutDemandeDetails.fields.niveau")}>{demande.niveau || t("institutDemandeDetails.tags.dash")}</Descriptions.Item>

                  <Descriptions.Item label={t("institutDemandeDetails.fields.mention")}>{demande.mention || t("institutDemandeDetails.tags.dash")}</Descriptions.Item>
                  <Descriptions.Item label={t("institutDemandeDetails.fields.anneeTxt")}>{demande.annee || t("institutDemandeDetails.tags.dash")}</Descriptions.Item>

                  <Descriptions.Item label={t("institutDemandeDetails.fields.periode")}>{demande.periode || t("institutDemandeDetails.tags.dash")}</Descriptions.Item>
                  <Descriptions.Item label={t("institutDemandeDetails.fields.year")}>{demande.year || t("institutDemandeDetails.tags.dash")}</Descriptions.Item>

                  <Descriptions.Item label={t("institutDemandeDetails.fields.countryOfSchool")}>{demande.countryOfSchool || t("institutDemandeDetails.tags.dash")}</Descriptions.Item>
                  <Descriptions.Item label={t("institutDemandeDetails.fields.secondarySchoolName")}>{demande.secondarySchoolName || t("institutDemandeDetails.tags.dash")}</Descriptions.Item>

                  <Descriptions.Item label={t("institutDemandeDetails.fields.graduationDate")}>{fmtDate(demande.graduationDate)}</Descriptions.Item>
                  <Descriptions.Item label={t("institutDemandeDetails.fields.observation")}>
                    <Text>{demande.observation || t("institutDemandeDetails.tags.dash")}</Text>
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Card
                  className="mt-3"
                  title={t("institutDemandeDetails.sections.actionsWorkflow")}
                  extra={
                    <Button onClick={() => openWorkflowModal()} type="default">
                      {t("institutDemandeDetails.buttons.updateStatus")}
                    </Button>
                  }
                >
                  <Space wrap>
                    <Button onClick={() => openWorkflowModal("PENDING")}>{t("institutDemandeDetails.buttons.pending")}</Button>
                    <Button onClick={() => openWorkflowModal("IN_PROGRESS")}>{t("institutDemandeDetails.buttons.inProgress")}</Button>
                    <Button type="primary" onClick={() => openWorkflowModal("VALIDATED")}>{t("institutDemandeDetails.buttons.validated")}</Button>
                    <Button danger onClick={() => openWorkflowModal("REJECTED")}>{t("institutDemandeDetails.buttons.rejected")}</Button>
                  </Space>
                </Card>

                <Divider />

                <Space wrap className="mb-2">
                  <Button
                    icon={<FileTextOutlined />}
                    onClick={() => navigate(`/organisations/demandes/${demande.id}/documents`)}
                  >
                    {t("institutDemandeDetails.buttons.seeDocs")}
                  </Button>
                </Space>
              </>
            )}
          </Card>

          <Card
            title={
              <Space>
                {t("institutDemandeDetails.docs.title")}
                <Tag>{demande?._count?.documents ?? docs?.length ?? 0}</Tag>
              </Space>
            }
          >
            <Table
              rowKey={(r) => r.id}
              columns={docColumns}
              dataSource={docs}
              pagination={{ pageSize: 5 }}
              locale={{ emptyText: t("institutDemandeDetails.docs.empty") }}
              scroll={{ x: true }}
            />
          </Card>
        </div>
      </div>

      {/* ===== Modal Statut + Observation ===== */}
      <Modal
        open={wfOpen}
        onCancel={() => setWfOpen(false)}
        onOk={submitWorkflow}
        okText={t("institutDemandeDetails.buttons.save")}
        confirmLoading={wfSubmitting}
        title={t("institutDemandeDetails.modals.statusTitle")}
        destroyOnClose
      >
        <Form
          form={wfForm}
          layout="vertical"
          initialValues={{
            status: wfPresetStatus || demande?.status || "PENDING",
            observation: demande?.observation || "",
          }}
        >
          <Form.Item
            name="status"
            label={t("institutDemandeDetails.modals.statusField")}
            rules={[{ required: true, message: t("institutDemandeDetails.modals.statusPlaceholder") }]}
          >
            <Select options={STATUS_OPTIONS} placeholder={t("institutDemandeDetails.modals.statusPlaceholder")} />
          </Form.Item>

          <Form.Item
            name="observation"
            label={t("institutDemandeDetails.modals.observationField")}
            rules={[{ max: 2000, message: "2000" }]}
          >
            <TextArea
              rows={5}
              allowClear
              placeholder={t("institutDemandeDetails.modals.observationPlaceholder")}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ===== Modal Détails Institut (source du document) ===== */}
      <Modal
        open={orgOpen}
        onCancel={() => setOrgOpen(false)}
        footer={<Button onClick={() => setOrgOpen(false)}>{t("institutDemandeDetails.buttons.close")}</Button>}
        title={t("institutDemandeDetails.modals.orgSourceTitle")}
        destroyOnClose
      >
        {orgDoc ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label={t("institutDemandeDetails.orgFields.name")}>
              {orgDoc.ownerOrg?.name || t("institutDemandeDetails.tags.dash")}
            </Descriptions.Item>
            <Descriptions.Item label={t("institutDemandeDetails.orgFields.slug")}>
              <Tag>{orgDoc.ownerOrg?.slug || t("institutDemandeDetails.tags.dash")}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("institutDemandeDetails.orgFields.type")}>
              <Tag color="blue">{orgDoc.ownerOrg?.type || t("institutDemandeDetails.tags.dash")}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("institutDemandeDetails.orgFields.phone")}>
              {orgDoc.ownerOrg?.phone || t("institutDemandeDetails.tags.dash")}
            </Descriptions.Item>
            <Descriptions.Item label={t("institutDemandeDetails.orgFields.address")}>
              {orgDoc.ownerOrg?.address || t("institutDemandeDetails.tags.dash")}
            </Descriptions.Item>
            <Descriptions.Item label={t("institutDemandeDetails.orgFields.country")}>
              {orgDoc.ownerOrg?.country || t("institutDemandeDetails.tags.dash")}
            </Descriptions.Item>
            <Descriptions.Item label={t("institutDemandeDetails.orgFields.website")}>
              {orgDoc.ownerOrg?.website ? (
                <a href={orgDoc.ownerOrg.website} target="_blank" rel="noreferrer">
                  {orgDoc.ownerOrg.website}
                </a>
              ) : t("institutDemandeDetails.tags.dash")}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Text type="secondary">{t("institutDemandeDetails.modals.noneSelected")}</Text>
        )}
      </Modal>

      {/* ===== Modal Détails Institut acheteur (assignedOrg) ===== */}
      <Modal
        open={buyerOpen}
        onCancel={() => setBuyerOpen(false)}
        footer={<Button onClick={() => setBuyerOpen(false)}>{t("institutDemandeDetails.buttons.close")}</Button>}
        title={t("institutDemandeDetails.modals.buyerTitle")}
        destroyOnClose
      >
        {demande?.assignedOrg ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label={t("institutDemandeDetails.orgFields.nameShort")}>
              {demande.assignedOrg.name || t("institutDemandeDetails.tags.dash")}
            </Descriptions.Item>
            <Descriptions.Item label={t("institutDemandeDetails.orgFields.slug")}>
              <Tag>{demande.assignedOrg.slug || t("institutDemandeDetails.tags.dash")}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("institutDemandeDetails.orgFields.type")}>
              <Tag color="purple">{demande.assignedOrg.type || t("institutDemandeDetails.tags.dash")}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("institutDemandeDetails.orgFields.phone")}>
              {demande.assignedOrg.phone || t("institutDemandeDetails.tags.dash")}
            </Descriptions.Item>
            <Descriptions.Item label={t("institutDemandeDetails.orgFields.address")}>
              {demande.assignedOrg.address || t("institutDemandeDetails.tags.dash")}
            </Descriptions.Item>
            <Descriptions.Item label={t("institutDemandeDetails.orgFields.country")}>
              {demande.assignedOrg.country || t("institutDemandeDetails.tags.dash")}
            </Descriptions.Item>
            <Descriptions.Item label={t("institutDemandeDetails.orgFields.website")}>
              {demande.assignedOrg.website ? (
                <a href={demande.assignedOrg.website} target="_blank" rel="noreferrer">
                  {demande.assignedOrg.website}
                </a>
              ) : t("institutDemandeDetails.tags.dash")}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Text type="secondary">{t("institutDemandeDetails.modals.noneBuyer")}</Text>
        )}
      </Modal>

      {/* Modal Preview PDF */}
      <Modal
        open={preview.open}
        title={preview.title || t("institutDemandeDetails.preview.title")}
        onCancel={() => {
          if (preview.url && preview.url.startsWith('blob:')) {
            URL.revokeObjectURL(preview.url);
          }
          setPreview({ open: false, url: "", title: "" });
        }}
        footer={
          <Space>
            {preview.url && (
              <a href={preview.url} target="_blank" rel="noreferrer">
                <Button type="default">{t("institutDemandeDetails.preview.openInNewTab")}</Button>
              </a>
            )}
            <Button type="primary" onClick={() => {
              if (preview.url && preview.url.startsWith('blob:')) {
                URL.revokeObjectURL(preview.url);
              }
              setPreview({ open: false, url: "", title: "" });
            }}>
              {t("institutDemandeDetails.preview.close")}
            </Button>
          </Space>
        }
        width="95vw"
        style={{ top: 20, paddingBottom: 0 }}
        bodyStyle={{ height: "calc(95vh - 110px)", padding: 0 }}
        destroyOnClose
      >
        {preview.url ? (
          <iframe
            src={preview.url}
            title="aperçu-pdf"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        ) : (
          <div style={{ padding: 16 }}>
            <Spin />
            <Text type="secondary" style={{ marginLeft: 16 }}>{t("institutDemandeDetails.preview.loading")}</Text>
          </div>
        )}
      </Modal>
    </div>
  );
}
