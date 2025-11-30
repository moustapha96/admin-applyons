import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Table, Tag, Space, Avatar, Breadcrumb, Button, Input, Select, message, Modal, Badge } from "antd";
import { UserOutlined, SearchOutlined, PlusOutlined } from "@ant-design/icons";
import organizationService from "../../../services/organizationService";
import { useAuth } from "../../../hooks/useAuth";

const { Search } = Input;

const roleOptions = [
  { value: "ADMIN", label: "Administrateur" },
  { value: "MEMBER", label: "Membre" },
  { value: "GUEST", label: "Invité" },
];

const statusOptions = [
  { value: true, label: "Actif" },
  { value: false, label: "Inactif" },
];

const OrganizationUsersList = () => {
  const { id: orgId } = useParams();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    role: null,
    status: null,
  });
  const [sortConfig, setSortConfig] = useState({
    field: "createdAt",
    order: "descend",
  });
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search,
        ...(filters.role && { role: filters.role }),
        ...(filters.status !== null && { enabled: filters.status }),
        sortBy: sortConfig.field,
        sortOrder: sortConfig.order === "ascend" ? "asc" : "desc",
      };
      const response = await organizationService.listUsers(orgId, params);
      setUsers(response.users);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      message.error("Erreur lors de la récupération des utilisateurs");
    } finally {
      setLoading(false);
    }
  }, [orgId, pagination.current, pagination.pageSize, filters, sortConfig]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchUsers();
  }, [fetchUsers]);

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
      role: null,
      status: null,
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleRemoveUser = async (userId) => {
    try {
      // Logique pour retirer un utilisateur de l'organisation
      message.success("Utilisateur retiré avec succès");
      fetchUsers();
    } catch (error) {
      message.error("Échec du retrait de l'utilisateur");
      console.error(error);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: "red",
      MEMBER: "blue",
      GUEST: "green",
    };
    return colors[role] || "default";
  };

  const columns = [
    {
      title: "Nom complet",
      dataIndex: ["firstName", "lastName"],
      key: "name",
      sorter: true,
      render: (_, record) => (
        <Space size="middle">
          <Avatar
            size="default"
            icon={<UserOutlined />}
            src={record.avatar}
          />
          <Link to={`/admin/users/${record.id}/details`}>
            {record.firstName || ""} {record.lastName || ""}
          </Link>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
    },
    {
      title: "Téléphone",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => phone || "N/A",
    },
    {
      title: "Rôle",
      dataIndex: "role",
      key: "role",
      filters: roleOptions,
      filterSearch: true,
      onFilter: (value, record) => record.role === value,
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {roleOptions.find(opt => opt.value === role)?.label || role}
        </Tag>
      ),
    },
    {
      title: "Statut",
      dataIndex: "enabled",
      key: "status",
      filters: statusOptions,
      filterSearch: true,
      onFilter: (value, record) => record.enabled === value,
      render: (enabled) => (
        <Tag color={enabled ? "green" : "red"}>
          {enabled ? "Actif" : "Inactif"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link">
            <Link to={`/admin/users/${record.id}/details`}>Détails</Link>
          </Button>
          {currentUser?.role === "SUPER_ADMIN" && (
            <Button
              type="link"
              danger
              onClick={() => {
                Modal.confirm({
                  title: "Retirer cet utilisateur de l'organisation ?",
                  content: "Cette action est irréversible.",
                  okText: "Retirer",
                  okType: "danger",
                  cancelText: "Annuler",
                  onOk: () => handleRemoveUser(record.id),
                });
              }}
            >
              Retirer
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
          <h5 className="text-lg font-semibold">Utilisateurs de l'organisation</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">Dashboard</Link> },
              { title: <Link to="/admin/organisations">Organisations</Link> },
              { title: "Utilisateurs" },
            ]}
          />
        </div>
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
            <div className="w-full md:flex-1">
              <Search
                placeholder="Rechercher un utilisateur..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap gap-4 w-full md:w-auto justify-start sm:justify-center md:justify-end">
              <Select
                placeholder="Filtrer par rôle"
                allowClear
                className="w-full sm:w-44"
                onChange={(value) => handleFilterChange("role", value)}
                options={roleOptions}
              />
              <Select
                placeholder="Filtrer par statut"
                allowClear
                className="w-full sm:w-44"
                onChange={(value) => handleFilterChange("status", value)}
                options={statusOptions}
              />
              <Button className="w-full sm:w-auto" onClick={clearFilters}>
                Réinitialiser
              </Button>
            </div>
            <div className="w-full md:w-auto flex justify-start md:justify-end">
              <Button
                type="primary"
                onClick={() => navigate(`/admin/organisations/${orgId}/users/add`)}
                icon={<PlusOutlined />}
                className="w-full sm:w-auto"
              >
                Ajouter un utilisateur
              </Button>
            </div>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total) => `Total ${total} utilisateurs`,
          }}
          onChange={handleTableChange}
          scroll={{ x: true }}
          className="responsive-table"
        />
      </div>
    </div>
  );
};

export default OrganizationUsersList;
