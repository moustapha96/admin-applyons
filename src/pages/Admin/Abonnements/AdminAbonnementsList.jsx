import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  Tag,
  Space,
  Breadcrumb,
  Button,
  Input,
  Select,
  message,
  Modal,
  DatePicker,
  Card,
  Typography,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  BarChartOutlined
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import organizationService from "@/services/organizationService";
// import { useAuth } from "@/hooks/useAuth";
import abonnementService from "@/services/abonnement.service";

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { confirm } = Modal;

const AdminAbonnementsList = () => {
  const { t } = useTranslation();
  // const { user } = useAuth();

  const statusOptions = [
    { value: "ACTIVE", label: t("adminAbonnements.status.ACTIVE"), color: "green" },
    { value: "EXPIRED", label: t("adminAbonnements.status.EXPIRED"), color: "red" },
    { value: "PENDING", label: t("adminAbonnements.status.PENDING"), color: "gold" },
  ];
  const [abonnements, setAbonnements] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    organizationId: null,
    status: null,
    dateRange: null,
    minMontant: null,
    maxMontant: null,
  });
  const [sortConfig, setSortConfig] = useState({
    field: "createdAt",
    order: "descend",
  });
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  const fetchAbonnements = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search,
        ...(filters.organizationId && { organizationId: filters.organizationId }),
        ...(filters.status && { [filters.status.toLowerCase()]: true }),
        ...(filters.dateRange && {
          dateFrom: filters.dateRange[0].format("YYYY-MM-DD"),
          dateTo: filters.dateRange[1].format("YYYY-MM-DD"),
        }),
        ...(filters.minMontant && { minMontant: filters.minMontant }),
        ...(filters.maxMontant && { maxMontant: filters.maxMontant }),
        sortBy: sortConfig.field,
        sortOrder: sortConfig.order === "ascend" ? "asc" : "desc",
        withOrg: "true",
      };
      const response = await abonnementService.list(params);
      setAbonnements(response.abonnements);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des abonnements:", error);
      message.error(t("adminAbonnements.messages.loadError"));
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters, sortConfig]);

  const fetchOrganizations = useCallback(async () => {
    try {
      const response = await organizationService.list({ limit: 1000 });
      setOrganizations(response.organizations);
    } catch (error) {
      console.error("Erreur lors de la récupération des organisations:", error);
      message.error(t("adminAbonnements.messages.orgLoadError"));
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await abonnementService.stats();
      setStats(response);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchAbonnements();
    fetchOrganizations();
    fetchStats();
  }, [fetchAbonnements, fetchOrganizations, fetchStats]);

  const handleTableChange = (newPagination, _, sorter) => {
    if (newPagination.current !== pagination.current || newPagination.pageSize !== pagination.pageSize) {
      setPagination({
        ...pagination,
        current: newPagination.current,
        pageSize: newPagination.pageSize,
      });
    }
    if (sorter && sorter.field) {
      setSortConfig({
        field: sorter.field,
        order: sorter.order,
      });
    }
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleDateRangeChange = (dates) => {
    setFilters(prev => ({ ...prev, dateRange: dates }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      organizationId: null,
      status: null,
      dateRange: null,
      minMontant: null,
      maxMontant: null,
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleDeleteAbonnement = async (abonnementId) => {
    confirm({
      title: t("adminAbonnements.modals.archiveTitle"),
      icon: <ExclamationCircleOutlined />,
      content: t("adminAbonnements.modals.archiveContent"),
      okText: t("adminAbonnements.modals.archiveOk"),
      okType: "danger",
      cancelText: t("adminAbonnements.modals.archiveCancel"),
      onOk: async () => {
        try {
          await abonnementService.softDelete(abonnementId);
          message.success(t("adminAbonnements.messages.archiveSuccess"));
          fetchAbonnements();
        } catch (error) {
          console.error("Erreur lors de l'archivage:", error);
          message.error(t("adminAbonnements.messages.archiveError"));
        }
      },
    });
  };

  const handleRestoreAbonnement = async (abonnementId) => {
    try {
      await abonnementService.restore(abonnementId);
      message.success(t("adminAbonnements.messages.restoreSuccess"));
      fetchAbonnements();
    } catch (error) {
      console.error("Erreur lors de la restauration:", error);
      message.error(t("adminAbonnements.messages.restoreError"));
    }
  };

  const handleHardDeleteAbonnement = async (abonnementId) => {
    confirm({
      title: t("adminAbonnements.modals.deleteTitle"),
      icon: <ExclamationCircleOutlined />,
      content: t("adminAbonnements.modals.deleteContent"),
      okText: t("adminAbonnements.modals.deleteOk"),
      okType: "danger",
      cancelText: t("adminAbonnements.modals.deleteCancel"),
      onOk: async () => {
        try {
          await abonnementService.hardDelete(abonnementId);
          message.success(t("adminAbonnements.messages.deleteSuccess"));
          fetchAbonnements();
        } catch (error) {
          console.error("Erreur lors de la suppression:", error);
          message.error(t("adminAbonnements.messages.deleteError"));
        }
      },
    });
  };

  const getStatusTag = (dateDebut, dateExpiration) => {
    const now = new Date();
    const start = new Date(dateDebut);
    const end = new Date(dateExpiration);

    if (end < now) {
      return <Tag color="red">{t("adminAbonnements.status.expired")}</Tag>;
    } else if (start <= now && end >= now) {
      return <Tag color="green">{t("adminAbonnements.status.active")}</Tag>;
    } else {
      return <Tag color="gold">{t("adminAbonnements.status.coming")}</Tag>;
    }
  };

  const columns = [
    {
      title: t("adminAbonnements.columns.id"),
      dataIndex: "id",
      key: "id",
      render: (id) => `#${id.substring(0, 8)}...`,
    },
    {
      title: t("adminAbonnements.columns.organization"),
      dataIndex: ["organization", "name"],
      key: "organization",
      render: (name, record) => (
        <Link to={`/admin/organisations/${record.organizationId}/details`}>
          {name}
        </Link>
      ),
    },
    {
      title: t("adminAbonnements.columns.periode"),
      key: "periode",
      render: (_, record) => (
        <div>
          <div>{new Date(record.dateDebut).toLocaleDateString()}</div>
          <div>→ {new Date(record.dateExpiration).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      title: t("adminAbonnements.columns.status"),
      key: "status",
      render: (_, record) => getStatusTag(record.dateDebut, record.dateExpiration),
    },
    {
      title: t("adminAbonnements.columns.montant"),
      dataIndex: "montant",
      key: "montant",
      render: (montant) => `${parseFloat(montant).toLocaleString()} USD`,
    },
    {
      title: t("adminAbonnements.columns.actions"),
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small">
            <Link to={`/admin/abonnements/${record.id}/details`}>{t("adminAbonnements.actions.details")}</Link>
          </Button>
          <Button type="link" size="small">
            <Link to={`/admin/abonnements/${record.id}/edit`}>{t("adminAbonnements.actions.edit")}</Link>
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/admin/abonnements/${record.id}/renew`)}
          >
            {t("adminAbonnements.actions.renew")}
          </Button>
          {!record.isDeleted ? (
            <Button
              type="link"
              danger
              size="small"
              onClick={() => handleDeleteAbonnement(record.id)}
            >
              {t("adminAbonnements.actions.archive")}
            </Button>
          ) : (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => handleRestoreAbonnement(record.id)}
              >
                {t("adminAbonnements.actions.restore")}
              </Button>
              <Button
                type="link"
                danger
                size="small"
                onClick={() => handleHardDeleteAbonnement(record.id)}
              >
                {t("adminAbonnements.actions.delete")}
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <Title level={4}>{t("adminAbonnements.title")}</Title>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("adminAbonnements.breadcrumb.dashboard")}</Link> },
              { title: t("adminAbonnements.breadcrumb.abonnements") },
            ]}
          />
        </div>

        {/* Statistiques */}
        <Card className="mb-6">
          <Title level={5} className="mb-4">
            <BarChartOutlined className="mr-2" />
            {t("adminAbonnements.stats.title")}
          </Title>
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <Text strong>{t("adminAbonnements.stats.total")}</Text>
                <Title level={2}>{stats.active + stats.expired}</Title>
              </Card>
              <Card>
                <Text strong>{t("adminAbonnements.stats.active")}</Text>
                <Title level={2} className="text-green-600">{stats.active}</Title>
              </Card>
              <Card>
                <Text strong>{t("adminAbonnements.stats.expired")}</Text>
                <Title level={2} className="text-red-600">{stats.expired}</Title>
              </Card>
            </div>
          )}
        </Card>

        {/* Filtres */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-full md:w-1/4">
              <Search
                placeholder={t("adminAbonnements.filters.search")}
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
              />
            </div>
            <div className="w-full md:w-1/4">
              <Select
                placeholder={t("adminAbonnements.filters.organization")}
                allowClear
                className="w-full"
                onChange={(value) => handleFilterChange("organizationId", value)}
                options={organizations.map(org => ({
                  value: org.id,
                  label: org.name,
                }))}
                loading={organizations.length === 0}
              />
            </div>
            <div className="w-full md:w-1/4">
              <Select
                placeholder={t("adminAbonnements.filters.status")}
                allowClear
                className="w-full"
                onChange={(value) => handleFilterChange("status", value)}
                options={statusOptions}
              />
            </div>
            <div className="w-full md:w-1/4">
              <RangePicker
                className="w-full"
                onChange={handleDateRangeChange}
                placeholder={[t("adminAbonnements.filters.dateRange"), t("adminAbonnements.filters.dateRange")]}
                format="YYYY-MM-DD"
              />
            </div>
            <div className="w-full md:w-auto flex gap-2">
              <Button onClick={clearFilters} icon={<ReloadOutlined />}>
                {t("common.reset")}
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/admin/abonnements/create")}
              >
                {t("adminAbonnements.actions.create")}
              </Button>
            </div>
          </div>
        </Card>

        {/* Tableau des abonnements */}
        <Card>
          <Table
            columns={columns}
            dataSource={abonnements}
            loading={loading}
            rowKey="id"
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total) => t("adminAbonnements.pagination.total", { total }),
            }}
            onChange={handleTableChange}
            scroll={{ x: true }}
          />
        </Card>
      </div>
    </div>
  );
};

export default AdminAbonnementsList;
