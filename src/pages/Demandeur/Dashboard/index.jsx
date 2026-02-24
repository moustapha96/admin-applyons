/* eslint-disable react/prop-types */
"use client";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Card, Table, Tag, Row, Col } from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import dashboardService from "../../../services/dashboardService";
import { useTranslation } from "react-i18next";

// Petites cartes KPI (cliquables si `to` fourni)
function StatCard({ label, value, sublabel, to }) {
  const content = (
    <>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value ?? 0}</div>
      {sublabel && <div className="mt-1 text-xs text-slate-400">{sublabel}</div>}
    </>
  );
  const className = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-slate-50";
  if (to) {
    return (
      <Link to={to} className={`block ${className}`}>
        {content}
      </Link>
    );
  }
  return <div className={className}>{content}</div>;
}

export default function DemandeurDashboard() {
  const { t, i18n } = useTranslation();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getDemandeurStats(user.id);
        // Axios interceptor retourne res.data : { success, meta, data }
        setPayload(res?.data ? res : { data: res });
      } catch (error) {
        console.error("Error fetching demandeur stats:", error);
        toast.error(error?.message || t("demandeurDashboard.toasts.loadError"));
        setPayload({ data: { widgets: {}, tables: {} } });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?.id, t]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  // Extraction des données (payload = réponse API : { data: { widgets, tables } } ou { success, data } )
  const data = payload?.data ?? payload ?? {};
  const widgets = data.widgets || {};
  const tables = data.tables || {};

  // Calcul des KPIs (avec liens de navigation pour chaque carte)
  const kpis = useMemo(() => {
    return [
      {
        label: t("demandeurDashboard.kpis.myRequests"),
        value: widgets.myDemandes?.total ?? 0,
        sublabel:
          widgets.myDemandes?.byStatus && Object.keys(widgets.myDemandes.byStatus).length > 0
            ? t("demandeurDashboard.kpis.seeBreakdown")
            : t("demandeurDashboard.kpis.none"),
        to: "/demandeur/mes-demandes",
      },
      {
        label: t("demandeurDashboard.kpis.myDemandesAuthentification"),
        value: widgets.myDemandesAuthentification?.total ?? 0,
        sublabel:
          widgets.myDemandesAuthentification?.byStatus && Object.keys(widgets.myDemandesAuthentification.byStatus).length > 0
            ? t("demandeurDashboard.kpis.seeBreakdown")
            : t("demandeurDashboard.kpis.none"),
        to: "/demandeur/demandes-authentification",
      },
      {
        label: t("demandeurDashboard.kpis.myDocuments"),
        value: widgets.myDocuments?.total ?? 0,
        sublabel: t("demandeurDashboard.kpis.translatedCount", {
          count: widgets.myDocuments?.translated ?? 0,
        }),
        to: "/demandeur/mes-demandes",
      },
      {
        label: t("demandeurDashboard.kpis.myPayments"),
        value: widgets.myPayments?.total ?? 0,
        sublabel:
          widgets.myPayments?.byStatus && Object.keys(widgets.myPayments.byStatus).length > 0
            ? t("demandeurDashboard.kpis.seeBreakdown")
            : "—",
        to: "/demandeur/mes-demandes",
      },
    ];
  }, [widgets, t]);

  // Formatage des dates selon la langue
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString(
        i18n.language === "zh" ? "zh-CN" :
        i18n.language === "de" ? "de-DE" :
        i18n.language === "es" ? "es-ES" :
        i18n.language === "it" ? "it-IT" :
        i18n.language === "en" ? "en-US" : "fr-FR",
        { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
      );
    } catch {
      return dateString || t("demandeurDashboard.common.na");
    }
  };

  // Activités récentes fusionnées (demandes + paiements) triées par date
  const recentActivities = useMemo(() => {
    const items = [];
    (tables.allDemandes || []).forEach((d) => {
      items.push({
        key: `demande-${d.id}`,
        type: "demande",
        reference: d.code,
        status: d.status,
        amount: null,
        currency: null,
        sortDate: new Date(d.createdAt || 0).getTime(),
        date: d.createdAt,
      });
    });
    (tables.allPayments || []).forEach((p) => {
      const ref = p.demandePartage?.code
        ? `Demande ${p.demandePartage.code}`
        : p.demandeAuthentification?.codeADN
          ? p.demandeAuthentification.codeADN
          : (p.provider || p.id);
      items.push({
        key: `payment-${p.id}`,
        type: "payment",
        reference: ref,
        status: p.status,
        amount: p.amount,
        currency: p.currency,
        sortDate: new Date(p.createdAt || 0).getTime(),
        date: p.createdAt,
      });
    });
    items.sort((a, b) => b.sortDate - a.sortDate);
    return items;
  }, [tables.allDemandes, tables.allPayments]);

  const activityColumns = [
    {
      title: t("demandeurDashboard.activity.table.type"),
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type) => (
        <Tag color={type === "demande" ? "blue" : "green"}>
          {type === "demande"
            ? t("demandeurDashboard.activity.table.typeRequest")
            : t("demandeurDashboard.activity.table.typePayment")}
        </Tag>
      ),
    },
    {
      title: t("demandeurDashboard.activity.table.reference"),
      dataIndex: "reference",
      key: "reference",
      ellipsis: true,
    },
    {
      title: t("demandeurDashboard.activity.table.status"),
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={
          status === "VALIDATED" || status === "PAID" || status === "SUCCEEDED" || status === "CAPTURED" ? "green" :
          status === "REJECTED" || status === "FAILED" || status === "CANCELED" ? "red" :
          "default"
        }>
          {status || "—"}
        </Tag>
      ),
    },
    {
      title: t("demandeurDashboard.activity.table.amount"),
      key: "amount",
      width: 110,
      align: "right",
      render: (_, row) =>
        row.amount != null
          ? `${row.amount} ${row.currency || ""}`.trim()
          : "—",
    },
    {
      title: t("demandeurDashboard.activity.table.date"),
      dataIndex: "date",
      key: "date",
      width: 160,
      render: (date) => formatDate(date),
    },
  ];

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h5 className="text-xl font-bold">
              {t("demandeurDashboard.header.hello", {
                firstName: user?.firstName || "",
                lastName: user?.lastName || ""
              })}
            </h5>
            <h6 className="font-semibold text-slate-400">
              {t("demandeurDashboard.header.welcome")}
            </h6>
          </div>
        </div>

        {/* Liens rapides */}
        <Card title={t("demandeurDashboard.links.title")} className="mb-4">
          <Row gutter={[12, 12]}>
            <Col xs={12} sm={12} md={6}>
              <Link to="/demandeur/mes-demandes" className="block rounded-lg border p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <FileTextOutlined className="text-xl text-primary" />
                <span className="ml-2 font-medium">{t("demandeurDashboard.links.mesDemandes")}</span>
              </Link>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Link to="/demandeur/mes-demandes/create" className="block rounded-lg border p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <PlusOutlined className="text-xl text-primary" />
                <span className="ml-2 font-medium">{t("demandeurDashboard.links.newApplication")}</span>
              </Link>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Link to="/demandeur/demandes-authentification" className="block rounded-lg border p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <SafetyCertificateOutlined className="text-xl text-primary" />
                <span className="ml-2 font-medium">{t("demandeurDashboard.links.demandesAuthentification")}</span>
              </Link>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Link to="/demandeur/profile" className="block rounded-lg border p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <UserOutlined className="text-xl text-primary" />
                <span className="ml-2 font-medium">{t("demandeurDashboard.links.profile")}</span>
              </Link>
            </Col>
          </Row>
        </Card>

        {/* Loader */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        )}

        {/* Contenu principal */}
        {!loading && payload && (
          <>
            {/* KPIs (cartes cliquables) */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {kpis.map((k) => (
                <StatCard key={k.label} label={k.label} value={k.value} sublabel={k.sublabel} to={k.to} />
              ))}
            </div>

            <div className="mt-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h6 className="mb-0 font-medium text-slate-700">
                    {t("demandeurDashboard.activity.title")}
                  </h6>
                  {recentActivities.length > 0 && (
                    <Link to="/demandeur/mes-demandes">{t("demandeurDashboard.links.seeAll")}</Link>
                  )}
                </div>
                {recentActivities.length > 0 ? (
                  <Table
                    size="small"
                    columns={activityColumns}
                    dataSource={recentActivities}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: false,
                      showTotal: (total) => t("demandeurDashboard.activity.table.total", { total }),
                    }}
                    locale={{ emptyText: t("demandeurDashboard.activity.none") }}
                  />
                ) : (
                  <p className="text-sm text-slate-500">{t("demandeurDashboard.activity.none")}</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Message si pas de données */}
        {!loading && !payload && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            {t("demandeurDashboard.empty")}
          </div>
        )}
      </div>
    </div>
  );
}
