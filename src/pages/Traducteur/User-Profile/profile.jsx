"use client"
import { useState, useEffect } from "react"
import {
    Card,
    Avatar,
    Typography,
    Row,
    Col,
    Tag,
    Descriptions,
    Spin,
    Alert,
    Badge,
    Space,
    Button,
    Upload,
    Divider,
    Statistic,
    Form,
    Input,
    Modal,
    Select,
    DatePicker
} from "antd"
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    CrownOutlined,
    SafetyCertificateOutlined,
    EditOutlined,
    CameraOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    LockOutlined,
    PlusCircleOutlined,
    HomeOutlined,
    GlobalOutlined,

    BankOutlined
} from "@ant-design/icons"
import authService from "../../../services/authService"
import organizationService from "../../../services/organizationService"
import { toast } from "sonner"
import { useAuth } from "../../../hooks/useAuth"
import { IoTransgender } from "react-icons/io5"
import { useTranslation } from "react-i18next"
import { getPermissionColor, getPermissionLabel, getRoleLabel } from "../../../auth/permissions"
import { buildImageUrl } from "../../../utils/imageUtils"
import { useNavigate } from "react-router-dom"
import { LogoutOutlined } from "@ant-design/icons"
import countries from "../../../assets/countries.json"
import dayjs from "dayjs"

const { Title, Text } = Typography

// Helper pour convertir les dates string en dayjs
const isDay = (d) => dayjs.isDayjs(d);
const reviveDate = (v) => {
  if (!v) return null;
  if (isDay(v)) return v;
  const d = dayjs(v);
  return d.isValid() ? d : null;
};

export default function TraducteurUserProfile() {
    const { t } = useTranslation()
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isEditingOrg, setIsEditingOrg] = useState(false)
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false)
    const [passwordForm] = Form.useForm()
    const [orgForm] = Form.useForm()
    const [form] = Form.useForm()
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [orgLoading, setOrgLoading] = useState(false)
    const { refreshProfile, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        fetchUserData()
    }, [])

    const fetchUserData = async () => {
        try {
            setLoading(true)
            const response = await authService.getProfile()
            const user = response.user || response
            setUserData(user)
            console.log(response)
            refreshProfile()
            form.setFieldsValue({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email,
                phone: user.phone || "",
                adress: user.adress || "",
                country: user.country || "",
                gender: user.gender || "MALE",
                dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : null,
                placeOfBirth: user.placeOfBirth || "",
            })
            // Initialiser le formulaire d'organisation si disponible
            if (user.organization) {
                orgForm.setFieldsValue({
                    name: user.organization.name || "",
                    slug: user.organization.slug || "",
                    address: user.organization.address || "",
                    phone: user.organization.phone || "",
                    country: user.organization.country || "",
                    website: user.organization.website || "",
                    email: user.organization.email || "",
                })
            }
            setError(null)
        } catch (error) {
            console.error("Error fetching user data:", error)
            setError(t("profilePage.alerts.loadError"))
        } finally {
            setLoading(false)
        }
    }


    const handleAvatarUpload = async (file) => {
        const formData = new FormData()
        formData.append("avatar", file)
        formData.append("email", userData.email)
        formData.append("firstName", userData.firstName)
        formData.append("lastName", userData.lastName)
        formData.append("phone", userData.phone)
        formData.append("adress", userData.adress)
        formData.append("country", userData.country)
        formData.append("gender", userData.gender)

        try {
            await authService.updateProfile(formData)
            toast.success(t("profilePage.toasts.avatarUpdated"))
            const response = await authService.getProfile()
            console.log(response)
            fetchUserData()
        } catch (error) {
            console.error("Error uploading avatar:", error)
            toast.error(t("profilePage.toasts.avatarError"))
        }
        return false
    }

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleCancel = () => {
        setIsEditing(false)
    }

    const handleOrgEdit = () => {
        setIsEditingOrg(true)
    }

    const handleOrgCancel = () => {
        setIsEditingOrg(false)
        // Réinitialiser les valeurs du formulaire
        if (userData?.organization) {
            orgForm.setFieldsValue({
                name: userData.organization.name || "",
                slug: userData.organization.slug || "",
                address: userData.organization.address || "",
                phone: userData.organization.phone || "",
                country: userData.organization.country || "",
                website: userData.organization.website || "",
                email: userData.organization.email || "",
            })
        }
    }

    const handleUpdateOrganization = async (values) => {
        if (!userData?.organization?.id) {
            toast.error(t("profilePage.orgEditor.noOrgToEdit"))
            return
        }
        setOrgLoading(true)
        try {
            await organizationService.update(userData.organization.id, values)
            toast.success(t("profilePage.toasts.orgUpdated"))
            await fetchUserData()
            setIsEditingOrg(false)
        } catch (error) {
            console.error("Error updating organization:", error)
            toast.error(error?.response?.data?.message || error?.message || t("profilePage.toasts.orgUpdateError"))
        } finally {
            setOrgLoading(false)
        }
    }

    // Vérifier si l'utilisateur peut modifier l'organisation
    const canEditOrganization = () => {
        if (!userData?.permissions) return false
        return userData.permissions.some(
            (p) => p.key === "organizations.manage" || p.key === "organizations.write"
        )
    }

    const handleUpdateProfile = async (values) => {
        setLoading(true)
        try {
            // Convertir la date de naissance en format ISO si elle existe
            const payload = {
                ...values,
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
            }
            await authService.updateProfile(payload)
            toast.success(t("profilePage.toasts.profileUpdated"))
            await fetchUserData()
            setIsEditing(false)
        } catch (error) {
            console.error("Error updating profile:", error)
            toast.error(t("profilePage.toasts.profileError"))
        } finally {
            setLoading(false)
        }
    }

    const showPasswordModal = () => {
        setIsPasswordModalVisible(true)
    }

    const handlePasswordCancel = () => {
        setIsPasswordModalVisible(false)
        passwordForm.resetFields()
    }

    const handleLogout = async () => {
        try {
            await logout()
            navigate("/auth/login")
        } catch {
            navigate("/auth/login")
        }
    }

    const handlePasswordUpdate = async (values) => {
        setPasswordLoading(true)
        try {
            await authService.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            })
            toast.success(t("profilePage.toasts.passwordUpdated"))
            setIsPasswordModalVisible(false)
            passwordForm.resetFields()
        } catch (error) {
            console.error("Error updating password:", error)
            toast.error(error?.message || t("profilePage.toasts.passwordError"))
        } finally {
            setPasswordLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return t("profilePage.common.na")
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getRoleColor = (role) => {
        const colors = {
            ADMIN: "red",
            MANAGER: "orange",
            USER: "blue",
            MODERATOR: "purple",
        }
        return colors[role] || "default"
    }

    const getStatusColor = (enabled) => {
        return enabled ? "success" : "error"
    }

    const getGenderText = (gender) => {
        const genders = {
            MALE: t("profilePage.gender.MALE"),
            FEMALE: t("profilePage.gender.FEMALE"),
            OTHER: t("profilePage.gender.OTHER"),
        }
        return genders[gender] || t("profilePage.gender.UNSPECIFIED")
    }

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <Spin size="large" />
                <Text style={{ marginTop: 16 }}>{t("profilePage.alerts.loading")}</Text>
            </div>
        )
    }

    if (error) {
        return <Alert message={t("profilePage.alerts.errorTitle")} description={error} type="error" showIcon style={{ margin: "20px" }} />
    }

    if (!userData) {
        return (
            <Alert
                message={t("profilePage.alerts.noDataTitle")}
                description={t("profilePage.alerts.noDataDesc")}
                type="warning"
                showIcon
                style={{ margin: "20px" }}
            />
        )
    }

    return (
        <>
            <div className="container-fluid relative px-3">
                <div className="layout-specing">
                    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
                        <Row gutter={[24, 24]}>
                            {/* En-tête du profil */}
                            <Col span={24}>
                                <Card
                                    style={{
                                        background: "linear-gradient(135deg, #1e81b0 0%,  #e28743 100%)",
                                        border: "none",
                                        borderRadius: "12px",
                                    }}
                                >
                                    <Row align="middle" gutter={24}>
                                        <Col>
                                            <Badge count={<CheckCircleOutlined style={{ color: "#52c41a" }} />} offset={[-8, 8]}>
                                                <Upload showUploadList={false} beforeUpload={handleAvatarUpload} accept="image/*">
                                                    <Avatar
                                                        size={120}
                                                        src={userData.avatar ? buildImageUrl(userData.avatar) : undefined}
                                                        icon={<UserOutlined />}
                                                        style={{
                                                            cursor: "pointer",
                                                            border: "4px solid rgba(255,255,255,0.3)",
                                                            transition: "all 0.3s ease",
                                                        }}
                                                    />
                                                    <div
                                                        style={{
                                                            position: "absolute",
                                                            bottom: 0,
                                                            right: 0,
                                                            backgroundColor: "rgba(0,0,0,0.6)",
                                                            borderRadius: "50%",
                                                            padding: "8px",
                                                            color: "white",
                                                        }}
                                                    >
                                                        <CameraOutlined />
                                                    </div>
                                                </Upload>
                                            </Badge>
                                        </Col>
                                        <Col flex={1}>
                                            <Title level={2} style={{ color: "white", margin: 0 }}>
                                                {userData.firstName || userData.lastName || userData.username || t("profilePage.header.userFallback")}
                                            </Title>
                                            <Space size="middle" style={{ marginTop: "8px" }}>
                                                <Tag
                                                    color={getRoleColor(userData.role)}
                                                    icon={<CrownOutlined />}
                                                    style={{ fontSize: "14px", padding: "4px 12px" }}
                                                >
                                                    {getRoleLabel(userData.role, t)}
                                                </Tag>
                                                <Tag
                                                    color={getStatusColor(userData.enabled)}
                                                    icon={<SafetyCertificateOutlined />}
                                                    style={{ fontSize: "14px", padding: "4px 12px" }}
                                                >
                                                    {userData.enabled ? t("profilePage.header.active") : t("profilePage.header.inactive")}
                                                </Tag>
                                            </Space>
                                        </Col>
                                        <Col>
                                            <Space>
                                                <Button
                                                    type="primary"
                                                    ghost
                                                    icon={<EditOutlined />}
                                                    size="large"
                                                    style={{ borderColor: "white", color: "white" }}
                                                    onClick={handleEdit}
                                                >
                                                    {t("profilePage.header.editProfile")}
                                                </Button>
                                                <Button
                                                    type="default"
                                                    ghost
                                                    icon={<LockOutlined />}
                                                    size="large"
                                                    style={{ borderColor: "white", color: "white" }}
                                                    onClick={showPasswordModal}
                                                >
                                                    {t("profilePage.header.password")}
                                                </Button>
                                                <Button
                                                    type="default"
                                                    ghost
                                                    danger
                                                    icon={<LogoutOutlined />}
                                                    size="large"
                                                    style={{ borderColor: "white", color: "white" }}
                                                    onClick={handleLogout}
                                                >
                                                    {t("common.logout")}
                                                </Button>
                                            </Space>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>

                            {/* Statistiques rapides */}
                            <Col span={24}>
                                <Row gutter={16}>
                                    <Col xs={24} sm={8}>
                                        <Card>
                                            <Statistic
                                                title={t("profilePage.stats.activePerms")}
                                                value={userData.permissions.length}
                                                prefix={<SafetyCertificateOutlined />}
                                                valueStyle={{ color: "#3f8600" }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Card>
                                            <Statistic
                                                title={t("profilePage.stats.lastLogin")}
                                                value={formatDate(userData.updatedAt)}
                                                prefix={<ClockCircleOutlined />}
                                                valueStyle={{ color: "#1e81b0", fontSize: "16px" }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Card>
                                            <Statistic
                                                title={t("profilePage.stats.memberSince")}
                                                value={formatDate(userData.createdAt)}
                                                prefix={<CalendarOutlined />}
                                                valueStyle={{ color: "#722ed1", fontSize: "16px" }}
                                            />
                                        </Card>
                                    </Col>
                                </Row>
                            </Col>

                            {/* Informations personnelles */}
                            <Col xs={24} lg={12}>
                                <Card
                                    title={
                                        <Space>
                                            <UserOutlined />
                                            <span>{t("profilePage.sections.personalInfo")}</span>
                                        </Space>
                                    }
                                    extra={
                                        <Button type="link" icon={<EditOutlined />} onClick={handleEdit}>
                                            {t("profilePage.buttons.edit")}
                                        </Button>
                                    }
                                    style={{ height: "100%" }}
                                >
                                    {isEditing ? (
                                        <Form
                                            form={form}
                                            layout="vertical"
                                            onFinish={handleUpdateProfile}
                                        >

                                            <Form.Item name="firstName" label={t("profilePage.fields.firstName")}>
                                                <Input placeholder={t("profilePage.placeholders.firstName")} />
                                            </Form.Item>
                                            <Form.Item name="lastName" label={t("profilePage.fields.lastName")}>
                                                <Input placeholder={t("profilePage.placeholders.lastName")} />
                                            </Form.Item>
                                            <Form.Item name="email" label={t("profilePage.fields.email")}>
                                                <Input disabled />
                                            </Form.Item>
                                            <Form.Item name="phone" label={t("profilePage.fields.phone")}>
                                                <Input placeholder={t("profilePage.placeholders.phone")} />
                                            </Form.Item>
                                            <Form.Item name="adress" label={t("profilePage.fields.adress")}>
                                                <Input placeholder={t("profilePage.placeholders.adress")} />
                                            </Form.Item>

                                            <Form.Item name="placeOfBirth" label={t("profilePage.fields.placeOfBirth")}>
                                                <Input placeholder={t("profilePage.placeholders.placeOfBirth")} />
                                            </Form.Item>

                                            <Form.Item
                                                name="dateOfBirth"
                                                label={t("profilePage.fields.dateOfBirth")}
                                                getValueProps={(v) => ({ value: reviveDate(v) })}
                                            >
                                                <DatePicker
                                                    style={{ width: "100%" }}
                                                    placeholder={t("profilePage.placeholders.dateOfBirth")}
                                                    format="DD/MM/YYYY"
                                                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                                                />
                                            </Form.Item>
                                            <Form.Item name="country" label={t("profilePage.fields.country")}>
                                                <Select
                                                    showSearch
                                                    allowClear
                                                    placeholder={t("profilePage.placeholders.country")}
                                                    filterOption={(input, option) =>
                                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                    }
                                                    options={(countries || []).map((c) => ({
                                                        value: c.name,
                                                        label: c.name
                                                    }))}
                                                />
                                            </Form.Item>
                                            <Form.Item name="gender" label={t("profilePage.fields.gender")}>
                                                <Input disabled value={getGenderText(userData.gender)} />
                                            </Form.Item>


                                            <Form.Item>
                                                <Space>
                                                    <Button
                                                        type="primary"
                                                        loading={loading}
                                                        icon={!loading && <PlusCircleOutlined className="mr-1 h-4 w-4" />}
                                                        htmlType="submit"
                                                    >
                                                        {t("profilePage.buttons.save")}
                                                    </Button>
                                                    <Button onClick={handleCancel}>
                                                       {t("profilePage.buttons.cancel")}
                                                    </Button>
                                                </Space>
                                            </Form.Item>
                                        </Form>
                                    ) : (
                                        <Descriptions column={1} size="middle">
                                            <Descriptions.Item
                                                label={
                                                    <Space>
                                                        <MailOutlined />
                                                        <span>{t("profilePage.fields.email")}</span>
                                                    </Space>
                                                }
                                            >
                                                <Text copyable>{userData.email}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <Space>
                                                        <UserOutlined />
                                                        <span>{t("profilePage.fields.fullName")}</span>
                                                    </Space>
                                                }
                                            >
                                                <Text>{userData.firstName || ""} {userData.lastName || ""}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <Space>
                                                        <PhoneOutlined />
                                                        <span>{t("profilePage.fields.phone")}</span>
                                                    </Space>
                                                }
                                            >
                                                <Text copyable>{userData.phone || t("profilePage.org.unspecified")}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <Space>
                                                        <HomeOutlined />
                                                        <span>{t("profilePage.fields.adress")}</span>
                                                    </Space>
                                                }
                                            >
                                                <Text>{userData.adress || t("profilePage.org.unspecified")}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <Space>
                                                        <GlobalOutlined />
                                                        <span>{t("profilePage.fields.country")}</span>
                                                    </Space>
                                                }
                                            >
                                                <Text>{userData.country || t("profilePage.org.unspecified")}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <Space>
                                                        <CalendarOutlined />
                                                        <span>{t("profilePage.fields.dateOfBirth")}</span>
                                                    </Space>
                                                }
                                            >
                                                <Text>{userData.dateOfBirth ? dayjs(userData.dateOfBirth).format("DD/MM/YYYY") : t("profilePage.org.unspecified")}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <Space>
                                                        <HomeOutlined />
                                                        <span>{t("profilePage.fields.placeOfBirth")}</span>
                                                    </Space>
                                                }
                                            >
                                                <Text>{userData.placeOfBirth || t("profilePage.org.unspecified")}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <Space>
                                                        <IoTransgender />
                                                        <span>{t("profilePage.fields.gender")}</span>
                                                    </Space>
                                                }
                                            >
                                                <Text>{getGenderText(userData.gender)}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <Space>
                                                        <CalendarOutlined />
                                                        <span>{t("profilePage.fields.createdAt")}</span>
                                                    </Space>
                                                }
                                            >
                                                {formatDate(userData.createdAt)}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <Space>
                                                        <ClockCircleOutlined />
                                                        <span>{t("profilePage.fields.updatedAt")}</span>
                                                    </Space>
                                                }
                                            >
                                                {formatDate(userData.updatedAt)}
                                            </Descriptions.Item>
                                        </Descriptions>
                                    )}
                                </Card>
                            </Col>

                            {/* Organisation et permissions */}
                            <Col xs={24} lg={12}>
                                <Card
                                    title={
                                        <Space>
                                            <BankOutlined />
                                            <span>{t("profilePage.sections.organization")}</span>
                                        </Space>
                                    }
                                    extra={
                                        userData?.organization && canEditOrganization() && (
                                            <Button type="link" icon={<EditOutlined />} onClick={handleOrgEdit}>
                                                {t("profilePage.buttons.edit")}
                                            </Button>
                                        )
                                    }
                                    style={{ height: "100%", marginBottom: "24px" }}
                                >
                                    {!userData?.organization ? (
                                        <Text type="secondary">{t("profilePage.orgEditor.noOrgAssociated")}</Text>
                                    ) : isEditingOrg && canEditOrganization() ? (
                                        <Form
                                            form={orgForm}
                                            layout="vertical"
                                            onFinish={handleUpdateOrganization}
                                        >
                                            <Form.Item name="name" label={t("profilePage.orgEditor.name")}>
                                                <Input placeholder={t("profilePage.orgEditor.name")} />
                                            </Form.Item>

                                            <Form.Item name="address" label={t("profilePage.orgEditor.address")}>
                                                <Input placeholder={t("profilePage.orgEditor.address")} />
                                            </Form.Item>
                                            <Form.Item name="phone" label={t("profilePage.orgEditor.phone")}>
                                                <Input placeholder={t("profilePage.orgEditor.phone")} />
                                            </Form.Item>
                                            <Form.Item name="country" label={t("profilePage.orgEditor.country")}>
                                                <Select
                                                    showSearch
                                                    allowClear
                                                    placeholder={t("profilePage.orgEditor.country")}
                                                    filterOption={(input, option) =>
                                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                    }
                                                    options={(countries || []).map((c) => ({
                                                        value: c.code,
                                                        label: c.name
                                                    }))}
                                                />
                                            </Form.Item>
                                            <Form.Item name="website" label={t("profilePage.orgEditor.website")}>
                                                <Input placeholder="https://www.example.com" />
                                            </Form.Item>
                                            <Form.Item name="email" label={t("profilePage.orgEditor.email")}>
                                                <Input type="email" placeholder="email@example.com" />
                                            </Form.Item>
                                            <Form.Item>
                                                <Space>
                                                    <Button
                                                        type="primary"
                                                        loading={orgLoading}
                                                        htmlType="submit"
                                                    >
                                                        {t("profilePage.buttons.save")}
                                                    </Button>
                                                    <Button onClick={handleOrgCancel}>
                                                        {t("profilePage.buttons.cancel")}
                                                    </Button>
                                                </Space>
                                            </Form.Item>
                                        </Form>
                                    ) : (
                                        <>
                                            <Title level={5} style={{ marginBottom: "16px" }}>
                                                {userData.organization?.name || t("profilePage.org.none")}
                                            </Title>
                                            <Descriptions column={1} size="small">
                                                <Descriptions.Item label={t("profilePage.fields.type")}>
                                                    <Tag color="blue">{
                                                    userData.organization?.type ? t(`profilePage.orgTypes.${userData.organization?.type}`) : t("profilePage.org.unspecified")
                                                    
                                                    
                                                    || t("profilePage.org.unspecified")}</Tag>
                                                </Descriptions.Item>
                                                
                                                <Descriptions.Item label={t("profilePage.orgEditor.address")}>
                                                    <Text>{userData.organization?.address || t("profilePage.org.unspecified")}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label={t("profilePage.orgEditor.phone")}>
                                                    <Text copyable>{userData.organization?.phone || t("profilePage.org.unspecified")}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label={t("profilePage.orgEditor.country")}>
                                                    <Text>{userData.organization?.country || t("profilePage.org.unspecified")}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label={t("profilePage.orgEditor.website")}>
                                                    {userData.organization?.website ? (
                                                        <a href={userData.organization.website} target="_blank" rel="noreferrer">
                                                            {userData.organization.website}
                                                        </a>
                                                    ) : (
                                                        <Text>{t("profilePage.org.unspecified")}</Text>
                                                    )}
                                                </Descriptions.Item>
                                                <Descriptions.Item label={t("profilePage.orgEditor.email")}>
                                                    <Text copyable>{userData.organization?.email || t("profilePage.org.unspecified")}</Text>
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </>
                                    )}
                                </Card>
                            </Col>

                            <Col xs={24} lg={24}>

                                <Card
                                    title={
                                        <Space>
                                            <SafetyCertificateOutlined />
                                            <span>{t("profilePage.sections.permissionsAccess")}</span>
                                        </Space>
                                    }
                                    style={{ height: "100%" }}
                                >
                                    <Title level={5} style={{ marginBottom: "16px" }}>
                                        {t("profilePage.sections.role")}: <Tag color={getRoleColor(userData.role)}>{getRoleLabel(userData.role, t)}</Tag>
                                    </Title>
                                    <Divider orientation="left" orientationMargin="0">
                                        <Text type="secondary">{t("profilePage.sections.grantedPerms")}</Text>
                                    </Divider>
                                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                                        <Space size={[8, 8]} wrap>
                                            {userData.permissions.map((permission) => (
                                                <Tag
                                                    key={permission.id}
                                                    color={getPermissionColor(permission.key)}
                                                    style={{
                                                        padding: "4px 8px",
                                                        borderRadius: "6px",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    {getPermissionLabel(permission.key, t)}
                                                </Tag>
                                            ))}
                                        </Space>
                                    </div>
                                </Card>

                            </Col>
                        </Row>
                    </div>
                </div>
            </div>

            {/* Modal pour changer le mot de passe */}
            <Modal
                title={t("profilePage.passwordModal.title")}
                open={isPasswordModalVisible}
                onCancel={handlePasswordCancel}
                footer={null}
                centered
            >
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordUpdate}
                    autoComplete="off"
                >
                    <Form.Item
                        name="currentPassword"
                        label={t("profilePage.passwordModal.current")}
                        rules={[
                            {
                                required: true,
                                message: t("profilePage.passwordModal.currentRequired"),
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            placeholder={t("profilePage.placeholders.currentPwd")}
                        />
                    </Form.Item>
                    <Form.Item
                        name="newPassword"
                        label={t("profilePage.passwordModal.new")}
                        rules={[
                            {
                                required: true,
                                message: t("profilePage.passwordModal.newRequired"),
                            },
                            {
                                min: 8,
                                message: t("profilePage.passwordModal.newMin"),
                            },
                        ]}
                        hasFeedback
                    >
                        <Input.Password
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            placeholder={t("profilePage.placeholders.newPwd")}
                        />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label={t("profilePage.passwordModal.confirm")}
                        dependencies={['newPassword']}
                        hasFeedback
                        rules={[
                            {
                                required: true,
                                message: t("profilePage.passwordModal.confirmRequired"),
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve()
                                    }
                                    return Promise.reject(new Error(t("profilePage.passwordModal.confirmMismatch")))
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            placeholder={t("profilePage.placeholders.confirmPwd")}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                            <Button onClick={handlePasswordCancel}>
                                {t("profilePage.buttons.cancel")}
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={passwordLoading}
                            >
                                {t("profilePage.buttons.save")}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}
