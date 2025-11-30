import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb, Card, Descriptions, Avatar, Statistic, Row, Col, Divider, Tag, Space, Button, Spin } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, EditFilled } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import userService from "../../../services/userService";

import {  getPermissionColor, getPermissionLabel, getRoleLabel } from "../../../auth/permissions"
import { PERMS } from "../../../auth/permissions";

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

    if (loading) return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;
    if (!user) return <div>{t("adminUserDetails.messages.notFound")}</div>;

    return (
        <div className="container-fluid relative px-3">
            <div className="layout-specing">
                <div className="md:flex justify-between items-center mb-6">
                    <h5 className="text-lg font-semibold">{t("adminUserDetails.title")}</h5>
                    <Breadcrumb
                        items={[
                            { title: <Link to="/admin/dashboard">{t("adminUserDetails.breadcrumb.dashboard")}</Link> },
                            { title: <Link to="/admin/users">{t("adminUserDetails.breadcrumb.users")}</Link> },
                            { title: `${user.firstName || ""} ${user.lastName || ""}` },
                        ]}
                    />
                </div>
                <div className="md:flex md:justify-end justify-end items-center mb-6">
                    <Button
                        type="primary"
                        onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                        icon={<EditFilled />}
                    >
                        {t("adminUserDetails.actions.edit")}
                    </Button>
                </div>
                <Card>
                    <Descriptions title={t("adminUserDetails.sections.personalInfo")} bordered>
                        <Descriptions.Item label={t("adminUserDetails.fields.fullName")} span={2}>
                            <Avatar size="large" icon={<UserOutlined />} src={user.avatar} />
                            <span className="ml-3">{user.firstName || ""} {user.lastName || ""}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label={t("adminUserDetails.fields.email")}>
                            <Link to={`mailto:${user.email}`}>
                                <MailOutlined /> {user.email}
                            </Link>
                        </Descriptions.Item>
                        <Descriptions.Item label={t("adminUserDetails.fields.phone")}>
                            {user.phone ? <Link to={`tel:${user.phone}`}><PhoneOutlined /> {user.phone}</Link> : t("adminUserDetails.common.na")}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("adminUserDetails.fields.role")}>
                            <Tag color={user.role === "ADMIN" ? "red" : user.role === "INSTITUT" ? "blue" : "green"}>
                                {getRoleLabel(user.role, t)}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label={t("adminUserDetails.fields.status")}>
                            <Tag color={user.enabled ? "green" : "red"}>
                                {user.enabled ? t("adminUserDetails.status.active") : t("adminUserDetails.status.inactive")}
                            </Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label={t("adminUserDetails.fields.address")}>
                            {user.adress ? user.adress : t("adminUserDetails.common.na")}
                        </Descriptions.Item>

                        <Descriptions.Item label={t("adminUserDetails.fields.lastLogin")}>
                            {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : t("adminUserDetails.common.never")}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("adminUserDetails.fields.createdAt")}>
                            {new Date(user.createdAt).toLocaleString()}
                        </Descriptions.Item>
                    </Descriptions>
                    <h3 className="text-lg font-semibold mb-4">{t("adminUserDetails.sections.permissions")}</h3>
                    <Space wrap>
                        {user.permissions && user.permissions.length > 0 ? (
                            user.permissions.map((permission) => (
                                <Tag key={permission.id} color={getPermissionColor(permission.key)}>
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
                            <h3 className="text-lg font-semibold mb-4">{t("adminUserDetails.sections.organization")}</h3>
                            <Descriptions bordered>
                                <Descriptions.Item label={t("adminUserDetails.org.name")} span={2}>{user.organization.name}</Descriptions.Item>
                                <Descriptions.Item label={t("adminUserDetails.org.type")}>{user.organization.type}</Descriptions.Item>
                                
                            </Descriptions>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default UserDetail;
