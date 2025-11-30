"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Breadcrumb, Card, DatePicker, Statistic, Row, Col, Select, message } from "antd";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import transactionService from "../../../services/transactionService";

import {
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { DollarCircleOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;
const COLORS = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2"];

export default function AdminTransactionsStats() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    from: dayjs().startOf("month").toISOString(),
    to: dayjs().endOf("month").toISOString(),
    statut: undefined,
    typePaiement: undefined,
  });

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionService.stats({
        from: filters.from,
        to: filters.to,
        statut: filters.statut || undefined,
        typePaiement: filters.typePaiement || undefined,
      });
      setStats(res);
    } catch (e) {
      message.error(e?.response?.data?.message || "Erreur chargement stats");
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(()=> { fetchStats(); }, [fetchStats]);

  const byStatut = useMemo(()=> stats?.byStatut || [], [stats]);
  const byType = useMemo(()=> stats?.byTypePaiement || [], [stats]);
  const totalAmount = useMemo(()=> Number(stats?.totalAmount || 0), [stats]);

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Statistiques des transactions</h5>
          <Breadcrumb items={[{ title: <Link to="/admin/dashboard">Dashboard</Link> }, { title: "Transactions" }, { title: "Statistiques" }]} />
        </div>

        <Card className="mb-4">
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} md="auto">
              <RangePicker
                allowClear={false}
                value={[dayjs(filters.from), dayjs(filters.to)]}
                onChange={(vals) => {
                  const from = vals?.[0]?.startOf("day").toISOString();
                  const to = vals?.[1]?.endOf("day").toISOString();
                  setFilters((f) => ({ ...f, from, to }));
                }}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                allowClear placeholder="Filtrer statut"
                className="w-full"
                value={filters.statut}
                onChange={(v)=> setFilters((f)=> ({ ...f, statut: v || undefined }))}
                options={[
                  { value: "PENDING", label: "PENDING" },
                  { value: "COMPLETED", label: "COMPLETED" },
                  { value: "FAILED", label: "FAILED" },
                ]}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                allowClear placeholder="Type paiement"
                className="w-full"
                value={filters.typePaiement}
                onChange={(v)=> setFilters((f)=> ({ ...f, typePaiement: v || undefined }))}
                options={[
                  { value: "STRIPE", label: "STRIPE" },
                  { value: "PAYPAL", label: "PAYPAL" },
                  { value: "CASH", label: "CASH" },
                  { value: "WIRE", label: "VIREMENT" },
                ]}
              />
            </Col>
          </Row>
        </Card>

        <Row gutter={[16,16]}>
          <Col xs={24} md={8}>
            <Card loading={loading}>
              <Statistic
                title="Montant total (période)"
                value={totalAmount.toLocaleString()}
                suffix="USD"
                prefix={<DollarCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={16}>
            <Card title="Montant par type de paiement" loading={loading}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byType.map(x=> ({ ...x, total: Number(x.totalAmount || 0) }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="typePaiement" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" name="Montant" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16,16]} className="mt-4">
          <Col xs={24} md={12}>
            <Card title="Répartition par statut (nombre)" loading={loading}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byStatut}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="statut" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Nombre" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Répartition par type (camembert)" loading={loading}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={byType.map(x=> ({ ...x, total: Number(x.totalAmount || 0) }))}
                       dataKey="total" nameKey="typePaiement" outerRadius={110} label>
                    {byType.map((_, i)=><Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
