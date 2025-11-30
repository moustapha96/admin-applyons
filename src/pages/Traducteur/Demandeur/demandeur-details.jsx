
/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  Button,
  message,
  Breadcrumb,
  Descriptions,
  Avatar,
  Spin,
  Modal,
  Upload,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  GlobalOutlined,
  UploadOutlined,
  FileTextOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { buildImageUrl } from "@/utils/imageUtils";
import demandeService from "@/services/demandeService";
import userService from "@/services/userService";
import documentService from "@/services/documentService";
import { useAuth } from "@/hooks/useAuth";

const { Title, Text } = Typography;

const statusColor = (status) => {
  switch ((status || "PENDING").toUpperCase()) {
    case "VALIDATED":
      return "green";
    case "REJECTED":
      return "red";
    case "IN_PROGRESS":
      return "gold";
    case "PENDING":
    default:
      return "blue";
  }
};

const fmtDate = (d, f = "DD/MM/YYYY") =>
  d ? (dayjs(d).isValid() ? dayjs(d).format(f) : "—") : "—";

// Utilise buildImageUrl pour construire les URLs d'images
const safeUrl = (u) => buildImageUrl(u);

export default function TraducteurDemandeurDetails() {
  const { id: userId } = useParams(); // id du DEMANDEUR dans l'URL
  const navigate = useNavigate();
  const { user: me } = useAuth() || {};
  const myOrgId = me?.organization?.id || null;

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);

  const [demandeur, setDemandeur] = useState(null);
  const [rows, setRows] = useState([]);

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [sort, setSort] = useState({ field: "createdAt", order: "descend" });
  const [filters, setFilters] = useState({
    search: "",
    status: null,
    periode: null,
    year: null,
  });

  // === MODAL DOCUMENTS / TRADUCTION ===
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [currentDemande, setCurrentDemande] = useState(null);

  // Charger profil demandeur
  useEffect(() => {
    const loadUser = async () => {
      if (!userId) return;
      setLoadingUser(true);
      try {
        let u = null;
        try {
          const resU = await userService.getById(userId);
          console.log(resU.user)
          u = resU?.user || resU?.data?.user || resU || null;
        } catch {
          // Fallback : prendre le user depuis une 1ère demande
          const resD = await demandeService.getDemandesDemandeur(userId, { page: 1, limit: 1 });
          const payload = resD?.data || resD;
          const first = (payload?.demandes || [])[0];
          u = first?.user || null;
        }
        if (!u) message.warning("Impossible de charger le profil du demandeur.");
        setDemandeur(u);
      } catch (err) {
        console.error(err);
        message.error("Erreur lors du chargement du demandeur.");
      } finally {
        setLoadingUser(false);
      }
    };
    loadUser();
  }, [userId]);

  // Charger demandes du demandeur assignées à mon org
  const fetchDemandes = useCallback(async () => {
    if (!userId) return;
    if (!myOrgId) {
      message.warning("Organisation active introuvable : filtrage 'assignedOrgId' désactivé.");
    }

    setLoadingTable(true);
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
      search: filters.search || undefined,
      status: filters.status || undefined,
      targetOrgId: undefined,
      periode: filters.periode || undefined,
      year: filters.year || undefined,
      sortBy: sort.field,
      sortOrder: sort.order === "ascend" ? "asc" : "desc",
      assignedOrgId: myOrgId || undefined,
    };
    console.log(params, userId);

    try {
      const res = await demandeService.getDemandesDemandeur(userId, myOrgId , params);
      const payload = res?.data || res;
      const list = payload?.demandes || [];
      setRows(list);
      setPagination((p) => ({ ...p, total: payload?.pagination?.total || list.length || 0 }));
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.message || e?.message || "Erreur chargement des demandes");
    } finally {
      setLoadingTable(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userId,
    myOrgId,
    filters.search,
    filters.status,
    filters.periode,
    filters.year,
    sort.field,
    sort.order,
    pagination.current,
    pagination.pageSize,
  ]);

  useEffect(() => {
    fetchDemandes();
  }, [fetchDemandes]);

  const onTableChange = (pg, _filters, sorter) => {
    setPagination((p) => ({ ...p, current: pg.current, pageSize: pg.pageSize }));
    if (sorter && sorter.field) {
      setSort({ field: sorter.field, order: sorter.order || "ascend" });
    }
  };

  const resetFilters = () => {
    setFilters({ search: "", status: null, periode: null, year: null });
    setPagination((p) => ({ ...p, current: 1 }));
  };

  // === Gestion Modal Documents ===
  const openDocsModal = async (demande) => {
    setCurrentDemande(demande);
    setDocsModalOpen(true);
    setDocsLoading(true);
    try {
      // 2 options : soit ton getById accepte ?withDocuments=1
      // const res = await demandeService.getById(demande.id, { withDocuments: 1 });
      // const list = res?.demande?.documents || res?.documents || [];

      // soit tu as un service documents dédié :
      const res = await documentService.listByDemande(demande.id);
      const list = res?.documents || res || [];
      setDocs(list);
    } catch (e) {
      console.error(e);
      message.error("Erreur chargement des documents");
    } finally {
      setDocsLoading(false);
    }
  };

  const closeDocsModal = () => {
    setDocsModalOpen(false);
    setCurrentDemande(null);
    setDocs([]);
  };

  const handleUploadTranslated = async (doc, file) => {
    try {
      await documentService.uploadTranslated(doc.id, file);
      message.success("Fichier traduit ajouté avec succès");
      // rafraîchir la liste des documents
      await openDocsModal(currentDemande);
      // rafraîchir le tableau des demandes (compteur docs traduits/état)
      fetchDemandes();
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.message || e?.message || "Échec de l’upload");
    }
  };

  const DocsRow = ({ d }) => {
    const uOrig = safeUrl(d.urlOriginal);
    const uChif = safeUrl(d.urlChiffre);
    const uTrad = safeUrl(d.urlTraduit);

    return (
      <div
        key={d.id}
        className="flex items-start justify-between gap-3 p-2 rounded border"
        style={{ borderColor: "#f0f0f0" }}
      >
        <div className="min-w-0">
          <Space direction="vertical" size={2}>
            <Space wrap size="small">
              <Tag>{d.ownerOrg?.name || "—"}</Tag>
              {d.estTraduit ? <Tag color="green">Traduit</Tag> : <Tag>Non traduit</Tag>}
              {d.urlChiffre ? <Tag color="geekblue">Chiffré</Tag> : <Tag>Non chiffré</Tag>}
              {d.blockchainHash && <Tag color="purple">Blockchain</Tag>}
            </Space>
            <Text type="secondary" ellipsis>
              {d.id}
            </Text>
            <Space wrap size="small">
              {uOrig && (
                <a href={uOrig} target="_blank" rel="noreferrer">
                  <Button size="small" icon={<EyeOutlined />}>
                    Original
                  </Button>
                </a>
              )}
              {uChif && (
                <a href={uChif} target="_blank" rel="noreferrer">
                  <Button size="small" icon={<FileTextOutlined />}>
                    Chiffré
                  </Button>
                </a>
              )}
              {uTrad && (
                <a href={uTrad} target="_blank" rel="noreferrer">
                  <Button size="small" type="primary" icon={<EyeOutlined />}>
                    Traduit
                  </Button>
                </a>
              )}
            </Space>
          </Space>
        </div>

        {/* Bloc upload si non traduit */}
        {!d.estTraduit && (
          <Upload
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            maxCount={1}
            showUploadList={false}
            beforeUpload={() => false} // on gère l’envoi manuellement
            customRequest={async ({ file, onSuccess, onError }) => {
              try {
                await handleUploadTranslated(d, file);
                onSuccess?.("ok");
              } catch (err) {
                onError?.(err);
              }
            }}
          >
            <Button type="primary" icon={<UploadOutlined />}>
              Ajouter traduction
            </Button>
          </Upload>
        )}
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        title: "Code",
        dataIndex: "code",
        key: "code",
        width: 180,
        ellipsis: true,
        render: (v, r) => (
          <Space size="small" wrap>
            <Link to={`/traducteur/demandes/${r.id}`}>{v || "—"}</Link>
          </Space>
        ),
        sorter: true,
      },
      {
        title: "Date",
        dataIndex: "dateDemande",
        key: "dateDemande",
        width: 130,
        render: (v) => fmtDate(v),
        sorter: true,
      },
      {
        title: "Institut cible",
        key: "targetOrg",
        render: (_, r) => r?.targetOrg?.name || "—",
      },
      {
        title: "Statut",
        dataIndex: "status",
        key: "status",
        width: 140,
        render: (s) => <Tag color={statusColor(s)}>{s || "PENDING"}</Tag>,
        filters: [
          { text: "PENDING", value: "PENDING" },
          { text: "IN_PROGRESS", value: "IN_PROGRESS" },
          { text: "VALIDATED", value: "VALIDATED" },
          { text: "REJECTED", value: "REJECTED" },
        ],
        onFilter: (value, record) => (record.status || "PENDING") === value,
      },
      {
        title: "Docs",
        key: "docs",
        width: 80,
        align: "center",
        render: (_, r) =>
          (r?._count && typeof r._count.documents === "number" && r._count.documents) ||
          (Array.isArray(r.documents) ? r.documents.length : 0) ||
          0,
      },
      {
        title: "Actions",
        key: "actions",
        width: 260,
        render: (_, r) => (
          <Space size="small" wrap>
            <Link to={`/traducteur/demandes/${r.id}`}>
              <Button type="link">Détails</Button>
            </Link>
            <Link to={`/traducteur/demandes/${r.id}/documents`}>
              <Button type="link">Documents</Button>
            </Link>
          </Space>
        ),
      },
    ],
    []
  );

  if (loadingUser && !demandeur) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container-fluid relative px-3 py-2 md:py-4">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-4">
          <Space direction="vertical" size={0}>
            <Title level={5} style={{ margin: 0 }}>
              Détails du demandeur
            </Title>
            <Text type="secondary">
              {demandeur
                ? `${demandeur.firstName || ""} ${demandeur.lastName || ""}`.trim()
                : "—"}
            </Text>
          </Space>
          <Breadcrumb
            items={[
              { title: <Link to="/traducteur/dashboard">Dashboard</Link> },
              { title: <Link to="/traducteur/mes-demandes">Mes demandes</Link> },
              {
                title:
                  demandeur &&
                  `${demandeur.firstName || ""} ${demandeur.lastName || ""}`.trim(),
              },
            ]}
          />
        </div>

        {/* Carte Profil Demandeur */}
        <Card className="mb-4" loading={loadingUser} title="Informations personnelles">
          {demandeur ? (
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Nom complet">
                <Space size="middle" wrap>
                  <Avatar size="large" icon={<UserOutlined />} src={demandeur.avatar ? buildImageUrl(demandeur.avatar) : undefined} />
                  <Text strong>
                    {(demandeur.firstName || "") + " " + (demandeur.lastName || "")}
                  </Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Email">
                {demandeur.email ? (
                  <Space>
                    <MailOutlined />
                    <a href={`mailto:${demandeur.email}`}>{demandeur.email}</a>
                  </Space>
                ) : (
                  "—"
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Téléphone">
                {demandeur.phone ? (
                  <Space>
                    <PhoneOutlined />
                    <a href={`tel:${demandeur.phone}`}>{demandeur.phone}</a>
                  </Space>
                ) : (
                  "—"
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Adresse">
                <Space>
                  <HomeOutlined />
                  <Text>{demandeur.adress || "—"}</Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Pays de résidence">
                <Space>
                  <GlobalOutlined />
                  <Text>{demandeur.country || "—"}</Text>
                </Space>
              </Descriptions.Item>

            </Descriptions>
          ) : (
            <Text type="secondary">Demandeur non trouvé.</Text>
          )}
        </Card>

        {/* Table des demandes de ce demandeur assignées à mon org */}
        <Card
          title={
            <Space>
              <Text strong>Demandes de ce demandeur</Text>
              <Tag>{pagination.total || 0}</Tag>
            </Space>
          }
          extra={
            <Space>
              <Button onClick={resetFilters}>Réinitialiser</Button>
            </Space>
          }
        >
          <Table
            rowKey="id"
            loading={loadingTable}
            columns={columns}
            dataSource={rows}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
            }}
            onChange={onTableChange}
          />
        </Card>

        <div className="mt-4">
          <Button onClick={() => navigate(-1)}>Retour</Button>
        </div>
      </div>

      {/* MODAL DOCUMENTS / UPLOAD TRADUCTION */}
      <Modal
        open={docsModalOpen}
        onCancel={closeDocsModal}
        footer={null}
        title={
          <Space wrap>
            <Text strong>Documents de la demande</Text>
            {currentDemande?.code && <Tag color="blue">{currentDemande.code}</Tag>}
            {currentDemande?.targetOrg?.name && (
              <Tag>{currentDemande.targetOrg.name}</Tag>
            )}
          </Space>
        }
        width={860}
      >
        {docsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spin />
          </div>
        ) : docs.length === 0 ? (
          <Text type="secondary">Aucun document</Text>
        ) : (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {docs.map((d) => (
              <DocsRow key={d.id} d={d} />
            ))}
          </Space>
        )}
      </Modal>
    </div>
  );
}
