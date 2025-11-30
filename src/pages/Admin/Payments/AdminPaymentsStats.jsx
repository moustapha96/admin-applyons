// // src/pages/Admin/Payments/AdminPaymentsStats.jsx
// "use client";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import { Breadcrumb, Card, DatePicker, Statistic, Row, Col, Space, Select, message } from "antd";
// import { Link } from "react-router-dom";
// import { DollarCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
// import dayjs from "dayjs";
// import paymentService from "@/services/paymentService";
// import {
//   LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell,
// } from "recharts";

// const { RangePicker } = DatePicker;
// const COLORS = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2"];

// export default function AdminPaymentsStats() {
//   const [loading, setLoading] = useState(false);
//   const [stats, setStats] = useState(null);
//   const [filters, setFilters] = useState({
//     from: dayjs().startOf("month").toISOString(),
//     to: dayjs().endOf("month").toISOString(),
//     granularity: "day", // "day" | "week" | "month"
//   });

//   const fetchStats = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await paymentService.stats({
//         from: filters.from,
//         to: filters.to,
//         granularity: filters.granularity,
//       });
//       setStats(res);
//     } catch (e) {
//       message.error(e?.response?.data?.message || "Erreur chargement statistiques");
//     } finally {
//       setLoading(false);
//     }
//   }, [filters]);

//   useEffect(() => { fetchStats(); }, [fetchStats]);

//   const timeSeries = useMemo(() => stats?.timeseries || [], [stats]);
//   const byProvider = useMemo(() => stats?.byProvider || [], [stats]);
//   const byStatus = useMemo(() => stats?.byStatus || [], [stats]);

//   return (
//     <div className="container-fluid relative px-3">
//       <div className="layout-specing">
//         <div className="md:flex justify-between items-center mb-6">
//           <h5 className="text-lg font-semibold">Statistiques des paiements</h5>
//           <Breadcrumb items={[{ title: <Link to="/admin/dashboard">Dashboard</Link> }, { title: "Paiements" }, { title: "Statistiques" }]} />
//         </div>

//         <Card className="mb-4">
//           <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
//             <RangePicker
//               allowClear={false}
//               value={[dayjs(filters.from), dayjs(filters.to)]}
//               onChange={(vals) => {
//                 const from = vals?.[0]?.startOf("day").toISOString();
//                 const to = vals?.[1]?.endOf("day").toISOString();
//                 setFilters((f) => ({ ...f, from, to }));
//               }}
//             />
//             <Select
//               value={filters.granularity}
//               onChange={(v) => setFilters((f) => ({ ...f, granularity: v }))}
//               options={[
//                 { value: "day", label: "Jour" },
//                 { value: "week", label: "Semaine" },
//                 { value: "month", label: "Mois" },
//               ]}
//             />
//           </Space>
//         </Card>

//         <Row gutter={[16, 16]}>
//           <Col xs={24} md={8}>
//             <Card loading={loading}>
//               <Statistic
//                 title="Montant total"
//                 prefix={<DollarCircleOutlined />}
//                 value={(stats?.totals?.amount ?? 0).toLocaleString()}
//                 suffix={stats?.totals?.currency || "USD"}
//               />
//             </Card>
//           </Col>
//           <Col xs={24} md={8}>
//             <Card loading={loading}>
//               <Statistic title="Paiements réussis" prefix={<CheckCircleOutlined />} value={stats?.totals?.succeeded ?? 0} />
//             </Card>
//           </Col>
//           <Col xs={24} md={8}>
//             <Card loading={loading}>
//               <Statistic title="Nombre total" value={stats?.totals?.count ?? 0} />
//             </Card>
//           </Col>
//         </Row>

//         <Row gutter={[16, 16]} className="mt-4">
//           <Col xs={24} lg={16}>
//             <Card title="Évolution (montant)">
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={timeSeries}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="bucket" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Line type="monotone" dataKey="amount" name="Montant" />
//                 </LineChart>
//               </ResponsiveContainer>
//             </Card>
//           </Col>
//           <Col xs={24} lg={8}>
//             <Card title="Répartition par provider">
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie data={byProvider} dataKey="amount" nameKey="provider" outerRadius={110} label>
//                     {byProvider.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//             </Card>
//           </Col>
//         </Row>

//         <Row gutter={[16, 16]} className="mt-4">
//           <Col xs={24} lg={12}>
//             <Card title="Montant par provider">
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={byProvider}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="provider" />
//                   <YAxis />
//                   <Tooltip />
//                   <Bar dataKey="amount" name="Montant" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </Card>
//           </Col>
//           <Col xs={24} lg={12}>
//             <Card title="Répartition par statut (nombre)">
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={byStatus}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="status" />
//                   <YAxis />
//                   <Tooltip />
//                   <Bar dataKey="count" name="Nombre" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </Card>
//           </Col>
//         </Row>
//       </div>
//     </div>
//   );
// }

// src/pages/Admin/Payments/AdminPaymentsStats.jsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumb, Card, DatePicker, Statistic, Row, Col, Space, Select, message, Empty } from "antd";
import { Link } from "react-router-dom";
import { DollarCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import paymentService from "@/services/paymentService";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const { RangePicker } = DatePicker;
const COLORS = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#2f54eb", "#eb2f96"];

const STATUS_LABELS = {
  PENDING: "En attente",
  REQUIRES_ACTION: "Action requise",
  SUCCEEDED: "Réussi",
  COMPLETED: "Terminé",
  FAILED: "Échoué",
  CANCELED: "Annulé",
};

export default function AdminPaymentsStats() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Filtres envoyés au backend (conformes à ta route)
  const [filters, setFilters] = useState({
    from: dayjs().startOf("month").toISOString(),
    to: dayjs().endOf("month").toISOString(),
    provider: null,
    status: null,
  });

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentService.stats({
        from: filters.from,
        to: filters.to,
        ...(filters.provider ? { provider: filters.provider } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      });
      setStats(res);
    } catch (e) {
      message.error(e?.response?.data?.message || "Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Données normalisées
  const byStatus = useMemo(() => stats?.byStatus ?? [], [stats]);
  const byProvider = useMemo(() => stats?.byProvider ?? [], [stats]);
  const amountByStatus = useMemo(() => stats?.amountByStatus ?? [], [stats]);

  // KPIs
  const totalCount = useMemo(
    () => byStatus.reduce((acc, s) => acc + (s?.count ?? 0), 0),
    [byStatus]
  );

  const succeededCount = useMemo(() => {
    // selon ta stack, "COMPLETED" (PayPal) et/ou "SUCCEEDED" (Stripe) marquent la réussite
    const map = Object.fromEntries(byStatus.map(s => [s.status, s.count]));
    return (map.SUCCEEDED ?? 0) + (map.COMPLETED ?? 0);
  }, [byStatus]);

  const totalAmount = useMemo(
    () => amountByStatus.reduce((acc, s) => acc + Number(s?.totalAmount ?? 0), 0),
    [amountByStatus]
  );

  // Options dynamiques pour les selects (issues des stats)
  const providerOptions = useMemo(
    () => Array.from(new Set(byProvider.map(p => p.provider).filter(Boolean))).map(p => ({ label: p, value: p })),
    [byProvider]
  );

  const statusOptions = useMemo(
    () => Array.from(new Set(byStatus.map(s => s.status).filter(Boolean))).map(s => ({
      label: STATUS_LABELS[s] || s,
      value: s,
    })),
    [byStatus]
  );

  // Données pour les graphiques
  const byProviderForCharts = useMemo(
    () => byProvider.map((p) => ({ provider: p.provider || "—", count: p.count })),
    [byProvider]
  );

  const byStatusCountForCharts = useMemo(
    () => byStatus.map((s) => ({ status: STATUS_LABELS[s.status] || s.status, count: s.count })),
    [byStatus]
  );

  const amountByStatusForCharts = useMemo(
    () => amountByStatus.map((s) => ({
      status: STATUS_LABELS[s.status] || s.status,
      amount: Number(s.totalAmount || 0),
    })),
    [amountByStatus]
  );

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
          <h5 className="text-lg font-semibold">Statistiques des paiements</h5>
          <Breadcrumb items={[
            { title: <Link to="/admin/dashboard">Dashboard</Link> },
            { title: "Paiements" },
            { title: "Statistiques" },
          ]} />
        </div>

        <Card className="mb-4">
          <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
            <RangePicker
              allowClear={false}
              value={[dayjs(filters.from), dayjs(filters.to)]}
              onChange={(vals) => {
                const from = vals?.[0]?.startOf("day").toISOString();
                const to = vals?.[1]?.endOf("day").toISOString();
                setFilters((f) => ({ ...f, from, to }));
              }}
            />
            <Space wrap>
              <Select
                allowClear
                placeholder="Provider"
                style={{ minWidth: 160 }}
                options={providerOptions}
                value={filters.provider}
                onChange={(v) => setFilters((f) => ({ ...f, provider: v ?? null }))}
              />
              <Select
                allowClear
                placeholder="Statut"
                style={{ minWidth: 180 }}
                options={statusOptions}
                value={filters.status}
                onChange={(v) => setFilters((f) => ({ ...f, status: v ?? null }))}
              />
            </Space>
          </Space>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card loading={loading}>
              <Statistic
                title="Montant total"
                prefix={<DollarCircleOutlined />}
                value={formatXOF(totalAmount)}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card loading={loading}>
              <Statistic
                title="Paiements réussis"
                prefix={<CheckCircleOutlined />}
                value={succeededCount}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card loading={loading}>
              <Statistic title="Nombre total" value={totalCount} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} lg={12}>
            <Card title="Répartition par provider (nombre)">
              {byProviderForCharts.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={byProviderForCharts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="provider" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Nombre">
                      {byProviderForCharts.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Montant par statut">
              {amountByStatusForCharts.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={amountByStatusForCharts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip formatter={(v) => formatXOF(v)} />
                    <Bar dataKey="amount" name="Montant (XOF)">
                      {amountByStatusForCharts.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} lg={12}>
            <Card title="Répartition par statut (nombre)">
              {byStatusCountForCharts.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={byStatusCountForCharts}
                      dataKey="count"
                      nameKey="status"
                      outerRadius={110}
                      label
                    >
                      {byStatusCountForCharts.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
