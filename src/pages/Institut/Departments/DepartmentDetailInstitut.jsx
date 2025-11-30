// /* eslint-disable no-unused-vars */
// "use client";

// import { useEffect, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import { Breadcrumb, Button, Card, Descriptions, Space, Table, Tag, message, Popconfirm } from "antd";
// import departmentService from "@/services/departmentService";
// import dayjs from "dayjs";

// export default function DepartmentDetailInstitut() {
//   const { id } = useParams();
//   const [dept, setDept] = useState(null);
//   const [filieres, setFilieres] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const load = async () => {
//     try {
//       const d = await departmentService.getById(id);         // détails dept :contentReference[oaicite:8]{index=8}
//       setDept(d?.department || null);
//       const f = await departmentService.listFilieres(id, { page: 1, limit: 20 }); // filières du dept :contentReference[oaicite:9]{index=9}
//       setFilieres(f?.filieres || []);
//     } catch { message.error("Erreur de chargement"); }
//     finally { setLoading(false); }
//   };

//   useEffect(() => { load(); }, [id]);

//   const remove = async () => {
//     try { await departmentService.remove(id); message.success("Supprimé"); history.back(); } 
//     catch (e) { message.error(e?.response?.data?.message || e?.message); }
//   };

//   const columns = [
//     { title: "Nom", dataIndex: "name", render: (v, r) => <Link to={`/organisations/filieres/${r.id}`}>{v}</Link> },
//     { title: "Code", dataIndex: "code", width: 120, render: v => v || "—" },
//     { title: "Niveau", dataIndex: "level", width: 160, render: v => <Tag>{v || "—"}</Tag> },
//     { title: "Créée le", dataIndex: "createdAt", width: 180, render: v => dayjs(v).format("DD/MM/YYYY HH:mm") },
//   ];

//   if (!dept) return null;

//   return (
//     <div className="container-fluid relative px-3">
//       <div className="layout-specing">
//         <div className="md:flex justify-between items-center mb-6">
//           <h5 className="text-lg font-semibold">Département</h5>
//           <Breadcrumb items={[
//             { title: <Link to="/organisations/dashboard">Dashboard</Link> },
//             { title: <Link to="/organisations/departements">Départements</Link> },
//             { title: dept.name },
//           ]}/>
//         </div>

//         <Space className="mb-4">
//           <Link to={`/organisations/departements/${id}/edit`}><Button type="primary">Modifier</Button></Link>
//           <Link to={`/organisations/filieres/create?departmentId=${id}`}><Button>Ajouter une filière</Button></Link>
//           <Popconfirm title="Supprimer ce département ?" onConfirm={remove}><Button danger>Supprimer</Button></Popconfirm>
//         </Space>

//         <Card title="Informations">
//           <Descriptions bordered column={1} size="small">
//             <Descriptions.Item label="Nom">{dept.name}</Descriptions.Item>
//             <Descriptions.Item label="Code">{dept.code || "—"}</Descriptions.Item>
//             <Descriptions.Item label="Description">{dept.description || "—"}</Descriptions.Item>
//             <Descriptions.Item label="Organisation">{dept.organization?.name}</Descriptions.Item>
//             <Descriptions.Item label="Filières">{dept.filiereCount ?? 0}</Descriptions.Item>
//             <Descriptions.Item label="Créé le">{dayjs(dept.createdAt).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
//           </Descriptions>
//         </Card>

//         <Card className="mt-4" title="Filières du département">
//           <Table rowKey="id" dataSource={filieres} columns={columns} loading={loading} pagination={false} />
//         </Card>
//       </div>
//     </div>
//   );
// }
/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb, Button, Card, Descriptions, Space, Table, Tag, message, Popconfirm } from "antd";
import departmentService from "@/services/departmentService";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

export default function DepartmentDetailInstitut() {
  const { id } = useParams();
  const { t } = useTranslation();

  const [dept, setDept] = useState(null);
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const d = await departmentService.getById(id);
      setDept(d?.department || null);
      const f = await departmentService.listFilieres(id, { page: 1, limit: 20 });
      setFilieres(f?.filieres || []);
    } catch {
      message.error(t("departmentDetailInstitut.messages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const remove = async () => {
    try {
      await departmentService.remove(id);
      message.success(t("departmentDetailInstitut.messages.deleted"));
      history.back();
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("departmentDetailInstitut.messages.deleteError"));
    }
  };

  const columns = useMemo(() => ([
    {
      title: t("departmentDetailInstitut.table.name"),
      dataIndex: "name",
      render: (v, r) => <Link to={`/organisations/filieres/${r.id}`}>{v}</Link>
    },
    {
      title: t("departmentDetailInstitut.table.code"),
      dataIndex: "code",
      width: 120,
      render: (v) => v || "—"
    },
    {
      title: t("departmentDetailInstitut.table.level"),
      dataIndex: "level",
      width: 160,
      render: (v) => <Tag>{v || "—"}</Tag>
    },
    {
      title: t("departmentDetailInstitut.table.createdAt"),
      dataIndex: "createdAt",
      width: 180,
      render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm")
    }
  ]), [t]);

  if (!dept) return null;

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("departmentDetailInstitut.pageTitle")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("departmentDetailInstitut.breadcrumbs.dashboard")}</Link> },
              { title: <Link to="/organisations/departements">{t("departmentDetailInstitut.breadcrumbs.departments")}</Link> },
              { title: dept.name }
            ]}
          />
        </div>

        <Space className="mb-4">
          <Link to={`/organisations/departements/${id}/edit`}>
            <Button type="primary">{t("departmentDetailInstitut.buttons.edit")}</Button>
          </Link>
          <Link to={`/organisations/filieres/create?departmentId=${id}`}>
            <Button>{t("departmentDetailInstitut.buttons.addFiliere")}</Button>
          </Link>
          <Popconfirm title={t("departmentDetailInstitut.buttons.confirmDeleteTitle")} onConfirm={remove}>
            <Button danger>{t("departmentDetailInstitut.buttons.delete")}</Button>
          </Popconfirm>
        </Space>

        <Card title={t("departmentDetailInstitut.cards.infoTitle")}>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label={t("departmentDetailInstitut.fields.name")}>{dept.name}</Descriptions.Item>
            <Descriptions.Item label={t("departmentDetailInstitut.fields.code")}>{dept.code || "—"}</Descriptions.Item>
            <Descriptions.Item label={t("departmentDetailInstitut.fields.description")}>{dept.description || "—"}</Descriptions.Item>
            <Descriptions.Item label={t("departmentDetailInstitut.fields.organization")}>{dept.organization?.name}</Descriptions.Item>
            <Descriptions.Item label={t("departmentDetailInstitut.fields.filieresCount")}>{dept.filiereCount ?? 0}</Descriptions.Item>
            <Descriptions.Item label={t("departmentDetailInstitut.fields.createdAt")}>
              {dayjs(dept.createdAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card className="mt-4" title={t("departmentDetailInstitut.cards.filieresTitle")}>
          <Table
            rowKey="id"
            dataSource={filieres}
            columns={columns}
            loading={loading}
            pagination={false}
          />
        </Card>
      </div>
    </div>
  );
}
