/* eslint-disable react/no-unescaped-entities */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  Card,
  Descriptions,
  Avatar,
  Statistic,
  Row,
  Col,
  Divider,
  Tag,
  Space,
  Button,
  Spin,
  Table,
  Input,
  Select,
  Tooltip,
  Badge,
} from "antd";
import {
  GlobalOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  UserOutlined,
  BankOutlined,
  TeamOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import organizationService from "../../../services/organizationService";
import { BiBuilding } from "react-icons/bi";

const { Search } = Input;

const typeOptions = [
  { value: "ENTREPRISE", label: "Entreprise" },
  { value: "TRADUCTEUR", label: "Agence de Traduction" },
  { value: "BANQUE", label: "Banque" },
  { value: "COLLEGE", label: "Collège" },
  { value: "LYCEE", label: "Lycée" },
  { value: "UNIVERSITE", label: "Université" },
];

const countryOptions = [
  { value: "SN", label: "Sénégal" },
  { value: "FR", label: "France" },
  { value: "US", label: "États-Unis" },
  { value: "CA", label: "Canada" },
];

const getTypeColor = (type) => {
  const colors = {
    ENTREPRISE: "blue",
    TRADUCTEUR: "purple",
    BANQUE: "gold",
    COLLEGE: "green",
    LYCEE: "cyan",
    UNIVERSITE: "geekblue",
  };
  return colors[type] || "default";
};

const roleTagColor = (role) => {
  const map = {
    ADMIN: "red",
    SUPERVISEUR: "geekblue",
    INSTITUT: "blue",
    TRADUCTEUR: "purple",
    DEMANDEUR: "green",
  };
  return map[role] || "default";
};

const defaultUsersState = {
  page: 1,
  limit: 10,
  search: "",
  role: undefined,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const OrganizationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [organization, setOrganization] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(true);

  // --- Users (liste paginée dans le détail)
  const [usersItems, setUsersItems] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersState, setUsersState] = useState(defaultUsersState);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // helper: trad du tri Antd -> backend
  const mapSorterToBackend = (sorter) => {
    // sorter.field ∈ ['username','email','role','enabled','createdAt','updatedAt']
    // sorter.order ∈ ['ascend','descend',undefined]
    const fieldMap = {
      username: "username",
      email: "email",
      role: "role",
      enabled: "enabled",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    };
    const sortBy = fieldMap[sorter?.field] || "createdAt";
    const sortOrder = sorter?.order === "ascend" ? "asc" : "desc";
    return { sortBy, sortOrder };
  };

  const fetchOrganization = async (overrideUsersState) => {
    const s = { ...usersState, ...(overrideUsersState || {}) };
    setLoadingOrg(true);
    setLoadingUsers(true);
    try {
      const response = await organizationService.getById(id, {
        usersPage: s.page,
        usersLimit: s.limit,
        usersSearch: s.search || undefined,
        usersRole: s.role || undefined,
        usersSortBy: s.sortBy,
        usersSortOrder: s.sortOrder,
      });

      setOrganization(response.organization || null);

      const users = response.users || {};
      setUsersItems(users.items || []);
      setUsersTotal(users.pagination?.total || 0);

      // réconcilier le state avec ce que renvoie l’API (au cas où)
      setUsersState((prev) => ({
        ...prev,
        page: users.pagination?.page ?? s.page,
        limit: users.pagination?.limit ?? s.limit,
        search: users.filters?.search ?? s.search,
        role: users.filters?.role ?? s.role,
        sortBy: users.filters?.sortBy ?? s.sortBy,
        sortOrder: users.filters?.sortOrder ?? s.sortOrder,
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération de l'organisation:", error);
      setOrganization(null);
      setUsersItems([]);
      setUsersTotal(0);
    } finally {
      setLoadingOrg(false);
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchOrganization();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Table columns
  const userColumns = useMemo(
    () => [
      {
        title: "Utilisateur",
        dataIndex: "username",
        key: "username",
        sorter: true,
        render: (text, record) => (
          <Space>
            <Avatar icon={<UserOutlined />} />
            <div>
              <div className="font-medium">{text || "—"}</div>
              <div className="text-xs text-gray-500">{record.email}</div>
            </div>
          </Space>
        ),
      },
      {
        title: "Téléphone",
        dataIndex: "phone",
        key: "phone",
        render: (v) => v || "—",
      },
      {
        title: "Rôle",
        dataIndex: "role",
        key: "role",
        sorter: true,
        render: (role) => <Tag color={roleTagColor(role)}>{role}</Tag>,
      },
      {
        title: "Statut",
        dataIndex: "enabled",
        key: "enabled",
        sorter: true,
        render: (enabled) =>
          enabled ? (
            <Badge status="success" text="Activé" />
          ) : (
            <Badge status="default" text="Désactivé" />
          ),
      },
      {
        title: "Créé le",
        dataIndex: "createdAt",
        key: "createdAt",
        sorter: true,
        render: (d) => (d ? new Date(d).toLocaleString() : "—"),
        defaultSortOrder: usersState.sortBy === "createdAt" ? (usersState.sortOrder === "asc" ? "ascend" : "descend") : undefined,
      },
      {
        title: "",
        key: "actions",
        width: 80,
        render: (_, record) => (
          <Space>
            <Tooltip title="Voir le profil">
              <Button size="small" onClick={() => navigate(`/admin/users/${record.id}/details`)}>
                Voir
              </Button>
            </Tooltip>
          </Space>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, usersState.sortBy, usersState.sortOrder]
  );

  // Handlers UI
  const onSearchUsers = (value) => {
    const next = { ...usersState, page: 1, search: value?.trim() || "" };
    setUsersState(next);
    fetchOrganization(next);
  };

  const onChangeRole = (value) => {
    const next = { ...usersState, page: 1, role: value || undefined };
    setUsersState(next);
    fetchOrganization(next);
  };

  const onChangeTable = (pagination, _filters, sorter) => {
    const { sortBy, sortOrder } = mapSorterToBackend(sorter);
    const next = {
      ...usersState,
      page: pagination.current,
      limit: pagination.pageSize,
      sortBy,
      sortOrder,
    };
    setUsersState(next);
    fetchOrganization(next);
  };

  if (loadingOrg && !organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!organization) {
    return <div>Organisation non trouvée.</div>;
  }

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Détails de l'organisation</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">Dashboard</Link> },
              { title: <Link to="/admin/organisations">Organisations</Link> },
              { title: organization.name },
            ]}
          />
        </div>

        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)}>Retour</Button>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/organisations/${organization.id}/edit`)}
            className="ml-2"
          >
            Modifier
          </Button>
        </div>

        <Card>
          <Descriptions title="Informations générales" bordered>
            <Descriptions.Item label="Nom" span={2}>
              <Space>
                <Avatar shape="square" size="large" icon={<BiBuilding />} />
                <span className="ml-3">{organization.name}</span>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color={getTypeColor(organization.type)}>
                {typeOptions.find((opt) => opt.value === organization.type)?.label || organization.type}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Slug">
              <Tag icon={<GlobalOutlined />}>{organization.slug}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Email">
              <Space>
                <MailOutlined />
                <a href={`mailto:${organization.email}`}>{organization.email}</a>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Téléphone">
              <Space>
                <PhoneOutlined />
                <a href={`tel:${organization.phone}`}>{organization.phone}</a>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Adresse">
              <Space>
                <EnvironmentOutlined />
                <span>{organization.address || "—"}</span>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Site Web">
              <Space>
                <GlobalOutlined />
                {organization.website ? (
                  <a href={organization.website} target="_blank" rel="noopener noreferrer">
                    {organization.website}
                  </a>
                ) : (
                  "N/A"
                )}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Pays">
              <Tag color="blue">
                {countryOptions.find((opt) => opt.value === organization.country)?.label || organization.country}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Créé le">
              {new Date(organization.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Mis à jour le">
              {new Date(organization.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>

          <Divider />
          <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Statistic
                title="Utilisateurs"
                value={organization.counts?.users ?? 0}
                prefix={<UserOutlined />}
              />
            </Col>
            <Col xs={24} md={8}>
              <Statistic
                title="Départements"
                value={organization.counts?.departments ?? 0}
                prefix={<BankOutlined />}
              />
            </Col>
            <Col xs={24} md={8}>
              <Statistic
                title="Abonnements"
                value={organization.counts?.subscriptions ?? 0}
                prefix={<TeamOutlined />}
              />
            </Col>
          </Row>
          <Divider />
          <h3 className="text-lg font-semibold mb-4">Navigation rapide</h3>
          <Space wrap>
            <Button onClick={() => navigate(`/admin/organisations/${organization.id}/users`)}>
              Voir les utilisateurs
            </Button>
            <Button onClick={() => navigate(`/admin/organisations/${organization.id}/demandes`)}>
              Voir les demandes
            </Button>
            <Button onClick={() => navigate(`/admin/organisations/${organization.id}/abonnements`)}>
              Voir les abonnements
            </Button>
            <Button onClick={() => navigate(`/admin/organisations/${organization.id}/notifications`)}>
              Voir les notifications
            </Button>
          </Space>
        </Card>

        <Divider />

        <Card
          title={
            <Space>
              Utilisateurs de l’organisation
              <Tooltip title="Liste paginée avec recherche, rôle, tri et pagination">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
          extra={
            <Space wrap>
              <Search
                allowClear
                placeholder="Rechercher (nom, email, téléphone)"
                onSearch={onSearchUsers}
                defaultValue={usersState.search}
                style={{ width: 320 }}
              />
              <Select
                allowClear
                placeholder="Filtrer par rôle"
                style={{ width: 200 }}
                value={usersState.role}
                onChange={onChangeRole}
                options={[
                  { value: "ADMIN", label: "Admin" },
                  { value: "SUPERVISEUR", label: "Superviseur" },
                  { value: "INSTITUT", label: "Institut" },
                  { value: "TRADUCTEUR", label: "Traducteur" },
                  { value: "DEMANDEUR", label: "Demandeur" },
                ]}
              />
              <Tag>
                Total (org): {organization.counts?.users ?? usersTotal}
              </Tag>
            </Space>
          }
        >
          <Table
            rowKey="id"
            loading={loadingUsers}
            columns={userColumns}
            dataSource={usersItems}
            pagination={{
              current: usersState.page,
              pageSize: usersState.limit,
              total: usersTotal,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50", "100"],
              showTotal: (t) => `${t} utilisateur(s)`,
            }}
            onChange={onChangeTable}
          />
        </Card>
      </div>
    </div>
  );
};

export default OrganizationDetail;
