
"use client";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card, Table, Tag,  Button, message,
  Breadcrumb, Tabs, Descriptions, Divider
} from "antd";
import dayjs from "dayjs";
import documentService from "@/services/documentService";
import demandeService from "@/services/demandeService";
import { useTranslation } from "react-i18next";

const { TabPane } = Tabs;

const statusColor = (s) =>
  s === "VALIDATED" ? "green" :
  s === "REJECTED" ? "red" :
  s === "IN_PROGRESS" ? "gold" : "blue";

export default function DemandeurDemandeDocuments() {
  const { t, i18n } = useTranslation();
  const { demandeId } = useParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [demande, setDemande] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await demandeService.getById(demandeId);
        setDemande(res?.demande || null);
      } catch (e) {
        message.error(e?.message || t("demandeDocuments.toasts.loadDemandeError"));
      }
    })();
  }, [demandeId, t]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await documentService.listByDemande(demandeId);
      setRows(res || []);
    } catch (e) {
      message.error(e?.message || t("demandeDocuments.toasts.loadDocsError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [demandeId]);

  const openDoc = (doc, type = "original") => {
    const url = `/api/documents/${doc.id}/content?type=${type}&disposition=inline`;
    window.open(url, "_blank");
  };

  const fmtDateTime = (v) =>
    v ? dayjs(v).locale(i18n.language || "fr").format("DD/MM/YYYY HH:mm") : t("demandeDocuments.common.na");

  const columns = [
    {
      title: t("demandeDocuments.columns.ownerOrg"),
      dataIndex: "ownerOrg",
      render: (v) => v?.name || t("demandeDocuments.common.na"),
      width: 220
    },
    { title: t("demandeDocuments.columns.mention"), dataIndex: "mention" },
    { title: t("demandeDocuments.columns.type"), dataIndex: "type" },
    {
      title: t("demandeDocuments.columns.createdAt"),
      dataIndex: "createdAt",
      render: (v) => fmtDateTime(v),
      width: 180
    },
    {
      title: t("demandeDocuments.columns.encrypted"),
      dataIndex: "encryptedAt",
      render: (v, r) =>
        r.urlChiffre ? <Tag color="purple">{t("demandeDocuments.common.yes")}</Tag> : <Tag>{t("demandeDocuments.common.no")}</Tag>,
      width: 110
    },
    {
      title: t("demandeDocuments.columns.original"),
      dataIndex: "urlOriginal",
      render: (v, r) =>
        v ? (
          <Button size="small" onClick={() => openDoc(r, "original")}>
            {t("demandeDocuments.actions.open")}
          </Button>
        ) : (
          <Tag>{t("demandeDocuments.common.na")}</Tag>
        ),
      width: 120
    },
    {
      title: t("demandeDocuments.columns.translated"),
      dataIndex: "urlTraduit",
      render: (v, r) =>
        r.estTraduit && v ? (
          <Button size="small" onClick={() => openDoc(r, "traduit")}>
            {t("demandeDocuments.actions.open")}
          </Button>
        ) : (
          <Tag>{t("demandeDocuments.common.na")}</Tag>
        ),
      width: 120
    }
  ];

  // Sections info de la demande
  const renderDemandeInfo = () => (
    <Card>
      <Descriptions title={t("demandeDocuments.info.general")} bordered column={2}>
        <Descriptions.Item label={t("demandeDocuments.fields.code")}>{demande?.code || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.date")}>{fmtDateTime(demande?.dateDemande)}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.status")}>
          {demande?.status ? <Tag color={statusColor(demande.status)}>{t(`demandeurDemandes.status.${demande.status}`)}</Tag> : t("demandeDocuments.common.na")}
        </Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.periode")}>
          {demande?.periode ? t(`demandeurDemandes.periods.${demande.periode}`) : t("demandeDocuments.common.na")}
        </Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.year")}>{demande?.year || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.observation")}>{demande?.observation || t("demandeDocuments.common.na")}</Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions title={t("demandeDocuments.info.academic")} bordered column={2}>
        <Descriptions.Item label={t("demandeDocuments.fields.serie")}>{demande?.serie || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.niveau")}>{demande?.niveau || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.mention")}>{demande?.mention || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.schoolYear")}>{demande?.annee || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.countryOfSchool")}>{demande?.countryOfSchool || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.secondarySchoolName")}>{demande?.secondarySchoolName || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.graduationDate")}>
          {demande?.graduationDate ? dayjs(demande.graduationDate).format("DD/MM/YYYY") : t("demandeDocuments.common.na")}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions title={t("demandeDocuments.info.personal")} bordered column={2}>
        <Descriptions.Item label={t("demandeDocuments.fields.dob")}>
          {demande?.dob ? dayjs(demande.dob).format("DD/MM/YYYY") : t("demandeDocuments.common.na")}
        </Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.citizenship")}>{demande?.citizenship || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.passport")}>{demande?.passport || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.isEnglishFirstLanguage")}>
          {demande?.isEnglishFirstLanguage ? t("demandeDocuments.common.yes") : t("demandeDocuments.common.no")}
        </Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.testScores")}>{demande?.testScores || t("demandeDocuments.common.na")}</Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions title={t("demandeDocuments.info.finance")} bordered column={2}>
        <Descriptions.Item label={t("demandeDocuments.fields.willApplyForFinancialAid")}>
          {demande?.willApplyForFinancialAid ? t("demandeDocuments.common.yes") : t("demandeDocuments.common.no")}
        </Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.hasExternalSponsorship")}>
          {demande?.hasExternalSponsorship ? t("demandeDocuments.common.yes") : t("demandeDocuments.common.no")}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions title={t("demandeDocuments.info.visa")} bordered column={2}>
        <Descriptions.Item label={t("demandeDocuments.fields.visaType")}>{demande?.visaType || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.hasPreviouslyStudiedInUS")}>
          {demande?.hasPreviouslyStudiedInUS ? t("demandeDocuments.common.yes") : t("demandeDocuments.common.no")}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions title={t("demandeDocuments.info.orgs")} bordered column={2}>
        <Descriptions.Item label={t("demandeDocuments.fields.targetOrg")}>{demande?.targetOrg?.name || t("demandeDocuments.common.na")}</Descriptions.Item>
        <Descriptions.Item label={t("demandeDocuments.fields.assignedOrg")}>{demande?.assignedOrg?.name || t("demandeDocuments.common.na")}</Descriptions.Item>
      </Descriptions>
    </Card>
  );

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-4">
          <h5 className="text-lg font-semibold">{t("demandeDocuments.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/demandeur/dashboard">{t("demandeDocuments.breadcrumb.dashboard")}</Link> },
              { title: <Link to={`/demandeur/mes-demandes/${demandeId}/details`}>{t("demandeDocuments.breadcrumb.detail")}</Link> },
              { title: t("demandeDocuments.breadcrumb.documents") },
            ]}
          />
        </div>

        <Tabs defaultActiveKey="1">
          <TabPane tab={t("demandeDocuments.tabs.documents")} key="1">
            <Card>
              <Table
                rowKey={(r) => r.id}
                loading={loading}
                columns={columns}
                dataSource={rows}
                scroll={{ x: true }}
              />
            </Card>
          </TabPane>

          <TabPane tab={t("demandeDocuments.tabs.info")} key="2">
            {renderDemandeInfo()}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}
