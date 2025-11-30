import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, Tag, Space, Avatar, Breadcrumb, Button, Input, Select, message, Modal } from "antd";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";
import { PiPlusDuotone } from "react-icons/pi";
import { useAuth } from "../../../hooks/useAuth";
import userService from "../../../services/userService";
import { getPermissionLabel } from "../../../auth/permissions"
import { PERMS } from "../../../auth/permissions";
import { useTranslation } from "react-i18next";
import { buildImageUrl } from "../../../utils/imageUtils";

const { Search } = Input;

const UserList = () => {
    const { t } = useTranslation();
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
                ...(filters.status && { status: filters.status }),
                sortBy: sortConfig.field,
                sortOrder: sortConfig.order === "ascend" ? "asc" : "desc",
            };
            const response = await userService.list(params);
            setUsers(
                currentUser?.role === "SUPER_ADMIN"
                    ? response.users
                    : response.users.filter(user => user.role !== "SUPER_ADMIN")
            );
            setPagination(prev => ({
                ...prev,
                total: response.pagination.total,
            }));
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs:", error);
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize, filters, sortConfig, currentUser]);

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

    const handleDeleteUser = async (userId) => {
        try {
            await userService.archive(userId);
            message.success(t("adminUsers.messages.archiveSuccess"));
            fetchUsers();
        } catch (error) {
            message.error(t("adminUsers.messages.archiveError"));
            console.error(error);
        }
    };

    const roleOptions = [
        { value: "ADMIN", label: t("adminUsers.roles.ADMIN") },
        { value: "SUPER_ADMIN", label: t("adminUsers.roles.SUPER_ADMIN") },
        { value: "SUPERVISEUR", label: t("adminUsers.roles.SUPERVISEUR") },
        { value: "INSTITUT", label: t("adminUsers.roles.INSTITUT") },
        { value: "DEMANDEUR", label: t("adminUsers.roles.DEMANDEUR") },
        { value: "TRADUCTEUR", label: t("adminUsers.roles.TRADUCTEUR") },
    ];

    const permissionsOptions = Object.entries(PERMS).map(([key, value]) => ({
        value: value,
        label: getPermissionLabel(value, t),
    }));

    const statusOptions = [
        { value: "ACTIVE", label: t("adminUsers.status.ACTIVE") },
        { value: "INACTIVE", label: t("adminUsers.status.INACTIVE") },
    ];

    const columns = [
        {
            title: t("adminUsers.columns.fullName"),
            dataIndex: ["firstName", "lastName"],
            key: "name",
            sorter: true,
            render: (_, record) => (
                <Space size="middle">
                    <Avatar
                        size="default"
                        icon={<UserOutlined />}
                        src={record.avatar ? buildImageUrl(record.avatar) : undefined}
                    />
                    <Link to={`/admin/users/${record.id}/details`}>
                        {record.firstName || ""} {record.lastName || ""}
                    </Link>
                </Space>
            ),
        },
        {
            title: t("adminUsers.columns.email"),
            dataIndex: "email",
            key: "email",
            sorter: true,
        },
        {
            title: t("adminUsers.columns.phone"),
            dataIndex: "phone",
            key: "phone",
            render: (phone) => phone || t("adminUsers.common.na"),
        },
        {
            title: t("adminUsers.columns.role"),
            dataIndex: "role",
            key: "role",
            filters: roleOptions,
            filterSearch: true,
            onFilter: (value, record) => record.role === value,
            render: (role) => (
                <Tag color={(role === "ADMIN" || role === "SUPER_ADMIN") ? "red" :
                    role === "INSTITUT" ? "blue" :
                        role === "DEMANDEUR" ? "orange" :
                            role === "TRADUCTEUR" ? "cyan" :
                                role === "SUPERVISEUR" ? "purple" : "green"}>

                    {role === "ADMIN" ? t("adminUsers.roles.ADMIN") :
                        role === "SUPER_ADMIN" ? t("adminUsers.roles.SA") :
                            role === "INSTITUT" ? t("adminUsers.roles.INSTITUT") :
                                role === "TRADUCTEUR" ? t("adminUsers.roles.TRADUCTEUR") :
                                    role === "DEMANDEUR" ? t("adminUsers.roles.DEMANDEUR") :
                                    role === "SUPERVISEUR" ? t("adminUsers.roles.SUPERVISEUR") : t("adminUsers.roles.UTILISATEUR")}
                </Tag>
            ),
        },
        {
            title: t("adminUsers.columns.status"),
            dataIndex: "enabled",
            key: "status",
            filters: statusOptions,
            filterSearch: true,
            onFilter: (value, record) => record.enabled === (value === "ACTIVE"),
            render: (enabled) => (
                <Tag color={enabled ? "green" : "red"}>
                    {enabled ? t("adminUsers.status.ACTIVE") : t("adminUsers.status.INACTIVE")}
                </Tag>
            ),
        },
        // {
        //     title: "Permissions",
        //     key: "permissions",
        //     render: (_, record) => (
        //         <Space size="small" wrap>
        //             {record.permissions?.map((p) => (
        //                 <Tag key={p.id} color={getPermissionColor(p.key)}>
        //                     {getPermissionLabel(p.key)}
        //                 </Tag>
        //             ))}
        //         </Space>
        //     ),
        // },
        {
            title: t("adminUsers.columns.actions"),
            key: "actions",
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link">
                        <Link to={`/admin/users/${record.id}/details`}>{t("adminUsers.actions.details")}</Link>
                    </Button>
                    <Button type="link">
                        <Link to={`/admin/users/${record.id}/edit`}>{t("adminUsers.actions.edit")}</Link>
                    </Button>
                    {currentUser?.role === "SUPER_ADMIN" && record.role !== "SUPER_ADMIN" && (
                        <Button
                            type="link"
                            danger
                            onClick={() => {
                                Modal.confirm({
                                    title: t("adminUsers.actions.delete") + " ?",
                                    content: "Cette action est irréversible.",
                                    okText: t("adminUsers.actions.delete"),
                                    okType: "danger",
                                    cancelText: t("common.cancel"),
                                    onOk: () => handleDeleteUser(record.id),
                                });
                            }}
                        >
                            {t("adminUsers.actions.delete")}
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
                    <h5 className="text-lg font-semibold">{t("adminUsers.title")}</h5>
                    <Breadcrumb
                        items={[
                            { title: <Link to="/admin/dashboard">{t("adminUsers.breadcrumb.dashboard")}</Link> },
                            { title: t("adminUsers.breadcrumb.users") },
                        ]}
                    />
                </div>
                <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
                        <div className="w-full md:flex-1">
                            <Search
                                placeholder={t("adminUsers.filters.search")}
                                allowClear
                                enterButton={<SearchOutlined />}
                                size="large"
                                onSearch={handleSearch}
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-wrap gap-4 w-full md:w-auto justify-start sm:justify-center md:justify-end">
                            <Select
                                placeholder={t("adminUsers.filters.role")}
                                allowClear
                                className="w-full sm:w-44"
                                onChange={(value) => handleFilterChange("role", value)}
                                options={roleOptions}
                            />
                            <Select
                                placeholder={t("adminUsers.filters.status")}
                                allowClear
                                className="w-full sm:w-44"
                                onChange={(value) => handleFilterChange("status", value)}
                                options={statusOptions}
                            />
                            <Select
                                placeholder="Filtrer par permissions"
                                allowClear
                                className="w-full sm:w-44"
                                onChange={(value) => handleFilterChange("permissions", value)}
                                options={permissionsOptions}
                            />
                            <Button className="w-full sm:w-auto" onClick={clearFilters}>
                                {t("common.reset")}
                            </Button>
                        </div>
                        <div className="w-full md:w-auto flex justify-start md:justify-end">
                            <Button
                                type="primary"
                                onClick={() => navigate("/admin/users/create")}
                                icon={<PiPlusDuotone />}
                                className="w-full sm:w-auto"
                            >
                                {t("adminUsers.actions.new")}
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
                        showTotal: (total) => `Total ${total} ${t("adminUsers.breadcrumb.users").toLowerCase()}`,
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: true }}
                    className="responsive-table"
                />
            </div>
        </div>
    );
};

export default UserList;
