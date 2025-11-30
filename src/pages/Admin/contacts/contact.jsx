"use client"

import { useState, useEffect } from "react"
import {
    Table,
    Card,
    Tag,
    Button,
    Modal,
    Input,
    Select,
    Space,
    message,
    Descriptions,
    Typography,
    Row,
    Col,
    Pagination,
    Tooltip,
    Popconfirm,
    Breadcrumb,
} from "antd"
import { EyeOutlined, MessageOutlined, DeleteOutlined, ReloadOutlined, FilterOutlined } from "@ant-design/icons"

import moment from "moment"
import contactService from "../../../services/contactService"
import { Link } from "react-router-dom"
import { useAuth } from "../../../hooks/useAuth"
import { useTranslation } from "react-i18next"

const { TextArea } = Input
const { Option } = Select
const { Title, Text } = Typography

const AdminContactList = () => {
    const { t } = useTranslation()
    const { user } = useAuth()
    console.log(user)

    const [contacts, setContacts] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedContact, setSelectedContact] = useState(null)
    const [detailsVisible, setDetailsVisible] = useState(false)
    const [responseVisible, setResponseVisible] = useState(false)
    const [responseText, setResponseText] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    })

    // Charger les contacts
    const loadContacts = async (page = 1, status = "") => {
        setLoading(true)
        try {
            const params = {
                page,
                limit: pagination.pageSize,
                ...(status && { status }),
            }
            const response = await contactService.getAll(params)
            console.log(response)
            setContacts(response.data)
            setPagination((prev) => ({
                ...prev,
                current: response.pagination.page,
                total: response.pagination.total,
            }))
        } catch (error) {
            message.error(t("adminContacts.messages.loadError"))
            console.error("Erreur:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadContacts()
    }, [])

    // Gérer le changement de statut
    const handleStatusChange = async (contactId, newStatus) => {
        try {
            await contactService.updateStatus(contactId, newStatus)
            message.success(t("adminContacts.messages.statusUpdated"))
            loadContacts(pagination.current, statusFilter)
        } catch (error) {
            message.error(t("adminContacts.messages.statusUpdateError"))
            console.error("Erreur:", error)
        }
    }

    // Répondre à un contact
    const handleResponse = async () => {
        setLoading(true)
        if (!responseText.trim()) {
            message.warning(t("adminContacts.messages.responseRequired"))
            return
        }
        console.log(selectedContact)
        try {
            await contactService.respond(selectedContact.id, responseText)
            message.success(t("adminContacts.messages.responseSent"))
            setResponseVisible(false)
            setResponseText("")
            setSelectedContact(null)
            loadContacts(pagination.current, statusFilter)
        } catch (error) {
            message.error(t("adminContacts.messages.responseError"))
            console.error("Erreur:", error)
        } finally {
            setLoading(false)
        }
    }

    // Supprimer un contact
    const handleDelete = async (contactId) => {
        try {
            await contactService.delete(contactId)
            message.success(t("adminContacts.messages.deleteSuccess"))
            loadContacts(pagination.current, statusFilter)
        } catch (error) {
            message.error(t("adminContacts.messages.deleteError"))
            console.error("Erreur:", error)
        }
    }

    // Filtrer par statut
    const handleStatusFilter = (status) => {
        console.log(status)
        setStatusFilter(status)
        loadContacts(1, status)
    }

    // Colonnes du tableau
    const columns = [
        {
            title: t("adminContacts.columns.name"),
            dataIndex: "name",
            key: "name",
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: t("adminContacts.columns.email"),
            dataIndex: "email",
            key: "email",
            render: (email) => <Text copyable>{email}</Text>,
        },
        {
            title: t("adminContacts.columns.subject"),
            dataIndex: "subject",
            key: "subject",
            ellipsis: true,
        },
        {
            title: t("adminContacts.columns.status"),
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const statusConfig = {
                    PENDING: { color: "orange", text: t("adminContacts.statuses.PENDING") },
                    IN_PROGRESS: { color: "blue", text: t("adminContacts.statuses.IN_PROGRESS") },
                    RESOLVED: { color: "green", text: t("adminContacts.statuses.RESOLVED") },
                    CLOSED: { color: "gray", text: t("adminContacts.statuses.CLOSED") },
                }
                const config = statusConfig[status] || { color: "default", text: status }
                return <Tag color={config.color}>{config.text}</Tag>
            },
        },
        {
            title: t("adminContacts.columns.date"),
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
        },
        {
            title: t("adminContacts.columns.actions"),
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Tooltip title={t("adminContacts.tooltips.viewDetails")}>
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => {
                                setSelectedContact(record)
                                setDetailsVisible(true)
                            }}
                        />
                    </Tooltip>

                    {user && user?.permissions?.some((p) => p.key === "contacts.manage") && (
                        <Tooltip title={t("adminContacts.tooltips.reply")}>
                            <Button
                                type="text"
                                icon={<MessageOutlined />}
                                onClick={() => {
                                    setSelectedContact(record);
                                    setResponseVisible(true);
                                }}
                            />
                        </Tooltip>
                    )}


                    <Select
                        value={record.status}
                        style={{ width: 120 }}
                        onChange={(value) => handleStatusChange(record.id, value)}
                        size="small"
                    >
                        <Option value="PENDING">{t("adminContacts.statuses.PENDING")}</Option>
                        <Option value="IN_PROGRESS">{t("adminContacts.statuses.IN_PROGRESS")}</Option>
                        <Option value="RESOLVED">{t("adminContacts.statuses.RESOLVED")}</Option>
                        <Option value="CLOSED">{t("adminContacts.statuses.CLOSED")}</Option>
                    </Select>
                    {user && user.role === "SUPER_ADMIN" && (
                        <Popconfirm
                            title={t("adminContacts.modals.deleteConfirm.title")}
                            onConfirm={() => handleDelete(record.id)}
                            okText={t("adminContacts.modals.deleteConfirm.okText")}
                            cancelText={t("adminContacts.modals.deleteConfirm.cancelText")}
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    )}

                </Space>
            ),
        },
    ]

    return <>
        <div className="container-fluid relative px-3">
            <div className="layout-specing">
                <div className="md:flex justify-between items-center mb-6">
                    <h5 className="text-lg font-semibold">{t("adminContacts.pageTitle")}</h5>
                    <Breadcrumb
                        items={[
                            { title: <Link to="/admin/dashboard">{t("adminContacts.breadcrumbs.dashboard")}</Link> },
                            { title: t("adminContacts.breadcrumbs.contacts") },
                        ]}
                    />
                </div>

                <div style={{ padding: "24px" }}>
                    <Card>
                        <Row justify="space-between" align="middle" style={{ marginBottom: "24px" }}>
                            <Col>
                                <Title level={2} style={{ margin: 0 }}>
                                    {t("adminContacts.title")}
                                </Title>
                            </Col>
                            <Col>
                                <Space>
                                    <Select
                                        placeholder={t("adminContacts.filters.statusPlaceholder")}
                                        style={{ width: 150 }}
                                        allowClear
                                        value={statusFilter}
                                        onChange={handleStatusFilter}
                                        suffixIcon={<FilterOutlined />}
                                    >
                                        <Option value="PENDING">{t("adminContacts.statuses.PENDING")}</Option>
                                        <Option value="IN_PROGRESS">{t("adminContacts.statuses.IN_PROGRESS")}</Option>
                                        <Option value="RESOLVED">{t("adminContacts.statuses.RESOLVED")}</Option>
                                        <Option value="CLOSED">{t("adminContacts.statuses.CLOSED")}</Option>
                                    </Select>
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={() => loadContacts(pagination.current, statusFilter)}
                                        loading={loading}
                                    >
                                        {t("adminContacts.buttons.refresh")}
                                    </Button>
                                </Space>
                            </Col>
                        </Row>

                        <Table
                            columns={columns}
                            dataSource={contacts}
                            rowKey="id"
                            loading={loading}
                            pagination={false}
                            scroll={{ x: 800 }}
                        />

                        <div style={{ marginTop: "16px", textAlign: "right" }}>
                            <Pagination
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                onChange={(page) => loadContacts(page, statusFilter)}
                                showSizeChanger={false}
                                showQuickJumper
                                showTotal={(total, range) => t("adminContacts.pagination.showTotal", { from: range[0], to: range[1], total })}
                            />
                        </div>
                    </Card>

                    {/* Modal des détails */}
                    <Modal
                        title={t("adminContacts.modals.details.title")}
                        open={detailsVisible}
                        onCancel={() => {
                            setDetailsVisible(false)
                            setSelectedContact(null)
                        }}
                        footer={[
                            <Button key="close" onClick={() => setDetailsVisible(false)}>
                                {t("adminContacts.modals.details.close")}
                            </Button>,
                        ]}
                        width={600}
                    >
                        {selectedContact && (
                            <Descriptions column={1} bordered>
                                <Descriptions.Item label={t("adminContacts.fields.name")}>{selectedContact.name}</Descriptions.Item>
                                <Descriptions.Item label={t("adminContacts.fields.email")}>{selectedContact.email}</Descriptions.Item>
                                <Descriptions.Item label={t("adminContacts.fields.subject")}>{selectedContact.subject}</Descriptions.Item>
                                <Descriptions.Item label={t("adminContacts.fields.message")}>
                                    <div style={{ whiteSpace: "pre-wrap" }}>{selectedContact.message}</div>
                                </Descriptions.Item>
                                <Descriptions.Item label={t("adminContacts.fields.status")}>
                                    <Tag
                                        color={
                                            selectedContact.status === "PENDING"
                                                ? "orange"
                                                : selectedContact.status === "IN_PROGRESS"
                                                    ? "blue"
                                                    : selectedContact.status === "RESOLVED"
                                                        ? "green"
                                                        : "gray"
                                        }
                                    >
                                        {t(`adminContacts.statuses.${selectedContact.status}`)}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label={t("adminContacts.fields.createdAt")}>
                                    {moment(selectedContact.createdAt).format("DD/MM/YYYY à HH:mm")}
                                </Descriptions.Item>
                                {selectedContact.response && (
                                    <>
                                        <Descriptions.Item label={t("adminContacts.fields.response")}>
                                            <div style={{ whiteSpace: "pre-wrap" }}>{selectedContact.response}</div>
                                        </Descriptions.Item>
                                        <Descriptions.Item label={t("adminContacts.fields.respondedAt")}>
                                            {moment(selectedContact.respondedAt).format("DD/MM/YYYY à HH:mm")}
                                        </Descriptions.Item>
                                    </>
                                )}
                            </Descriptions>
                        )}
                    </Modal>

                    {/* Modal de réponse */}
                    <Modal
                        title={t("adminContacts.modals.response.title")}
                        open={responseVisible}
                        onOk={handleResponse}
                        onCancel={() => {
                            setResponseVisible(false)
                            setResponseText("")
                            setSelectedContact(null)
                        }}
                        okText={t("adminContacts.modals.response.send")}
                        confirmLoading={loading}
                        okButtonProps={{ disabled: !responseText.trim() }}
                        cancelText={t("adminContacts.modals.response.cancel")}
                        width={600}
                    >
                        {selectedContact && (
                            <div style={{ marginBottom: "16px" }}>
                                <Text strong>{t("adminContacts.modals.response.contact")}: </Text>
                                <Text>
                                    {selectedContact.name} ({selectedContact.email})
                                </Text>
                                <br />
                                <Text strong>{t("adminContacts.modals.response.subject")}: </Text>
                                <Text>{selectedContact.subject}</Text>
                            </div>
                        )}
                        <TextArea
                            rows={6}
                            placeholder={t("adminContacts.modals.response.placeholder")}
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                        />
                    </Modal>
                </div>
            </div>
        </div>
    </>

}

export default AdminContactList

