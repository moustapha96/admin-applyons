// /* eslint-disable no-unused-vars */
// "use client";

// import { useCallback, useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { Breadcrumb, Button, Input, Select, Table, Tag, Space, message } from "antd";
// import { DownloadOutlined, EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
// import departmentService from "@/services/departmentService";
// import { useAuth } from "../../../hooks/useAuth";

// export default function DepartmentListInstitut() {
//   const { user: me } = useAuth();
//   const orgId = me?.organization?.id;

//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
//   const [filters, setFilters] = useState({ search: "", sortBy: "name", sortOrder: "asc" });

//   const fetchData = useCallback(async () => {
//     if (!orgId) return;
//     setLoading(true);
//     try {
//       const res = await departmentService.list({
//         page: pagination.current,
//         limit: pagination.pageSize,
//         organizationId: orgId,                    // filtre par organisation (backend supporte) :contentReference[oaicite:2]{index=2}
//         search: filters.search || undefined,
//         sortBy: filters.sortBy,
//         sortOrder: filters.sortOrder,
//       });
//       console.log(res)                  // service retourne la réponse axios brute :contentReference[oaicite:3]{index=3}
//       setRows(res.departments || []);
//       setPagination(p => ({ ...p, total: res.pagination?.total || 0 }));
//     } catch (e) { message.error(e?.message || "Erreur de chargement"); }
//     finally { setLoading(false); }
//   }, [orgId, pagination.current, pagination.pageSize, filters]);

//   useEffect(() => { fetchData(); }, [fetchData]);

//   const onTableChange = (pg, _f, sorter) => {
//     setPagination({ ...pagination, current: pg.current, pageSize: pg.pageSize });
//     if (sorter?.field) {
//       setFilters(f => ({ ...f, sortBy: sorter.field, sortOrder: sorter.order === "ascend" ? "asc" : "desc" }));
//     }
//   };

//   const exportCsv = async () => {
//     try {
//       const resp = await departmentService.exportCsv({ organizationId: orgId }); // endpoint CSV dispo :contentReference[oaicite:4]{index=4}
//       const blob = new Blob([resp.data], { type: "text/csv;charset=utf-8" });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url; a.download = `departements_${orgId}.csv`;
//       a.click();
//       URL.revokeObjectURL(url);
//     } catch (e) { message.error("Export impossible"); }
//   };

//   const columns = [
//     { title: "Nom", dataIndex: "name", sorter: true, render: (v, r) => <Link to={`/organisations/departements/${r.id}`}>{v}</Link> },
//     { title: "Code", dataIndex: "code", sorter: true, width: 140, render: v => v || "—" },
//     { title: "Filières", dataIndex: "filiereCount", width: 120, render: v => <Tag>{v ?? 0}</Tag> },
   
//      {
//       title: "Actions",
//       key: "actions",
//       width: 180,
//       render: (_, r) => (
//         <Space size="small">
//           <Link to={`/organisations/departements/${r.id}`}>
//             <Button size="small" icon={<EyeOutlined />}>Détails</Button>
//           </Link>
//           <Link to={`/organisations/departements/${r.id}/edit`}>
//             <Button size="small" icon={<EditOutlined />}>Modifier</Button>
//           </Link>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div className="container-fluid relative px-3">
//       <div className="layout-specing">
//         <div className="md:flex justify-between items-center mb-6">
//           <h5 className="text-lg font-semibold">Départements (mon institut)</h5>
//           <Breadcrumb items={[
//             { title: <Link to="/organisations/dashboard">Dashboard</Link> },
//             { title: "Départements" },
//           ]}/>
//         </div>

//         <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
//           <div className="flex gap-3 flex-col md:flex-row md:items-center">
//             <Input.Search
//               placeholder="Recherche (nom, code, description)"
//               allowClear
//               enterButton={<SearchOutlined />}
//               onSearch={(v) => { setFilters({ ...filters, search: v }); setPagination(p => ({ ...p, current: 1 })); }}
//               className="w-full md:w-1/2"
//             />
//             <Space className="ml-auto">
//               <Button onClick={exportCsv} icon={<DownloadOutlined />}>Exporter CSV</Button>
//               <Link to="/organisations/departements/create"><Button type="primary" icon={<PlusOutlined />}>Nouveau</Button></Link>
//             </Space>
//           </div>
//         </div>

//         <Table
//           rowKey="id"
//           loading={loading}
//           dataSource={rows}
//           columns={columns}
//           pagination={{ ...pagination, showSizeChanger: true, pageSizeOptions: ["5","10","20","50"] }}
//           onChange={onTableChange}
//           scroll={{ x: true }}
//         />
//       </div>
//     </div>
//   );
// }
/* eslint-disable no-unused-vars */
"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Breadcrumb, Button, Input, Table, Tag, Space, message } from "antd";
import { DownloadOutlined, EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import departmentService from "@/services/departmentService";
import { useAuth } from "../../../hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function DepartmentListInstitut() {
  const { t, i18n } = useTranslation();
  const { user: me } = useAuth();
  const orgId = me?.organization?.id;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: "", sortBy: "name", sortOrder: "asc" });

  const fetchData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await departmentService.list({
        page: pagination.current,
        limit: pagination.pageSize,
        organizationId: orgId,
        search: filters.search || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });
      setRows(res.departments || []);
      setPagination((p) => ({ ...p, total: res.pagination?.total || 0 }));
    } catch (e) {
      message.error(e?.message || t("departmentListInstitut.messages.loadError"));
    } finally {
      setLoading(false);
    }
  }, [orgId, pagination.current, pagination.pageSize, filters, t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onTableChange = (pg, _f, sorter) => {
    setPagination({ ...pagination, current: pg.current, pageSize: pg.pageSize });
    if (sorter?.field) {
      setFilters((f) => ({ ...f, sortBy: sorter.field, sortOrder: sorter.order === "ascend" ? "asc" : "desc" }));
    }
  };

  const exportCsv = async () => {
    try {
      const resp = await departmentService.exportCsv({ organizationId: orgId });
      const blob = new Blob([resp.data], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `departements_${orgId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      message.error(t("departmentListInstitut.messages.exportError"));
    }
  };

  const columns = useMemo(() => ([
    {
      title: t("departmentListInstitut.columns.name"),
      dataIndex: "name",
      sorter: true,
      render: (v, r) => <Link to={`/organisations/departements/${r.id}`}>{v}</Link>,
    },
    {
      title: t("departmentListInstitut.columns.code"),
      dataIndex: "code",
      sorter: true,
      width: 140,
      render: (v) => v || "—",
    },
    {
      title: t("departmentListInstitut.columns.filieres"),
      dataIndex: "filiereCount",
      width: 120,
      render: (v) => <Tag>{v ?? 0}</Tag>,
    },
    {
      title: t("departmentListInstitut.columns.actions"),
      key: "actions",
      width: 180,
      render: (_, r) => (
        <Space size="small">
          <Link to={`/organisations/departements/${r.id}`}>
            <Button size="small" icon={<EyeOutlined />}>{t("departmentListInstitut.buttons.details")}</Button>
          </Link>
          <Link to={`/organisations/departements/${r.id}/edit`}>
            <Button size="small" icon={<EditOutlined />}>{t("departmentListInstitut.buttons.edit")}</Button>
          </Link>
        </Space>
      ),
    },
  ]), [t]);

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("departmentListInstitut.pageTitle")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("departmentListInstitut.breadcrumbs.dashboard")}</Link> },
              { title: t("departmentListInstitut.breadcrumbs.departments") },
            ]}
          />
        </div>

        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex gap-3 flex-col md:flex-row md:items-center">
            <Input.Search
              placeholder={t("departmentListInstitut.searchPlaceholder")}
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={(v) => {
                setFilters({ ...filters, search: v });
                setPagination((p) => ({ ...p, current: 1 }));
              }}
              className="w-full md:w-1/2"
            />
            <Space className="ml-auto">
              <Button onClick={exportCsv} icon={<DownloadOutlined />}>
                {t("departmentListInstitut.buttons.exportCsv")}
              </Button>
              <Link to="/organisations/departements/create">
                <Button type="primary" icon={<PlusOutlined />}>
                  {t("departmentListInstitut.buttons.new")}
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
          onChange={onTableChange}
          scroll={{ x: true }}
        />
      </div>
    </div>
  );
}
