/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Table, Tag, Space, Button, Input, Select, Typography, message, Modal, Form } from "antd";
import organizationService from "@/services/organizationservice";
import userService from "@/services/userService";
import { useAuth } from "../../../hooks/useAuth";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

export default function OrgUsersList() {
  const { t } = useTranslation();
  const { user: user } = useAuth();
  const orgId = user?.organization?.id;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({
    search: "",
    role: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Modal créer utilisateur rapide
  const [openCreate, setOpenCreate] = useState(false);
  const [form] = Form.useForm();
  const [creating, setCreating] = useState(false);

  const fetchUsers = async (page = pagination.page, limit = pagination.limit) => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await organizationService.listUsers(orgId, {
        page, limit,
        search: filters.search || undefined,
        role: filters.role || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      }); // GET /organisations/:id/users :contentReference[oaicite:6]{index=6} :contentReference[oaicite:7]{index=7}
      const data = res.data;
      setRows(data.users || []);
      setPagination({
        page: data.pagination?.page || page,
        limit: data.pagination?.limit || limit,
        total: data.pagination?.total || 0,
      });
    } catch (e) {
      message.error(e?.message || t("institutUsers.orgUsersList.messages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(1, pagination.limit); /* eslint-disable-next-line */ }, [orgId]);

  const columns = [
    { title: t("institutUsers.orgUsersList.list.columns.email"), dataIndex: "email" },
    { title: t("institutUsers.orgUsersList.list.columns.username"), dataIndex: "username" },
    { title: t("institutUsers.orgUsersList.list.columns.role"), dataIndex: "role", render: (r) => <Tag>{r}</Tag>, width: 140 },
    { title: t("institutUsers.orgUsersList.list.columns.enabled"), dataIndex: "enabled", render: (v) => <Tag color={v ? "green" : "red"}>{v ? t("institutUsers.orgUsersList.list.enabled.yes") : t("institutUsers.orgUsersList.list.enabled.no")}</Tag>, width: 100 },
    {
      title: t("institutUsers.orgUsersList.list.columns.actions"),
      key: "actions",
      render: (_, r) => (
        <Space>
          <Link to={`/organisations/users/${r.id}/permissions`}><Button size="small">{t("institutUsers.orgUsersList.list.buttons.permissions")}</Button></Link>
          <Button size="small" onClick={async () => {
            try {
              const res = await userService.resetPassword(r.id); // PATCH /users/:id/password :contentReference[oaicite:8]{index=8} :contentReference[oaicite:9]{index=9}
              const pwd = res.data?.temporaryPassword;
              message.success(pwd ? t("institutUsers.orgUsersList.createModal.messages.newPassword", { password: pwd }) : t("institutUsers.orgUsersList.createModal.messages.passwordReset"));
            } catch (e) {
              message.error(e?.message || t("institutUsers.orgUsersList.createModal.messages.passwordResetError"));
            }
          }}>{t("institutUsers.orgUsersList.list.buttons.resetPassword")}</Button>
        </Space>
      ),
    },
  ];

  const onCreateUser = async () => {
    try {
      const v = await form.validateFields();
      setCreating(true);
      // POST /users (organizationId + role) :contentReference[oaicite:10]{index=10} :contentReference[oaicite:11]{index=11}
      await userService.create({
        email: v.email,
        password: v.password, // optionnel, sinon back génère
        role: v.role || "INSTITUT",
        enabled: true,
        organizationId: orgId,
        firstName: v.firstName || undefined,
        lastName: v.lastName || undefined,
      });
      message.success(t("institutUsers.orgUsersList.createModal.messages.success"));
      setOpenCreate(false);
      form.resetFields();
      fetchUsers(1, pagination.limit);
    } catch (e) {
      if (e?.errorFields) return; // erreurs antd
      message.error(e?.response?.data?.message || e?.message || t("institutUsers.orgUsersList.createModal.messages.error"));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-2 md:p-4">
      <Title level={3}>{t("institutUsers.orgUsersList.title")}</Title>
      <Text type="secondary">{t("institutUsers.orgUsersList.subtitle")} <Text code>{orgId}</Text></Text>

      <Card className="mt-3" title={t("institutUsers.orgUsersList.filters.title")}>
        <Space wrap>
          <Input placeholder={t("institutUsers.orgUsersList.filters.searchPlaceholder")} value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} style={{ minWidth: 260 }} />
          <Select allowClear placeholder={t("institutUsers.orgUsersList.filters.rolePlaceholder")} value={filters.role} onChange={(v) => setFilters((f) => ({ ...f, role: v }))} style={{ width: 220 }}
            options={["DEMANDEUR", "INSTITUT", "TRADUCTEUR", "SUPERVISEUR", "ADMIN"].map(r => ({ label: r, value: r }))} />
          <Select value={filters.sortBy} onChange={(v) => setFilters((f) => ({ ...f, sortBy: v }))} style={{ width: 180 }}
            options={[
              { value: "createdAt", label: t("institutUsers.orgUsersList.filters.sortBy.createdAt") },
              { value: "updatedAt", label: t("institutUsers.orgUsersList.filters.sortBy.updatedAt") },
              { value: "email", label: t("institutUsers.orgUsersList.filters.sortBy.email") },
              { value: "username", label: t("institutUsers.orgUsersList.filters.sortBy.username") }
            ]} />
          <Select value={filters.sortOrder} onChange={(v) => setFilters((f) => ({ ...f, sortOrder: v }))} style={{ width: 120 }}
            options={[
              { value: "asc", label: t("institutUsers.orgUsersList.filters.sortOrder.asc") },
              { value: "desc", label: t("institutUsers.orgUsersList.filters.sortOrder.desc") }
            ]} />
          <Button type="primary" onClick={() => fetchUsers(1, pagination.limit)}>{t("institutUsers.orgUsersList.filters.buttons.apply")}</Button>
          <Button onClick={() => { setFilters({ search: "", role: undefined, sortBy: "createdAt", sortOrder: "desc" }); fetchUsers(1, pagination.limit); }}>{t("institutUsers.orgUsersList.filters.buttons.reset")}</Button>
          <Button type="primary" onClick={() => setOpenCreate(true)}>{t("institutUsers.orgUsersList.filters.buttons.addUser")}</Button>
          <Link to="/organisations/users/superviseurs/create"><Button>{t("institutUsers.orgUsersList.filters.buttons.createSupervisor")}</Button></Link>
        </Space>
      </Card>

      <Card className="mt-3" title={t("institutUsers.orgUsersList.list.title")}>
        <Table
          rowKey={(r) => r.id}
          loading={loading}
          columns={columns}
          dataSource={rows}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: (p, ps) => fetchUsers(p, ps),
          }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title={t("institutUsers.orgUsersList.createModal.title")}
        open={openCreate}
        onCancel={() => setOpenCreate(false)}
        onOk={onCreateUser}
        okText={t("institutUsers.orgUsersList.createModal.buttons.create")}
        confirmLoading={creating}
      >
        <Form form={form} layout="vertical">
          <Form.Item label={t("institutUsers.orgUsersList.createModal.labels.email")} name="email" rules={[{ required: true, type: "email" }]}><Input /></Form.Item>
          <Form.Item label={t("institutUsers.orgUsersList.createModal.labels.password")} name="password"><Input.Password /></Form.Item>
          <Form.Item label={t("institutUsers.orgUsersList.createModal.labels.role")} name="role" initialValue="DEMANDEUR">
            <Select options={["DEMANDEUR","INSTITUT","TRADUCTEUR","SUPERVISEUR"].map(r=>({label:r,value:r}))} />
          </Form.Item>
          <Form.Item label={t("institutUsers.orgUsersList.createModal.labels.firstName")} name="firstName"><Input /></Form.Item>
          <Form.Item label={t("institutUsers.orgUsersList.createModal.labels.lastName")} name="lastName"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
