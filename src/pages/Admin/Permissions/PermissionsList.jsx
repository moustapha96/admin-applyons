/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import permissionService from "../../../services/permissionService";

const { Search } = Input;

export default function PermissionsList() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...(filters.search && { search: filters.search }),
      };
      const res = await permissionService.list(params);
      const data = res?.data || res;
      const permissions = Array.isArray(data.permissions)
        ? data.permissions
        : Array.isArray(data)
        ? data
        : [];
      setRows(permissions);
      setPagination((p) => ({
        ...p,
        total: data.pagination?.total ?? permissions.length,
      }));
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          t("adminPermissions.messages.loadError")
      );
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters.search, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const clearFilters = () => {
    setFilters({ search: "" });
    setPagination((p) => ({ ...p, current: 1 }));
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ allowedRoles: [] });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    // Parser allowedRoles si c'est une string JSON
    let allowedRoles = record.allowedRoles;
    if (typeof allowedRoles === "string") {
      try {
        allowedRoles = JSON.parse(allowedRoles);
      } catch {
        allowedRoles = null;
      }
    }
    form.setFieldsValue({
      key: record.key,
      name: record.name,
      description: record.description || "",
      allowedRoles: allowedRoles || [],
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Normaliser allowedRoles : si vide, envoyer null, sinon garder le tableau
      const submitValues = {
        ...values,
        allowedRoles: values.allowedRoles && values.allowedRoles.length > 0 
          ? values.allowedRoles 
          : null,
      };
      
      if (editing) {
        await permissionService.update(editing.id, submitValues);
        message.success(t("adminPermissions.messages.updateSuccess"));
      } else {
        await permissionService.create(submitValues);
        message.success(t("adminPermissions.messages.createSuccess"));
      }
      setModalOpen(false);
      form.resetFields();
      await fetchData();
      await refreshPermissions(); // Rafraîchir le contexte des permissions
    } catch (e) {
      if (e.errorFields) {
        // Validation errors
        return;
      }
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          t("adminPermissions.messages.saveError")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await permissionService.remove(id);
      message.success(t("adminPermissions.messages.deleteSuccess"));
      await fetchData();
      await refreshPermissions(); // Rafraîchir le contexte des permissions
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          t("adminPermissions.messages.deleteError")
      );
    }
  };

  const getKeyColor = (key) => {
    if (key?.includes(".read")) return "blue";
    if (key?.includes(".create")) return "green";
    if (key?.includes(".update")) return "orange";
    if (key?.includes(".delete")) return "red";
    if (key?.includes(".manage")) return "purple";
    return "default";
  };

  const columns = useMemo(
    () => [
      {
        title: t("adminPermissions.columns.key"),
        dataIndex: "key",
        key: "key",
        sorter: true,
        render: (key) => (
          <Tag color={getKeyColor(key)} style={{ fontFamily: "monospace" }}>
            {key}
          </Tag>
        ),
      },
      {
        title: t("adminPermissions.columns.name"),
        dataIndex: "name",
        key: "name",
        sorter: true,
      },
      {
        title: t("adminPermissions.columns.description"),
        dataIndex: "description",
        key: "description",
        render: (desc) => desc || t("adminPermissions.noData"),
        ellipsis: true,
      },
      {
        title: t("adminPermissions.columns.allowedRoles"),
        dataIndex: "allowedRoles",
        key: "allowedRoles",
        width: 200,
        render: (allowedRoles) => {
          if (!allowedRoles || allowedRoles === null) {
            return <Tag color="default">{t("adminPermissions.allRoles")}</Tag>;
          }
          let roles = allowedRoles;
          if (typeof allowedRoles === "string") {
            try {
              roles = JSON.parse(allowedRoles);
            } catch {
              return t("adminPermissions.noData");
            }
          }
          if (Array.isArray(roles) && roles.length > 0) {
            return (
              <Space size="small" wrap>
                {roles.map((role) => (
                  <Tag key={role} color="blue">
                    {role}
                  </Tag>
                ))}
              </Space>
            );
          }
          return "—";
        },
      },
      {
        title: t("adminPermissions.columns.createdAt"),
        dataIndex: "createdAt",
        key: "createdAt",
        width: 180,
        render: (date) =>
          date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "—",
      },
      {
        title: t("adminPermissions.columns.actions"),
        key: "actions",
        width: 200,
        fixed: "right",
        render: (_, record) => (
          <Space size="small">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            >
              {t("adminPermissions.actions.edit")}
            </Button>
            <Popconfirm
              title={t("adminPermissions.confirmDelete")}
              description={t("adminPermissions.confirmDeleteDescription")}
              onConfirm={() => handleDelete(record.id)}
              okText={t("common.yes")}
              cancelText={t("common.no")}
              okButtonProps={{ danger: true }}
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={currentUser?.role !== "SUPER_ADMIN"}
              >
                {t("adminPermissions.actions.delete")}
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [t, currentUser]
  );

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">
            {t("adminPermissions.pageTitle")}
          </h5>
          <Breadcrumb
            items={[
              {
                title: (
                  <Link to="/admin/dashboard">
                    {t("adminPermissions.breadcrumbs.dashboard")}
                  </Link>
                ),
              },
              { title: t("adminPermissions.breadcrumbs.permissions") },
            ]}
          />
        </div>

        <Card className="mb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4">
            <Search
              placeholder={t("adminPermissions.searchPlaceholder")}
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
              <Button icon={<ReloadOutlined />} onClick={clearFilters}>
                {t("common.reset")}
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
                disabled={currentUser?.role !== "SUPER_ADMIN"}
              >
                {t("adminPermissions.actions.create")}
              </Button>
            </Space>
          </div>
        </Card>

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
                t("adminPermissions.pagination.total", { total }),
            }}
            onChange={handleTableChange}
            scroll={{ x: true }}
          />
        </Card>

        {/* Modal Create/Edit */}
        <Modal
          title={
            editing
              ? t("adminPermissions.modal.editTitle")
              : t("adminPermissions.modal.createTitle")
          }
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
              key: "",
              name: "",
              description: "",
              allowedRoles: [],
            }}
          >
            <Form.Item
              name="key"
              label={t("adminPermissions.form.key")}
              rules={[
                {
                  required: true,
                  message: t("adminPermissions.form.keyRequired"),
                },
                {
                  pattern: /^[a-z0-9.]+$/,
                  message: t("adminPermissions.form.keyPattern"),
                },
              ]}
              help={t("adminPermissions.form.keyHelp")}
            >
              <Input
                placeholder={t("adminPermissions.form.keyPlaceholder")}
                disabled={!!editing}
                style={{ fontFamily: "monospace" }}
              />
            </Form.Item>

            <Form.Item
              name="name"
              label={t("adminPermissions.form.name")}
              rules={[
                {
                  required: true,
                  message: t("adminPermissions.form.nameRequired"),
                },
              ]}
            >
              <Input placeholder={t("adminPermissions.form.namePlaceholder")} />
            </Form.Item>

            <Form.Item
              name="description"
              label={t("adminPermissions.form.description")}
            >
              <Input.TextArea
                rows={3}
                placeholder={t("adminPermissions.form.descriptionPlaceholder")}
              />
            </Form.Item>

            <Form.Item
              name="allowedRoles"
              label={t("adminPermissions.form.allowedRoles")}
              help={t("adminPermissions.form.allowedRolesHelp")}
            >
              <Select
                mode="multiple"
                placeholder={t("adminPermissions.form.allowedRolesPlaceholder")}
                allowClear
                options={[
                  { label: t("roles.ADMIN"), value: "ADMIN" },
                  { label: t("roles.SUPER_ADMIN"), value: "SUPER_ADMIN" },
                  { label: t("roles.INSTITUT"), value: "INSTITUT" },
                  { label: t("roles.SUPERVISEUR"), value: "SUPERVISEUR" },
                  { label: t("roles.TRADUCTEUR"), value: "TRADUCTEUR" },
                  { label: t("roles.DEMANDEUR"), value: "DEMANDEUR" },
                ]}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
