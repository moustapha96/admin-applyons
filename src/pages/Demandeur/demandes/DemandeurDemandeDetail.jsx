/* eslint-disable no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button, Card, Descriptions, Space, Tag, Typography, Divider, Breadcrumb, Modal, Spin, message } from "antd";
import { EditOutlined, FileTextOutlined, FilePdfOutlined } from "@ant-design/icons";
import demandeService from "@/services/demandeService";
import documentService from "@/services/documentService";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

const statusColor = (s) =>
  s === "VALIDATED" ? "green" :
  s === "REJECTED" ? "red" :
  s === "IN_PROGRESS" ? "gold" : "blue";

/** Statuts pour lesquels la candidature peut encore être modifiée (non validée, non rejetée). */
const canEditStatus = (s) => s && s !== "VALIDATED" && s !== "REJECTED" && s !== "CANCELLED" && s !== "IN_PROGRESS";

export default function DemandeurDemandeDetail() {
  const { t, i18n } = useTranslation();
  const { demandeId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acceptanceLetterDoc, setAcceptanceLetterDoc] = useState(null);
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [preview, setPreview] = useState({ open: false, url: "", title: "" });

  useEffect(() => {
    (async () => {
      const res = await demandeService.getById(demandeId);
      setData(res);
      setLoading(false);
    })();
  }, [demandeId]);

  useEffect(() => {
    if (!data?.demande || data.demande.status !== "VALIDATED" || !demandeId) return;
    setLoadingLetter(true);
    (async () => {
      try {
        const res = await documentService.listByDemande(demandeId);
        const list = Array.isArray(res) ? res : (res?.documents || res?.data || []);
        const doc = list.find((item) => (item.type || "").toUpperCase() === "LETTRE_ACCEPTATION");
        setAcceptanceLetterDoc(doc || null);
      } catch (e) {
        setAcceptanceLetterDoc(null);
      } finally {
        setLoadingLetter(false);
      }
    })();
  }, [data?.demande?.status, demandeId]);

  useEffect(() => {
    return () => {
      if (preview.url && preview.url.startsWith("blob:")) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview.url]);

  const openAcceptanceLetter = async () => {
    if (!acceptanceLetterDoc?.id) return;
    try {
      const blob = await documentService.getContent(acceptanceLetterDoc.id, { type: "original", display: true });
      const url = URL.createObjectURL(blob);
      setPreview({
        open: true,
        url,
        title: t("demandeDetail.acceptanceLetter.previewTitle"),
      });
    } catch (error) {
      if (error.response?.status === 403) {
        message.error(t("demandeDetail.acceptanceLetter.accessDenied") || "Accès refusé.");
      } else if (error.response?.status === 404) {
        message.error(t("demandeDetail.acceptanceLetter.notFound") || "Document non disponible.");
      } else {
        message.error(error?.response?.data?.message || error?.message || t("demandeDetail.acceptanceLetter.openError"));
      }
    }
  };

  const d = data?.demande, p = data?.payment, tr = data?.transaction;
  const editable = canEditStatus(d?.status);

  const fmtDateTime = (v) =>
    v ? dayjs(v).locale(i18n.language || "fr").format("DD/MM/YYYY HH:mm") : t("demandeDetail.common.na");
  const fmtDate = (v) =>
    v ? dayjs(v).locale(i18n.language || "fr").format("DD/MM/YYYY") : t("demandeDetail.common.na");

  return (
    <div className="container-fluid relative px-2 sm:px-3 overflow-x-hidden max-w-full">
      <div className="layout-specing py-4 sm:py-6">
        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
          <h5 className="text-base sm:text-lg font-semibold order-2 sm:order-1">{t("demandeDetail.title")}</h5>
          <Breadcrumb
            className="order-1 sm:order-2"
            items={[
              { title: <Link to="/demandeur/dashboard">{t("demandeDetail.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/demandeur/mes-demandes">{t("demandeDetail.breadcrumb.mine")}</Link> },
              { title: <span className="break-words">{d?.code || t("demandeDetail.breadcrumb.detail")}</span> },
            ]}
          />
        </div>

        <Card loading={loading} className="overflow-hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <Title level={4} className="!mb-0 break-words">{d?.code || t("demandeDetail.common.na")}</Title>
            <Space wrap size="small">
              <Link to={`/demandeur/mes-demandes/${demandeId}/documents`}>
                <Button icon={<FileTextOutlined />} className="w-full sm:w-auto">{t("demandeDetail.actions.documents")}</Button>
              </Link>
              {editable && (
                <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/demandeur/mes-demandes/${demandeId}/edit`)} className="w-full sm:w-auto">
                  {t("demandeDetail.actions.edit")}
                </Button>
              )}
            </Space>
          </div>

          {!!d && (
            <>
              {/* Dossier */}
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} title={t("demandeDetail.sections.case")}>
                <Descriptions.Item label={t("demandeDetail.fields.code")}>{d.code || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.status")}>
                  <Tag color={statusColor(d.status)}>{t(`demandeurDemandes.status.${d.status || "PENDING"}`)}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.targetOrg")}>
                  {d.targetOrg?.name || t("demandeDetail.common.na")}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.assignedOrg")}>
                  {d.assignedOrg?.name ? <Tag color="geekblue">{d.assignedOrg.name}</Tag> : t("demandeDetail.common.na")}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.createdAt")} span={2}>
                  {fmtDateTime(d.dateDemande)}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.periode")}>
                  {d.periode ? t(`demandeurDemandes.periods.${d.periode}`) : t("demandeDetail.common.na")}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.year")}>{d.year || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.observation")} span={2}>
                  {d.observation || t("demandeDetail.common.na")}
                </Descriptions.Item>
              </Descriptions>

              {/* Lettre d'acceptation (visible uniquement si candidature acceptée) */}
              {d.status === "VALIDATED" && (
                <>
                  <Divider>{t("demandeDetail.acceptanceLetter.sectionTitle")}</Divider>
                  <Card size="small" className="mb-4">
                    {loadingLetter ? (
                      <Space><Spin size="small" /><Text type="secondary">{t("demandeDetail.acceptanceLetter.loading")}</Text></Space>
                    ) : acceptanceLetterDoc ? (
                      <Space wrap>
                        <Button type="primary" icon={<FilePdfOutlined />} onClick={openAcceptanceLetter}>
                          {t("demandeDetail.acceptanceLetter.viewButton")}
                        </Button>
                        {acceptanceLetterDoc.createdAt && (
                          <Text type="secondary">{t("demandeDetail.acceptanceLetter.addedOn")} {fmtDateTime(acceptanceLetterDoc.createdAt)}</Text>
                        )}
                      </Space>
                    ) : (
                      <Text type="secondary">{t("demandeDetail.acceptanceLetter.notYetAvailable")}</Text>
                    )}
                  </Card>
                </>
              )}

              {/* Académique */}
              <Divider>{t("demandeDetail.sections.academic")}</Divider>
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label={t("demandeDetail.fields.serie")}>{d.serie || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.niveau")}>{d.niveau || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.mention")}>{d.mention || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.schoolYear")}>{d.annee || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.countryOfSchool")}>{d.countryOfSchool || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.secondarySchoolName")}>{d.secondarySchoolName || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.graduationDate")} span={2}>
                  {fmtDate(d.graduationDate)}
                </Descriptions.Item>
              </Descriptions>

              {/* Identité */}
              <Divider>{t("demandeDetail.sections.identity")}</Divider>
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label={t("demandeDetail.fields.dob")}>{fmtDate(d.dob)}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.citizenship")}>{d.citizenship || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.passport")}>{d.passport || t("demandeDetail.common.na")}</Descriptions.Item>
              </Descriptions>

              {/* Anglais / Tests */}
              <Divider>{t("demandeDetail.sections.englishTests")}</Divider>
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label={t("demandeDetail.fields.isEnglishFirstLanguage")}>
                  {d.isEnglishFirstLanguage ? t("demandeDetail.common.yes") : t("demandeDetail.common.no")}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.testScores")}>{d.testScores || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.englishProficiencyTests")} span={2}>
                  <pre className="whitespace-pre-wrap break-words !m-0 text-xs sm:text-sm">
                    {d.englishProficiencyTests ? JSON.stringify(d.englishProficiencyTests) : t("demandeDetail.common.na")}
                  </pre>
                </Descriptions.Item>
              </Descriptions>

              {/* Scolarité / Notes */}
              <Divider>{t("demandeDetail.sections.schooling")}</Divider>
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label={t("demandeDetail.fields.gradingScale")}>{d.gradingScale || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.gpa")}>{d.gpa || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.examsTaken")} span={2}>
                  <pre className="whitespace-pre-wrap break-words !m-0 text-xs sm:text-sm">
                    {d.examsTaken ? JSON.stringify(d.examsTaken) : t("demandeDetail.common.na")}
                  </pre>
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.intendedMajor")} span={2}>
                  {d.intendedMajor || t("demandeDetail.common.na")}
                </Descriptions.Item>
              </Descriptions>

              {/* Activités & Distinctions */}
              <Divider>{t("demandeDetail.sections.activities")}</Divider>
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label={t("demandeDetail.fields.extracurricularActivities")} span={2}>
                  {d.extracurricularActivities || t("demandeDetail.common.na")}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.honorsOrAwards")} span={2}>
                  {d.honorsOrAwards || t("demandeDetail.common.na")}
                </Descriptions.Item>
              </Descriptions>

              {/* Famille */}
              <Divider>{t("demandeDetail.sections.family")}</Divider>
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label={t("demandeDetail.fields.parentGuardianName")}>{d.parentGuardianName || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.occupation")}>{d.occupation || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.educationLevel")}>{d.educationLevel || t("demandeDetail.common.na")}</Descriptions.Item>
              </Descriptions>

              {/* Financier */}
              <Divider>{t("demandeDetail.sections.finance")}</Divider>
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label={t("demandeDetail.fields.willApplyForFinancialAid")}>
                  {d.willApplyForFinancialAid ? t("demandeDetail.common.yes") : t("demandeDetail.common.no")}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.hasExternalSponsorship")}>
                  {d.hasExternalSponsorship ? t("demandeDetail.common.yes") : t("demandeDetail.common.no")}
                </Descriptions.Item>
              </Descriptions>

              {/* Visa */}
              <Divider>{t("demandeDetail.sections.visa")}</Divider>
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label={t("demandeDetail.fields.visaType")}>{d.visaType || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.hasPreviouslyStudiedInUS")}>
                  {d.hasPreviouslyStudiedInUS ? t("demandeDetail.common.yes") : t("demandeDetail.common.no")}
                </Descriptions.Item>
              </Descriptions>

              {/* Essays */}
              <Divider>{t("demandeDetail.sections.essays")}</Divider>
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label={t("demandeDetail.fields.personalStatement")} span={2}>
                  {d.personalStatement || t("demandeDetail.common.na")}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.optionalEssay")} span={2}>
                  {d.optionalEssay || t("demandeDetail.common.na")}
                </Descriptions.Item>
              </Descriptions>

              {/* Candidature */}
              <Divider>{t("demandeDetail.sections.application")}</Divider>
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label={t("demandeDetail.fields.applicationRound")}>{d.applicationRound || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.howDidYouHearAboutUs")}>{d.howDidYouHearAboutUs || t("demandeDetail.common.na")}</Descriptions.Item>
              </Descriptions>

              {/* Paiement / Transaction (optionnel) */}
              {/* <Card className="mt-4" size="small" title={t("demandeDetail.sections.paymentTransaction")}>
                {p || tr ? (
                  <Descriptions size="small" column={2}>
                    {tr && <>
                      <Descriptions.Item label={t("demandeDetail.fields.txStatus")}>{tr.statut}</Descriptions.Item>
                      <Descriptions.Item label={t("demandeDetail.fields.txAmount")}>{tr.montant}</Descriptions.Item>
                    </>}
                    {p && <>
                      <Descriptions.Item label={t("demandeDetail.fields.provider")}>{p.provider}</Descriptions.Item>
                      <Descriptions.Item label={t("demandeDetail.fields.paymentStatus")}>{p.status}</Descriptions.Item>
                      <Descriptions.Item label={t("demandeDetail.fields.amount")}>{p.amount} {p.currency}</Descriptions.Item>
                      <Descriptions.Item label={t("demandeDetail.fields.paymentType")}>{p.paymentType}</Descriptions.Item>
                    </>}
                  </Descriptions>
                ) : t("demandeDetail.empty.noPayment")}
              </Card> */}
            </>
          )}
        </Card>

        {/* Modal aperçu PDF lettre d'acceptation */}
        <Modal
          open={preview.open}
          title={preview.title}
          onCancel={() => {
            if (preview.url?.startsWith("blob:")) URL.revokeObjectURL(preview.url);
            setPreview({ open: false, url: "", title: "" });
          }}
          footer={[
            preview.url ? (
              <a key="newtab" href={preview.url} target="_blank" rel="noreferrer">
                <Button>{t("demandeDetail.acceptanceLetter.openInNewTab")}</Button>
              </a>
            ) : null,
            <Button key="close" type="primary" onClick={() => { if (preview.url?.startsWith("blob:")) URL.revokeObjectURL(preview.url); setPreview({ open: false, url: "", title: "" }); }}>
              {t("demandeDetail.acceptanceLetter.close")}
            </Button>,
          ].filter(Boolean)}
          width="95vw"
          style={{ top: 20, paddingBottom: 0, maxWidth: "1200px" }}
          styles={{ body: { height: "calc(95vh - 110px)", padding: 0 } }}
          destroyOnClose
        >
          {preview.url ? (
            <iframe src={preview.url} title="lettre-acceptation" style={{ width: "100%", height: "100%", border: "none" }} />
          ) : (
            <div style={{ padding: 16 }}><Text type="secondary">{t("demandeDetail.acceptanceLetter.noContent")}</Text></div>
          )}
        </Modal>
      </div>
    </div>
  );
}
