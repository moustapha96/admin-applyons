
import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, Tag, Space, Avatar, Breadcrumb, Button, Input, Select, message, Modal, Badge } from "antd";
import { SearchOutlined, PlusOutlined,  PhoneOutlined, MailOutlined } from "@ant-design/icons";
import organizationService from "../../../services/organizationservice";
import { useAuth } from "../../../hooks/useAuth";
import { BiBuildingHouse } from "react-icons/bi";
import { useTranslation } from "react-i18next";

const { Search } = Input;

const OrganizationList = () => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  
  const typeOptions = [
    { value: "ENTREPRISE", label: t("adminOrganizations.types.ENTREPRISE") },
    { value: "TRADUCTEUR", label: t("adminOrganizations.types.TRADUCTEUR") },
    { value: "BANQUE", label: t("adminOrganizations.types.BANQUE") },
    { value: "COLLEGE", label: t("adminOrganizations.types.COLLEGE") },
    { value: "LYCEE", label: t("adminOrganizations.types.LYCEE") },
    { value: "UNIVERSITE", label: t("adminOrganizations.types.UNIVERSITE") },
  ];

  const countryOptions = [
    { value: "SN", label: t("adminOrganizations.countries.SN") },
    { value: "FR", label: t("adminOrganizations.countries.FR") },
    { value: "US", label: t("adminOrganizations.countries.US") },
    { value: "CA", label: t("adminOrganizations.countries.CA") },
  ];
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    type: null,
    country: null,
  });
  const [sortConfig, setSortConfig] = useState({
    field: "createdAt",
    order: "descend",
  });
  const navigate = useNavigate();

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search,
        ...(filters.type && { type: filters.type }),
        ...(filters.country && { country: filters.country }),
        sortBy: sortConfig.field,
        sortOrder: sortConfig.order === "ascend" ? "asc" : "desc",
      };
      const response = await organizationService.list(params);
      setOrganizations(response.organizations);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des organisations:", error);
      message.error(t("adminOrganizations.messages.loadError"));
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters, sortConfig]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchOrganizations();
  }, [fetchOrganizations]);

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
      type: null,
      country: null,
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleDeleteOrganization = async (orgId) => {
    try {
      await organizationService.softDelete(orgId);
      message.success(t("adminOrganizations.messages.archiveSuccess"));
      fetchOrganizations();
    } catch (error) {
      message.error(t("adminOrganizations.messages.archiveError"));
      console.error(error);
    }
  };

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

  const columns = [
    {
      title: t("adminOrganizations.columns.name"),
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (_, record) => (
        <Space size="middle">
          <Avatar shape="square" size="large" icon={<BiBuildingHouse />} />
          <Link to={`/admin/organisations/${record.id}/details`}>
            {record.name}
          </Link>
        </Space>
      ),
    },
    {
      title: t("adminOrganizations.columns.type"),
      dataIndex: "type",
      key: "type",
      filters: typeOptions,
      filterSearch: true,
      onFilter: (value, record) => record.type === value,
      render: (type) => (
        <Tag color={getTypeColor(type)}>
          {typeOptions.find(opt => opt.value === type)?.label || type}
        </Tag>
      ),
    },
    {
      title: t("adminOrganizations.columns.email"),
      dataIndex: "email",
      key: "email",
      sorter: true,
      render: (email) => (
        <Space>
          <MailOutlined />
          <a href={`mailto:${email}`}>{email}</a>
        </Space>
      ),
    },
    {
      title: t("adminOrganizations.columns.phone"),
      dataIndex: "phone",
      key: "phone",
      render: (phone) => (
        <Space>
          <PhoneOutlined />
          <a href={`tel:${phone}`}>{phone}</a>
        </Space>
      ),
    },
    {
      title: t("adminOrganizations.columns.country"),
      dataIndex: "country",
      key: "country",
      filters: countryOptions,
      filterSearch: true,
      onFilter: (value, record) => record.country === value,
      render: (country) => (
        <Tag color="blue">
          {countryOptions.find(opt => opt.value === country)?.label || country}
        </Tag>
      ),
    },
    {
      title: "Statistiques",
      key: "stats",
      render: (_, record) => (
        <Space size="small">
          <Badge count={record.counts.users} style={{ backgroundColor: "#52c41a" }} />
          <span>Utilisateurs</span>
          <Badge count={record.counts.departments} style={{ backgroundColor: "#1890ff" }} />
          <span>Départements</span>
        </Space>
      ),
    },
    {
      title: t("adminOrganizations.columns.actions"),
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link">
            <Link to={`/admin/organisations/${record.id}/details`}>{t("adminOrganizations.actions.details")}</Link>
          </Button>
          <Button type="link">
            <Link to={`/admin/organisations/${record.id}/edit`}>{t("adminOrganizations.actions.edit")}</Link>
          </Button>
          {currentUser?.role === "SUPER_ADMIN" && (
            <Button
              type="link"
              danger
              onClick={() => {
                Modal.confirm({
                  title: t("adminOrganizations.actions.delete") + " ?",
                  content: "Cette action est irréversible.",
                  okText: t("adminOrganizations.actions.delete"),
                  okType: "danger",
                  cancelText: t("common.cancel"),
                  onOk: () => handleDeleteOrganization(record.id),
                });
              }}
            >
              {t("adminOrganizations.actions.delete")}
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
          <h5 className="text-lg font-semibold">{t("adminOrganizations.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("adminOrganizations.breadcrumb.dashboard")}</Link> },
              { title: t("adminOrganizations.breadcrumb.organizations") },
            ]}
          />
        </div>
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
            <div className="w-full md:flex-1">
              <Search
                placeholder={t("adminOrganizations.filters.search")}
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap gap-4 w-full md:w-auto justify-start sm:justify-center md:justify-end">
              <Select
                placeholder={t("adminOrganizations.filters.type")}
                allowClear
                className="w-full sm:w-44"
                onChange={(value) => handleFilterChange("type", value)}
                options={typeOptions}
              />
              <Select
                placeholder={t("adminOrganizations.filters.country")}
                allowClear
                className="w-full sm:w-44"
                onChange={(value) => handleFilterChange("country", value)}
                options={countryOptions}
              />
              <Button className="w-full sm:w-auto" onClick={clearFilters}>
                {t("common.reset")}
              </Button>
            </div>
            <div className="w-full md:w-auto flex justify-start md:justify-end">
              <Button
                type="primary"
                onClick={() => navigate("/admin/organisations/create")}
                icon={<PlusOutlined />}
                className="w-full sm:w-auto"
              >
                {t("adminOrganizations.actions.new")}
              </Button>
            </div>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={organizations}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total) => `Total ${total} ${t("adminOrganizations.breadcrumb.organizations").toLowerCase()}`,
          }}
          onChange={handleTableChange}
          scroll={{ x: true }}
          className="responsive-table"
        />
      </div>
    </div>
  );
};

export default OrganizationList;
