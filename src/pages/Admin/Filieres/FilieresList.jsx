

"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Table, Button, Card, Space, Input, Select, Tag, message, Modal, Form,
  Drawer, Descriptions, Divider, Popconfirm, Typography
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  SearchOutlined, ReloadOutlined
} from "@ant-design/icons";
import filiereService from "@/services/filiereService";
import departmentService from "@/services/departmentService";

const { Title, Text } = Typography;

export default function FilieresList() {
  // --- State
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  // Filtres
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState(undefined);
  const [departmentId, setDepartmentId] = useState(undefined);
  const [departments, setDepartments] = useState([]);
  // UI: Modal create/edit
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  // UI: Drawer détails
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);

  // Charger les départements (pour filtre + formulaire)
  useEffect(() => {
    (async () => {
      try {
        const res = await departmentService.list({ withOrganization: true });
        setDepartments(res?.departments || res?.data?.departments || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Récupérer les données des filières
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await filiereService.list({
        page: pagination.current,
        limit: pagination.pageSize,
        departmentId: departmentId || undefined,
        level: level || undefined,
        search: search || undefined,
        withDepartment: true,
      });
      const list = res?.filieres || res?.data?.filieres || [];
      const total = res?.pagination?.total || res?.data?.pagination?.total || 0;
      setRows(list);
      setPagination(p => ({ ...p, total }));
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.message || "Échec de chargement des filières");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, departmentId, level, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Colonnes du tableau
  const columns = useMemo(() => [
    { title: "Nom", dataIndex: "name", sorter: false },
    {
      title: "Niveau",
      dataIndex: "level",
      width: 140,
      render: v => v ? <Tag>{v}</Tag> : <Tag color="default">—</Tag>
    },
    {
      title: "Département",
      dataIndex: ["department", "name"],
      render: (_, record) => record?.department?.name || "—",
    },
    {
      title: "Organisation",
      width: 170,
      render: (_, record) => (
        record?.department?.organization?.name ?
          <Link to={`/admin/organizations/${record.department.organization.id}`}>
            {record.department.organization.name}
          </Link> : "—"
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => openDetails(record)}>Détails</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>Éditer</Button>
          <Popconfirm
            title="Supprimer cette filière ?"
            okText="Oui"
            cancelText="Non"
            onConfirm={() => removeFiliere(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>Supprimer</Button>
          </Popconfirm>
        </Space>
      )
    },
  ], []);

  // Actions
  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    form.setFieldsValue({
      name: row?.name || "",
      level: row?.level || "",
      departmentId: row?.departmentId || row?.department?.id,
      description: row?.description || "",
      code: row?.code || "",
    });
    setModalOpen(true);
  };

  const openDetails = (row) => {
    setDetailRow(row);
    setDetailOpen(true);
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        level: values.level || null,
        departmentId: values.departmentId || null,
        description: values.description || null,
        code: values.code || null,
      };
      if (editing?.id) {
        await filiereService.update(editing.id, payload);
        message.success("Filière mise à jour");
      } else {
        await filiereService.create(payload);
        message.success("Filière créée");
      }
      setModalOpen(false);
      setEditing(null);
      fetchData();
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || "Échec d’enregistrement");
    }
  };

  const removeFiliere = async (id) => {
    try {
      await filiereService.remove(id);
      message.success("Filière supprimée");
      setPagination(p => {
        const newTotal = p.total - 1;
        const lastPage = Math.max(1, Math.ceil(newTotal / p.pageSize));
        return { ...p, current: Math.min(p.current, lastPage) };
      });
      fetchData();
    } catch (e) {
      message.error(e?.response?.data?.message || "Échec suppression");
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <Title level={5} style={{ margin: 0 }}>Filières</Title>
          <Space>
            <Button
              onClick={() => {
                setSearch("");
                setLevel(undefined);
                setDepartmentId(undefined);
                setPagination(p => ({ ...p, current: 1 }));
                fetchData();
              }}
              icon={<ReloadOutlined />}
            >
              Réinitialiser
            </Button>
           
          </Space>
        </div>
        <Card className="mb-4">
          <Space wrap>
            <Input
              allowClear
              placeholder="Rechercher par nom…"
              style={{ width: 260 }}
              onPressEnter={() => {
                setPagination(p => ({ ...p, current: 1 }));
                fetchData();
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              suffix={<SearchOutlined />}
            />
            <Select
              allowClear
              placeholder="Niveau"
              style={{ width: 200 }}
              value={level}
              onChange={(v) => {
                setLevel(v);
                setPagination(p => ({ ...p, current: 1 }));
              }}
              options={[
                { value: "L1", label: "L1" },
                { value: "L2", label: "L2" },
                { value: "L3", label: "L3" },
                { value: "M1", label: "M1" },
                { value: "M2", label: "M2" },
                { value: "D", label: "Doctorat" },
              ]}
            />
            <Select
              allowClear
              showSearch
              placeholder="Département"
              style={{ width: 320 }}
              optionFilterProp="label"
              value={departmentId}
              onChange={(v) => {
                setDepartmentId(v);
                setPagination(p => ({ ...p, current: 1 }));
              }}
              options={(departments || []).map(d => ({ value: d.id, label: d.name }))}
            />
          </Space>
        </Card>
        <Card>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={rows}
            columns={columns}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }),
            }}
            scroll={{ x: true }}
          />
        </Card>

        {/* Modal Create/Edit */}
        <Modal
          title={editing ? "Modifier la filière" : "Nouvelle filière"}
          open={modalOpen}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
          onOk={onSubmit}
          okText={editing ? "Enregistrer" : "Créer"}
          destroyOnHidden
        >
          <Form form={form} layout="vertical">
            <Form.Item label="Nom" name="name" rules={[{ required: true, message: "Nom requis" }]}>
              <Input placeholder="Ex: Informatique" />
            </Form.Item>
            <Form.Item label="Niveau" name="level">
              <Select
                allowClear
                options={[
                  { value: "L1", label: "L1" },
                  { value: "L2", label: "L2" },
                  { value: "L3", label: "L3" },
                  { value: "M1", label: "M1" },
                  { value: "M2", label: "M2" },
                  { value: "D", label: "Doctorat" },
                ]}
              />
            </Form.Item>
            <Form.Item label="Département" name="departmentId" rules={[{ required: true, message: "Département requis" }]}>
              <Select
                showSearch
                placeholder="Sélectionner…"
                optionFilterProp="label"
                options={(departments || []).map(d => ({ value: d.id, label: d.name }))}
              />
            </Form.Item>
            <Form.Item label="Code" name="code">
              <Input placeholder="Code interne (optionnel)" />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea rows={3} placeholder="Description de la filière" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Drawer Détails */}
        <Drawer
          title="Détails de la filière"
          width={520}
          placement="right"
          onClose={() => setDetailOpen(false)}
          open={detailOpen}
          destroyOnHidden
        >
          {detailRow ? (
            <>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Nom">{detailRow.name || "—"}</Descriptions.Item>
                <Descriptions.Item label="Niveau">{detailRow.level || "—"}</Descriptions.Item>
                <Descriptions.Item label="Département">{detailRow.department?.name || "—"}</Descriptions.Item>
                <Descriptions.Item label="Code">{detailRow.code || "—"}</Descriptions.Item>
                <Descriptions.Item label="Description">{detailRow.description || "—"}</Descriptions.Item>
                <Descriptions.Item label="Créée le">
                  {detailRow.createdAt ? new Date(detailRow.createdAt).toLocaleString() : "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Mise à jour">
                  {detailRow.updatedAt ? new Date(detailRow.updatedAt).toLocaleString() : "—"}
                </Descriptions.Item>
              </Descriptions>
              {detailRow.department?.organization && (
                <>
                  <Divider />
                  <Title level={5}>Organisation</Title>
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Nom">{detailRow.department.organization.name}</Descriptions.Item>
                    <Descriptions.Item label="Type">{detailRow.department.organization.type}</Descriptions.Item>
                    <Descriptions.Item label="Site web">
                      <a href={detailRow.department.organization.website} target="_blank" rel="noopener noreferrer">
                        {detailRow.department.organization.website}
                      </a>
                    </Descriptions.Item>
                  </Descriptions>
                </>
              )}
            </>
          ) : <Text type="secondary">—</Text>}
        </Drawer>
      </div>
    </div>
  );
}
