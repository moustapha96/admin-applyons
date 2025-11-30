/* eslint-disable react/prop-types */

// /* eslint-disable no-unused-vars */
// "use client";

// import { useCallback, useEffect, useMemo, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Breadcrumb,
//   Button,
//   Card,
//   DatePicker,
//   Input,
//   Select,
//   Space,
//   Table,
//   Tag,
//   Typography,
//   message,
//   Switch,
//   Popconfirm,
//   Tooltip,
// } from "antd";
// import dayjs from "dayjs";
// import { SearchOutlined, ReloadOutlined, CheckOutlined, CloseOutlined, PlayCircleOutlined, EyeOutlined } from "@ant-design/icons";
// import { useAuth } from "../../../hooks/useAuth";
// import demandeService from "@/services/demandeService";

// const { Title, Text } = Typography;
// const { RangePicker } = DatePicker;

// const STATUS_COLORS = {
//   PENDING: "blue",
//   IN_PROGRESS: "gold",
//   VALIDATED: "green",
//   REJECTED: "red",
// };

// const SORT_FIELDS = [
//   { label: "Mise à jour", value: "updatedAt" },
//   { label: "Création", value: "createdAt" },
//   { label: "Code", value: "code" },
//   { label: "Date de demande", value: "dateDemande" },
// ];

// export default function TranslatorDemandesList() {
//   const navigate = useNavigate();
//   const { user: me } = useAuth();
//   const orgId = me?.organization?.id; // organisation TRADUCTEUR

//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
//   const [filters, setFilters] = useState({
//     search: "",
//     status: undefined,
//     from: undefined,
//     to: undefined,
//     sortBy: "updatedAt",
//     sortOrder: "desc",
//     onlyMine: false, // afficher seulement mes demandes
//   });

//   // mappe le sorter AntD vers ton backend
//   const mapSorterToBackend = (sorter) => {
//     const f = sorter?.field;
//     const order = sorter?.order;
//     // champs autorisés côté backend
//     const allowed = new Set(["updatedAt", "createdAt", "code", "dateDemande"]);
//     const sortBy = allowed.has(f) ? f : filters.sortBy || "updatedAt";
//     const sortOrder = order === "ascend" ? "asc" : "desc";
//     return { sortBy, sortOrder };
//   };

//   const fetchData = useCallback(
//     async (page = pagination.page, limit = pagination.limit, override = {}) => {
//       if (!orgId) return;
//       setLoading(true);
//       try {
//         const f = { ...filters, ...override };
//         const params = {
//           page,
//           limit,
//           search: f.search || undefined,
//           status: f.status || undefined,
//           from: f.from || undefined,
//           to: f.to || undefined,
//           sortBy: f.sortBy,
//           sortOrder: f.sortOrder,
//           assignedOrgId: orgId, // clé importante (org TRADUCTEUR)
//           // si on veut “mes demandes” (par ex. assignées au user courant)
//           assignedUserId: f.onlyMine ? me?.id : undefined,
//         };
//         const res = await demandeService.list(params);
//         console.log(res.demandes);
//         setRows(res?.demandes || []);
//         setPagination({
//           page: res?.pagination?.page || page,
//           limit: res?.pagination?.limit || limit,
//           total: res?.pagination?.total || 0,
//         });
//         setFilters(f);
//       } catch (e) {
//         message.error(e?.message || "Échec chargement des demandes");
//       } finally {
//         setLoading(false);
//       }
//     },
//     [orgId, filters, pagination.page, pagination.limit, me?.id]
//   );

//   useEffect(() => {
//     // initial load
//     fetchData(1, pagination.limit);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [orgId]);

//   // ==== ACTIONS ====
//   const updateStatus = async (row, newStatus) => {
//     try {
//       await demandeService.updateStatus(row.id, { status: newStatus });
//       message.success(`Statut mis à jour: ${newStatus}`);
//       // recharger la page actuelle
//       fetchData(pagination.page, pagination.limit);
//     } catch (e) {
//       message.error(e?.message || "Échec mise à jour du statut");
//     }
//   };

//   const startOrContinue = (row) => updateStatus(row, "IN_PROGRESS");
//   const validateDemande = (row) => updateStatus(row, "VALIDATED");
//   const rejectDemande = (row) => updateStatus(row, "REJECTED");

//   const columns = useMemo(
//     () => [
//       {
//         title: "Code",
//         dataIndex: "code",
//         key: "code",
//         sorter: true,
//         render: (v, r) => <Link to={`/traducteur/demandes/${r.id}`}>{v}</Link>,
//       },
//       {
//         title: "Date",
//         dataIndex: "dateDemande",
//         key: "dateDemande",
//         sorter: true,
//         width: 140,
//         render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
//       },
//       {
//         title: "Client",
//         key: "user",
//         render: (_, r) => r.user?.email || r.user?.username || "—",
//       },
//       {
//         title: "Institut cible",
//         key: "target",
//         render: (_, r) => r.targetOrg?.name || "—",
//         responsive: ["md"],
//       },
//       {
//         title: "Docs",
//         dataIndex: "documentsCount",
//         key: "documentsCount",
//         width: 90,
//         align: "center",
//       },
//       {
//         title: "Statut",
//         dataIndex: "status",
//         key: "status",
//         width: 150,
//         sorter: true,
//         render: (s) => (
//           <Tag color={STATUS_COLORS[s || "PENDING"] || "blue"}>
//             {s || "PENDING"}
//           </Tag>
//         ),
//       },
//       {
//         title: "Options",
//         key: "actions",
//         fixed: "right",
//         width: 260,
//         render: (_, row) => {
//           const s = row.status || "PENDING";
//           return (
//             <Space wrap>
//               <Tooltip title="Voir la demande">
//                 <Button icon={<EyeOutlined />} onClick={() => navigate(`/traducteur/demandes/${row.id}`)}>
//                   Voir
//                 </Button>
//               </Tooltip>


//  <Tooltip title="Voir les documents">
//                 <Button icon={<EyeOutlined />} onClick={() => navigate(`/traducteur/demandes/${row.id}/documents`)}>
//                   Document(s)
//                 </Button>
//               </Tooltip>


//             </Space>
//           );
//         },
//       },
//     ],
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [navigate]
//   );

//   // gestion changement Table (pagination/tri)
//   const onChangeTable = (pag, _filters, sorter) => {
//     const { sortBy, sortOrder } = mapSorterToBackend(sorter);
//     fetchData(pag.current, pag.pageSize, { sortBy, sortOrder });
//   };

//   // reset complet des filtres
//   const resetFilters = () => {
//     const reset = {
//       search: "",
//       status: undefined,
//       from: undefined,
//       to: undefined,
//       sortBy: "updatedAt",
//       sortOrder: "desc",
//       onlyMine: false,
//     };
//     setFilters(reset);
//     fetchData(1, pagination.limit, reset);
//   };

//   return (
//     <div className="container-fluid relative px-3">
//       <div className="layout-specing">
//         <div className="md:flex justify-between items-center mb-6">
//           <h5 className="text-lg font-semibold">Demandes à traiter</h5>
//           <Breadcrumb
//             items={[
//               { title: <Link to="/">Dashboard</Link> },
//               { title: "Demandes" },
//             ]}
//           />
//         </div>

//         <Card className="mb-4" title="Filtres & options">
//           <Space wrap>
//             <Input.Search
//               placeholder="Recherche…"
//               allowClear
//               enterButton={<SearchOutlined />}
//               onSearch={(v) => setFilters((f) => ({ ...f, search: v }))}
//               defaultValue={filters.search}
//               style={{ minWidth: 260 }}
//             />

//             <Select
//               allowClear
//               placeholder="Statut"
//               value={filters.status}
//               onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
//               style={{ width: 200 }}
//               options={["PENDING", "IN_PROGRESS", "VALIDATED", "REJECTED"].map((s) => ({
//                 label: s,
//                 value: s,
//               }))}
//             />

//             <RangePicker
//               onChange={(v) =>
//                 setFilters((f) => ({
//                   ...f,
//                   from: v?.[0]?.startOf("day")?.toISOString(),
//                   to: v?.[1]?.endOf("day")?.toISOString(),
//                 }))
//               }
//             />

//             <Select
//               value={filters.sortBy}
//               onChange={(v) => setFilters((f) => ({ ...f, sortBy: v }))}
//               style={{ width: 180 }}
//               options={SORT_FIELDS}
//             />
//             <Select
//               value={filters.sortOrder}
//               onChange={(v) => setFilters((f) => ({ ...f, sortOrder: v }))}
//               style={{ width: 140 }}
//               options={[
//                 { label: "Descendant", value: "desc" },
//                 { label: "Ascendant", value: "asc" },
//               ]}
//             />

//             <Space align="center">
//               <Text>Mes demandes uniquement</Text>
//               <Switch
//                 checked={filters.onlyMine}
//                 onChange={(checked) => setFilters((f) => ({ ...f, onlyMine: checked }))}
//               />
//             </Space>

//             <Button type="primary" onClick={() => fetchData(1, pagination.limit)}>
//               Appliquer
//             </Button>
//             <Button icon={<ReloadOutlined />} onClick={resetFilters}>
//               Réinitialiser
//             </Button>
//           </Space>
//         </Card>

//         <Card title="Liste des demandes assignées">
//           <Table
//             rowKey="id"
//             loading={loading}
//             columns={columns}
//             dataSource={rows}
//             pagination={{
//               current: pagination.page,
//               pageSize: pagination.limit,
//               total: pagination.total,
//               showSizeChanger: true,
//               pageSizeOptions: ["5", "10", "20", "50", "100"],
//               showTotal: (t) => `${t} demande(s)`,
//             }}
//             onChange={onChangeTable}
//             scroll={{ x: true }}
//           />
//         </Card>
//       </div>
//     </div>
//   );
// }

/* eslint-disable no-unused-vars */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  Button,
  Card,
  DatePicker,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
  Switch,
  Tooltip,
  Modal,
  Spin,
  Upload,
} from "antd";
import dayjs from "dayjs";
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  UploadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../hooks/useAuth";
import demandeService from "@/services/demandeService";
import documentService from "@/services/documentService"; // <-- nouveau service

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const STATUS_COLORS = {
  PENDING: "blue",
  IN_PROGRESS: "gold",
  VALIDATED: "green",
  REJECTED: "red",
};

// SORT_FIELDS sera défini dans le composant avec useTranslation

const safeUrl = (u) => {
  if (!u) return null;
  if (/^https?:\/\/[^/]+uploads\//i.test(u)) {
    return u.replace(/(https?:\/\/[^/]+)uploads\//i, "$1/uploads/");
  }
  return u;
};

export default function TranslatorDemandesList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const orgId = me?.organization?.id; // organisation TRADUCTEUR

  const SORT_FIELDS = [
    { label: t("traducteurDemandesList.sortFields.updatedAt"), value: "updatedAt" },
    { label: t("traducteurDemandesList.sortFields.createdAt"), value: "createdAt" },
    { label: t("traducteurDemandesList.sortFields.code"), value: "code" },
    { label: t("traducteurDemandesList.sortFields.dateDemande"), value: "dateDemande" },
  ];

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({
    search: "",
    status: undefined,
    from: undefined,
    to: undefined,
    sortBy: "updatedAt",
    sortOrder: "desc",
    onlyMine: false,
  });

  // ====== Modal Documents / Traduction ======
  const [docsOpen, setDocsOpen] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [currentDemande, setCurrentDemande] = useState(null);

  // mappe le sorter AntD vers ton backend
  const mapSorterToBackend = (sorter) => {
    const f = sorter?.field;
    const order = sorter?.order;
    const allowed = new Set(["updatedAt", "createdAt", "code", "dateDemande"]);
    const sortBy = allowed.has(f) ? f : filters.sortBy || "updatedAt";
    const sortOrder = order === "ascend" ? "asc" : "desc";
    return { sortBy, sortOrder };
  };

  const fetchData = useCallback(
    async (page = pagination.page, limit = pagination.limit, override = {}) => {
      if (!orgId) return;
      setLoading(true);
      try {
        const f = { ...filters, ...override };
        const params = {
          page,
          limit,
          search: f.search || undefined,
          status: f.status || undefined,
          from: f.from || undefined,
          to: f.to || undefined,
          sortBy: f.sortBy,
          sortOrder: f.sortOrder,
          assignedOrgId: orgId,
          assignedUserId: f.onlyMine ? me?.id : undefined,
        };
        const res = await demandeService.list(params);
        setRows(res?.demandes || []);
        setPagination({
          page: res?.pagination?.page || page,
          limit: res?.pagination?.limit || limit,
          total: res?.pagination?.total || 0,
        });
        setFilters(f);
      } catch (e) {
        message.error(e?.message || "Échec chargement des demandes");
      } finally {
        setLoading(false);
      }
    },
    [orgId, filters, pagination.page, pagination.limit, me?.id]
  );

  useEffect(() => {
    fetchData(1, pagination.limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  // ==== Actions statut (si tu veux les réactiver)
  const updateStatus = async (row, newStatus) => {
    try {
      await demandeService.updateStatus(row.id, { status: newStatus });
      message.success(t("traducteurDemandesList.messages.updateSuccess", { status: newStatus }));
      fetchData(pagination.page, pagination.limit);
    } catch (e) {
      message.error(e?.message || t("traducteurDemandesList.messages.updateError"));
    }
  };

  // ==== Modal: charger docs d'une demande
  const openDocs = async (demande) => {
    setCurrentDemande(demande);
    setDocsOpen(true);
    setDocsLoading(true);
    try {
      // Option A : si tu as /api/demandes/:id?withDocuments=1
      // const resp = await demandeService.getById(demande.id, { withDocuments: 1 });
      // const list = resp?.demande?.documents || resp?.documents || [];

      // Option B : endpoint dédié
      const resp = await documentService.listByDemande(demande.id);
      const list = resp?.documents || resp || [];
      setDocs(list);
      } catch (e) {
        console.error(e);
        message.error(t("traducteurDemandesList.messages.documentsError"));
    } finally {
      setDocsLoading(false);
    }
  };

  const closeDocs = () => {
    setDocsOpen(false);
    setCurrentDemande(null);
    setDocs([]);
  };

  const handleUploadTranslated = async (doc, file, extra = {}) => {
    try {
      await documentService.uploadTranslated(doc.id, file, extra);
      message.success(t("traducteurDemandesList.messages.translationAdded"));
      // refresh docs + table
      await openDocs(currentDemande);
      fetchData(pagination.page, pagination.limit);
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.message || e?.message || t("traducteurDemandesList.messages.uploadError"));
    }
  };

  const DocsRow = ({ d, t }) => {
    const uOrig = safeUrl(d.urlOriginal);
    const uChif = safeUrl(d.urlChiffre);
    const uTrad = safeUrl(d.urlTraduit);

    return (
      <div
        className="flex items-start justify-between gap-3 p-2 rounded border"
        style={{ borderColor: "#f0f0f0" }}
        key={d.id}
      >
        <div className="min-w-0">
          <Space direction="vertical" size={2}>
            <Space wrap size="small">
              <Tag>{d.ownerOrg?.name || "—"}</Tag>
              {d.estTraduit ? <Tag color="green">{t("traducteurDemandesList.documents.translated")}</Tag> : <Tag>{t("traducteurDemandesList.documents.notTranslated")}</Tag>}
              {d.urlChiffre ? <Tag color="geekblue">{t("traducteurDemandesList.documents.encrypted")}</Tag> : <Tag>{t("traducteurDemandesList.documents.notEncrypted")}</Tag>}
              {d.blockchainHash && <Tag color="purple">{t("traducteurDemandesList.documents.blockchain")}</Tag>}
            </Space>
            <Text type="secondary">{d.id}</Text>
            <Space wrap size="small">
              {uOrig && (
                <a href={uOrig} target="_blank" rel="noreferrer">
                  <Button size="small" icon={<EyeOutlined />}>
                    {t("traducteurDemandesList.documents.original")}
                  </Button>
                </a>
              )}
              {uChif && (
                <a href={uChif} target="_blank" rel="noreferrer">
                  <Button size="small" icon={<FileTextOutlined />}>
                    {t("traducteurDemandesList.documents.encrypted")}
                  </Button>
                </a>
              )}
              {uTrad && (
                <a href={uTrad} target="_blank" rel="noreferrer">
                  <Button size="small" type="primary" icon={<EyeOutlined />}>
                    {t("traducteurDemandesList.documents.translated")}
                  </Button>
                </a>
              )}
            </Space>
          </Space>
        </div>

        {!d.estTraduit && (
          <Upload
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            maxCount={1}
            showUploadList={false}
            beforeUpload={() => false} // on envoie manuellement
            customRequest={async ({ file, onSuccess, onError }) => {
              try {
                // si tu veux passer encryptionKeyTraduit ou ownerOrgId :
                await handleUploadTranslated(d, file, {
                  // ownerOrgId: orgId,                  // <-- utile si ton ctrl l'exige
                  // encryptionKeyTraduit: "hex-optional" // <-- si tu veux chiffrer côté ctrl
                });
                onSuccess?.("ok");
              } catch (err) {
                onError?.(err);
              }
            }}
          >
            <Button type="primary" icon={<UploadOutlined />}>
              {t("traducteurDemandesList.actions.addTranslation")}
            </Button>
          </Upload>
        )}
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        title: t("traducteurDemandesList.columns.code"),
        dataIndex: "code",
        key: "code",
        sorter: true,
        render: (v, r) => <Link to={`/traducteur/demandes/${r.id}`}>{v}</Link>,
      },
      {
        title: t("traducteurDemandesList.columns.date"),
        dataIndex: "dateDemande",
        key: "dateDemande",
        sorter: true,
        width: 140,
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : t("common.na")),
      },
      {
        title: t("traducteurDemandesList.columns.client"),
        key: "user",
        render: (_, r) => r.user?.email || r.user?.username || t("common.na"),
      },
      {
        title: t("traducteurDemandesList.columns.targetOrg"),
        key: "target",
        render: (_, r) => r.targetOrg?.name || t("common.na"),
        responsive: ["md"],
      },
      {
        title: t("traducteurDemandesList.columns.docs"),
        dataIndex: "_count",
        key: "documentsCount",
        width: 90,
        align: "center",
        render: (c, r) => (typeof c?.documents === "number" ? c.documents : (r.documents?.length || 0)),
      },
      {
        title: t("traducteurDemandesList.columns.status"),
        dataIndex: "status",
        key: "status",
        width: 150,
        sorter: true,
        render: (s) => (
          <Tag color={STATUS_COLORS[s || "PENDING"] || "blue"}>{s || "PENDING"}</Tag>
        ),
      },
      {
        title: t("traducteurDemandesList.columns.actions"),
        key: "actions",
        fixed: "right",
        width: 320,
        render: (_, row) => (
          <Space wrap>
            <Tooltip title={t("traducteurDemandesList.actions.view")}>
              <Button icon={<EyeOutlined />} onClick={() => navigate(`/traducteur/demandes/${row.id}`)}>
                {t("traducteurDemandesList.actions.view")}
              </Button>
            </Tooltip>

            <Tooltip title={t("traducteurDemandesList.actions.viewDocuments")}>
              <Button
                icon={<EyeOutlined />}
                onClick={() => navigate(`/traducteur/demandes/${row.id}/documents`)}
              >
                {t("traducteurDemandesList.actions.documents")}
              </Button>
            </Tooltip>

            {/* NOUVEAU : ouvrir modal pour upload de traduction */}
            <Tooltip title={t("traducteurDemandesList.actions.translate")}>
              <Button onClick={() => openDocs(row)}>{t("traducteurDemandesList.actions.translate")}</Button>
            </Tooltip>
          </Space>
        ),
      },
    ],
    [navigate, t]
  );

  const onChangeTable = (pag, _filters, sorter) => {
    const { sortBy, sortOrder } = mapSorterToBackend(sorter);
    fetchData(pag.current, pag.pageSize, { sortBy, sortOrder });
  };

  const resetFilters = () => {
    const reset = {
      search: "",
      status: undefined,
      from: undefined,
      to: undefined,
      sortBy: "updatedAt",
      sortOrder: "desc",
      onlyMine: false,
    };
    setFilters(reset);
    fetchData(1, pagination.limit, reset);
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("traducteurDemandesList.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/traducteur/dashboard">{t("traducteurDemandesList.breadcrumb.dashboard")}</Link> },
              { title: t("traducteurDemandesList.breadcrumb.demandes") }
            ]}
          />
        </div>

        <Card className="mb-4" title={t("traducteurDemandesList.filters.title")}>
          <Space wrap>
            <Input.Search
              placeholder={t("traducteurDemandesList.filters.search")}
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={(v) => setFilters((f) => ({ ...f, search: v }))}
              defaultValue={filters.search}
              style={{ minWidth: 260 }}
            />

            <Select
              allowClear
              placeholder={t("traducteurDemandesList.filters.status")}
              value={filters.status}
              onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
              style={{ width: 200 }}
              options={["PENDING", "IN_PROGRESS", "VALIDATED", "REJECTED"].map((s) => ({
                label: t(`traducteurDemandesList.status.${s}`),
                value: s,
              }))}
            />

            <RangePicker
              placeholder={[t("traducteurDemandesList.filters.dateRange"), t("traducteurDemandesList.filters.dateRange")]}
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  from: v?.[0]?.startOf("day")?.toISOString(),
                  to: v?.[1]?.endOf("day")?.toISOString(),
                }))
              }
            />

            <Select
              value={filters.sortBy}
              onChange={(v) => setFilters((f) => ({ ...f, sortBy: v }))}
              style={{ width: 180 }}
              options={SORT_FIELDS}
            />
            <Select
              value={filters.sortOrder}
              onChange={(v) => setFilters((f) => ({ ...f, sortOrder: v }))}
              style={{ width: 140 }}
              options={[
                { label: t("traducteurDemandesList.sortOrder.desc"), value: "desc" },
                { label: t("traducteurDemandesList.sortOrder.asc"), value: "asc" },
              ]}
            />

            <Space align="center">
              <Text>{t("traducteurDemandesList.filters.onlyMine")}</Text>
              <Switch
                checked={filters.onlyMine}
                onChange={(checked) => setFilters((f) => ({ ...f, onlyMine: checked }))}
              />
            </Space>

            <Button type="primary" onClick={() => fetchData(1, pagination.limit)}>
              {t("traducteurDemandesList.actions.apply")}
            </Button>
            <Button icon={<ReloadOutlined />} onClick={resetFilters}>
              {t("common.reset")}
            </Button>
          </Space>
        </Card>

        <Card title={t("traducteurDemandesList.table.title")}>
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={rows}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50", "100"],
              showTotal: (t) => `${t} demande(s)`,
            }}
            onChange={onChangeTable}
            scroll={{ x: true }}
          />
        </Card>
      </div>

      {/* MODAL documents / upload traduction */}
      <Modal
        open={docsOpen}
        onCancel={closeDocs}
        footer={null}
        width={860}
        title={
          <Space wrap>
            <Text strong>{t("traducteurDemandesList.modal.documentsTitle")}</Text>
            {currentDemande?.code && <Tag color="blue">{currentDemande.code}</Tag>}
            {currentDemande?.targetOrg?.name && <Tag>{currentDemande.targetOrg.name}</Tag>}
          </Space>
        }
      >
        {docsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spin />
          </div>
        ) : docs.length === 0 ? (
          <Text type="secondary">{t("traducteurDemandesList.modal.noDocuments")}</Text>
        ) : (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {docs.map((d) => (
              <DocsRow key={d.id} d={d} t={t} />
            ))}
          </Space>
        )}
      </Modal>
    </div>
  );
}
