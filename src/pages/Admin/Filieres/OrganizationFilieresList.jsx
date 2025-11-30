// src/pages/Filieres/OrganizationFilieresList.jsx
"use client";
import { useEffect, useState } from "react";
import { Card, Input, Select, Space, Table, Typography, message, Tag } from "antd";
import filiereService from "@/services/filiereService";
import { useOrgScope } from "@/hooks/useOrgScope";
import dayjs from "dayjs";

const { Title } = Typography;

export default function OrganizationFilieresList() {
  const { isAdmin, organizationId } = useOrgScope();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pag, setPag] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: "", level: undefined, organizationId });

  const fetch = async (page = pag.current, pageSize = pag.pageSize, f = filters) => {
    if (!f.organizationId && !isAdmin) return;
    setLoading(true);
    try {
      const { data } = await filiereService.listByOrganization({
        page, limit: pageSize,
        organizationId: f.organizationId,
        search: f.search || undefined,
        level: f.level || undefined
      }); // retourne filieres + department + organization :contentReference[oaicite:20]{index=20}
      setRows(data?.filieres ?? []);
      setPag({ current: page, pageSize, total: data?.pagination?.total ?? 0 });
    } catch (e) { message.error("Erreur chargement"); }
    finally { setLoading(false); }
  };

  useEffect(()=> { fetch(1, pag.pageSize, filters); /* eslint-disable-next-line */ }, [filters.search, filters.level, filters.organizationId]);

  const columns = [
    { title: "Filière", dataIndex: "name" },
    { title: "Niveau", dataIndex: "level", render: v => v || "—" },
    { title: "Département", dataIndex: ["department","name"] },
    { title: "Organisation", dataIndex: ["organization","name"], render: (v)=> v || "—" },
    { title: "Créée le", dataIndex: "createdAt", render: v => dayjs(v).format("DD/MM/YYYY HH:mm") },
  ];

  return (
    <Card>
      <Space className="mb-3" style={{ width:"100%", justifyContent:"space-between" }}>
        <Title level={4} style={{ margin: 0 }}>Filières de mon organisation</Title>
        <Space>
          <Input.Search allowClear placeholder="Recherche (nom…)" style={{ width: 240 }}
            onSearch={(v)=> setFilters(s=>({...s, search: v}))}
            onChange={(e)=> setFilters(s=>({...s, search: e.target.value}))}
          />
          <Select allowClear placeholder="Niveau" style={{ width: 180 }}
            value={filters.level}
            onChange={(v)=> setFilters(s=>({...s, level: v || undefined}))}
            options={[{value:"Licence",label:"Licence"},{value:"Master",label:"Master"},{value:"Doctorat",label:"Doctorat"}]}
          />
          {!isAdmin && <Tag color="blue">Organisation: {filters.organizationId}</Tag>}
        </Space>
      </Space>

      <Table
        rowKey="id"
        dataSource={rows}
        loading={loading}
        columns={columns}
        pagination={{
          current: pag.current, pageSize: pag.pageSize, total: pag.total,
          onChange: (p, ps)=> fetch(p, ps, filters),
          showSizeChanger: true
        }}
      />
    </Card>
  );
}
