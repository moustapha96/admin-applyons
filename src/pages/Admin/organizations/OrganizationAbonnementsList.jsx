import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Table, Tag, Space, Breadcrumb, Button, Input, Select, message, Modal, Badge } from "antd";
import { SearchOutlined, PlusOutlined, CreditCardOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import organizationService from "../../../services/organizationService";
import { useAuth } from "../../../hooks/useAuth";

const { Search } = Input;

const OrganizationAbonnementsList = () => {
  const { t } = useTranslation();
  const { id: orgId } = useParams();
  const { user: currentUser } = useAuth();
  const [abonnements, setAbonnements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: null,
    type: null,
  });
  const [sortConfig, setSortConfig] = useState({
    field: "createdAt",
    order: "descend",
  });
  const navigate = useNavigate();

  const statusOptions = useMemo(() => [
    { value: "ACTIVE", label: t("adminOrgAbonnements.status.ACTIVE") },
    { value: "EXPIRED", label: t("adminOrgAbonnements.status.EXPIRED") },
    { value: "CANCELLED", label: t("adminOrgAbonnements.status.CANCELLED") },
  ], [t]);

  const typeOptions = useMemo(() => [
    { value: "MENSUEL", label: t("adminOrgAbonnements.type.MENSUEL") },
    { value: "ANNUEL", label: t("adminOrgAbonnements.type.ANNUEL") },
    { value: "PONCTUEL", label: t("adminOrgAbonnements.type.PONCTUEL") },
  ], [t]);

  const fetchAbonnements = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search,
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
        sortBy: sortConfig.field,
        sortOrder: sortConfig.order === "ascend" ? "asc" : "desc",
      };
      const response = await organizationService.listAbonnements(orgId, params);
      setAbonnements(response.abonnements);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des abonnements:", error);
      message.error(t("adminOrgAbonnements.messages.loadError"));
    } finally {
      setLoading(false);
    }
  }, [orgId, pagination.current, pagination.pageSize, filters, sortConfig]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchAbonnements();
  }, [fetchAbonnements]);

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

  const clearFilters = () => {
    setFilters({
      search: "",
      status: null,
      type: null,
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleDeleteAbonnement = useCallback(async (abonnementId) => {
    try {
      // Logique pour supprimer un abonnement
      message.success(t("adminOrgAbonnements.messages.deleteSuccess"));
      fetchAbonnements();
    } catch (error) {
      message.error(t("adminOrgAbonnements.messages.deleteError"));
      console.error(error);
    }
  }, [t, fetchAbonnements]);

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: "green",
      EXPIRED: "red",
      CANCELLED: "gray",
    };
    return colors[status] || "default";
  };

  const columns = useMemo(() => [
    {
      title: t("adminOrgAbonnements.columns.title"),
      dataIndex: "title",
      key: "title",
      sorter: true,
      render: (_, record) => (
        <Space size="middle">
          <CreditCardOutlined />
          <Link to={`/admin/organisations/${orgId}/abonnements/${record.id}/details`}>
            {record.title}
          </Link>
        </Space>
      ),
    },
    {
      title: t("adminOrgAbonnements.columns.type"),
      dataIndex: "type",
      key: "type",
      filters: typeOptions,
      filterSearch: true,
      onFilter: (value, record) => record.type === value,
      render: (type) => (
        <Tag color="blue">
          {typeOptions.find(opt => opt.value === type)?.label || type}
        </Tag>
      ),
    },
    {
      title: t("adminOrgAbonnements.columns.status"),
      dataIndex: "status",
      key: "status",
      filters: statusOptions,
      filterSearch: true,
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {statusOptions.find(opt => opt.value === status)?.label || status}
        </Tag>
      ),
    },
    {
      title: t("adminOrgAbonnements.columns.price"),
      dataIndex: "price",
      key: "price",
      sorter: true,
      render: (price) => `${price} ${t("adminOrgAbonnements.common.currency")}`,
    },
    {
      title: t("adminOrgAbonnements.columns.startDate"),
      dataIndex: "startDate",
      key: "startDate",
      sorter: true,
      render: (startDate) => new Date(startDate).toLocaleDateString(),
    },
    {
      title: t("adminOrgAbonnements.columns.endDate"),
      dataIndex: "endDate",
      key: "endDate",
      sorter: true,
      render: (endDate) => new Date(endDate).toLocaleDateString(),
    },
    {
      title: t("adminOrgAbonnements.columns.actions"),
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
         
          {currentUser?.role === "SUPER_ADMIN" && (
            <Button
              type="link"
              danger
              onClick={() => {
                Modal.confirm({
                  title: t("adminOrgAbonnements.modal.deleteTitle"),
                  content: t("adminOrgAbonnements.modal.deleteContent"),
                  okText: t("adminOrgAbonnements.modal.deleteOk"),
                  okType: "danger",
                  cancelText: t("common.cancel"),
                  onOk: () => handleDeleteAbonnement(record.id),
                });
              }}
            >
              {t("adminOrgAbonnements.actions.delete")}
            </Button>
          )}
        </Space>
      ),
    },
  ], [t, orgId, typeOptions, statusOptions, currentUser?.role, handleDeleteAbonnement]);

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("adminOrgAbonnements.pageTitle")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("adminOrgAbonnements.breadcrumbs.dashboard")}</Link> },
              { title: <Link to="/admin/organisations">{t("adminOrgAbonnements.breadcrumbs.organizations")}</Link> },
              { title: t("adminOrgAbonnements.breadcrumbs.abonnements") },
            ]}
          />
        </div>
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
            <div className="w-full md:flex-1">
              <Search
                placeholder={t("adminOrgAbonnements.searchPlaceholder")}
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap gap-4 w-full md:w-auto justify-start sm:justify-center md:justify-end">
              <Select
                placeholder={t("adminOrgAbonnements.filters.statusPlaceholder")}
                allowClear
                className="w-full sm:w-44"
                onChange={(value) => handleFilterChange("status", value)}
                options={statusOptions}
              />
              <Select
                placeholder={t("adminOrgAbonnements.filters.typePlaceholder")}
                allowClear
                className="w-full sm:w-44"
                onChange={(value) => handleFilterChange("type", value)}
                options={typeOptions}
              />
              <Button className="w-full sm:w-auto" onClick={clearFilters}>
                {t("adminOrgAbonnements.actions.reset")}
              </Button>
            </div>
            <div className="w-full md:w-auto flex justify-start md:justify-end">
              <Button
                type="primary"
                onClick={() => navigate(`/admin/organisations/${orgId}/abonnements/create`)}
                icon={<PlusOutlined />}
                className="w-full sm:w-auto"
              >
                {t("adminOrgAbonnements.actions.create")}
              </Button>
            </div>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={abonnements}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total) => t("adminOrgAbonnements.pagination.total", { total }),
          }}
          onChange={handleTableChange}
          scroll={{ x: true }}
          className="responsive-table"
        />
      </div>
    </div>
  );
};

export default OrganizationAbonnementsList;
