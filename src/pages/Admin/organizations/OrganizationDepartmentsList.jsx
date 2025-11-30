import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Table, Tag, Space, Breadcrumb, Button, Input, Select, message, Modal } from "antd";
import { SearchOutlined, PlusOutlined, BankOutlined } from "@ant-design/icons";
import organizationService from "../../../services/organizationService";
import { useAuth } from "../../../hooks/useAuth";

const { Search } = Input;

const OrganizationDepartmentsList = () => {
  const { id: orgId } = useParams();
  const { user: currentUser } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
  });
  const [sortConfig, setSortConfig] = useState({
    field: "createdAt",
    order: "descend",
  });
  const navigate = useNavigate();

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search,
        sortBy: sortConfig.field,
        sortOrder: sortConfig.order === "ascend" ? "asc" : "desc",
      };
      const response = await organizationService.listDepartments(orgId, params);
      setDepartments(response.departments);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des départements:", error);
      message.error("Erreur lors de la récupération des départements");
    } finally {
      setLoading(false);
    }
  }, [orgId, pagination.current, pagination.pageSize, filters, sortConfig]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchDepartments();
  }, [fetchDepartments]);

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

  const clearFilters = () => {
    setFilters({
      search: "",
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleDeleteDepartment = async (deptId) => {
    try {
      // Logique pour supprimer un département
      message.success("Département supprimé avec succès");
      fetchDepartments();
    } catch (error) {
      message.error("Échec de la suppression");
      console.error(error);
    }
  };

  const columns = [
    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (_, record) => (
        <Space size="middle">
          <BankOutlined />
          <Link to={`/organisations/${orgId}/departments/${record.id}/details`}>
            {record.name}
          </Link>
        </Space>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description) => description || "N/A",
    },
    {
      title: "Créé le",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (createdAt) => new Date(createdAt).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link">
            <Link to={`/organisations/${orgId}/departments/${record.id}/details`}>Détails</Link>
          </Button>
          <Button type="link">
            <Link to={`/organisations/${orgId}/departments/${record.id}/edit`}>Modifier</Link>
          </Button>
          {currentUser?.role === "SUPER_ADMIN" && (
            <Button
              type="link"
              danger
              onClick={() => {
                Modal.confirm({
                  title: "Supprimer ce département ?",
                  content: "Cette action est irréversible.",
                  okText: "Supprimer",
                  okType: "danger",
                  cancelText: "Annuler",
                  onOk: () => handleDeleteDepartment(record.id),
                });
              }}
            >
              Supprimer
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
          <h5 className="text-lg font-semibold">Départements de l'organisation</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">Dashboard</Link> },
              { title: <Link to="/organisations">Organisations</Link> },
              { title: "Départements" },
            ]}
          />
        </div>
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
            <div className="w-full md:flex-1">
              <Search
                placeholder="Rechercher un département..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap gap-4 w-full md:w-auto justify-start sm:justify-center md:justify-end">
              <Button className="w-full sm:w-auto" onClick={clearFilters}>
                Réinitialiser
              </Button>
            </div>
            <div className="w-full md:w-auto flex justify-start md:justify-end">
              <Button
                type="primary"
                onClick={() => navigate(`/organisations/${orgId}/departments/create`)}
                icon={<PlusOutlined />}
                className="w-full sm:w-auto"
              >
                Nouveau Département
              </Button>
            </div>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={departments}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total) => `Total ${total} départements`,
          }}
          onChange={handleTableChange}
          scroll={{ x: true }}
          className="responsive-table"
        />
      </div>
    </div>
  );
};

export default OrganizationDepartmentsList;
