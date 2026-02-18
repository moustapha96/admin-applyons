import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Table, Tag, Space, Breadcrumb, Button, Input, Select, message, Modal, Badge } from "antd";
import { SearchOutlined, PlusOutlined, FileTextOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import organizationService from "../../../services/organizationService";
import { useAuth } from "../../../hooks/useAuth";

const { Search } = Input;

const OrganizationDemandesList = () => {
  const { t } = useTranslation();
  const { id: orgId } = useParams();
  const { user: currentUser } = useAuth();
  const statusOptions = [
    { value: "PENDING", label: t("adminOrgDemandesList.status.PENDING") },
    { value: "APPROVED", label: t("adminOrgDemandesList.status.APPROVED") },
    { value: "REJECTED", label: t("adminOrgDemandesList.status.REJECTED") },
    { value: "COMPLETED", label: t("adminOrgDemandesList.status.COMPLETED") },
  ];
  const typeOptions = [
    { value: "TRADUCTION", label: t("adminOrgDemandesList.type.TRADUCTION") },
    { value: "VERIFICATION", label: t("adminOrgDemandesList.type.VERIFICATION") },
    { value: "AUTRE", label: t("adminOrgDemandesList.type.AUTRE") },
  ];
  const [demandes, setDemandes] = useState([]);
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

  const fetchDemandes = useCallback(async () => {
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
      const response = await organizationService.listDemandes(orgId, params);
      setDemandes(response.demandes);   
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes:", error);
      message.error(t("adminOrgDemandesList.messages.loadError"));
    } finally {
      setLoading(false);
    }
  }, [orgId, pagination.current, pagination.pageSize, filters, sortConfig, t]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchDemandes();
  }, [fetchDemandes]);

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

  const handleDeleteDemande = async (demandeId) => {
    try {
      message.success(t("adminOrgDemandesList.messages.deleteSuccess"));
      fetchDemandes();
    } catch (error) {
      message.error(t("adminOrgDemandesList.messages.deleteError"));
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "gold",
      APPROVED: "green",
      REJECTED: "red",
      COMPLETED: "blue",
    };
    return colors[status] || "default";
  };

  const columns = [
    {
      title: t("adminOrgDemandesList.table.title"),
      dataIndex: "title",
      key: "title",
      sorter: true,
      render: (_, record) => (
        <Space size="middle">
          <FileTextOutlined />
          <Link to={`/organisations/${orgId}/demandes/${record.id}/details`}>
            {record.title}
          </Link>
        </Space>
      ),
    },
    {
      title: t("adminOrgDemandesList.table.type"),
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
      title: t("adminOrgDemandesList.table.status"),
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
      title: t("adminOrgDemandesList.table.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (createdAt) => new Date(createdAt).toLocaleString(),
    },
    {
      title: t("adminOrgDemandesList.table.actions"),
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link">
            <Link to={`/organisations/${orgId}/demandes/${record.id}/details`}>{t("adminOrgDemandesList.actions.details")}</Link>
          </Button>
          {currentUser?.role === "SUPER_ADMIN" && (
            <Button
              type="link"
              danger
              onClick={() => {
                Modal.confirm({
                  title: t("adminOrgDemandesList.deleteConfirm.title"),
                  content: t("adminOrgDemandesList.deleteConfirm.content"),
                  okText: t("adminOrgDemandesList.deleteConfirm.okText"),
                  okType: "danger",
                  cancelText: t("adminOrgDemandesList.deleteConfirm.cancelText"),
                  onOk: () => handleDeleteDemande(record.id),
                });
              }}
            >
              {t("adminOrgDemandesList.actions.delete")}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("adminOrgDemandesList.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">{t("adminOrgDemandesList.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/organisations">{t("adminOrgDemandesList.breadcrumb.organisations")}</Link> },
              { title: t("adminOrgDemandesList.breadcrumb.demandes") },
            ]}
          />
        </div>
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
            <div className="w-full md:flex-1">
              <Search
                placeholder={t("adminOrgDemandesList.searchPlaceholder")}
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap gap-4 w-full md:w-auto justify-start sm:justify-center md:justify-end">
              <Select
                placeholder={t("adminOrgDemandesList.filterByStatus")}
                allowClear
                className="w-full sm:w-44"
                onChange={(value) => handleFilterChange("status", value)}
                options={statusOptions}
              />
              <Select
                placeholder={t("adminOrgDemandesList.filterByType")}
                allowClear
                className="w-full sm:w-44"
                onChange={(value) => handleFilterChange("type", value)}
                options={typeOptions}
              />
              <Button className="w-full sm:w-auto" onClick={clearFilters}>
                {t("adminOrgDemandesList.reset")}
              </Button>
            </div>
            <div className="w-full md:w-auto flex justify-start md:justify-end">
              <Button
                type="primary"
                onClick={() => navigate(`/organisations/${orgId}/demandes/create`)}
                icon={<PlusOutlined />}
                className="w-full sm:w-auto"
              >
                {t("adminOrgDemandesList.newDemande")}
              </Button>
            </div>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={demandes}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total) => t("adminOrgDemandesList.totalDemandes", { count: total }),
          }}
          onChange={handleTableChange}
          scroll={{ x: true }}
          className="responsive-table"
        />
      </div>
    </div>
  );
};

export default OrganizationDemandesList;
