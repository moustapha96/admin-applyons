
/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Space,
  Button,
  Typography,
  message,
  Breadcrumb,
  Modal,
  Upload,
  Input,
  Tooltip,
  Popconfirm,
  Spin,
} from "antd";
import dayjs from "dayjs";
import demandeService from "@/services/demandeService";
import documentService from "@/services/documentService";
import { CloudUploadOutlined, EyeOutlined, DownloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;
const { Dragger } = Upload;

const fmtDate = (d, f = "DD/MM/YYYY") => (d ? (dayjs(d).isValid() ? dayjs(d).format(f) : "—") : "—");
const yesNo = (v, t) => (v ? t("traducteurDemandeDetails.common.yes") : t("traducteurDemandeDetails.common.no"));

const statusColor = (status) => {
  switch ((status || "PENDING").toUpperCase()) {
    case "VALIDATED":
      return "green";
    case "REJECTED":
      return "red";
    case "IN_PROGRESS":
      return "gold";
    case "PENDING":
    default:
      return "blue";
  }
};

// Corrige les URLs sans slash après le host (ex: http://localhost:5000uploads/...)
const safeUrl = (u) => {
  if (!u) return null;
  if (/^https?:\/\/[^/]+uploads\//i.test(u)) {
    return u.replace(/(https?:\/\/[^/]+)uploads\//i, "$1/uploads/");
  }
  return u;
};

export default function TranslatorDemandeDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [demande, setDemande] = useState(null);
  const [documents, setDocuments] = useState([]);

  // Modal upload traduction
  const [openModal, setOpenModal] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [encryptionKeyTraduit, setEncryptionKeyTraduit] = useState("");
  const [uploading, setUploading] = useState(false);


  // Modal preview PDF
  const [preview, setPreview] = useState({ open: false, url: "", title: "" });

  const fetchDemande = useCallback(async () => {
    setLoading(true);
    try {
      const res = await demandeService.getById(id);
      const d = res?.demande ?? res ?? null;
      if (!d) {
        message.warning(t("traducteurDemandeDetails.messages.noData"));
        setDemande(null);
        setDocuments([]);
        return;
      }
      setDemande(d);
      setDocuments(Array.isArray(d.documents) ? d.documents : []);
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("traducteurDemandeDetails.messages.loadError"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDemande();
  }, [fetchDemande, t]);

  const updateStatus = async (status) => {
    try {
      await demandeService.changeStatus(id, status);
      message.success(t("traducteurDemandeDetails.messages.statusUpdated"));
      fetchDemande();
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("traducteurDemandeDetails.messages.statusUpdateError"));
    }
  };

  const docsCount = useMemo(() => {
    return (
      (demande?._count && typeof demande._count.documents === "number" && demande._count.documents) ||
      documents.length ||
      0
    );
  }, [demande, documents]);

  // Upload traduction
  const openUploadTranslation = (doc) => {
    setCurrentDoc(doc);
    setUploadFile(null);
    setEncryptionKeyTraduit("");
    setOpenModal(true);
  };
  const onChangeUpload = ({ fileList }) => {
    setUploadFile(fileList?.[0]?.originFileObj || null);
  };
  const submitUploadTranslation = async () => {
    if (!currentDoc) return;
    if (!uploadFile) {
      return message.warning(t("traducteurDemandeDetails.messages.uploadWarning"));
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", uploadFile);
      await documentService.traduireUpload(currentDoc.id, form);
      message.success(t("traducteurDemandeDetails.messages.uploadSuccess"));
      setOpenModal(false);
      await fetchDemande();
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("traducteurDemandeDetails.messages.uploadError"));
    } finally {
      setUploading(false); // Désactive le loader
    }
  };

  // Suppression traduction
  const deleteTranslation = async (docId) => {
    try {
      await documentService.deleteTranslation(docId);
      message.success(t("traducteurDemandeDetails.messages.deleteSuccess"));
      await fetchDemande();
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("traducteurDemandeDetails.messages.deleteError"));
    }
  };

  // Prévisualisation intégrée (in-app)
  const openPreview = (doc, kind = "original") => {
    const raw =
      kind === "traduit"
        ? (safeUrl(doc.urlTraduit) || safeUrl(doc.urlChiffreTraduit))
        : (safeUrl(doc.urlOriginal) || safeUrl(doc.urlChiffre));

    if (!raw) {
      message.warning(t("traducteurDemandeDetails.messages.noFileAvailable"));
      return;
    }
    // Option : si tu as un endpoint sécurisé de content streaming, utilise-le ici
    // const url = documentService.getDocumentContentUrl(doc.id, kind, true);
    const url = raw;
    setPreview({
      open: true,
      url,
      title: kind === "traduit" ? t("traducteurDemandeDetails.messages.previewTitleTranslated", { id: doc.id }) : t("traducteurDemandeDetails.messages.previewTitleOriginal", { id: doc.id }),
    });
  };

  const downloadDirect = (doc, kind = "original") => {
    const raw =
      kind === "traduit"
        ? (safeUrl(doc.urlTraduit) || safeUrl(doc.urlChiffreTraduit))
        : (safeUrl(doc.urlOriginal) || safeUrl(doc.urlChiffre));
    if (!raw) {
      message.warning(t("traducteurDemandeDetails.messages.noFileToDownload"));
      return;
    }
    window.open(raw, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div className="container-fluid relative px-3">
        <div className="layout-specing">
          <div className="md:flex justify-between items-center mb-6">
            <h5 className="text-lg font-semibold">{t("traducteurDemandeDetails.title")}</h5>
            <Breadcrumb
              items={[
                { title: <Link to="/traducteur/dashboard">{t("traducteurDemandeDetails.breadcrumbs.dashboard")}</Link> },
                { title: <Link to="/traducteur/demandes">{t("traducteurDemandeDetails.breadcrumbs.demandes")}</Link> },
                { title: t("traducteurDemandeDetails.breadcrumbs.detail") },
              ]}
            />
          </div>

          <div className="p-2 md:p-4">
            <Space align="center" className="mb-2" size="middle" wrap>
              <Title level={3} style={{ margin: 0 }}>
                {t("traducteurDemandeDetails.pageTitle")}
              </Title>
              <Button onClick={() => navigate(-1)}>{t("traducteurDemandeDetails.buttons.back")}</Button>
              <Link to={`/traducteur/demandes/${id}/documents`}>
                <Button type="primary">{t("traducteurDemandeDetails.buttons.documents")}</Button>
              </Link>
            </Space>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={14}>
                <Card loading={loading} title={t("traducteurDemandeDetails.sections.generalInfo")}>
                  {demande && (
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.code")}>{demande.code || "—"}</Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.dateDemande")}>{fmtDate(demande.dateDemande)}</Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.status")}>
                        <Tag color={statusColor(demande.status)}>{demande.status || "PENDING"}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.demandeur")}>
                        {demande.user?.firstName || demande.user?.lastName
                          ? `${demande.user?.firstName || ""} ${demande.user?.lastName || ""}`.trim()
                          : demande.user?.email || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.targetOrg")}>
                        {demande.targetOrg?.name || "—"}{" "}
                        {demande.targetOrg?.type && <Tag style={{ marginLeft: 8 }}>{demande.targetOrg?.type}</Tag>}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.assignedOrg")}>
                        {demande.assignedOrg?.name || "—"}{" "}
                        {demande.assignedOrg?.type && <Tag style={{ marginLeft: 8 }}>{demande.assignedOrg?.type}</Tag>}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.periodeYear")}>
                        {demande.periode || "—"} / {demande.year || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.serieNiveauMention")}>
                        {(demande.serie || "—") + " / " + (demande.niveau || "—") + " / " + (demande.mention || "—")}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.secondarySchool")}>
                        {(demande.secondarySchoolName || "—") + " (" + (demande.countryOfSchool || "—") + ")"}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.graduationDate")}>{fmtDate(demande.graduationDate)}</Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.dob")}>{fmtDate(demande.dob)}</Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.citizenshipPassport")}>
                        {(demande.citizenship || "—") + " / " + (demande.passport || "—")}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.englishFirstLanguage")}>{yesNo(demande.isEnglishFirstLanguage, t)}</Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.englishTests")}>{demande.englishProficiencyTests || "—"}</Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.scoresGpaScale")}>
                        {(demande.testScores || "—") + " / " + (demande.gpa || "—") + " / " + (demande.gradingScale || "—")}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.examsTaken")}>{demande.examsTaken || "—"}</Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.intendedMajor")}>{demande.intendedMajor || "—"}</Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.activitiesAwards")}>
                        {(demande.extracurricularActivities || "—") + " / " + (demande.honorsOrAwards || "—")}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.parentInfo")}>
                        {(demande.parentGuardianName || "—") +
                          " / " +
                          (demande.educationLevel || "—") +
                          " / " +
                          (demande.occupation || "—")}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.financialAid")}>
                        {yesNo(demande.willApplyForFinancialAid, t)} / {yesNo(demande.hasExternalSponsorship, t)}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.visa")}>
                        {(demande.visaType || "—") + " / " + yesNo(demande.hasPreviouslyStudiedInUS, t)}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.personalStatement")}>
                        <Text>{demande.personalStatement || "—"}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.optionalEssay")}>
                        <Text>{demande.optionalEssay || "—"}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.applicationRound")}>
                        {(demande.applicationRound || "—") + " / " + (demande.howDidYouHearAboutUs || "—")}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.observation")}>
                        <Text>{demande.observation || "—"}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.createdAt")}>
                        {fmtDate(demande.createdAt, "DD/MM/YYYY HH:mm")} / {fmtDate(demande.updatedAt, "DD/MM/YYYY HH:mm")}
                      </Descriptions.Item>
                      <Descriptions.Item label={t("traducteurDemandeDetails.fields.documents")}>
                        <Tag>{docsCount}</Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  )}
                </Card>

              </Col>

              <Col xs={24} md={10}>
                <Card loading={loading} title={t("traducteurDemandeDetails.sections.documentsPreview")}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {documents.slice(0, 5).map((d) => {
                      const uOrig = safeUrl(d.urlOriginal) || safeUrl(d.urlChiffre);
                      const uTrad = safeUrl(d.urlTraduit) || safeUrl(d.urlChiffreTraduit);
                      return (
                        <div
                          key={d.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                            width: "100%",
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div>
                              <Tag style={{ marginTop: 4 }}>{d.ownerOrg?.name || "—"}</Tag>
                              {d.estTraduit ? <Tag color="green">{t("traducteurDemandeDetails.documents.translated")}</Tag> : <Tag>{t("traducteurDemandeDetails.documents.notTranslated")}</Tag>}
                            </div>
                          </div>

                          <Space wrap size="small">


                            {uOrig && (
                              <a href={uOrig} target="_blank" rel="noreferrer">
                                <Button
                                  size="small"
                                  icon={<EyeOutlined />}
                                  type="default"
                                  onClick={() => openPreview(d, "traduit")}
                                >
                                  {t("traducteurDemandeDetails.documents.view")}
                                </Button>
                              </a>
                            )}

                            {uTrad && (
                              <>
                                <a href={uTrad} target="_blank" rel="noreferrer">
                                  <Button
                                    size="small"
                                    icon={<EyeOutlined />}
                                    type="default"
                                    onClick={() => openPreview(d, "traduit")}
                                  >
                                    {t("traducteurDemandeDetails.documents.viewTranslated")}
                                  </Button>
                                </a>
                              </>
                            )}

                            {/* Uploader traduction si non traduit */}
                            {!d.estTraduit && (
                              <Tooltip title={t("traducteurDemandeDetails.tooltips.uploadTranslation")}>
                                <Button
                                  size="small"
                                  type="primary"
                                  icon={<CloudUploadOutlined />}
                                  onClick={() => openUploadTranslation(d)}
                                >
                                  {t("traducteurDemandeDetails.documents.translate")}
                                </Button>
                              </Tooltip>
                            )}

                            {/* Supprimer traduction si disponible */}
                            {d.estTraduit && (
                              <Tooltip title={t("traducteurDemandeDetails.tooltips.deleteTranslation")}>
                                <Popconfirm
                                  title={t("traducteurDemandeDetails.modals.deleteTitle")}
                                  okText={t("traducteurDemandeDetails.modals.deleteButton")}
                                  okButtonProps={{ danger: true }}
                                  cancelText={t("traducteurDemandeDetails.modals.cancel")}
                                  onConfirm={() => deleteTranslation(d.id)}
                                >
                                  <Button size="small" danger>
                                    {t("traducteurDemandeDetails.documents.delete")}
                                  </Button>
                                </Popconfirm>
                              </Tooltip>
                            )}


                          </Space>
                        </div>
                      );
                    })}
                    {documents.length === 0 && <Text type="secondary">{t("traducteurDemandeDetails.documents.none")}</Text>}
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </div>

      {/* Modal Upload Traduction */}
      <Modal
        open={openModal}
        title={currentDoc ? t("traducteurDemandeDetails.modals.uploadTitle", { id: currentDoc.id }) : t("traducteurDemandeDetails.modals.uploadTitleGeneric")}
        onCancel={() => setOpenModal(false)}
        onOk={submitUploadTranslation}
        okText={t("traducteurDemandeDetails.modals.save")}
        okButtonProps={{ loading: uploading }}
        destroyOnHidden
      >
        <Spin spinning={uploading}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Dragger
              multiple={false}
              accept=".pdf"
              beforeUpload={() => false}
              onChange={({ fileList }) => onChangeUpload({ fileList })}
              fileList={uploadFile ? [{ uid: "1", name: uploadFile.name }] : []}
            >
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined />
              </p>
              <p className="ant-upload-text">{t("traducteurDemandeDetails.modals.uploadText")}</p>
              <p className="ant-upload-hint">{t("traducteurDemandeDetails.modals.uploadHint")}</p>
            </Dragger>
          </Space>
        </Spin>


      </Modal>

      {/* Modal Preview PDF */}
      <Modal
        open={preview.open}
        title={preview.title || t("traducteurDemandeDetails.modals.previewTitle")}
        onCancel={() => setPreview({ open: false, url: "", title: "" })}
        footer={
          <Space>
            {preview.url && (
              <a href={preview.url} target="_blank" rel="noreferrer">
                <Button type="default">{t("traducteurDemandeDetails.modals.openInNewTab")}</Button>
              </a>
            )}
            <Button type="primary" onClick={() => setPreview({ open: false, url: "", title: "" })}>
              {t("traducteurDemandeDetails.modals.close")}
            </Button>
          </Space>
        }
        width="80vw"
        style={{ height: "85vh", padding: 0 }}
        destroyOnHidden
      >
        {preview.url ? (
          <iframe
            src={preview.url}
            title="aperçu-pdf"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        ) : (
          <div style={{ padding: 16 }}>
            <Text type="secondary">{t("traducteurDemandeDetails.modals.noContent")}</Text>
          </div>
        )}
      </Modal>
    </>
  );
}
