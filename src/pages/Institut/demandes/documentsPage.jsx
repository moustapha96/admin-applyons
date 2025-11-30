// /* eslint-disable no-unused-vars */
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import { Card, Table, Tag, Space, Typography, Button, message, Breadcrumb } from "antd";
// import dayjs from "dayjs";
// import demandeService from "@/services/demandeService";

// import {
//   ArrowLeftOutlined,
// } from "@ant-design/icons";
// const { Title } = Typography;

// function fmtDate(v, withTime = false) {
//   if (!v) return "—";
//   console.log(v)
//   const d = dayjs(v);
//   return withTime ? d.format("DD/MM/YYYY HH:mm") : d.format("YYYY");
// }

// // Corrige les URLs sans "/" après le host
// function normalizeUrl(u) {
//   return u
// }

// function fileNameFromUrl(u) {
//   try {
//     const url = new URL(normalizeUrl(u));
//     const last = url.pathname.split("/").filter(Boolean).pop();
//     return last || "—";
//   } catch {
//     return "—";
//   }
// }

// export default function DemandeDocumentsPage() {
//   const { id } = useParams(); // demandePartageId
//   const navigate = useNavigate();

//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [demande, setDemande] = useState(null);

//   const normalizeItems = (res) => {
//     // Supporte: tableau brut | {items: []} | {documents: []}
//     const list = Array.isArray(res) ? res : (res?.items ?? res?.documents ?? []);
//     if (!Array.isArray(list)) return [];
//     return list.map((doc) => ({
//       ...doc,
//       _urlOriginal: normalizeUrl(doc.urlOriginal),
//       _urlChiffre: normalizeUrl(doc.urlChiffre),
//       _filename: fileNameFromUrl(doc.urlOriginal),
//     }));
//   };

//   const fetchDemande = async () => {
//     setLoading(true);
//     try {
//       const res = await demandeService.getById(id);
//       const d = res?.demande ?? res;
//       console.log(d)
//       setDemande(d);
//     } catch (e) {
//       message.error(e?.message || "Erreur lors du chargement de la demande");
//     } finally {
//       setLoading(false);
//     }
//   };


//   const load = async () => {
//     setLoading(true);
//     try {
//       const res = await demandeService.listDocuments(id);
//       console.log(res);
//       setRows(normalizeItems(res));
//     } catch (e) {
//       message.error(e?.message || "Échec chargement des documents");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//     fetchDemande();
//   }, [id]);


//   const openUrl = (u) => {
//     const url = normalizeUrl(u);
//     if (!url) return message.warning("URL indisponible");
//     window.open(url, "_blank", "noopener,noreferrer");
//   };


//   const columns = useMemo(() => ([

//     {
//       title: "Institut",
//       key: "owner",
//       width: 260,
//       render: (_v, r) => {
//         const org = r.ownerOrg || {};
//         return (
//           <Space size={6} wrap>
//             <span>{org.name || "—"}</span>
//             {org.type ? <Tag>{org.type}</Tag> : null}
//             {org.slug ? <Tag color="default">{org.slug}</Tag> : null}
//           </Space>
//         );
//       },
//     },
//     { title: "Type", dataIndex: "type", width: 140, render: (v) => v || "—" },
//     { title: "Mention", dataIndex: "mention", render: (v) => v || "—" },

//     {
//       title: "Date d’obtention", dataIndex: "dateObtention",
//       width: 160, render: (v) => fmtDate(v)
//     },
//     {
//       title: "Document",
//       key: "openOriginal",
//       width: 120,
//       render: (_v, r) =>
//         r.urlOriginal ? (
//           <Button size="small" onClick={() => openUrl(r.urlOriginal)}>Ouvrir</Button>
//         ) : (
//           <Tag>—</Tag>
//         ),
//     },

//     {
//       title: "Traduit",
//       key: "openTranslated",
//       width: 120,
//       render: (_v, r) =>
//         r.urlTraduit ? (
//           <Button size="small" onClick={() => openUrl(r.urlTraduit)}>Ouvrir</Button>
//         ) : (
//           <Tag>—</Tag>
//         ),
//     },

//   ]), []);

//   return (
//     <div className="container-fluid relative px-3">
//       <div className="layout-specing">
//         <div className="md:flex justify-between items-center mb-6">
//           <Space>
//             <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
//               Retour
//             </Button>
//           </Space>

//           <Breadcrumb
//             items={[
//               { title: <Link to="/organisations/dashboard">Dashboard</Link> },
//               { title: <Link to="/organisations/demandes">Demandes</Link> },
//               { title: <Link to={`/organisations/demandes/${id}/details`}>Détails</Link> },
//               { title: "Documents" },
//             ]}
//           />
//         </div>


//         <div className="p-2 md:p-4">
//           <Space align="center" className="mb-3" wrap>
//             <Title level={3} className="!mb-0">
//               Documents de la demande{" "}
//               <Typography.Text copyable={{ text: demande?.code }}>
//                 <Tag> {demande?.code}</Tag>
//               </Typography.Text>
//             </Title>
//           </Space>


//           <Card>
//             <Table
//               rowKey={(r) => r.id}
//               loading={loading}
//               columns={columns}
//               dataSource={rows}
//               scroll={{ x: true }}
//               pagination={{ pageSize: 10, showSizeChanger: true }}
//               locale={{ emptyText: "Aucun document" }}
//             />
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }
/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, Table, Tag, Space, Typography, Button, message, Breadcrumb } from "antd";
import dayjs from "dayjs";
import demandeService from "@/services/demandeService";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

function fmtDate(v, withTime = false) {
  if (!v) return "—";
  const d = dayjs(v);
  return withTime ? d.format("DD/MM/YYYY HH:mm") : d.format("YYYY");
}

// Corrige les URLs sans "/" après le host
function normalizeUrl(u) { return u; }

function fileNameFromUrl(u) {
  try {
    const url = new URL(normalizeUrl(u));
    const last = url.pathname.split("/").filter(Boolean).pop();
    return last || "—";
  } catch {
    return "—";
  }
}

export default function DemandeDocumentsPage() {
  const { t } = useTranslation();
  const { id } = useParams(); // demandePartageId
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [demande, setDemande] = useState(null);

  const normalizeItems = (res) => {
    // Supporte: tableau brut | {items: []} | {documents: []}
    const list = Array.isArray(res) ? res : (res?.items ?? res?.documents ?? []);
    if (!Array.isArray(list)) return [];
    return list.map((doc) => ({
      ...doc,
      _urlOriginal: normalizeUrl(doc.urlOriginal),
      _urlChiffre: normalizeUrl(doc.urlChiffre),
      _filename: fileNameFromUrl(doc.urlOriginal),
    }));
  };

  const fetchDemande = async () => {
    setLoading(true);
    try {
      const res = await demandeService.getById(id);
      const d = res?.demande ?? res;
      setDemande(d);
    } catch (e) {
      message.error(e?.message || t("demandeDocuments.toasts.loadDemandeError"));
    } finally {
      setLoading(false);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await demandeService.listDocuments(id);
      setRows(normalizeItems(res));
    } catch (e) {
      message.error(e?.message || t("demandeDocuments.toasts.loadDocsError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    fetchDemande();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openUrl = (u) => {
    const url = normalizeUrl(u);
    if (!url) return message.warning(t("demandeDocuments.toasts.urlMissing"));
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const columns = useMemo(() => ([
    {
      title: t("demandeDocuments.table.institute"),
      key: "owner",
      width: 260,
      render: (_v, r) => {
        const org = r.ownerOrg || {};
        return (
          <Space size={6} wrap>
            <span>{org.name || t("demandeDocuments.table.dash")}</span>
            {org.type ? <Tag>{org.type}</Tag> : null}
            {org.slug ? <Tag color="default">{org.slug}</Tag> : null}
          </Space>
        );
      },
    },
    { title: t("demandeDocuments.table.type"), dataIndex: "type", width: 140, render: (v) => v || t("demandeDocuments.table.dash") },
    { title: t("demandeDocuments.table.mention"), dataIndex: "mention", render: (v) => v || t("demandeDocuments.table.dash") },
    { title: t("demandeDocuments.table.obtainedAt"), dataIndex: "dateObtention", width: 160, render: (v) => fmtDate(v) },
    {
      title: t("demandeDocuments.table.doc"),
      key: "openOriginal",
      width: 120,
      render: (_v, r) =>
        r.urlOriginal ? (
          <Button size="small" onClick={() => openUrl(r.urlOriginal)}>{t("demandeDocuments.buttons.open")}</Button>
        ) : (
          <Tag>{t("demandeDocuments.table.dash")}</Tag>
        ),
    },
    {
      title: t("demandeDocuments.table.translated"),
      key: "openTranslated",
      width: 120,
      render: (_v, r) =>
        r.urlTraduit ? (
          <Button size="small" onClick={() => openUrl(r.urlTraduit)}>{t("demandeDocuments.buttons.open")}</Button>
        ) : (
          <Tag>{t("demandeDocuments.table.dash")}</Tag>
        ),
    },
  ]), [t]);

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              {t("demandeDocuments.buttons.back")}
            </Button>
          </Space>

          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("demandeDocuments.breadcrumbs.dashboard")}</Link> },
              { title: <Link to="/organisations/demandes">{t("demandeDocuments.breadcrumbs.demandes")}</Link> },
              { title: <Link to={`/organisations/demandes/${id}/details`}>{t("demandeDocuments.breadcrumbs.details")}</Link> },
              { title: t("demandeDocuments.breadcrumbs.docs") }
            ]}
          />
        </div>

        <div className="p-2 md:p-4">
          <Space align="center" className="mb-3" wrap>
            <Title level={3} className="!mb-0">
              {t("demandeDocuments.title")}{" "}
              <Text copyable={{ text: demande?.code }}>
                <Tag>{demande?.code}</Tag>
              </Text>
            </Title>
          </Space>

          <Card>
            <Table
              rowKey={(r) => r.id}
              loading={loading}
              columns={columns}
              dataSource={rows}
              scroll={{ x: true }}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              locale={{ emptyText: t("demandeDocuments.table.empty") }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
