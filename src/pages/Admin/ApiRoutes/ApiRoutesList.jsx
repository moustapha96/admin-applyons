/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  Button,
  Card,
  Input,
  Space,
  Table,
  Tag,
  message,
  Modal,
  Form,
  Select,
  Statistic,
  Row,
  Col,
  Switch,
} from "antd";
import {
  ReloadOutlined,
  EditOutlined,
  SearchOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../hooks/useAuth";
import apiRouteService from "../../../services/apiRouteService";
import { usePermissions } from "../../../hooks/usePermissions";

const { Search } = Input;
const { Option } = Select;

export default function ApiRoutesList() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  console.log(currentUser)
  const { hasPermission } = usePermissions();
  const [form] = Form.useForm();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    method: undefined,
    prefix: undefined,
    isActive: undefined,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...(filters.search && { search: filters.search }),
        ...(filters.method && { method: filters.method }),
        ...(filters.prefix && { prefix: filters.prefix }),
        ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      };
      const res = await apiRouteService.list(params);
      const data = res?.data || res;
      const routes = Array.isArray(data.routes)
        ? data.routes
        : Array.isArray(data)
        ? data
        : [];
      setRows(routes);
      setPagination((p) => ({
        ...p,
        total: data.pagination?.total ?? routes.length,
      }));
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          t("adminApiRoutes.messages.loadError")
      );
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters, t]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await apiRouteService.stats();
      const data = res?.data || res;
      setStats(data.stats || data);
    } catch (e) {
      console.error("Erreur lors du chargement des statistiques:", e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleSearch = (value) => {
    setFilters((f) => ({ ...f, search: value }));
    setPagination((p) => ({ ...p, current: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPagination((p) => ({ ...p, current: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: "", method: undefined, prefix: undefined, isActive: undefined });
    setPagination((p) => ({ ...p, current: 1 }));
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await apiRouteService.sync();
      const data = res?.data || res;
      message.success(
        t("adminApiRoutes.messages.syncSuccess", {
          created: data.result?.created || 0,
          updated: data.result?.updated || 0,
          total: data.result?.total || 0,
        })
      );
      await fetchData();
      await fetchStats();
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          t("adminApiRoutes.messages.syncError")
      );
    } finally {
      setSyncing(false);
    }
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      isActive: record.isActive,
      description: record.description || "",
      tags: record.tags || "",
      requiredPermissions: record.requiredPermissions || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await apiRouteService.update(editing.id, values);
      message.success(t("adminApiRoutes.messages.updateSuccess"));
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      await fetchData();
      await fetchStats();
    } catch (e) {
      if (e.errorFields) {
        return;
      }
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          t("adminApiRoutes.messages.updateError")
      );
    } finally {
      setLoading(false);
    }
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: "blue",
      POST: "green",
      PUT: "orange",
      PATCH: "purple",
      DELETE: "red",
    };
    return colors[method] || "default";
  };

  // Extraire les préfixes uniques pour le filtre
  const uniquePrefixes = useMemo(() => {
    const prefixes = new Set();
    rows.forEach((route) => {
      if (route.prefix) prefixes.add(route.prefix);
    });
    return Array.from(prefixes).sort();
  }, [rows]);

  const columns = useMemo(
    () => [
      {
        title: t("adminApiRoutes.columns.method"),
        dataIndex: "method",
        key: "method",
        width: 100,
        filters: [
          { text: "GET", value: "GET" },
          { text: "POST", value: "POST" },
          { text: "PUT", value: "PUT" },
          { text: "PATCH", value: "PATCH" },
          { text: "DELETE", value: "DELETE" },
        ],
        onFilter: (value, record) => record.method === value,
        render: (method) => (
          <Tag color={getMethodColor(method)}>{method}</Tag>
        ),
      },
      {
        title: t("adminApiRoutes.columns.path"),
        dataIndex: "path",
        key: "path",
        render: (path) => (
          <code style={{ fontFamily: "monospace", fontSize: "12px" }}>
            {path}
          </code>
        ),
      },
      {
        title: t("adminApiRoutes.columns.prefix"),
        dataIndex: "prefix",
        key: "prefix",
        width: 150,
        render: (prefix) => prefix || "—",
      },
      {
        title: t("adminApiRoutes.columns.description"),
        dataIndex: "description",
        key: "description",
        ellipsis: true,
        render: (desc) => desc || t("adminApiRoutes.noData"),
      },
      {
        title: t("adminApiRoutes.columns.tags"),
        dataIndex: "tags",
        key: "tags",
        width: 150,
        render: (tags) => {
          if (!tags) return "—";
          const tagList = tags.split(",").map((t) => t.trim());
          return (
            <Space size="small" wrap>
              {tagList.map((tag, idx) => (
                <Tag key={idx} color="cyan">
                  {tag}
                </Tag>
              ))}
            </Space>
          );
        },
      },
      {
        title: t("adminApiRoutes.columns.requiresAuth"),
        dataIndex: "requiresAuth",
        key: "requiresAuth",
        width: 120,
        render: (requiresAuth) =>
          requiresAuth ? (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              {t("common.yes")}
            </Tag>
          ) : (
            <Tag color="default" icon={<CloseCircleOutlined />}>
              {t("common.no")}
            </Tag>
          ),
      },
      {
        title: t("adminApiRoutes.columns.requiredPermissions"),
        dataIndex: "requiredPermissions",
        key: "requiredPermissions",
        width: 180,
        render: (perms) => {
          if (!perms) return "—";
          const permList = perms.split(",").map((p) => p.trim());
          return (
            <Space size="small" wrap>
              {permList.map((perm, idx) => (
                <Tag key={idx} color="purple">
                  {perm}
                </Tag>
              ))}
            </Space>
          );
        },
      },
      {
        title: t("adminApiRoutes.columns.isActive"),
        dataIndex: "isActive",
        key: "isActive",
        width: 100,
        render: (isActive) =>
          isActive ? (
            <Tag color="green">{t("adminApiRoutes.active")}</Tag>
          ) : (
            <Tag color="red">{t("adminApiRoutes.inactive")}</Tag>
          ),
      },
      {
        title: t("adminApiRoutes.columns.createdAt"),
        dataIndex: "createdAt",
        key: "createdAt",
        width: 180,
        render: (date) =>
          date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "—",
      },
      {
        title: t("adminApiRoutes.columns.actions"),
        key: "actions",
        width: 100,
        fixed: "right",
        render: (_, record) => (
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          >
            {t("adminApiRoutes.actions.edit")}
          </Button>
        ),
      },
    ],
    [t]
  );

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">
            {t("adminApiRoutes.pageTitle")}
          </h5>
          <Breadcrumb
            items={[
              {
                title: (
                  <Link to="/admin/dashboard">
                    {t("adminApiRoutes.breadcrumbs.dashboard")}
                  </Link>
                ),
              },
              { title: t("adminApiRoutes.breadcrumbs.apiRoutes") },
            ]}
          />
        </div>

        {/* Statistiques */}
        {stats && (
          <Row gutter={16} className="mb-4">
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title={t("adminApiRoutes.stats.total")}
                  value={stats.total || 0}
                  loading={statsLoading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title={t("adminApiRoutes.stats.active")}
                  value={stats.active || 0}
                  valueStyle={{ color: "#3f8600" }}
                  prefix={<CheckCircleOutlined />}
                  loading={statsLoading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title={t("adminApiRoutes.stats.inactive")}
                  value={stats.inactive || 0}
                  valueStyle={{ color: "#cf1322" }}
                  prefix={<CloseCircleOutlined />}
                  loading={statsLoading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title={t("adminApiRoutes.stats.byMethod")}
                  value={stats.byMethod ? Object.keys(stats.byMethod).length : 0}
                  loading={statsLoading}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Filtres */}
        <Card className="mb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4">
            <Search
              placeholder={t("adminApiRoutes.searchPlaceholder")}
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              style={{ maxWidth: 400 }}
              onSearch={handleSearch}
              onChange={(e) => {
                if (!e.target.value) {
                  handleSearch("");
                }
              }}
            />
            <Space>
              <Select
                placeholder={t("adminApiRoutes.filters.method")}
                allowClear
                style={{ width: 120 }}
                value={filters.method}
                onChange={(value) => handleFilterChange("method", value)}
              >
                <Option value="GET">GET</Option>
                <Option value="POST">POST</Option>
                <Option value="PUT">PUT</Option>
                <Option value="PATCH">PATCH</Option>
                <Option value="DELETE">DELETE</Option>
              </Select>
              <Select
                placeholder={t("adminApiRoutes.filters.prefix")}
                allowClear
                style={{ width: 200 }}
                value={filters.prefix}
                onChange={(value) => handleFilterChange("prefix", value)}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
              >
                {uniquePrefixes.map((prefix) => (
                  <Option key={prefix} value={prefix} label={prefix}>
                    {prefix}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder={t("adminApiRoutes.filters.status")}
                allowClear
                style={{ width: 120 }}
                value={filters.isActive}
                onChange={(value) => handleFilterChange("isActive", value)}
              >
                <Option value={true}>{t("adminApiRoutes.active")}</Option>
                <Option value={false}>{t("adminApiRoutes.inactive")}</Option>
              </Select>
              <Button icon={<ReloadOutlined />} onClick={clearFilters}>
                {t("common.reset")}
              </Button>
              <Button
                type="primary"
                icon={<SyncOutlined />}
                onClick={handleSync}
                loading={syncing}
                disabled={(currentUser?.role !== "SUPER_ADMIN" && currentUser?.role !== "ADMIN") && !hasPermission("config.read")}
              >
                {t("adminApiRoutes.actions.sync")}
              </Button>
            </Space>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={rows}
            loading={loading}
            rowKey="id"
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total) =>
                t("adminApiRoutes.pagination.total", { total }),
            }}
            onChange={handleTableChange}
            scroll={{ x: true }}
          />
        </Card>

        {/* Modal Edit */}
        <Modal
          title={t("adminApiRoutes.modal.editTitle")}
          open={modalOpen}
          onOk={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            form.resetFields();
            setEditing(null);
          }}
          confirmLoading={loading}
          okText={t("common.save")}
          cancelText={t("common.cancel")}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              isActive: true,
              description: "",
              tags: "",
              requiredPermissions: "",
            }}
          >
            <Form.Item
              name="isActive"
              label={t("adminApiRoutes.form.isActive")}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="description"
              label={t("adminApiRoutes.form.description")}
            >
              <Input.TextArea
                rows={3}
                placeholder={t("adminApiRoutes.form.descriptionPlaceholder")}
              />
            </Form.Item>

            <Form.Item
              name="tags"
              label={t("adminApiRoutes.form.tags")}
              help={t("adminApiRoutes.form.tagsHelp")}
            >
              <Input
                placeholder={t("adminApiRoutes.form.tagsPlaceholder")}
              />
            </Form.Item>

            <Form.Item
              name="requiredPermissions"
              label={t("adminApiRoutes.form.requiredPermissions")}
              help={t("adminApiRoutes.form.requiredPermissionsHelp")}
            >
              <Input
                placeholder={t("adminApiRoutes.form.requiredPermissionsPlaceholder")}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
