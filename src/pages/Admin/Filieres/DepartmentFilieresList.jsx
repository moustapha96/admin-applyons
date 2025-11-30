// src/pages/Admin/Filieres/DepartmentFilieresList.jsx
"use client";
import { useEffect, useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Breadcrumb, Button, Card, Input, Select, Space, Table, Tag, Typography, message } from "antd";
import dayjs from "dayjs";

import departmentService from "@/services/departmentService";

const { Title } = Typography;
const DEPS_BASE = "/admin/departments";
const FILIERE_BASE = "/admin/filieres";

export default function DepartmentFilieresList() {
  const { id: departmentId } = useParams();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pag, setPag] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: "", level: undefined });

  const fetch = async (page = pag.current, pageSize = pag.pageSize, f = filters) => {
    if (!departmentId) return;
    setLoading(true);
    try {
      // service retourne { filieres, pagination }
      const res = await departmentService.listFilieres(departmentId, {
        page,
        limit: pageSize,
        search: f.search || undefined,
        level: f.level || undefined,
      });
      console.log(res)
      setRows(res?.filieres ?? []);
      setPag({ current: page, pageSize, total: res?.pagination?.total ?? 0 });
    } catch (e) {
      message.error(e?.response?.data?.message || "Erreur chargement des filières");
      // on peut remonter à la page Département si besoin
      // navigate(`${DEPS_BASE}/${departmentId}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch(1, pag.pageSize, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId, filters.search, filters.level]);

  const columns = useMemo(() => [
    {
      title: "Nom",
      dataIndex: "name",
      render: (v, r) => <Tag>{v}</Tag> ,
    },
    { title: "Code", dataIndex: "code", render: (v) => v || "—", width: 140 },
    {
      title: "Niveau",
      dataIndex: "level",
      width: 160,
      render: (v) => (v ? <Tag>{v}</Tag> : "—"),
    },
    {
      title: "Créée le",
      dataIndex: "createdAt",
      width: 180,
      render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
    },
    // {
    //   title: "Actions",
    //   key: "actions",
    //   fixed: "right",
    //   width: 230,
    //   render: (_, r) => (
    //     <Space wrap>
  
    //       <Link to={`${FILIERE_BASE}/${r.id}/edit`}>
    //         <Button size="small">Modifier</Button>
    //       </Link>
    //     </Space>
    //   ),
    // },
  ], []);

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Filières du département</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">Dashboard</Link> },
              { title: <Link to={DEPS_BASE}>Départements</Link> },
              { title: <Link to={`${DEPS_BASE}/${departmentId}`}>Détail</Link> },
              { title: "Filières" },
            ]}
          />
        </div>

        <Card>
          <Space className="mb-3" style={{ width: "100%", justifyContent: "space-between" }}>
            <Title level={4} style={{ margin: 0 }}>Filières</Title>
            <Space wrap>
              <Input.Search
                placeholder="Recherche (nom, code…)"
                allowClear
                style={{ width: 260 }}
                onSearch={(v) => setFilters((s) => ({ ...s, search: v }))}
                onChange={(e) => setFilters((s) => ({ ...s, search: e.target.value }))}
              />
              <Select
                allowClear
                placeholder="Niveau"
                style={{ width: 180 }}
                value={filters.level}
                onChange={(v) => setFilters((s) => ({ ...s, level: v || undefined }))}
                options={[
                  { value: "Licence", label: "Licence" },
                  { value: "Master", label: "Master" },
                  { value: "Doctorat", label: "Doctorat" },
                ]}
              />
             
            </Space>
          </Space>

          <Table
            rowKey="id"
            dataSource={rows}
            loading={loading}
            columns={columns}
            scroll={{ x: 800 }}
            pagination={{
              current: pag.current,
              pageSize: pag.pageSize,
              total: pag.total,
              showSizeChanger: true,
              onChange: (p, ps) => fetch(p, ps, filters),
            }}
          />
        </Card>
      </div>
    </div>
  );
}
