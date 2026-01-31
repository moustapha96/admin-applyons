/* eslint-disable react/no-unescaped-entities */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Breadcrumb,
  Card,
  Descriptions,
  Avatar,
  Statistic,
  Row,
  Col,
  Grid,
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
  Modal,
  message,
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
  DeleteOutlined,
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
  { value: "UNIVERSITE", label: "Université / Institut" },
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
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const breakpoint = Grid.useBreakpoint();

  const [organization, setOrganization] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(true);

  // --- Users (liste paginée dans le détail)
  const [usersItems, setUsersItems] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersState, setUsersState] = useState(defaultUsersState);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const totalUsersCount = organization?.counts?.users ?? usersTotal;
  const canDeleteOrganization = totalUsersCount === 0 && !loadingUsers;

  const handleDeleteOrganization = () => {
    if (!organization?.id || !canDeleteOrganization) return;
    Modal.confirm({
      title: t("adminOrgDetails.deleteModal.title"),
      content: t("adminOrgDetails.deleteModal.content", { name: organization.name }),
      okText: t("adminOrgDetails.deleteModal.okText"),
      okType: "danger",
      cancelText: t("adminOrgDetails.deleteModal.cancelText"),
      onOk: async () => {
        setDeleteLoading(true);
        try {
          await organizationService.softDelete(organization.id);
          message.success(t("adminOrgDetails.messages.deleteSuccess"));
          navigate("/admin/organisations", { replace: true });
        } catch (err) {
          message.error(err?.response?.data?.message || t("adminOrgDetails.messages.deleteError"));
        } finally {
          setDeleteLoading(false);
        }
      },
    });
  };

  const dash = t("adminOrgDetails.dash");
  // Table columns
  const userColumns = useMemo(
    () => [
      {
        title: t("adminOrgDetails.usersTable.user"),
        dataIndex: "username",
        key: "username",
        sorter: true,
        render: (text, record) => (
          <Space>
            <Avatar icon={<UserOutlined />} />
            <div>
              <div className="font-medium">{text || dash}</div>
              <div className="text-xs text-gray-500">{record.email}</div>
            </div>
          </Space>
        ),
      },
      {
        title: t("adminOrgDetails.usersTable.phone"),
        dataIndex: "phone",
        key: "phone",
        render: (v) => v || dash,
      },
      {
        title: t("adminOrgDetails.usersTable.role"),
        dataIndex: "role",
        key: "role",
        sorter: true,
        render: (role) => <Tag color={roleTagColor(role)}>{role}</Tag>,
      },
      {
        title: t("adminOrgDetails.usersTable.status"),
        dataIndex: "enabled",
        key: "enabled",
        sorter: true,
        render: (enabled) =>
          enabled ? (
            <Badge status="success" text={t("adminOrgDetails.usersTable.enabled")} />
          ) : (
            <Badge status="default" text={t("adminOrgDetails.usersTable.disabled")} />
          ),
      },
      {
        title: t("adminOrgDetails.usersTable.createdAt"),
        dataIndex: "createdAt",
        key: "createdAt",
        sorter: true,
        render: (d) => (d ? new Date(d).toLocaleString() : dash),
        defaultSortOrder: usersState.sortBy === "createdAt" ? (usersState.sortOrder === "asc" ? "ascend" : "descend") : undefined,
      },
      {
        title: "",
        key: "actions",
        width: 80,
        render: (_, record) => (
          <Space>
            <Tooltip title={t("adminOrgDetails.usersTable.viewProfile")}>
              <Button size="small" onClick={() => navigate(`/admin/users/${record.id}/details`)}>
                {t("adminOrgDetails.usersTable.view")}
              </Button>
            </Tooltip>
          </Space>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, usersState.sortBy, usersState.sortOrder, t, dash]
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
      <div className="flex items-center justify-center min-h-[50vh] sm:min-h-screen p-4">
        <Spin size="large" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container-fluid px-2 sm:px-3 py-4">{t("adminOrgDetails.messages.notFound")}</div>
    );
  }

  return (
    <div className="container-fluid relative px-2 sm:px-3 overflow-x-hidden max-w-full">
      <div className="layout-specing py-4 sm:py-6">
        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
          <h5 className="text-base sm:text-lg font-semibold order-2 sm:order-1">{t("adminOrgDetails.pageTitle")}</h5>
          <Breadcrumb
            className="order-1 sm:order-2"
            items={[
              { title: <Link to="/admin/dashboard">{t("adminOrgDetails.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/admin/organisations">{t("adminOrgDetails.breadcrumb.organizations")}</Link> },
              { title: <span className="break-words">{organization.name}</span> },
            ]}
          />
        </div>

        <div className="flex flex-wrap justify-end items-center gap-2 mb-4 sm:mb-6">
          <Button onClick={() => navigate(-1)} className="w-full sm:w-auto">{t("adminOrgDetails.buttons.back")}</Button>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/organisations/${organization.id}/edit`)}
            className="w-full sm:w-auto"
          >
            {t("adminOrgDetails.buttons.edit")}
          </Button>
          {canDeleteOrganization && (
            <Tooltip title={t("adminOrgDetails.deleteTooltip")}>
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={deleteLoading}
                onClick={handleDeleteOrganization}
                className="w-full sm:w-auto"
              >
                {t("adminOrgDetails.buttons.delete")}
              </Button>
            </Tooltip>
          )}
        </div>

        <Card className="overflow-hidden">
          <Descriptions
            title="Informations générales"
            bordered
            column={{ xs: 1, sm: 2, md: 3 }}
            size="small"
          >
            <Descriptions.Item label="Nom" span={2}>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Avatar shape="square" size="large" icon={<BiBuilding />} className="shrink-0" />
                <span className="break-words">{organization.name}</span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Type" span={1}>
              <Tag color={getTypeColor(organization.type)}>
                {typeOptions.find((opt) => opt.value === organization.type)?.label || organization.type}
              </Tag>
            </Descriptions.Item>

            {/* <Descriptions.Item label="Slug" span={1}>
              <Tag icon={<GlobalOutlined />}>{organization.slug}</Tag>
            </Descriptions.Item> */}

            <Descriptions.Item label="Email" span={1}>
              <Space className="flex-wrap">
                <MailOutlined />
                <a href={`mailto:${organization.email}`} className="break-all">{organization.email}</a>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Téléphone" span={1}>
              <Space className="flex-wrap">
                <PhoneOutlined />
                <a href={`tel:${organization.phone}`} className="break-all">{organization.phone}</a>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Adresse" span={1}>
              <Space className="flex-wrap">
                <EnvironmentOutlined />
                <span className="break-words">{organization.address || "—"}</span>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Site Web" span={1}>
              <Space className="flex-wrap">
                <GlobalOutlined />
                {organization.website ? (
                  <a href={organization.website} target="_blank" rel="noopener noreferrer" className="break-all">
                    {organization.website}
                  </a>
                ) : (
                  "N/A"
                )}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Pays" span={1}>
              <Tag color="blue">
                {countryOptions.find((opt) => opt.value === organization.country)?.label || organization.country}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Créé le" span={1}>
              {new Date(organization.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Mis à jour le" span={2}>
              {new Date(organization.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>

          <Divider />
          <h3 className="text-base sm:text-lg font-semibold mb-4">Statistiques</h3>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={8}>
              <Statistic
                title="Utilisateurs"
                value={organization.counts?.users ?? 0}
                prefix={<UserOutlined />}
              />
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Statistic
                title="Départements"
                value={organization.counts?.departments ?? 0}
                prefix={<BankOutlined />}
              />
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Statistic
                title="Abonnements"
                value={organization.counts?.subscriptions ?? 0}
                prefix={<TeamOutlined />}
              />
            </Col>
          </Row>
          <Divider />
          <h3 className="text-base sm:text-lg font-semibold mb-4">Navigation rapide</h3>
          <Space wrap size={[8, 8]}>
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
            <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
              <Search
                allowClear
                placeholder="Rechercher (nom, email, téléphone)"
                onSearch={onSearchUsers}
                defaultValue={usersState.search}
                style={{ width: breakpoint.xs && !breakpoint.sm ? "100%" : 320, minWidth: 0 }}
                className="w-full"
              />
              <Select
                allowClear
                placeholder="Filtrer par rôle"
                style={{ width: breakpoint.xs && !breakpoint.sm ? "100%" : 200, minWidth: 0 }}
                value={usersState.role}
                onChange={onChangeRole}
                options={[
                  { value: "ADMIN", label: "Admin" },
                  { value: "SUPERVISEUR", label: "Superviseur" },
                  { value: "INSTITUT", label: "Institut" },
                  { value: "TRADUCTEUR", label: "Traducteur" },
                  { value: "DEMANDEUR", label: "Demandeur" },
                ]}
                className="w-full sm:!w-[200px]"
              />
              <Tag className="!m-0">
                Total (org): {organization.counts?.users ?? usersTotal}
              </Tag>
            </div>
          }
        >
          <Table
            rowKey="id"
            loading={loadingUsers}
            columns={userColumns}
            dataSource={usersItems}
            scroll={{ x: "max-content" }}
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
