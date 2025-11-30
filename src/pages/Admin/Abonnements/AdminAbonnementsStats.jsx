// // src/pages/Admin/Abonnements/AdminAbonnementsStats.jsx
// "use client";
// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import {
//   Card,
//   Breadcrumb,
//   Typography,
//   Select,
//   Spin,
//   Row,
//   Col,
//   Statistic,
//   Table,
//   message,
//   Button,
// } from "antd";
// import {
//   BarChartOutlined,
//   CalendarOutlined,
//   BankOutlined,
//   ExclamationCircleOutlined,
// } from "@ant-design/icons";

// import organizationService from "@/services/organizationService";
// import abonnementService from "@/services/abonnement.service";

// const { Title, Text } = Typography;

// export default function AdminAbonnementsStats() {
//   const [stats, setStats] = useState(null);
//   const [organizations, setOrganizations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({ organizationId: null });

//   useEffect(() => {
//     document.documentElement.setAttribute("dir", "ltr");
//     document.documentElement.classList.add("light");
//     document.documentElement.classList.remove("dark");
//     fetchOrganizations();
//   }, []);

//   useEffect(() => {
//     fetchStats();
//   }, [filters]);

//   const fetchStats = async () => {
//     setLoading(true);
//     try {
//       const params = filters.organizationId ? { organizationId: filters.organizationId } : {};
//       const response = await abonnementService.stats(params);
//       console.log(response)
//       setStats(response);
//     } catch (error) {
//       console.error("Erreur stats:", error);
//       message.error("Erreur lors de la récupération des statistiques");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchOrganizations = async () => {
//     try {
//       const response = await organizationService.list({ limit: 1000 });
//       setOrganizations(response.organizations || []);
//     } catch (error) {
//       console.error("Erreur organisations:", error);
//     }
//   };

//   const monthlyData = stats?.totalsByMonth || [];

//   return (
//     <div className="container-fluid relative px-3">
//       <div className="layout-specing">
//         <div className="md:flex justify-between items-center mb-6">
//           <Title level={4}>
//             <BarChartOutlined className="mr-2" />
//             Statistiques des abonnements
//           </Title>
//           <Breadcrumb
//             items={[
//               { title: <Link to="/admin">Tableau de bord</Link> },
//               { title: "Statistiques des abonnements" },
//             ]}
//           />
//         </div>

//         <Card className="mb-6">
//           <div className="flex flex-col md:flex-row md:items-center gap-4">
//             <div className="w-full md:w-1/3">
//               <Select
//                 placeholder="Filtrer par organisation"
//                 allowClear
//                 className="w-full"
//                 onChange={(value) => setFilters((p) => ({ ...p, organizationId: value || null }))}
//                 options={organizations.map((org) => ({
//                   value: org.id,
//                   label: org.name,
//                 }))}
//               />
//             </div>
//             <div className="w-full md:w-1/3 text-right">
//               <Button type="primary" icon={<BarChartOutlined />} onClick={fetchStats}>
//                 Actualiser
//               </Button>
//             </div>
//           </div>
//         </Card>

//         {loading ? (
//           <Card className="text-center">
//             <Spin size="large" />
//           </Card>
//         ) : (
//           <>
//             <Card className="mb-6">
//               <Title level={5} className="mb-4">
//                 Résumé
//               </Title>
//               <Row gutter={16}>
//                 <Col span={8}>
//                   <Statistic
//                     title="Total des abonnements"
//                     value={(stats?.active || 0) + (stats?.expired || 0)}
//                     prefix={<BankOutlined />}
//                   />
//                 </Col>
//                 <Col span={8}>
//                   <Statistic
//                     title="Abonnements actifs"
//                     value={stats?.active || 0}
//                     prefix={<CalendarOutlined />}
//                   />
//                 </Col>
//                 <Col span={8}>
//                   <Statistic
//                     title="Abonnements expirés"
//                     value={stats?.expired || 0}
//                     prefix={<ExclamationCircleOutlined />}
//                   />
//                 </Col>
//               </Row>
//             </Card>

//             <Card>
//               <Title level={5} className="mb-4">
//                 Détails par mois
//               </Title>
//               <Table
//                 columns={[
//                   {
//                     title: "Mois",
//                     dataIndex: "month",
//                     key: "month",
//                     render: (m) =>
//                       new Date(m).toLocaleString("default", { month: "long", year: "numeric" }),
//                   },
//                   { title: "Nombre d'abonnements", dataIndex: "count", key: "count" },
//                   {
//                     title: "Revenus (XOF)",
//                     dataIndex: "totalMontant",
//                     key: "totalMontant",
//                     render: (montant) => Number(montant).toLocaleString(),
//                   },
//                 ]}
//                 dataSource={monthlyData}
//                 pagination={false}
//                 rowKey="month"
//               />
//             </Card>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// src/pages/Admin/Abonnements/AdminAbonnementsStats.jsx
"use client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Breadcrumb,
  Typography,
  Select,
  Spin,
  Row,
  Col,
  Statistic,
  Table,
  message,
  Button,
  Empty,
} from "antd";
import {
  BarChartOutlined,
  CalendarOutlined,
  BankOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import organizationService from "@/services/organizationService";
import abonnementService from "@/services/abonnement.service";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

export default function AdminAbonnementsStats() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ organizationId: null });

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchOrganizations();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [filters]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = filters.organizationId ? { organizationId: filters.organizationId } : {};
      const response = await abonnementService.stats(params);
      setStats(response);
    } catch (error) {
      console.error("Erreur stats:", error);
      message.error(t("adminAbonnements.messages.statsError"));
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await organizationService.list({ limit: 1000 });
      setOrganizations(response.organizations || []);
    } catch (error) {
      console.error("Erreur organisations:", error);
    }
  };

  const monthlyData = stats?.totalsByMonth || [];

  const formatXOF = (val) =>
    (Number(val) || 0).toLocaleString("fr-FR", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <Title level={4}>
            <BarChartOutlined className="mr-2" />
            {t("adminAbonnements.stats.titleFull")}
          </Title>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("adminAbonnements.breadcrumb.dashboard")}</Link> },
              { title: t("adminAbonnements.stats.breadcrumb") },
            ]}
          />
        </div>

        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-full md:w-1/3">
              <Select
                placeholder={t("adminAbonnements.filters.organization")}
                allowClear
                className="w-full"
                onChange={(value) => setFilters((p) => ({ ...p, organizationId: value || null }))}
                options={organizations.map((org) => ({
                  value: org.id,
                  label: org.name,
                }))}
              />
            </div>
            <div className="w-full md:w-1/3 text-right">
              <Button type="primary" icon={<BarChartOutlined />} onClick={fetchStats}>
                {t("adminAbonnements.actions.refresh")}
              </Button>
            </div>
          </div>
        </Card>

        {loading ? (
          <Card className="text-center">
            <Spin size="large" />
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <Title level={5} className="mb-4">
                {t("adminAbonnements.stats.summaryTitle")}
              </Title>
              <Row gutter={16}>
                <Col xs={24} md={6}>
                  <Statistic
                    title={t("adminAbonnements.stats.total")}
                    value={stats?.total ?? 0}
                    prefix={<BankOutlined />}
                  />
                </Col>
                <Col xs={24} md={6}>
                  <Statistic
                    title={t("adminAbonnements.stats.active")}
                    value={stats?.active ?? 0}
                    prefix={<CalendarOutlined />}
                  />
                </Col>
                <Col xs={24} md={6}>
                  <Statistic
                    title={t("adminAbonnements.stats.expired")}
                    value={stats?.expired ?? 0}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Col>
                <Col xs={24} md={6}>
                  <Statistic
                    title={t("adminAbonnements.stats.revenueTotal")}
                    value={formatXOF(stats?.revenueTotal)}
                  />
                </Col>
              </Row>
            </Card>

            <Card>
              <Title level={5} className="mb-4">
                {t("adminAbonnements.stats.monthlyTitle")}
              </Title>
              {monthlyData.length === 0 ? (
                <Empty description={t("adminAbonnements.stats.noData")} />
              ) : (
                <Table
                  columns={[
                    {
                      title: t("adminAbonnements.stats.columns.month"),
                      dataIndex: "month",
                      key: "month",
                      render: (m) =>
                        new Date(m).toLocaleString("fr-FR", {
                          month: "long",
                          year: "numeric",
                        }),
                    },
                    { title: t("adminAbonnements.stats.columns.count"), dataIndex: "count", key: "count" },
                    {
                      title: t("adminAbonnements.stats.columns.revenue"),
                      dataIndex: "totalMontant",
                      key: "totalMontant",
                      render: (montant) => formatXOF(montant),
                    },
                  ]}
                  dataSource={monthlyData}
                  pagination={false}
                  rowKey={(r) => r.month}
                />
              )}
            </Card>

            <div className="text-center mt-6 text-slate-400">
              © {new Date().getFullYear()} applyons
            </div>
          </>
        )}
      </div>
    </div>
  );
}
