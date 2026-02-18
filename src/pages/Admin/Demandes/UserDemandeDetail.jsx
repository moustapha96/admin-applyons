/* eslint-disable react/jsx-key */
// src/pages/Admin/Demandes/UserDemandeDetail.jsx — détail demande admin (documents, lettre d'acceptation, passeport, etc.)
"use client";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  Card,
  Descriptions,
  Space,
  Button,
  Divider,
  Tag,
  Spin,
  Tabs,
  Modal,
  message,
  Table,
  Typography,
  Drawer,
} from "antd";
import {
  FileTextOutlined,
  ArrowLeftOutlined,
  FilePdfOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import demandeService from "@/services/demandeService";
import documentService from "@/services/documentService";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { hasTranslation, normalizeDocument } from "@/utils/documentUtils";


const statusTagColor = (s) => {
  switch (s) {
    case "VALIDATED": return "green";
    case "REJECTED": return "red";
    case "IN_PROGRESS": return "gold";
    default: return "blue";
  }
};

const fmtDate = (v, withTime = false) => {
  if (!v) return "—";
  return dayjs(v).format(withTime ? "DD/MM/YYYY HH:mm" : "DD/MM/YYYY");
};

export default function AdminDemandeDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  const [demandeData, setDemandeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const userOrgId = user?.organization?.id ?? null;

  const load = async () => {
    setLoading(true);
    try {
      const res = await demandeService.getById(id);
      const data = res?.demande ?? res;
      setDemandeData(data ? { demande: data } : null);
    } catch (e) {
      message.error(e?.response?.data?.message || t("adminDemandeDetail.messages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const d = demandeData?.demande ?? null;
  const docs = useMemo(
    () => (d?.documents ?? []).map((doc) => normalizeDocument({ ...doc })),
    [d?.documents]
  );
  const acceptanceLetterDoc = useMemo(
    () => docs.find((doc) => (doc.type || "").toUpperCase() === "LETTRE_ACCEPTATION") || null,
    [docs]
  );
  const docsWithoutAcceptanceLetter = useMemo(
    () => docs.filter((doc) => (doc.type || "").toUpperCase() !== "LETTRE_ACCEPTATION"),
    [docs]
  );

  // Preview modal (PDF) — blob ou URL directe (passport)
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const openUrl = async (doc, type = "original") => {
    if (!doc?.id) {
      message.warning(t("adminDemandeDetail.messages.noDocument") || "Document non disponible");
      return;
    }
    try {
      const blob = await documentService.getContent(doc.id, { type, display: true });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewTitle(type === "traduit" ? t("adminDemandeDetail.documents.translated") : t("adminDemandeDetail.documents.original"));
      setPreviewVisible(true);
    } catch (e) {
      if (e?.response?.status === 401) message.error(t("adminDemandeDetail.messages.sessionExpired") || "Session expirée.");
      else if (e?.response?.status === 403) message.error(t("adminDemandeDetail.messages.accessDenied") || "Accès refusé.");
      else message.error(e?.response?.data?.message || e?.message || t("adminDemandeDetail.messages.openError"));
    }
  };

  const openPassportPreview = () => {
    const path = d?.documentPassport ?? d?.personalInfo?.documentPassport;
    if (!path) return;
    const base = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL_SIMPLE) || "";
    const fullUrl = base.replace(/\/$/, "") + (path.startsWith("/") ? path : `/${path}`);
    setPreviewUrl(fullUrl);
    setPreviewTitle(t("adminDemandeDetail.passport.title", "Passport (PDF)"));
    setPreviewVisible(true);
  };

  const canDeleteDoc = (r) => {
    const isOwner = (r.ownerOrgId && r.ownerOrgId === userOrgId) || (r.ownerOrg?.id && r.ownerOrg.id === userOrgId);
    return Boolean(isOwner && hasPermission("documents.delete"));
  };

  const handleDeleteDocument = (docRow) => {
    if (!docRow?.id) return;
    const isOwner = (docRow.ownerOrgId && docRow.ownerOrgId === userOrgId) || (docRow.ownerOrg?.id && docRow.ownerOrg.id === userOrgId);
    if (!isOwner || !hasPermission("documents.delete")) return;
    Modal.confirm({
      title: t("adminDemandeDetail.documents.deleteConfirmTitle") || "Supprimer ce document ?",
      content: t("adminDemandeDetail.documents.deleteConfirmMessage") || "Cette action est irréversible.",
      okText: t("common.yes"),
      okType: "danger",
      cancelText: t("common.no"),
      onOk: async () => {
        try {
          await documentService.remove(docRow.id);
          message.success(t("adminDemandeDetail.messages.docDeleted") || "Document supprimé.");
          await load();
        } catch (e) {
          message.error(e?.response?.data?.message || e?.message || "Erreur lors de la suppression.");
        }
      },
    });
  };

  const verifyIntegrity = async (docId) => {
    try {
      const r = await documentService.verifyIntegrity(docId);
      Modal.info({
        title: t("adminDemandeDetail.verify.title"),
        content: (
          <div>
            <div>
              {t("adminDemandeDetail.verify.original")} :{" "}
              {r?.results?.original?.integrityOk ? (
                <Tag color="green">{t("adminDemandeDetail.verify.valid")}</Tag>
              ) : (
                <Tag color="red">{t("adminDemandeDetail.verify.invalid")}</Tag>
              )}
            </div>
            {r?.results?.traduit && (
              <div style={{ marginTop: 8 }}>
                {t("adminDemandeDetail.verify.translated")} :{" "}
                {r?.results?.traduit?.integrityOk ? (
                  <Tag color="green">{t("adminDemandeDetail.verify.valid")}</Tag>
                ) : (
                  <Tag color="red">{t("adminDemandeDetail.verify.invalid")}</Tag>
                )}
              </div>
            )}
            <div style={{ marginTop: 8 }}>
              {t("adminDemandeDetail.verify.blockchain")} : {r?.chainValid ? <Tag color="blue">{t("adminDemandeDetail.verify.ok")}</Tag> : <Tag color="red">{t("adminDemandeDetail.verify.notValid")}</Tag>}
            </div>
          </div>
        ),
      });
    } catch {
      message.error(t("adminDemandeDetail.messages.verifyError"));
    }
  };

  if (loading || !d) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Spin />
      </div>
    );
  }

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("adminDemandeDetail.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("adminDemandeDetail.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/admin/demandes">{t("adminDemandeDetail.breadcrumb.demandes")}</Link> },
              { title: `#${d.code}` },
            ]}
          />
        </div>

        <div className="mb-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>{t("adminDemandeDetail.actions.back")}</Button>
        </div>

        <Card>
         
          <Descriptions bordered column={2} title={t("adminDemandeDetail.sections.mainInfo")}>
            <Descriptions.Item label={t("adminDemandeDetail.fields.code")}>
              <Space>
                <FileTextOutlined />
                <Tag color="blue">{d.code}</Tag>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t("adminDemandeDetail.fields.date")}>
              {d.dateDemande ? dayjs(d.dateDemande).format("DD/MM/YYYY HH:mm") : t("adminDemandeDetail.common.na")}
            </Descriptions.Item>

            <Descriptions.Item label={t("adminDemandeDetail.fields.status")} span={2}>
              <Tag color={statusTagColor(d.status)}>{d.status || "PENDING"}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t("adminDemandeDetail.fields.demandeur")} span={2}>
              {d.user?.email} {d.user?.firstName || d.user?.lastName ? `— ${d.user?.firstName ?? ""} ${d.user?.lastName ?? ""}` : ""}
            </Descriptions.Item>

            <Descriptions.Item label={t("adminDemandeDetail.fields.targetOrg")}>
              {d.targetOrg ? (
                <Link to={`/admin/organisations/${d.targetOrg.id}`}>{d.targetOrg.name}</Link>
              ) : t("adminDemandeDetail.common.na")}
            </Descriptions.Item>

            <Descriptions.Item label={t("adminDemandeDetail.fields.assignedOrg")}>
              {d.assignedOrg ? (
                <Link to={`/admin/organisations/${d.assignedOrg.id}`}>{d.assignedOrg.name}</Link>
              ) : t("adminDemandeDetail.common.na")}
            </Descriptions.Item>

            <Descriptions.Item label={t("adminDemandeDetail.fields.periode")}>
              {d.periode || t("adminDemandeDetail.common.na")}
            </Descriptions.Item>
            <Descriptions.Item label={t("adminDemandeDetail.fields.year")}>
              {d.year || t("adminDemandeDetail.common.na")}
            </Descriptions.Item>

            <Descriptions.Item label={t("adminDemandeDetail.fields.observation")} span={2}>
              {d.observation || t("adminDemandeDetail.common.na")}
            </Descriptions.Item>
          </Descriptions>

          <div className="mt-3">
            <Button type="default" icon={<UnorderedListOutlined />} onClick={() => setDrawerOpen(true)}>
              {t("adminDemandeDetail.drawer.openButton") || "Voir toutes les informations"}
            </Button>
          </div>

          {/* Passport (PDF) */}
          <Divider />
          <Card size="small" className="mt-3" title={t("adminDemandeDetail.passport.title") || "Passport (PDF)"}>
            {(d.documentPassport ?? d.personalInfo?.documentPassport) ? (
              <Button type="primary" ghost icon={<FilePdfOutlined />} onClick={openPassportPreview}>
                {t("adminDemandeDetail.passport.view") || "Voir le passeport"}
              </Button>
            ) : (
              <Typography.Text type="secondary">{t("adminDemandeDetail.passport.notAvailable") || "Non disponible."}</Typography.Text>
            )}
          </Card>

          {/* Lettre d'acceptation (si statut VALIDATED) */}
          {d.status === "VALIDATED" && (
            <>
              <Divider />
              <Card size="small" className="mt-3" title={t("adminDemandeDetail.acceptanceLetter.title") || "Lettre d'acceptation"}>
                {acceptanceLetterDoc ? (
                  <Space wrap>
                    <Button type="primary" size="small" icon={<FileTextOutlined />} onClick={() => openUrl(acceptanceLetterDoc, "original")}>
                      {t("adminDemandeDetail.acceptanceLetter.view") || "Voir / Télécharger"}
                    </Button>
                    <Tag color="green">{t("adminDemandeDetail.acceptanceLetter.addedOn") || "Ajoutée le"} {fmtDate(acceptanceLetterDoc.createdAt, true)}</Tag>
                    {canDeleteDoc(acceptanceLetterDoc) && (
                      <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteDocument(acceptanceLetterDoc)}>
                        {t("adminDemandeDetail.documents.delete") || "Supprimer"}
                      </Button>
                    )}
                  </Space>
                ) : (
                  <Typography.Text type="secondary">{t("adminDemandeDetail.acceptanceLetter.notAdded") || "Aucune lettre d'acceptation ajoutée."}</Typography.Text>
                )}
              </Card>
            </>
          )}

          <Divider />

          <Tabs 
            defaultActiveKey="acad"
            items={[
              {
                key: "acad",
                label: t("adminDemandeDetail.tabs.academic"),
                children: (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label={t("adminDemandeDetail.academicFields.serie")}>{d.academicInfo?.serie ?? d.serie ?? t("adminDemandeDetail.common.na")}</Descriptions.Item>
                    <Descriptions.Item label={t("adminDemandeDetail.academicFields.niveau")}>{d.academicInfo?.niveau ?? d.niveau ?? t("adminDemandeDetail.common.na")}</Descriptions.Item>
                    <Descriptions.Item label={t("adminDemandeDetail.academicFields.mention")}>{d.academicInfo?.mention ?? d.mention ?? t("adminDemandeDetail.common.na")}</Descriptions.Item>
                    <Descriptions.Item label={t("adminDemandeDetail.academicFields.annee")}>{d.academicInfo?.annee ?? d.annee ?? t("adminDemandeDetail.common.na")}</Descriptions.Item>
                    <Descriptions.Item label={t("adminDemandeDetail.academicFields.countryOfSchool")}>{d.academicInfo?.countryOfSchool ?? d.countryOfSchool ?? t("adminDemandeDetail.common.na")}</Descriptions.Item>
                    <Descriptions.Item label={t("adminDemandeDetail.academicFields.secondarySchoolName")}>{d.academicInfo?.secondarySchoolName ?? d.secondarySchoolName ?? t("adminDemandeDetail.common.na")}</Descriptions.Item>
                    <Descriptions.Item label={t("adminDemandeDetail.academicFields.graduationDate")} span={2}>
                      {d.academicInfo?.graduationDate ?? d.graduationDate ? dayjs(d.academicInfo?.graduationDate ?? d.graduationDate).format("DD/MM/YYYY") : t("adminDemandeDetail.common.na")}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: "identite",
                label: t("adminDemandeDetail.tabs.identity"),
                children: (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label={t("adminDemandeDetail.identityFields.dob")}>
                      {d.personalInfo?.dob ?? d.dob ? dayjs(d.personalInfo?.dob ?? d.dob).format("DD/MM/YYYY") : t("adminDemandeDetail.common.na")}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("adminDemandeDetail.identityFields.citizenship")}>{d.personalInfo?.citizenship ?? d.citizenship ?? t("adminDemandeDetail.common.na")}</Descriptions.Item>
                    <Descriptions.Item label={t("adminDemandeDetail.identityFields.passport")} span={2}>{d.personalInfo?.passport ?? d.passport ?? t("adminDemandeDetail.common.na")}</Descriptions.Item>
                    <Descriptions.Item label={t("adminDemandeDetail.identityFields.isEnglishFirstLanguage")}>
                      {d.englishInfo?.isEnglishFirstLanguage ?? d.isEnglishFirstLanguage ? t("adminDemandeDetail.common.yes") : t("adminDemandeDetail.common.no")}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("adminDemandeDetail.identityFields.englishProficiencyTests")}>
                      {(() => {
                        const raw = d.englishInfo?.englishProficiencyTests ?? d.englishProficiencyTests;
                        return Array.isArray(raw) ? raw.join(", ") : (raw != null ? String(raw) : t("adminDemandeDetail.common.na"));
                      })()}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("adminDemandeDetail.identityFields.testScores")}>{d.englishInfo?.testScores ?? d.testScores ?? t("adminDemandeDetail.common.na")}</Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: "fin",
                label: t("adminDemandeDetail.tabs.financial"),
                children: (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label={t("adminDemandeDetail.financialFields.willApplyForFinancialAid")}>
                      {d.financialInfo?.willApplyForFinancialAid ?? d.willApplyForFinancialAid ? t("adminDemandeDetail.common.yes") : t("adminDemandeDetail.common.no")}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("adminDemandeDetail.financialFields.hasExternalSponsorship")}>
                      {d.financialInfo?.hasExternalSponsorship ?? d.hasExternalSponsorship ? t("adminDemandeDetail.common.yes") : t("adminDemandeDetail.common.no")}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("adminDemandeDetail.financialFields.visaType")}>{d.visaInfo?.visaType ?? d.visaType ?? t("adminDemandeDetail.common.na")}</Descriptions.Item>
                    <Descriptions.Item label={t("adminDemandeDetail.financialFields.hasPreviouslyStudiedInUS")}>
                      {d.visaInfo?.hasPreviouslyStudiedInUS ?? d.hasPreviouslyStudiedInUS ? t("adminDemandeDetail.common.yes") : t("adminDemandeDetail.common.no")}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: "essais",
                label: t("adminDemandeDetail.tabs.essays"),
                children: (
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label={t("adminDemandeDetail.essayFields.personalStatement")}>{d.essaysInfo?.personalStatement ?? d.personalStatement ?? t("adminDemandeDetail.common.na")}</Descriptions.Item>
                    <Descriptions.Item label={t("adminDemandeDetail.essayFields.optionalEssay")}>{d.essaysInfo?.optionalEssay ?? d.optionalEssay ?? t("adminDemandeDetail.common.na")}</Descriptions.Item>
                    <Descriptions.Item label={t("adminDemandeDetail.essayFields.applicationRound")}>{d.applicationInfo?.applicationRound ?? d.applicationRound ?? t("adminDemandeDetail.common.na")}</Descriptions.Item>
                    <Descriptions.Item label={t("adminDemandeDetail.essayFields.howDidYouHearAboutUs")}>{d.applicationInfo?.howDidYouHearAboutUs ?? d.howDidYouHearAboutUs ?? t("adminDemandeDetail.common.na")}</Descriptions.Item>
                  </Descriptions>
                ),
              },
            ]}
          />
        </Card>

        {/* Documents attachés (hors lettre d'acceptation) */}
        <Card title={t("adminDemandeDetail.documents.title") || "Documents attachés"} className="mt-4">
          <Table
            rowKey={(r) => r.id}
            size="small"
            dataSource={docsWithoutAcceptanceLetter}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: t("adminDemandeDetail.documents.empty") || "Aucun document" }}
            scroll={{ x: true }}
            columns={[
              {
                title: t("adminDemandeDetail.documents.ownerOrg") || "Institut (source)",
                key: "ownerOrg",
                width: 200,
                render: (_, r) => (r.ownerOrg ? <Tag>{r.ownerOrg.name}</Tag> : "—"),
              },
              { title: t("adminDemandeDetail.documents.type") || "Type", dataIndex: "type", width: 140, render: (v) => v || "—" },
              { title: t("adminDemandeDetail.documents.mention") || "Mention", dataIndex: "mention", render: (v) => v || "—" },
              { title: t("adminDemandeDetail.documents.obtainedAt") || "Obtenu le", dataIndex: "dateObtention", width: 120, render: (v) => fmtDate(v) },
              {
                title: t("adminDemandeDetail.documents.original") || "Document",
                key: "openOriginal",
                width: 100,
                render: (_, r) =>
                  r.id ? (
                    <Button size="small" onClick={() => openUrl(r, "original")}>{t("adminDemandeDetail.documents.open") || "Ouvrir"}</Button>
                  ) : (
                    "—"
                  ),
              },
              {
                title: t("adminDemandeDetail.documents.translated") || "Traduction",
                key: "openTranslated",
                width: 100,
                render: (_, r) =>
                  r.id && hasTranslation(r) ? (
                    <Button size="small" onClick={() => openUrl(r, "traduit")}>{t("adminDemandeDetail.documents.open") || "Ouvrir"}</Button>
                  ) : (
                    "—"
                  ),
              },
              { title: t("adminDemandeDetail.documents.addedAt") || "Ajouté le", dataIndex: "createdAt", width: 150, render: (v) => fmtDate(v, true) },
              {
                title: "",
                key: "actions",
                width: 90,
                render: (_, r) =>
                  canDeleteDoc(r) ? (
                    <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteDocument(r)}>
                      {t("adminDemandeDetail.documents.delete") || "Supprimer"}
                    </Button>
                  ) : null,
              },
            ]}
          />
        </Card>

      {/* Drawer « Toutes les informations » */}
      <Drawer
        title={t("adminDemandeDetail.drawer.title") || "Toutes les informations"}
        placement="right"
        width={Math.min(560, typeof window !== "undefined" ? window.innerWidth * 0.9 : 560)}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        footer={<Button type="primary" onClick={() => setDrawerOpen(false)}>{t("adminDemandeDetail.actions.close") || "Fermer"}</Button>}
      >
        {d && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label={t("adminDemandeDetail.fields.code")}><Tag>{d.code}</Tag></Descriptions.Item>
            <Descriptions.Item label={t("adminDemandeDetail.fields.status")}><Tag color={statusTagColor(d.status)}>{d.status}</Tag></Descriptions.Item>
            <Descriptions.Item label={t("adminDemandeDetail.fields.date")}>{fmtDate(d.dateDemande, true)}</Descriptions.Item>
            <Descriptions.Item label={t("adminDemandeDetail.fields.demandeur")}>{d.user?.firstName} {d.user?.lastName} — {d.user?.email}</Descriptions.Item>
            <Descriptions.Item label={t("adminDemandeDetail.fields.targetOrg")}>{d.targetOrg?.name ?? "—"}</Descriptions.Item>
            <Descriptions.Item label={t("adminDemandeDetail.fields.assignedOrg")}>{d.assignedOrg?.name ?? "—"}</Descriptions.Item>
            <Descriptions.Item label={t("adminDemandeDetail.fields.periode")}>{d.periode ?? "—"}</Descriptions.Item>
            <Descriptions.Item label={t("adminDemandeDetail.fields.year")}>{d.year ?? "—"}</Descriptions.Item>
            <Descriptions.Item label={t("adminDemandeDetail.academicFields.serie")}>{d.academicInfo?.serie ?? d.serie ?? "—"}</Descriptions.Item>
            <Descriptions.Item label={t("adminDemandeDetail.academicFields.niveau")}>{d.academicInfo?.niveau ?? d.niveau ?? "—"}</Descriptions.Item>
            <Descriptions.Item label={t("adminDemandeDetail.academicFields.mention")}>{d.academicInfo?.mention ?? d.mention ?? "—"}</Descriptions.Item>
            <Descriptions.Item label={t("adminDemandeDetail.academicFields.countryOfSchool")}>{d.academicInfo?.countryOfSchool ?? d.countryOfSchool ?? "—"}</Descriptions.Item>
            <Descriptions.Item label={t("adminDemandeDetail.academicFields.secondarySchoolName")}>{d.academicInfo?.secondarySchoolName ?? d.secondarySchoolName ?? "—"}</Descriptions.Item>
            <Descriptions.Item label={t("adminDemandeDetail.academicFields.graduationDate")}>{fmtDate(d.academicInfo?.graduationDate ?? d.graduationDate)}</Descriptions.Item>
            <Descriptions.Item label={t("adminDemandeDetail.fields.observation")}>{d.observation ?? "—"}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

        {/* Preview modal */}
        <Modal
          open={previewVisible}
          title={previewTitle}
          onCancel={() => {
            if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setPreviewTitle("");
            setPreviewVisible(false);
          }}
          footer={null}
          width="95vw"
          style={{ top: 20, paddingBottom: 0 }}
          styles={{ body: { height: "calc(95vh - 110px)", padding: 0, overflow: "hidden" } }}
        >
          {previewUrl ? (
            <iframe src={previewUrl} style={{ width: "100%", height: "100%", border: "none" }} title="Preview" />
          ) : (
            <Spin />
          )}
        </Modal>
      </div>
    </div>
  );
}
