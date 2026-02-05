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
import { DATE_FORMAT } from "@/utils/dateFormat";
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
      const data = res?.data ?? res;
      setStats(data?.stats ?? data);
    } catch (e) {
      message.error(e?.response?.data?.message || "Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Données normalisées (toujours des tableaux)
  const byStatus = useMemo(() => {
    const raw = stats?.byStatus ?? stats?.by_status ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [stats]);
  const byProvider = useMemo(() => {
    const raw = stats?.byProvider ?? stats?.by_provider ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [stats]);
  const amountByStatus = useMemo(() => {
    const raw = stats?.amountByStatus ?? stats?.amount_by_status ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [stats]);
  const totals = useMemo(() => stats?.totals ?? {}, [stats]);

  // KPIs (priorité aux totaux API, sinon calcul depuis les tableaux)
  const totalCount = useMemo(() => {
    if (totals?.count != null) return Number(totals.count);
    return byStatus.reduce((acc, s) => acc + Number(s?.count ?? 0), 0);
  }, [totals, byStatus]);

  const succeededCount = useMemo(() => {
    if (totals?.succeeded != null) return Number(totals.succeeded);
    const map = Object.fromEntries(byStatus.map((s) => [String(s?.status ?? "").toUpperCase(), Number(s?.count ?? 0)]));
    return (map.SUCCEEDED ?? 0) + (map.COMPLETED ?? 0);
  }, [totals, byStatus]);

  const totalAmount = useMemo(() => {
    if (totals?.amount != null) return Number(totals.amount);
    return amountByStatus.reduce((acc, s) => acc + Number(s?.totalAmount ?? s?.amount ?? 0), 0);
  }, [totals, amountByStatus]);

  const currency = totals?.currency ?? "USD";

  // Options dynamiques pour les selects (issues des stats)
  const providerOptions = useMemo(
    () => Array.from(new Set(byProvider.map((p) => p?.provider).filter(Boolean))).map((p) => ({ label: String(p), value: p })),
    [byProvider]
  );

  const statusOptions = useMemo(
    () => Array.from(new Set(byStatus.map((s) => s?.status).filter(Boolean))).map((s) => ({
      label: STATUS_LABELS[s] || String(s),
      value: s,
    })),
    [byStatus]
  );

  // Données pour les graphiques (champs normalisés)
  const byProviderForCharts = useMemo(
    () => byProvider.map((p) => ({
      provider: p?.provider ?? "—",
      count: Number(p?.count ?? p?.total ?? 0),
      amount: Number(p?.amount ?? p?.totalAmount ?? 0),
    })),
    [byProvider]
  );

  const byStatusCountForCharts = useMemo(
    () => byStatus.map((s) => ({
      status: STATUS_LABELS[s?.status] ?? String(s?.status ?? "—"),
      count: Number(s?.count ?? 0),
    })),
    [byStatus]
  );

  const amountByStatusForCharts = useMemo(
    () => amountByStatus.map((s) => ({
      status: STATUS_LABELS[s?.status] ?? String(s?.status ?? "—"),
      amount: Number(s?.totalAmount ?? s?.amount ?? 0),
    })),
    [amountByStatus]
  );

  const formatCurrency = (val) =>
    (Number(val) || 0).toLocaleString("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });

  return (
    <div className="container-fluid relative px-2 sm:px-3 overflow-x-hidden max-w-full">
      <div className="layout-specing py-4 sm:py-6">
        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
          <h5 className="text-base sm:text-lg font-semibold order-2 sm:order-1 break-words">
            Statistiques des paiements
          </h5>
          <Breadcrumb
            className="order-1 sm:order-2"
            items={[
              { title: <Link to="/admin/dashboard">Dashboard</Link> },
              { title: <Link to="/admin/payments">Paiements</Link> },
              { title: "Statistiques" },
            ]}
          />
        </div>

        <Card className="mb-4 sm:mb-6 overflow-hidden">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={24} md={10} lg={8}>
              <RangePicker
                allowClear={false}
                format={DATE_FORMAT}
                className="w-full"
                value={[dayjs(filters.from), dayjs(filters.to)]}
                onChange={(vals) => {
                  const from = vals?.[0]?.startOf("day").toISOString();
                  const to = vals?.[1]?.endOf("day").toISOString();
                  setFilters((f) => ({ ...f, from, to }));
                }}
              />
            </Col>
            <Col xs={24} sm={12} md={7} lg={6}>
              <Select
                allowClear
                placeholder="Provider"
                className="w-full"
                options={providerOptions}
                value={filters.provider}
                onChange={(v) => setFilters((f) => ({ ...f, provider: v ?? null }))}
              />
            </Col>
            <Col xs={24} sm={12} md={7} lg={6}>
              <Select
                allowClear
                placeholder="Statut"
                className="w-full"
                options={statusOptions}
                value={filters.status}
                onChange={(v) => setFilters((f) => ({ ...f, status: v ?? null }))}
              />
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]} className="mb-4 sm:mb-6">
          <Col xs={24} sm={12} md={8}>
            <Card loading={loading} className="overflow-hidden">
              <Statistic
                title="Montant total"
                prefix={<DollarCircleOutlined />}
                value={formatCurrency(totalAmount)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card loading={loading} className="overflow-hidden">
              <Statistic
                title="Paiements réussis"
                prefix={<CheckCircleOutlined />}
                value={succeededCount}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card loading={loading} className="overflow-hidden">
              <Statistic title="Nombre total" value={totalCount} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mb-4 sm:mb-6">
          <Col xs={24} lg={12}>
            <Card title="Répartition par provider (nombre)" className="overflow-hidden min-h-[320px]">
              {byProviderForCharts.length === 0 && !loading ? (
                <Empty description="Aucune donnée sur la période" />
              ) : (
                <ResponsiveContainer width="100%" height={320} minHeight={280}>
                  <BarChart data={byProviderForCharts} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="provider" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [Number(v), "Nombre"]} />
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
            <Card title="Montant par statut" className="overflow-hidden min-h-[320px]">
              {amountByStatusForCharts.length === 0 && !loading ? (
                <Empty description="Aucune donnée sur la période" />
              ) : (
                <ResponsiveContainer width="100%" height={320} minHeight={280}>
                  <BarChart data={amountByStatusForCharts} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
                    <Tooltip formatter={(v) => [formatCurrency(v), "Montant"]} />
                    <Bar dataKey="amount" name="Montant">
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

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Répartition par statut (nombre)" className="overflow-hidden min-h-[320px]">
              {byStatusCountForCharts.length === 0 && !loading ? (
                <Empty description="Aucune donnée sur la période" />
              ) : (
                <ResponsiveContainer width="100%" height={320} minHeight={280}>
                  <PieChart>
                    <Pie
                      data={byStatusCountForCharts}
                      dataKey="count"
                      nameKey="status"
                      outerRadius={110}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {byStatusCountForCharts.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [Number(v), "Nombre"]} />
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
