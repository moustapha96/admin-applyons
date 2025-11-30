/* eslint-disable react/jsx-key */
// src/pages/Admin/Demandes/AdminDemandeDetail.jsx
"use client";
import { useEffect, useState } from "react";
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
  
} from "antd";
import {
  FileTextOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import demandeService from "@/services/demandeService";
import documentService from "@/services/documentService";

const { TabPane } = Tabs;

const statusTagColor = (s) => {
  switch (s) {
    case "VALIDATED": return "green";
    case "REJECTED": return "red";
    case "IN_PROGRESS": return "gold";
    default: return "blue";
  }
};

export default function AdminDemandeDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [demandeData, setDemandeData] = useState(null); // { demande, documents, transaction, payment }
  const [loading, setLoading] = useState(true);

  // Preview modal (PDF)
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await demandeService.getById(id);
      // attendu: { demande, documents, transaction, payment }
      setDemandeData(res);
    } catch (e) {
      message.error(e?.response?.data?.message || t("adminDemandeDetail.messages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const openDoc = async (docId, type = "original") => {
    try {
      // Votre backend supporte /documents/:id/content?type=original|traduit&disposition=inline
      const resp = await documentService.getContent(docId, { type, display: true });
      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewTitle(type === "traduit" ? t("adminDemandeDetail.documents.translated") : t("adminDemandeDetail.documents.original"));
      setPreviewVisible(true);
    } catch (e) {
      console.error(e);
      message.error(t("adminDemandeDetail.messages.openError"));
    }
  };

  const downloadDoc = async (docId, type = "original") => {
    try {
      const resp = await documentService.getContent(docId, { type, display: false });
      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `document_${docId}_${type}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      message.error(t("adminDemandeDetail.messages.downloadError"));
    }
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

  if (loading || !demandeData?.demande) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Spin />
      </div>
    );
  }

  const d = demandeData.demande;
  const docs = demandeData.documents || [];

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

          <Divider />

          <Tabs defaultActiveKey="acad">
            

            <TabPane tab={t("adminDemandeDetail.tabs.academic")} key="acad">
              <Descriptions bordered column={2}>
                <Descriptions.Item label={t("adminDemandeDetail.academicFields.serie")}>{d.serie || t("adminDemandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("adminDemandeDetail.academicFields.niveau")}>{d.niveau || t("adminDemandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("adminDemandeDetail.academicFields.mention")}>{d.mention || t("adminDemandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("adminDemandeDetail.academicFields.annee")}>{d.annee || t("adminDemandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("adminDemandeDetail.academicFields.countryOfSchool")}>{d.countryOfSchool || t("adminDemandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("adminDemandeDetail.academicFields.secondarySchoolName")}>{d.secondarySchoolName || t("adminDemandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("adminDemandeDetail.academicFields.graduationDate")} span={2}>
                  {d.graduationDate ? dayjs(d.graduationDate).format("DD/MM/YYYY") : t("adminDemandeDetail.common.na")}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab={t("adminDemandeDetail.tabs.identity")} key="identite">
              <Descriptions bordered column={2}>
                <Descriptions.Item label={t("adminDemandeDetail.identityFields.dob")}>
                  {d.dob ? dayjs(d.dob).format("DD/MM/YYYY") : t("adminDemandeDetail.common.na")}
                </Descriptions.Item>
                <Descriptions.Item label={t("adminDemandeDetail.identityFields.citizenship")}>{d.citizenship || t("adminDemandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("adminDemandeDetail.identityFields.passport")} span={2}>{d.passport || t("adminDemandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("adminDemandeDetail.identityFields.isEnglishFirstLanguage")}>
                  {d.isEnglishFirstLanguage ? t("adminDemandeDetail.common.yes") : t("adminDemandeDetail.common.no")}
                </Descriptions.Item>
                <Descriptions.Item label={t("adminDemandeDetail.identityFields.englishProficiencyTests")}>
                  {d.englishProficiencyTests ? JSON.stringify(d.englishProficiencyTests) : t("adminDemandeDetail.common.na")}
                </Descriptions.Item>
                <Descriptions.Item label={t("adminDemandeDetail.identityFields.testScores")}>{d.testScores || t("adminDemandeDetail.common.na")}</Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab={t("adminDemandeDetail.tabs.financial")} key="fin">
              <Descriptions bordered column={2}>
                <Descriptions.Item label={t("adminDemandeDetail.financialFields.willApplyForFinancialAid")}>
                  {d.willApplyForFinancialAid ? t("adminDemandeDetail.common.yes") : t("adminDemandeDetail.common.no")}
                </Descriptions.Item>
                <Descriptions.Item label={t("adminDemandeDetail.financialFields.hasExternalSponsorship")}>
                  {d.hasExternalSponsorship ? t("adminDemandeDetail.common.yes") : t("adminDemandeDetail.common.no")}
                </Descriptions.Item>
                <Descriptions.Item label={t("adminDemandeDetail.financialFields.visaType")}>{d.visaType || t("adminDemandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("adminDemandeDetail.financialFields.hasPreviouslyStudiedInUS")}>
                  {d.hasPreviouslyStudiedInUS ? t("adminDemandeDetail.common.yes") : t("adminDemandeDetail.common.no")}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab={t("adminDemandeDetail.tabs.essays")} key="essais">
              <Descriptions bordered column={1}>
                <Descriptions.Item label={t("adminDemandeDetail.essayFields.personalStatement")}>{d.personalStatement || t("adminDemandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("adminDemandeDetail.essayFields.optionalEssay")}>{d.optionalEssay || t("adminDemandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("adminDemandeDetail.essayFields.applicationRound")}>{d.applicationRound || t("adminDemandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("adminDemandeDetail.essayFields.howDidYouHearAboutUs")}>{d.howDidYouHearAboutUs || t("adminDemandeDetail.common.na")}</Descriptions.Item>
              </Descriptions>
            </TabPane>

            
          </Tabs>
        </Card>

        {/* Preview modal */}
        <Modal
          open={previewVisible}
          title={previewTitle}
          onCancel={() => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setPreviewVisible(false);
          }}
          footer={null}
          width="80%"
          bodyStyle={{ height: "70vh", overflow: "hidden" }}
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
