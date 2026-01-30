import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb, Card, Descriptions, Avatar, Statistic, Row, Col, Divider, Tag, Space, Button, Spin } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, EditFilled } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import userService from "../../../services/userService";

import {  getPermissionColor, getPermissionLabel, getRoleLabel } from "../../../auth/permissions"
import { PERMS } from "../../../auth/permissions";
import { buildImageUrl } from "../../../utils/imageUtils";

const UserDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
        fetchUserDetails(id);
    }, [id]);

    const fetchUserDetails = async (userId) => {
        setLoading(true);
        try {
            const response = await userService.getById(userId);
            console.log(response);
            setUser(response.user);
        } catch (error) {
            console.error("Erreur lors de la récupération de l'utilisateur:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh] sm:min-h-screen p-4">
            <Spin size="large" />
        </div>
    );
    if (!user) return (
        <div className="container-fluid px-2 sm:px-3 py-4">{t("adminUserDetails.messages.notFound")}</div>
    );

    return (
        <div className="container-fluid relative px-2 sm:px-3 overflow-x-hidden max-w-full">
            <div className="layout-specing py-4 sm:py-6">
                <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                    <h5 className="text-base sm:text-lg font-semibold order-2 sm:order-1">{t("adminUserDetails.title")}</h5>
                    <Breadcrumb
                        className="order-1 sm:order-2"
                        items={[
                            { title: <Link to="/admin/dashboard">{t("adminUserDetails.breadcrumb.dashboard")}</Link> },
                            { title: <Link to="/admin/users">{t("adminUserDetails.breadcrumb.users")}</Link> },
                            { title: `${user.firstName || ""} ${user.lastName || ""}` },
                        ]}
                    />
                </div>
                <div className="flex flex-wrap justify-end items-center gap-2 mb-4 sm:mb-6">
                    <Button
                        type="primary"
                        onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                        icon={<EditFilled />}
                        className="w-full sm:w-auto"
                    >
                        {t("adminUserDetails.actions.edit")}
                    </Button>
                </div>
                <Card className="overflow-hidden">
                    <Descriptions
                        title={t("adminUserDetails.sections.personalInfo")}
                        bordered
                        column={{ xs: 1, sm: 2, md: 3 }}
                        size="small"
                        className="ant-descriptions-responsive"
                    >
                        <Descriptions.Item label={t("adminUserDetails.fields.fullName")} span={2}>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <Avatar
                                    size="large"
                                    className="shrink-0"
                                    icon={<UserOutlined />}
                                    src={user.avatar ? buildImageUrl(user.avatar) : undefined}
                                />
                                <span className="break-words">{user.firstName || ""} {user.lastName || ""}</span>
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label={t("adminUserDetails.fields.email")} span={1}>
                            <Link to={`mailto:${user.email}`} className="break-all">
                                <MailOutlined /> {user.email}
                            </Link>
                        </Descriptions.Item>
                        <Descriptions.Item label={t("adminUserDetails.fields.phone")} span={1}>
                            {user.phone ? (
                                <Link to={`tel:${user.phone}`} className="break-all"><PhoneOutlined /> {user.phone}</Link>
                            ) : (
                                t("adminUserDetails.common.na")
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("adminUserDetails.fields.role")} span={1}>
                            <Tag color={user.role === "ADMIN" ? "red" : user.role === "INSTITUT" ? "blue" : "green"}>
                                {getRoleLabel(user.role, t)}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label={t("adminUserDetails.fields.status")} span={1}>
                            <Tag color={user.enabled ? "green" : "red"}>
                                {user.enabled ? t("adminUserDetails.status.active") : t("adminUserDetails.status.inactive")}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label={t("adminUserDetails.fields.address")} span={1}>
                            <span className="break-words">{user.adress ? user.adress : t("adminUserDetails.common.na")}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label={t("adminUserDetails.fields.lastLogin")} span={1}>
                            {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : t("adminUserDetails.common.never")}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("adminUserDetails.fields.createdAt")} span={1}>
                            {new Date(user.createdAt).toLocaleString()}
                        </Descriptions.Item>
                    </Descriptions>
                    <h3 className="text-base sm:text-lg font-semibold mt-6 mb-4">{t("adminUserDetails.sections.permissions")}</h3>
                    <Space wrap size={[8, 8]}>
                        {user.permissions && user.permissions.length > 0 ? (
                            user.permissions.map((permission) => (
                                <Tag key={permission.id} color={getPermissionColor(permission.key)} className="!m-0">
                                    {getPermissionLabel(permission.key, t)}
                                </Tag>
                            ))
                        ) : (
                            <Tag color="gray">{t("adminUserDetails.permissions.none")}</Tag>
                        )}
                    </Space>
                    <Divider />
                    {user.organization && (
                        <>
                            <h3 className="text-base sm:text-lg font-semibold mb-4">{t("adminUserDetails.sections.organization")}</h3>
                            <Descriptions
                                bordered
                                column={{ xs: 1, sm: 2, md: 3 }}
                                size="small"
                            >
                                <Descriptions.Item label={t("adminUserDetails.org.name")} span={2}>
                                    <span className="break-words">{user.organization.name}</span>
                                </Descriptions.Item>
                                <Descriptions.Item label={t("adminUserDetails.org.type")} span={1}>
                                    {user.organization.type}
                                </Descriptions.Item>
                            </Descriptions>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default UserDetail;
