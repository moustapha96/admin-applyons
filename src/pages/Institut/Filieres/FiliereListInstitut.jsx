// /* eslint-disable no-unused-vars */
// "use client";

// import { useCallback, useEffect, useState } from "react";
// import { Breadcrumb, Button, Input, Select, Table, Tag, Space, message } from "antd";
// import { Link, useNavigate } from "react-router-dom";
// import { SearchOutlined, PlusOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
// import { useAuth } from "../../../hooks/useAuth";
// import filiereService from "@/services/filiereService";
// import departmentService from "@/services/departmentService";

// export default function FiliereListInstitut() {
//     const { user: me } = useAuth();
//     const orgId = me?.organization?.id;

//     const [rows, setRows] = useState([]);
//     const [departments, setDepartments] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
//     const [filters, setFilters] = useState({ departmentId: null, search: "", level: null });

//     const loadDeps = useCallback(async () => {
//         try {
//             const res = await departmentService.list({ page: 1, limit: 200, organizationId: orgId });
//             console.log(res)
//             setDepartments(res?.departments || []);
//         } catch (e) {
//             console.log(e)
//         }
//     }, [orgId]);

//     const fetchData = useCallback(async () => {
//         if (!orgId) return;
//         setLoading(true);
//         try {
//             let res;
//             if (filters.departmentId) {
//                 // /filieres?departmentId=... (route list) :contentReference[oaicite:11]{index=11}
//                 res = await filiereService.list({
//                     page: pagination.current, limit: pagination.pageSize,
//                     departmentId: filters.departmentId,
//                     search: filters.search || undefined,
//                     level: filters.level || undefined,
//                 });
//             } else {
//                 // /filieres/by-organization?organizationId=... (pour toutes les filières de l'org) :contentReference[oaicite:12]{index=12}
//                 res = await filiereService.listByOrganization({
//                     page: pagination.current, limit: pagination.pageSize,
//                     organizationId: orgId,
//                     search: filters.search || undefined,
//                     level: filters.level || undefined,
//                 });
//             }
//             console.log(res)
//             setRows(res.filieres || []);
//             setPagination(p => ({ ...p, total: res.pagination?.total || 0 }));
//         } catch (e) { message.error(e?.message || "Erreur de chargement"); }
//         finally { setLoading(false); }
//     }, [orgId, pagination.current, pagination.pageSize, filters]);

//     useEffect(() => { loadDeps(); }, [loadDeps]);
//     useEffect(() => { fetchData(); }, [fetchData]);

//     const columns = [
//         { title: "Nom", dataIndex: "name", render: (v, r) => <Link to={`/organisations/filieres/${r.id}`}>{v}</Link> },
//         { title: "Code", dataIndex: "code", width: 140, render: v => v || "—" },
//         { title: "Niveau", dataIndex: "level", width: 160, render: v => <Tag>{v || "—"}</Tag> },
//         { title: "Département", dataIndex: ["department", "name"], render: (_, r) => r.department?.name || "—" },
//         {
//       title: "Actions",
//       key: "actions",
//       width: 180,
//       render: (_, r) => (
//         <Space size="small">
//           <Link to={`/organisations/filieres/${r.id}`}>
//             <Button size="small" icon={<EyeOutlined />}>Détails</Button>
//           </Link>
//           <Link to={`/organisations/filieres/${r.id}/edit`}>
//             <Button size="small" icon={<EditOutlined />}>Modifier</Button>
//           </Link>
//         </Space>
//       ),
//     },
//     ];

//     return (
//         <div className="container-fluid relative px-3">
//             <div className="layout-specing">
//                 <div className="md:flex justify-between items-center mb-6">
//                     <h5 className="text-lg font-semibold">Filières (mon institut)</h5>
//                     <Breadcrumb items={[
//                         { title: <Link to="/organisations/dashboard">Dashboard</Link> },
//                         { title: "Filières" },
//                     ]} />
//                 </div>

//                 <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
//                     <div className="flex gap-3 flex-col md:flex-row md:items-center">
//                         <Input.Search placeholder="Recherche (nom)" allowClear enterButton={<SearchOutlined />}
//                             onSearch={(v) => { setFilters({ ...filters, search: v }); setPagination(p => ({ ...p, current: 1 })); }}
//                             className="w-full md:w-1/2" />
//                         <Space className="ml-auto flex-wrap">
//                             <Select
//                                 placeholder="Département"
//                                 allowClear
//                                 className="w-60"
//                                 options={departments.map(d => ({ value: d.id, label: d.name }))}
//                                 onChange={(v) => { setFilters({ ...filters, departmentId: v || null }); setPagination(p => ({ ...p, current: 1 })); }}
//                             />
//                             <Select
//                                 placeholder="Niveau"
//                                 allowClear
//                                 className="w-52"
//                                 options={[
//                                     { value: "Licence", label: "Licence" },
//                                     { value: "Master", label: "Master" },
//                                     { value: "Doctorat", label: "Doctorat" },
//                                 ]}
//                                 onChange={(v) => { setFilters({ ...filters, level: v || null }); setPagination(p => ({ ...p, current: 1 })); }}
//                             />
//                             <Link to="/organisations/filieres/create"><Button type="primary" icon={<PlusOutlined />}>Nouvelle filière</Button></Link>
//                         </Space>
//                     </div>
//                 </div>

//                 <Table
//                     rowKey="id"
//                     loading={loading}
//                     dataSource={rows}
//                     columns={columns}
//                     pagination={{ ...pagination, showSizeChanger: true, pageSizeOptions: ["5", "10", "20", "50"] }}
//                     onChange={(pg) => setPagination({ ...pagination, current: pg.current, pageSize: pg.pageSize })}
//                     scroll={{ x: true }}
//                 />
//             </div>
//         </div>
//     );
// }
/* eslint-disable no-unused-vars */
"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { Breadcrumb, Button, Input, Select, Table, Tag, Space, message } from "antd";
import { Link } from "react-router-dom";
import { SearchOutlined, PlusOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import filiereService from "@/services/filiereService";
import departmentService from "@/services/departmentService";
import { useTranslation } from "react-i18next";

export default function FiliereListInstitut() {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const orgId = me?.organization?.id;

  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ departmentId: null, search: "", level: null });

  const loadDeps = useCallback(async () => {
    try {
      const res = await departmentService.list({ page: 1, limit: 200, organizationId: orgId });
      setDepartments(res?.departments || []);
    } catch (e) {
      // pas bloquant, on garde silencieux, tu peux ajouter: message.error(...)
    }
  }, [orgId]);

  const fetchData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      let res;
      if (filters.departmentId) {
        res = await filiereService.list({
          page: pagination.current,
          limit: pagination.pageSize,
          departmentId: filters.departmentId,
          search: filters.search || undefined,
          level: filters.level || undefined
        });
      } else {
        res = await filiereService.listByOrganization({
          page: pagination.current,
          limit: pagination.pageSize,
          organizationId: orgId,
          search: filters.search || undefined,
          level: filters.level || undefined
        });
      }
      setRows(res.filieres || []);
      setPagination((p) => ({ ...p, total: res.pagination?.total || 0 }));
    } catch (e) {
      message.error(e?.message || t("filiereListInstitut.messages.loadError"));
    } finally {
      setLoading(false);
    }
  }, [orgId, pagination.current, pagination.pageSize, filters, t]);

  useEffect(() => { loadDeps(); }, [loadDeps]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = useMemo(() => ([
    {
      title: t("filiereListInstitut.columns.name"),
      dataIndex: "name",
      render: (v, r) => <Link to={`/organisations/filieres/${r.id}`}>{v}</Link>
    },
    {
      title: t("filiereListInstitut.columns.code"),
      dataIndex: "code",
      width: 140,
      render: (v) => v || "—"
    },
    {
      title: t("filiereListInstitut.columns.level"),
      dataIndex: "level",
      width: 160,
      render: (v) => <Tag>{v || "—"}</Tag>
    },
    {
      title: t("filiereListInstitut.columns.department"),
      dataIndex: ["department", "name"],
      render: (_, r) => r.department?.name || "—"
    },
    {
      title: t("filiereListInstitut.columns.actions"),
      key: "actions",
      width: 180,
      render: (_, r) => (
        <Space size="small">
          <Link to={`/organisations/filieres/${r.id}`}>
            <Button size="small" icon={<EyeOutlined />}>{t("filiereListInstitut.buttons.details")}</Button>
          </Link>
          <Link to={`/organisations/filieres/${r.id}/edit`}>
            <Button size="small" icon={<EditOutlined />}>{t("filiereListInstitut.buttons.edit")}</Button>
          </Link>
        </Space>
      )
    }
  ]), [t]);

  const LEVEL_OPTIONS = [
    { value: "Licence", label: t("filiereListInstitut.levels.licence") },
    { value: "Master", label: t("filiereListInstitut.levels.master") },
    { value: "Doctorat", label: t("filiereListInstitut.levels.doctorat") }
  ];

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("filiereListInstitut.pageTitle")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("filiereListInstitut.breadcrumbs.dashboard")}</Link> },
              { title: t("filiereListInstitut.breadcrumbs.filieres") }
            ]}
          />
        </div>

        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex gap-3 flex-col md:flex-row md:items-center">
            <Input.Search
              placeholder={t("filiereListInstitut.filters.searchPlaceholder")}
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={(v) => {
                setFilters({ ...filters, search: v });
                setPagination((p) => ({ ...p, current: 1 }));
              }}
              className="w-full md:w-1/2"
            />
            <Space className="ml-auto flex-wrap">
              <Select
                placeholder={t("filiereListInstitut.filters.departmentPlaceholder")}
                allowClear
                className="w-60"
                options={departments.map((d) => ({ value: d.id, label: d.name }))}
                onChange={(v) => {
                  setFilters({ ...filters, departmentId: v || null });
                  setPagination((p) => ({ ...p, current: 1 }));
                }}
              />
              <Select
                placeholder={t("filiereListInstitut.filters.levelPlaceholder")}
                allowClear
                className="w-52"
                options={LEVEL_OPTIONS}
                onChange={(v) => {
                  setFilters({ ...filters, level: v || null });
                  setPagination((p) => ({ ...p, current: 1 }));
                }}
              />
              <Link to="/organisations/filieres/create">
                <Button type="primary" icon={<PlusOutlined />}>
                  {t("filiereListInstitut.buttons.new")}
                </Button>
              </Link>
            </Space>
          </div>
        </div>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={rows}
          columns={columns}
          pagination={{ ...pagination, showSizeChanger: true, pageSizeOptions: ["5", "10", "20", "50"] }}
          onChange={(pg) => setPagination({ ...pagination, current: pg.current, pageSize: pg.pageSize })}
          scroll={{ x: true }}
        />
      </div>
    </div>
  );
}
