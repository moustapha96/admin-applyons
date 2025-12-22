// /* eslint-disable no-unused-vars */
// "use client";
// import { useEffect, useMemo, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import {
//   Card,
//   Row,
//   Col,
//   Statistic,
//   Typography,
//   Table,
//   Tag,
//   Space,
//   Breadcrumb,
//   List,
//   Progress,
//   message,
//   Descriptions,
//   Divider,
// } from "antd";
// import {
//   FileTextOutlined,
//   BookOutlined,
//   SafetyCertificateOutlined,
//   DollarCircleOutlined,
//   BarChartOutlined,
//   TeamOutlined,
//   ApartmentOutlined,
//   ReadOutlined,
//   AuditOutlined,
// } from "@ant-design/icons";
// import dayjs from "dayjs";
// import dashboardService from "@/services/dashboardService";
// import { useAuth } from "../../../hooks/useAuth";


// const { Title, Text } = Typography;

// export default function InstitutDashboard() {
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [payload, setPayload] = useState(null);

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       try {
//         const res = await dashboardService.getInstitutStats(user.organization.id, { recentDays: 30 });
//         console.log(res);
//         setPayload(res);
//       } catch (e) {
//         console.error(e);
//         message.error(e?.message || "Erreur lors du chargement des statistiques");
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [user.organization]);

//   // Extraction des données
//   const data = payload?.data || {};
//   const widgets = data.widgets || {};
//   const tables = data.tables || {};
//   const charts = data.charts || {};

//   // Fonction pour convertir un objet en tableau de lignes
//   const mapToRows = (obj, keyLabel = "Statut", valueLabel = "Nombre") => {
//     if (!obj || typeof obj !== "object") return [];
//     return Object.entries(obj)
//       .filter(([_, value]) => value !== null && value !== undefined)
//       .map(([key, value]) => ({
//         key,
//         name: key,
//         value: value === null ? 0 : value,
//       }));
//   };

//   // Données pour les tableaux de répartition
//   const demandesTargetOrgRows = useMemo(
//     () => mapToRows(widgets.demandesTargetOrg?.byStatus, "Statut", "Nombre"),
//     [widgets.demandesTargetOrg?.byStatus]
//   );

//   const demandesAssignedOrgRows = useMemo(
//     () => mapToRows(widgets.demandesAssignedOrg?.byStatus, "Statut", "Nombre"),
//     [widgets.demandesAssignedOrg?.byStatus]
//   );

//   const paymentsByStatusRows = useMemo(
//     () => mapToRows(widgets.payments?.byStatus, "Statut", "Nombre"),
//     [widgets.payments?.byStatus]
//   );

//   const usersByRoleRows = useMemo(
//     () => mapToRows(widgets.users?.byRole, "Rôle", "Nombre"),
//     [widgets.users?.byRole]
//   );

//   // Colonnes pour les tableaux
//   const simpleCols = [
//     { title: "Statut/Rôle", dataIndex: "name", key: "name" },
//     {
//       title: "Nombre",
//       dataIndex: "value",
//       key: "value",
//       render: (v) => (v === null || v === undefined ? 0 : v),
//       align: "right",
//       width: 100,
//     },
//   ];

//   // Colonnes pour les listes (départements, filières)
//   const listCols = [
//     { title: "Nom", dataIndex: "name", key: "name" },
//     { title: "Code", dataIndex: "code", key: "code" },
//     { title: "Description/Niveau", dataIndex: "description", key: "description" },
//   ];


//   const recent = tables?.recentIncomingDemandes || [];
//   const totalRecent = recent.length;
//   const byStatus = recent.reduce((acc, { status }) => {
//     const k = status || "UNKNOWN";
//     acc[k] = (acc[k] || 0) + 1;
//     return acc;
//   }, {});
//   const statusEntries = Object.entries(byStatus);


//   // Formatage des dates
//   const formatDate = (dateString) => {
//     return dayjs(dateString).format("DD MMM YYYY, HH:mm");
//   };

//   return (
//     <div className="container-fluid relative px-3">
//       <div className="layout-specing">
//         <div className="md:flex justify-between items-center mb-6">
//           <Title level={3} className="mb-0">
//             Dashboard Institut
//           </Title>
//           <Breadcrumb
//             items={[
//               { title: <Link to="/organisations/dashboard">Accueil</Link> },
//               { title: "Institut" },
//             ]}
//           />
//         </div>
//         <Text type="secondary">
//           Organisation ID : <Text code>{user.organization.name || "Non défini"}</Text>
//         </Text>

//         {/* KPIs Ligne 1 */}
//         <Row gutter={[16, 16]} className="mt-3">
//           <Col xs={12} md={6}>
//             <Card loading={loading}>
//               <Statistic
//                 title="Demandes cibles (total)"
//                 prefix={<FileTextOutlined />}
//                 value={widgets.demandesTargetOrg?.total ?? 0}
//               />
//             </Card>
//           </Col>
//           <Col xs={12} md={6}>
//             <Card loading={loading}>
//               <Statistic
//                 title="Demandes assignées (total)"
//                 prefix={<FileTextOutlined />}
//                 value={widgets.demandesAssignedOrg?.total ?? 0}
//               />
//             </Card>
//           </Col>
//           <Col xs={12} md={6}>
//             <Card loading={loading}>
//               <Statistic
//                 title="Documents (total/à traduire/traduit)"
//                 prefix={<BookOutlined />}
//                 value={`${widgets.docsOwnedByOrg?.total ?? 0} / ${widgets.docsOwnedByOrg?.toTranslate ?? 0} / ${widgets.docsOwnedByOrg?.translated ?? 0}`}
//               />
//             </Card>
//           </Col>
//           <Col xs={12} md={6}>
//             <Card loading={loading}>
//               <Statistic
//                 title="Abonnements (actifs/total)"
//                 prefix={<SafetyCertificateOutlined />}
//                 value={`${widgets.subscriptions?.active ?? 0} / ${widgets.subscriptions?.total ?? 0}`}
//               />
//               <div style={{ marginTop: 8 }}>
//                 <Tag color="gold">Expirent bientôt : {widgets.subscriptions?.expiringSoon ?? 0}</Tag>
//               </div>
//             </Card>
//           </Col>
//         </Row>

//         {/* KPIs Ligne 2 : Utilisateurs */}
//         <Row gutter={[16, 16]} className="mt-2">
//           <Col xs={24} md={12}>
//             <Card loading={loading}>
//               <Statistic
//                 title="Utilisateurs (total)"
//                 prefix={<TeamOutlined />}
//                 value={widgets.users?.total ?? 0}
//               />
//             </Card>
//           </Col>
//           <Col xs={24} md={12}>
//             <Card title="Utilisateurs par rôle" loading={loading}>
//               <Table
//                 rowKey="key"
//                 size="small"
//                 columns={simpleCols}
//                 dataSource={usersByRoleRows}
//                 pagination={false}
//                 locale={{ emptyText: "Aucune donnée" }}
//               />
//             </Card>
//           </Col>
//         </Row>

//         {/* Graphique : Demandes cibles vs assignées */}
//         <Row gutter={[16, 16]} className="mt-2">
//           <Col xs={24} md={12}>
//             <Card title="Demandes cibles vs assignées" loading={loading}>
//               <Progress
//                 type="dashboard"
//                 percent={
//                   charts.targetVsAssigned?.assigned && charts.targetVsAssigned?.target
//                     ? Math.round((charts.targetVsAssigned.assigned / (charts.targetVsAssigned.target + charts.targetVsAssigned.assigned)) * 100)
//                     : 0
//                 }
//                 format={(percent) => `${percent}% assignées`}
//                 status="active"
//                 strokeColor={charts.targetVsAssigned?.assigned > 0 ? "#52c41a" : "#d9d9d9"}
//               />
//               <div className="mt-2 text-center">
//                 <Text strong>Cibles : {charts.targetVsAssigned?.target ?? 0}</Text>
//                 <br />
//                 <Text strong>Assignées : {charts.targetVsAssigned?.assigned ?? 0}</Text>
//               </div>
//             </Card>
//           </Col>
//         </Row>

//         {/* Répartition des demandes par statut */}
//         <Row gutter={[16, 16]} className="mt-2">
//           <Col xs={24} md={12}>
//             <Card title="Demandes cibles par statut" loading={loading}>
//               <Table
//                 rowKey="key"
//                 size="small"
//                 columns={simpleCols}
//                 dataSource={demandesTargetOrgRows}
//                 pagination={false}
//                 locale={{ emptyText: "Aucune donnée" }}
//               />
//             </Card>
//           </Col>
//           <Col xs={24} md={12}>
//             <Card title="Demandes assignées par statut" loading={loading}>
//               <Table
//                 rowKey="key"
//                 size="small"
//                 columns={simpleCols}
//                 dataSource={demandesAssignedOrgRows}
//                 pagination={false}
//                 locale={{ emptyText: "Aucune donnée" }}
//               />
//             </Card>
//           </Col>
//         </Row>

//         {/* Répartition des paiements par statut */}
//         <Row gutter={[16, 16]} className="mt-2">
//           <Col xs={24} md={12}>
//             <Card title="Paiements par statut" loading={loading}>
//               <Table
//                 rowKey="key"
//                 size="small"
//                 columns={simpleCols}
//                 dataSource={paymentsByStatusRows}
//                 pagination={false}
//                 locale={{ emptyText: "Aucune donnée" }}
//               />
//             </Card>
//           </Col>
//         </Row>

//         {/* Départements */}
//         <Row gutter={[16, 16]} className="mt-2">
//           <Col xs={24} md={12}>
//             <Card
//               title={`Départements (${widgets.departments?.total ?? 0})`}
//               loading={loading}
//               extra={<Tag color="blue">{widgets.departments?.total ?? 0}</Tag>}
//             >
//               <Table
//                 rowKey="id"
//                 size="small"
//                 columns={listCols}
//                 dataSource={widgets.departments?.list || []}
//                 pagination={false}
//                 locale={{ emptyText: "Aucun département" }}
//               />
//             </Card>
//           </Col>

//           {/* Filières */}
//           <Col xs={24} md={12}>
//             <Card
//               title={`Filières (${widgets.filieres?.total ?? 0})`}
//               loading={loading}
//               extra={<Tag color="blue">{widgets.filieres?.total ?? 0}</Tag>}
//             >
//               <Table
//                 rowKey="id"
//                 size="small"
//                 columns={[
//                   ...listCols,
//                   { title: "Département", dataIndex: ["department", "name"], key: "department" },
//                 ]}
//                 dataSource={widgets.filieres?.list || []}
//                 pagination={false}
//                 locale={{ emptyText: "Aucune filière" }}
//               />
//             </Card>
//           </Col>
//         </Row>

//         <Row gutter={[16, 16]} className="mt-2">
//           <Col xs={24}>
//             <Card title="Demandes entrantes — statistiques" loading={loading}>
//               <Row gutter={[16, 16]}>
//                 {/* Total */}
//                 <Col xs={24} sm={12} md={6}>
//                   <Card bordered className="rounded-2xl">
//                     <Statistic title="Total (récent)" value={totalRecent} />
//                   </Card>
//                 </Col>

//                 {/* Top 3 statuts (affiche tout si <=3) */}
//                 {statusEntries.slice(0, 3).map(([status, count]) => (
//                   <Col key={status} xs={24} sm={12} md={6}>
//                     <Card bordered className="rounded-2xl">
//                       <div className="flex items-center justify-between">
//                         <Space>
//                           <Tag color="blue">{status}</Tag>
//                         </Space>
//                         <Statistic value={count} />
//                       </div>
//                     </Card>
//                   </Col>
//                 ))}

//                 {/* Si plus de 3 statuts, on affiche le reste dans un bloc compact */}
//                 {statusEntries.length > 3 && (
//                   <Col xs={24}>
//                     <div className="rounded-2xl border border-slate-200 bg-white p-3">
//                       <div className="text-xs text-slate-500 mb-2">Autres statuts</div>
//                       <Space wrap>
//                         {statusEntries.slice(3).map(([status, count]) => (
//                           <Tag key={status}>
//                             <Space size={4}>
//                               <span className="font-medium">{status}</span>
//                               <span className="rounded bg-slate-100 px-1.5 text-[10px]">{count}</span>
//                             </Space>
//                           </Tag>
//                         ))}
//                       </Space>
//                     </div>
//                   </Col>
//                 )}
//               </Row>

      
//             </Card>
//           </Col>
//         </Row>
//       </div>
//     </div>
//   );
// }

/* eslint-disable no-unused-vars */
"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Table,
  Tag,
  Space,
  Breadcrumb,
  Progress,
  message,
} from "antd";
import {
  FileTextOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import dashboardService from "@/services/dashboardService";
import { useAuth } from "../../../hooks/useAuth";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

const statusColor = (s) =>
  s === "VALIDATED" ? "green" :
  s === "REJECTED" ? "red" :
  s === "IN_PROGRESS" ? "gold" : "blue";

export default function InstitutDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await dashboardService.getInstitutStats(user.organization.id, { recentDays: 30 });
        setPayload(res);
      } catch (e) {
        console.error(e);
        message.error(e?.message || t("institutDashboard.toasts.loadError"));
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.organization?.id, t]);

  // Extraction des données
  const data = payload?.data || {};
  const widgets = data.widgets || {};
  const tables = data.tables || {};
  const charts = data.charts || {};

  // Helper lines
  const mapToRows = (obj) => {
    if (!obj || typeof obj !== "object") return [];
    return Object.entries(obj)
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([key, value]) => ({ key, name: key, value: value ?? 0 }));
  };

  // Données pour les tableaux de répartition
  const demandesTargetOrgRows = useMemo(
    () => mapToRows(widgets.demandesTargetOrg?.byStatus),
    [widgets.demandesTargetOrg?.byStatus]
  );
  const demandesAssignedOrgRows = useMemo(
    () => mapToRows(widgets.demandesAssignedOrg?.byStatus),
    [widgets.demandesAssignedOrg?.byStatus]
  );
  const paymentsByStatusRows = useMemo(
    () => mapToRows(widgets.payments?.byStatus),
    [widgets.payments?.byStatus]
  );
  const usersByRoleRows = useMemo(
    () => mapToRows(widgets.users?.byRole),
    [widgets.users?.byRole]
  );

  // Colonnes i18n
  const simpleCols = [
    { title: t("institutDashboard.tables.simpleCols.name"), dataIndex: "name", key: "name" },
    {
      title: t("institutDashboard.tables.simpleCols.value"),
      dataIndex: "value",
      key: "value",
      render: (v) => (v === null || v === undefined ? 0 : v),
      align: "right",
      width: 100,
    },
  ];

  const listCols = [
    { title: t("institutDashboard.tables.listCols.name"), dataIndex: "name", key: "name" },
    { title: t("institutDashboard.tables.listCols.code"), dataIndex: "code", key: "code" },
    { title: t("institutDashboard.tables.listCols.description"), dataIndex: "description", key: "description" },
  ];

  // Récents (entrants)
  const recent = tables?.recentIncomingDemandes || [];
  const totalRecent = recent.length;
  const byStatus = recent.reduce((acc, { status }) => {
    const k = status || "UNKNOWN";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const statusEntries = Object.entries(byStatus);

  const formatDate = (v) => {
    if (!v) return t("institutDashboard.common.na");
    const locale =
      i18n.language === "zh" ? "zh-CN" :
      i18n.language === "de" ? "de-DE" :
      i18n.language === "es" ? "es-ES" :
      i18n.language === "it" ? "it-IT" :
      i18n.language === "en" ? "en-US" : "fr-FR";
    try {
      return new Date(v).toLocaleString(locale, {
        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
      });
    } catch {
      return v;
    }
  };

  const percentAssigned = charts.targetVsAssigned?.assigned && charts.targetVsAssigned?.target
    ? Math.round(
        (charts.targetVsAssigned.assigned /
          (charts.targetVsAssigned.target + charts.targetVsAssigned.assigned)) * 100
      )
    : 0;

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <Title level={3} className="mb-0">
            {t("institutDashboard.header.title")}
          </Title>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("institutDashboard.breadcrumb.home")}</Link> },
              { title: t("institutDashboard.breadcrumb.institute") },
            ]}
          />
        </div>
        <Text type="secondary">
          {t("institutDashboard.header.orgLabel")}{" "}
          <Text code>{user.organization?.name || t("institutDashboard.common.undef")}</Text>
        </Text>

        {/* KPIs 1 */}
        <Row gutter={[16, 16]} className="mt-3">
          <Col xs={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title={t("institutDashboard.kpis.targetRequests")}
                prefix={<FileTextOutlined />}
                value={widgets.demandesTargetOrg?.total ?? 0}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title={t("institutDashboard.kpis.assignedRequests")}
                prefix={<FileTextOutlined />}
                value={widgets.demandesAssignedOrg?.total ?? 0}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title={t("institutDashboard.kpis.documents")}
                prefix={<BookOutlined />}
                value={`${widgets.docsOwnedByOrg?.total ?? 0} / ${widgets.docsOwnedByOrg?.toTranslate ?? 0} / ${widgets.docsOwnedByOrg?.translated ?? 0}`}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title={t("institutDashboard.kpis.subscriptions")}
                prefix={<SafetyCertificateOutlined />}
                value={`${widgets.subscriptions?.active ?? 0} / ${widgets.subscriptions?.total ?? 0}`}
              />
              <div style={{ marginTop: 8 }}>
                <Tag color="gold">
                  {t("institutDashboard.kpis.expiringSoon", { count: widgets.subscriptions?.expiringSoon ?? 0 })}
                </Tag>
              </div>
            </Card>
          </Col>
        </Row>

        {/* KPIs 2: Users */}
        <Row gutter={[16, 16]} className="mt-2">
          <Col xs={24} md={12}>
            <Card loading={loading}>
              <Statistic
                title={t("institutDashboard.kpis.usersTotal")}
                prefix={<TeamOutlined />}
                value={widgets.users?.total ?? 0}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title={t("institutDashboard.tables.usersByRole")} loading={loading}>
              <Table
                rowKey="key"
                size="small"
                columns={simpleCols}
                dataSource={usersByRoleRows}
                pagination={false}
                locale={{ emptyText: t("institutDashboard.common.noData") }}
              />
            </Card>
          </Col>
        </Row>

        {/* Target vs Assigned */}
        <Row gutter={[16, 16]} className="mt-2">
          <Col xs={24} md={12}>
            <Card title={t("institutDashboard.charts.targetVsAssigned.title")} loading={loading}>
              <Progress
                type="dashboard"
                percent={percentAssigned}
                format={(p) => t("institutDashboard.charts.targetVsAssigned.format", { percent: p })}
                status="active"
              />
              <div className="mt-2 text-center">
                <Text strong>{t("institutDashboard.charts.targetVsAssigned.target", { n: charts.targetVsAssigned?.target ?? 0 })}</Text>
                <br />
                <Text strong>{t("institutDashboard.charts.targetVsAssigned.assigned", { n: charts.targetVsAssigned?.assigned ?? 0 })}</Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Répartition demandes par statut */}
        <Row gutter={[16, 16]} className="mt-2">
          <Col xs={24} md={12}>
            <Card title={t("institutDashboard.tables.targetByStatus")} loading={loading}>
              <Table
                rowKey="key"
                size="small"
                columns={simpleCols}
                dataSource={demandesTargetOrgRows}
                pagination={false}
                locale={{ emptyText: t("institutDashboard.common.noData") }}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title={t("institutDashboard.tables.assignedByStatus")} loading={loading}>
              <Table
                rowKey="key"
                size="small"
                columns={simpleCols}
                dataSource={demandesAssignedOrgRows}
                pagination={false}
                locale={{ emptyText: t("institutDashboard.common.noData") }}
              />
            </Card>
          </Col>
        </Row>

        {/* Paiements par statut */}
        <Row gutter={[16, 16]} className="mt-2">
          <Col xs={24} md={12}>
            <Card title={t("institutDashboard.tables.paymentsByStatus")} loading={loading}>
              <Table
                rowKey="key"
                size="small"
                columns={simpleCols}
                dataSource={paymentsByStatusRows}
                pagination={false}
                locale={{ emptyText: t("institutDashboard.common.noData") }}
              />
            </Card>
          </Col>
        </Row>

        {/* Départements & Filières */}
        <Row gutter={[16, 16]} className="mt-2">
          <Col xs={24} md={12}>
            <Card
              title={t("institutDashboard.lists.departmentsTitle", { n: widgets.departments?.total ?? 0 })}
              loading={loading}
              extra={<Tag color="blue">{widgets.departments?.total ?? 0}</Tag>}
            >
              <Table
                rowKey="id"
                size="small"
                columns={listCols}
                dataSource={widgets.departments?.list || []}
                pagination={false}
                locale={{ emptyText: t("institutDashboard.lists.noDepartment") }}
              />
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              title={t("institutDashboard.lists.tracksTitle", { n: widgets.filieres?.total ?? 0 })}
              loading={loading}
              extra={<Tag color="blue">{widgets.filieres?.total ?? 0}</Tag>}
            >
              <Table
                rowKey="id"
                size="small"
                columns={[
                  ...listCols,
                  { title: t("institutDashboard.lists.departmentCol"), dataIndex: ["department", "name"], key: "department" },
                ]}
                dataSource={widgets.filieres?.list || []}
                pagination={false}
                locale={{ emptyText: t("institutDashboard.lists.noTrack") }}
              />
            </Card>
          </Col>
        </Row>

        {/* Demandes entrantes — stats */}
        <Row gutter={[16, 16]} className="mt-2">
          <Col xs={24}>
            <Card title={t("institutDashboard.incoming.title")} loading={loading}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Card variant="outlined" className="rounded-2xl">
                    <Statistic title={t("institutDashboard.incoming.totalRecent")} value={totalRecent} />
                  </Card>
                </Col>

                {statusEntries.slice(0, 3).map(([status, count]) => (
                  <Col key={status} xs={24} sm={12} md={6}>
                    <Card variant="outlined" className="rounded-2xl">
                      <div className="flex items-center justify-between">
                        <Space>
                          <Tag color={statusColor(status)}>{status}</Tag>
                        </Space>
                        <Statistic value={count} />
                      </div>
                    </Card>
                  </Col>
                ))}

                {statusEntries.length > 3 && (
                  <Col xs={24}>
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="text-xs text-slate-500 mb-2">{t("institutDashboard.incoming.otherStatuses")}</div>
                      <Space wrap>
                        {statusEntries.slice(3).map(([status, count]) => (
                          <Tag key={status}>
                            <Space size={4}>
                              <span className="font-medium">{status}</span>
                              <span className="rounded bg-slate-100 px-1.5 text-[10px]">{count}</span>
                            </Space>
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  </Col>
                )}
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
