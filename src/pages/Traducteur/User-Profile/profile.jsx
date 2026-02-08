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
    DatePicker,
    Grid
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
import { DATE_FORMAT } from "../../../utils/dateFormat"

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
    const screens = Grid.useBreakpoint()
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
            await fetchUserData()
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
            <div className="flex items-center justify-center min-h-[50vh] sm:min-h-screen p-4">
                <Spin size="large" tip={t("profilePage.alerts.loading")} />
            </div>
        )
    }

    if (error) {
        return (
            <div className="container-fluid w-full max-w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 overflow-x-hidden">
                <Alert message={t("profilePage.alerts.errorTitle")} description={error} type="error" showIcon className="text-sm sm:text-base" />
            </div>
        )
    }

    if (!userData) {
        return (
            <div className="container-fluid w-full max-w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 overflow-x-hidden">
                <Alert
                    message={t("profilePage.alerts.noDataTitle")}
                    description={t("profilePage.alerts.noDataDesc")}
                    type="warning"
                    showIcon
                    className="text-sm sm:text-base"
                />
            </div>
        )
    }

    return (
        <>
            <div className="container-fluid relative w-full px-3 sm:px-4 md:px-6 overflow-x-hidden max-w-full">
                <div className="layout-specing w-full py-3 sm:py-4 md:py-6">
                    <div className="p-3 sm:p-4 md:p-6 w-full bg-gray-50 dark:bg-gray-900/30 min-h-screen sm:min-h-0 rounded-lg sm:rounded-xl">
                        <Row gutter={[16, 16]} className="!mx-0 sm:!mx-[-8px] w-full">
                            {/* En-tête du profil */}
                            <Col xs={24}>
                                <Card
                                    className="overflow-hidden !rounded-xl w-full"
                                    style={{
                                        background: "linear-gradient(135deg, #1e81b0 0%,  #e28743 100%)",
                                        border: "none",
                                        borderRadius: 12,
                                    }}
                                    bodyStyle={{ padding: screens.md ? 24 : "16px 12px" }}
                                >
                                    <Row align="middle" gutter={[16, 16]}>
                                        <Col xs={24} md={6} className="flex justify-center md:justify-start order-1">
                                            <Badge count={<CheckCircleOutlined style={{ color: "#52c41a" }} />} offset={[-6, 6]}>
                                                <Upload showUploadList={false} beforeUpload={handleAvatarUpload} accept="image/*">
                                                    <div className="relative cursor-pointer">
                                                        <Avatar
                                                            size={screens.md ? 120 : screens.sm ? 96 : 80}
                                                            src={userData.avatar ? buildImageUrl(userData.avatar) : undefined}
                                                            icon={<UserOutlined />}
                                                            className="border-4 border-white/30 transition-all shrink-0"
                                                        />
                                                        <div className="absolute bottom-0 right-0 bg-black/60 rounded-full p-1.5 sm:p-2 text-white">
                                                            <CameraOutlined className="text-xs sm:text-sm" />
                                                        </div>
                                                    </div>
                                                </Upload>
                                            </Badge>
                                        </Col>
                                        <Col xs={24} md={10} className="flex flex-col justify-center order-3 md:order-2 text-center md:text-left">
                                            <Title level={4} className="!m-0 !text-white !mb-1 !text-base sm:!text-lg md:!text-xl truncate max-w-full">
                                                {userData.firstName || userData.lastName || userData.username || t("profilePage.header.userFallback")}
                                            </Title>
                                            <Space size="small" wrap className="justify-center md:justify-start">
                                                <Tag color={getRoleColor(userData.role)} icon={<CrownOutlined />} className="!text-xs !text-inherit">
                                                    {getRoleLabel(userData.role, t)}
                                                </Tag>
                                                <Tag color={getStatusColor(userData.enabled)} icon={<SafetyCertificateOutlined />} className="!text-xs !text-inherit">
                                                    {userData.enabled ? t("profilePage.header.active") : t("profilePage.header.inactive")}
                                                </Tag>
                                            </Space>
                                        </Col>
                                        <Col xs={24} md={8} className="flex justify-center md:justify-end order-2 md:order-3">
                                            <Space
                                                wrap
                                                size="small"
                                                className="w-full sm:w-auto justify-center md:justify-end gap-2"
                                                direction={screens.sm ? "horizontal" : "vertical"}
                                            >
                                                <Button
                                                    type="primary"
                                                    ghost
                                                    icon={<EditOutlined />}
                                                    size={screens.sm ? "large" : "middle"}
                                                    className="!min-h-[44px] sm:!min-h-0 w-full sm:w-auto !border-white !text-white !flex items-center justify-center"
                                                    onClick={handleEdit}
                                                >
                                                    {t("profilePage.header.editProfile")}
                                                </Button>
                                                <Button
                                                    type="default"
                                                    ghost
                                                    icon={<LockOutlined />}
                                                    size={screens.sm ? "large" : "middle"}
                                                    className="!min-h-[44px] sm:!min-h-0 w-full sm:w-auto !border-white !text-white !flex items-center justify-center"
                                                    onClick={showPasswordModal}
                                                >
                                                    {t("profilePage.header.password")}
                                                </Button>
                                                <Button
                                                    type="default"
                                                    ghost
                                                    danger
                                                    icon={<LogoutOutlined />}
                                                    size={screens.sm ? "large" : "middle"}
                                                    className="!min-h-[44px] sm:!min-h-0 w-full sm:w-auto !border-white !text-white !flex items-center justify-center"
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
                            <Col xs={24}>
                                <Row gutter={[12, 12]} className="!mx-0 sm:!mx-[-8px] w-full">
                                    <Col xs={24} sm={12} md={8} className="min-w-0">
                                        <Card className="overflow-hidden !rounded-lg w-full min-w-0" bodyStyle={{ padding: screens.sm ? "12px 16px" : "10px 12px" }}>
                                            <Statistic
                                                title={<span className="text-xs sm:text-sm">{t("profilePage.stats.activePerms")}</span>}
                                                value={userData.permissions.length}
                                                prefix={<SafetyCertificateOutlined className="!text-sm" />}
                                                valueStyle={{ color: "#3f8600", fontSize: screens.sm ? 16 : 14, wordBreak: "break-word" }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12} md={8} className="min-w-0">
                                        <Card className="overflow-hidden !rounded-lg w-full min-w-0" bodyStyle={{ padding: screens.sm ? "12px 16px" : "10px 12px" }}>
                                            <Statistic
                                                title={<span className="text-xs sm:text-sm">{t("profilePage.stats.lastLogin")}</span>}
                                                value={formatDate(userData.updatedAt)}
                                                prefix={<ClockCircleOutlined className="!text-sm" />}
                                                valueStyle={{ color: "#1e81b0", fontSize: screens.sm ? 16 : 14, wordBreak: "break-word" }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12} md={8} className="min-w-0">
                                        <Card className="overflow-hidden !rounded-lg w-full min-w-0" bodyStyle={{ padding: screens.sm ? "12px 16px" : "10px 12px" }}>
                                            <Statistic
                                                title={<span className="text-xs sm:text-sm">{t("profilePage.stats.memberSince")}</span>}
                                                value={formatDate(userData.createdAt)}
                                                prefix={<CalendarOutlined className="!text-sm" />}
                                                valueStyle={{ color: "#722ed1", fontSize: screens.sm ? 16 : 14, wordBreak: "break-word" }}
                                            />
                                        </Card>
                                    </Col>
                                </Row>
                            </Col>

                            {/* Informations personnelles */}
                            <Col xs={24} md={24} className="!w-full !max-w-full min-w-0">
                                <Card
                                    className="overflow-hidden h-full !rounded-lg min-w-0 w-full"
                                    title={<span className="text-sm sm:text-base"><UserOutlined />{" "}{t("profilePage.sections.personalInfo")}</span>}
                                    extra={<Button type="link" icon={<EditOutlined />} onClick={handleEdit} className="p-0 text-xs sm:text-sm">{t("profilePage.buttons.edit")}</Button>}
                                    bodyStyle={{ padding: screens.md ? 24 : "16px 12px" }}
                                >
                                    {isEditing ? (
                                        <Form
                                            form={form}
                                            layout="vertical"
                                            onFinish={handleUpdateProfile}
                                            size={screens.sm ? "middle" : "small"}
                                            className="min-w-0 w-full [&_.ant-form-item]:!min-w-0 [&_.ant-form-item-label>label]:text-xs sm:[&_.ant-form-item-label>label]:text-sm [&_.ant-select]:max-w-full [&_.ant-picker]:max-w-full"
                                        >
                                            <Form.Item name="firstName" label={t("profilePage.fields.firstName")}>
                                                <Input placeholder={t("profilePage.placeholders.firstName")} className="w-full" />
                                            </Form.Item>
                                            <Form.Item name="lastName" label={t("profilePage.fields.lastName")}>
                                                <Input placeholder={t("profilePage.placeholders.lastName")} className="w-full" />
                                            </Form.Item>
                                            <Form.Item name="email" label={t("profilePage.fields.email")}>
                                                <Input disabled className="w-full" />
                                            </Form.Item>
                                            <Form.Item name="phone" label={t("profilePage.fields.phone")}>
                                                <Input placeholder={t("profilePage.placeholders.phone")} className="w-full" />
                                            </Form.Item>
                                            <Form.Item name="adress" label={t("profilePage.fields.adress")}>
                                                <Input placeholder={t("profilePage.placeholders.adress")} className="w-full" />
                                            </Form.Item>
                                            <Form.Item name="placeOfBirth" label={t("profilePage.fields.placeOfBirth")}>
                                                <Input placeholder={t("profilePage.placeholders.placeOfBirth")} className="w-full" />
                                            </Form.Item>
                                            <Form.Item
                                                name="dateOfBirth"
                                                label={t("profilePage.fields.dateOfBirth")}
                                                getValueProps={(v) => ({ value: reviveDate(v) })}
                                            >
                                                <DatePicker
                                                    className="w-full"
                                                    style={{ width: "100%", minWidth: 0 }}
                                                    placeholder={t("profilePage.placeholders.dateOfBirth")}
                                                    format={DATE_FORMAT}
                                                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                                                />
                                            </Form.Item>
                                            <Form.Item name="country" label={t("profilePage.fields.country")}>
                                                <Select
                                                    showSearch
                                                    allowClear
                                                    className="w-full"
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
                                                <Input disabled value={getGenderText(userData.gender)} className="w-full" />
                                            </Form.Item>


                                            <Form.Item className="!mb-0">
                                                <Space wrap size="small" className="w-full sm:w-auto" direction={screens.sm ? "horizontal" : "vertical"}>
                                                    <Button
                                                        type="primary"
                                                        loading={loading}
                                                        icon={!loading && <PlusCircleOutlined />}
                                                        htmlType="submit"
                                                        className="!min-h-[44px] w-full sm:w-auto sm:!min-h-0"
                                                    >
                                                        {t("profilePage.buttons.save")}
                                                    </Button>
                                                    <Button onClick={handleCancel} className="!min-h-[44px] w-full sm:w-auto sm:!min-h-0">
                                                        {t("profilePage.buttons.cancel")}
                                                    </Button>
                                                </Space>
                                            </Form.Item>
                                        </Form>
                                    ) : (
                                        <Descriptions
                                            column={{ xs: 1, sm: 2 }}
                                            size="small"
                                            layout="horizontal"
                                            labelStyle={{ fontWeight: 500, whiteSpace: "nowrap", paddingRight: 16, verticalAlign: "top" }}
                                            contentStyle={{ wordBreak: "break-word", verticalAlign: "top" }}
                                            className="w-full max-w-full [&_.ant-descriptions-view]:!w-full [&_.ant-descriptions-table]:!w-full [&_.ant-descriptions-item-label]:text-xs [&_.ant-descriptions-item-content]:text-xs [&_.ant-descriptions-item-label]:min-w-0 sm:[&_.ant-descriptions-item-label]:!min-w-[120px] sm:[&_.ant-descriptions-item-label]:text-sm sm:[&_.ant-descriptions-item-content]:text-sm [&_.ant-descriptions-row]:border-b [&_.ant-descriptions-row]:border-gray-100 dark:[&_.ant-descriptions-row]:border-gray-700"
                                        >
                                            <Descriptions.Item label={<span><MailOutlined className="mr-1" />{t("profilePage.fields.email")}</span>}>
                                                <Text copyable className="break-all">{userData.email}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item label={<span><UserOutlined className="mr-1" />{t("profilePage.fields.fullName")}</span>}>
                                                <Text className="break-words">{userData.firstName || ""} {userData.lastName || ""}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item label={<span><PhoneOutlined className="mr-1" />{t("profilePage.fields.phone")}</span>}>
                                                <Text copyable className="break-all">{userData.phone || t("profilePage.org.unspecified")}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item label={<span><HomeOutlined className="mr-1" />{t("profilePage.fields.adress")}</span>}>
                                                <Text className="break-words">{userData.adress || t("profilePage.org.unspecified")}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item label={<span><GlobalOutlined className="mr-1" />{t("profilePage.fields.country")}</span>}>
                                                <Text className="break-words">{userData.country || t("profilePage.org.unspecified")}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item label={<span><CalendarOutlined className="mr-1" />{t("profilePage.fields.dateOfBirth")}</span>}>
                                                {userData.dateOfBirth ? dayjs(userData.dateOfBirth).format(DATE_FORMAT) : t("profilePage.org.unspecified")}
                                            </Descriptions.Item>
                                            <Descriptions.Item label={<span><HomeOutlined className="mr-1" />{t("profilePage.fields.placeOfBirth")}</span>}>
                                                <Text className="break-words">{userData.placeOfBirth || t("profilePage.org.unspecified")}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item label={<span><IoTransgender className="mr-1" />{t("profilePage.fields.gender")}</span>}>
                                                {getGenderText(userData.gender)}
                                            </Descriptions.Item>
                                            <Descriptions.Item label={<span><CalendarOutlined className="mr-1" />{t("profilePage.fields.createdAt")}</span>}>
                                                {formatDate(userData.createdAt)}
                                            </Descriptions.Item>
                                            <Descriptions.Item label={<span><ClockCircleOutlined className="mr-1" />{t("profilePage.fields.updatedAt")}</span>}>
                                                {formatDate(userData.updatedAt)}
                                            </Descriptions.Item>
                                        </Descriptions>
                                    )}
                                </Card>
                            </Col>

                            {/* Organisation et permissions */}
                            <Col xs={24} md={24} className="!w-full !max-w-full min-w-0">
                                <Card
                                    className="overflow-hidden h-full mb-4 sm:mb-6 !rounded-lg min-w-0 w-full"
                                    title={<span className="text-sm sm:text-base"><BankOutlined />{" "}{t("profilePage.sections.organization")}</span>}
                                    extra={
                                        userData?.organization && canEditOrganization() && (
                                            <Button type="link" icon={<EditOutlined />} onClick={handleOrgEdit} className="p-0 text-xs sm:text-sm">
                                                {t("profilePage.buttons.edit")}
                                            </Button>
                                        )
                                    }
                                    bodyStyle={{ padding: screens.md ? 24 : "16px 12px" }}
                                >
                                    {!userData?.organization ? (
                                        <Text type="secondary">{t("profilePage.orgEditor.noOrgAssociated")}</Text>
                                    ) : isEditingOrg && canEditOrganization() ? (
                                        <Form
                                            form={orgForm}
                                            layout="vertical"
                                            onFinish={handleUpdateOrganization}
                                            size={screens.sm ? "middle" : "small"}
                                            className="min-w-0 w-full [&_.ant-form-item]:!min-w-0 [&_.ant-form-item-label>label]:text-xs sm:[&_.ant-form-item-label>label]:text-sm [&_.ant-select]:max-w-full [&_.ant-picker]:max-w-full"
                                        >
                                            <Form.Item name="name" label={t("profilePage.orgEditor.name")}>
                                                <Input placeholder={t("profilePage.orgEditor.name")} className="w-full" />
                                            </Form.Item>
                                            <Form.Item name="address" label={t("profilePage.orgEditor.address")}>
                                                <Input placeholder={t("profilePage.orgEditor.address")} className="w-full" />
                                            </Form.Item>
                                            <Form.Item name="phone" label={t("profilePage.orgEditor.phone")}>
                                                <Input placeholder={t("profilePage.orgEditor.phone")} className="w-full" />
                                            </Form.Item>
                                            <Form.Item name="country" label={t("profilePage.orgEditor.country")}>
                                                <Select
                                                    showSearch
                                                    allowClear
                                                    className="w-full"
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
                                                <Input placeholder="https://www.example.com" className="w-full" />
                                            </Form.Item>
                                            <Form.Item name="email" label={t("profilePage.orgEditor.email")}>
                                                <Input type="email" placeholder="email@example.com" className="w-full" />
                                            </Form.Item>
                                            <Form.Item className="!mb-0">
                                                <Space wrap size="small" className="w-full sm:w-auto" direction={screens.sm ? "horizontal" : "vertical"}>
                                                    <Button
                                                        type="primary"
                                                        loading={orgLoading}
                                                        htmlType="submit"
                                                        className="!min-h-[44px] w-full sm:w-auto sm:!min-h-0"
                                                    >
                                                        {t("profilePage.buttons.save")}
                                                    </Button>
                                                    <Button onClick={handleOrgCancel} className="!min-h-[44px] w-full sm:w-auto sm:!min-h-0">
                                                        {t("profilePage.buttons.cancel")}
                                                    </Button>
                                                </Space>
                                            </Form.Item>
                                        </Form>
                                    ) : (
                                        <>
                                            <Title level={5} className="!mb-3 sm:!mb-4 !text-sm sm:!text-base break-words">
                                                {userData.organization?.name || t("profilePage.org.none")}
                                            </Title>
                                            <Descriptions
                                                column={{ xs: 1, sm: 2 }}
                                                size="small"
                                                layout="horizontal"
                                                labelStyle={{ fontWeight: 500, whiteSpace: "nowrap", paddingRight: 16, verticalAlign: "top" }}
                                                contentStyle={{ wordBreak: "break-word", verticalAlign: "top" }}
                                                className="w-full max-w-full [&_.ant-descriptions-view]:!w-full [&_.ant-descriptions-table]:!w-full [&_.ant-descriptions-item-label]:text-xs [&_.ant-descriptions-item-content]:text-xs [&_.ant-descriptions-item-label]:min-w-0 sm:[&_.ant-descriptions-item-label]:!min-w-[120px] sm:[&_.ant-descriptions-item-label]:text-sm sm:[&_.ant-descriptions-item-content]:text-sm [&_.ant-descriptions-row]:border-b [&_.ant-descriptions-row]:border-gray-100 dark:[&_.ant-descriptions-row]:border-gray-700"
                                            >
                                                <Descriptions.Item label={t("profilePage.fields.type")}>
                                                    <Tag color="blue">{userData.organization?.type ? t(`profilePage.orgTypes.${userData.organization?.type}`) : t("profilePage.org.unspecified")}</Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label={t("profilePage.orgEditor.address")}>
                                                    <Text className="break-words">{userData.organization?.address || t("profilePage.org.unspecified")}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label={t("profilePage.orgEditor.phone")}>
                                                    <Text copyable className="break-all">{userData.organization?.phone || t("profilePage.org.unspecified")}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label={t("profilePage.orgEditor.country")}>
                                                    <Text className="break-words">{userData.organization?.country || t("profilePage.org.unspecified")}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label={t("profilePage.orgEditor.website")}>
                                                    {userData.organization?.website ? (
                                                        <a href={userData.organization.website} target="_blank" rel="noreferrer" className="break-all">
                                                            {userData.organization.website}
                                                        </a>
                                                    ) : (
                                                        <Text>{t("profilePage.org.unspecified")}</Text>
                                                    )}
                                                </Descriptions.Item>
                                                <Descriptions.Item label={t("profilePage.orgEditor.email")}>
                                                    <Text copyable className="break-all">{userData.organization?.email || t("profilePage.org.unspecified")}</Text>
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </>
                                    )}
                                </Card>
                            </Col>

                            <Col xs={24} className="!w-full !max-w-full min-w-0">
                                <Card
                                    className="overflow-hidden h-full !rounded-lg w-full min-w-0"
                                    title={<span className="text-sm sm:text-base"><SafetyCertificateOutlined />{" "}{t("profilePage.sections.permissionsAccess")}</span>}
                                    bodyStyle={{ padding: screens.md ? 24 : "16px 12px" }}
                                >
                                    <Title level={5} className="!mb-3 sm:!mb-4 !text-sm sm:!text-base">
                                        {t("profilePage.sections.role")}: <Tag color={getRoleColor(userData.role)} className="!text-xs sm:!text-sm">{getRoleLabel(userData.role, t)}</Tag>
                                    </Title>
                                    <Divider orientation="left" orientationMargin="0" className="!my-3 sm:!my-4">
                                        <Text type="secondary" className="text-xs sm:text-sm">{t("profilePage.sections.grantedPerms")}</Text>
                                    </Divider>
                                    <div className="max-h-[280px] sm:max-h-[300px] overflow-y-auto overflow-x-hidden p-1 sm:p-2 min-w-0">
                                        <Space size={[6, 6]} wrap className="w-full">
                                            {userData.permissions.map((permission) => (
                                                <Tag
                                                    key={permission.id}
                                                    color={getPermissionColor(permission.key)}
                                                    className="!text-xs !py-1 !px-2 sm:!py-1.5 sm:!px-2 !rounded-md"
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
                title={<span className="text-sm sm:text-base">{t("profilePage.passwordModal.title")}</span>}
                open={isPasswordModalVisible}
                onCancel={handlePasswordCancel}
                footer={null}
                centered
                width={screens.sm ? 480 : "100%"}
                style={{ maxWidth: "calc(100vw - 24px)", top: 24 }}
                bodyStyle={{ padding: screens.sm ? 24 : 16 }}
            >
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordUpdate}
                    autoComplete="off"
                    size={screens.sm ? "middle" : "small"}
                    className="min-w-0 w-full [&_.ant-form-item]:!min-w-0 [&_.ant-form-item-label>label]:text-xs sm:[&_.ant-form-item-label>label]:text-sm [&_.ant-input]:max-w-full"
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
                            className="w-full"
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            placeholder={t("profilePage.placeholders.currentPwd")}
                        />
                    </Form.Item>
                    <Form.Item
                        name="newPassword"
                        label={t("profilePage.passwordModal.new")}
                        rules={[
                            { required: true, message: t("profilePage.passwordModal.newRequired") },
                            { min: 8, message: t("profilePage.passwordModal.newMin") },
                        ]}
                        hasFeedback
                    >
                        <Input.Password
                            className="w-full"
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
                            { required: true, message: t("profilePage.passwordModal.confirmRequired") },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) return Promise.resolve()
                                    return Promise.reject(new Error(t("profilePage.passwordModal.confirmMismatch")))
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            className="w-full"
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            placeholder={t("profilePage.placeholders.confirmPwd")}
                        />
                    </Form.Item>
                    <Form.Item className="!mb-0">
                        <Space wrap size="small" className="w-full justify-end gap-2" direction={screens.sm ? "horizontal" : "vertical"}>
                            <Button onClick={handlePasswordCancel} className="!min-h-[44px] w-full sm:w-auto sm:!min-h-0">
                                {t("profilePage.buttons.cancel")}
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={passwordLoading}
                                className="!min-h-[44px] w-full sm:w-auto sm:!min-h-0"
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
