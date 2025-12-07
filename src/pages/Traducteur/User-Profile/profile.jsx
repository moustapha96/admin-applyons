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
            setError("Erreur lors du chargement du profil utilisateur")
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
            toast.success("Photo de profil mise à jour avec succès")
            const response = await authService.getProfile()
           console.log(response)
            fetchUserData()
        } catch (error) {
            console.error("Error uploading avatar:", error)
            toast.error("Erreur lors de la mise à jour de la photo")
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
            toast.error("Aucune organisation à modifier")
            return
        }
        setOrgLoading(true)
        try {
            await organizationService.update(userData.organization.id, values)
            toast.success("Organisation mise à jour avec succès")
            await fetchUserData()
            setIsEditingOrg(false)
        } catch (error) {
            console.error("Error updating organization:", error)
            toast.error(error?.response?.data?.message || error?.message || "Erreur lors de la mise à jour de l'organisation")
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
            toast.success("Profil mis à jour avec succès")
            await fetchUserData()
            setIsEditing(false)
        } catch (error) {
            console.error("Error updating profile:", error)
            toast.error("Erreur lors de la mise à jour du profil")
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
            toast.success("Mot de passe mis à jour avec succès")
            setIsPasswordModalVisible(false)
            passwordForm.resetFields()
        } catch (error) {
            console.error("Error updating password:", error)
            toast.error(error?.message || "Erreur lors de la mise à jour du mot de passe")
        } finally {
            setPasswordLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return "N/A"
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
            MALE: "Homme",
            FEMALE: "Femme",
            OTHER: "Autre",
        }
        return genders[gender] || "Non spécifié"
    }

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <Spin size="large" />
                <Text style={{ marginTop: 16 }}>Chargement du profil...</Text>
            </div>
        )
    }

    if (error) {
        return <Alert message="Erreur" description={error} type="error" showIcon style={{ margin: "20px" }} />
    }

    if (!userData) {
        return (
            <Alert
                message="Aucune donnée"
                description="Aucune donnée utilisateur disponible"
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
                                                {userData.firstName || userData.lastName || userData.username || "Utilisateur"}
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
                                                    {userData.enabled ? "ACTIF" : "INACTIF"}
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
                                                    Modifier le profil
                                                </Button>
                                                <Button
                                                    type="default"
                                                    ghost
                                                    icon={<LockOutlined />}
                                                    size="large"
                                                    style={{ borderColor: "white", color: "white" }}
                                                    onClick={showPasswordModal}
                                                >
                                                    Mot de passe
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
                                                title="Permissions actives"
                                                value={userData.permissions.length}
                                                prefix={<SafetyCertificateOutlined />}
                                                valueStyle={{ color: "#3f8600" }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Card>
                                            <Statistic
                                                title="Dernière connexion"
                                                value={formatDate(userData.updatedAt)}
                                                prefix={<ClockCircleOutlined />}
                                                valueStyle={{ color: "#1e81b0", fontSize: "16px" }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Card>
                                            <Statistic
                                                title="Membre depuis"
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
                                            <span>Informations personnelles</span>
                                        </Space>
                                    }
                                    extra={
                                        <Button type="link" icon={<EditOutlined />} onClick={handleEdit}>
                                            Modifier
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
                                            <Form.Item name="firstName" label="Prénom">
                                                <Input placeholder="Prénom" />
                                            </Form.Item>
                                            <Form.Item name="lastName" label="Nom">
                                                <Input placeholder="Nom" />
                                            </Form.Item>
                                            <Form.Item name="email" label="Email">
                                                <Input disabled />
                                            </Form.Item>
                                            <Form.Item name="phone" label="Téléphone">
                                                <Input placeholder="Téléphone" />
                                            </Form.Item>
                                            <Form.Item name="adress" label="Adresse">
                                                <Input placeholder="Adresse" />
                                            </Form.Item>
                                            <Form.Item name="country" label="Pays">
                                                <Select
                                                    showSearch
                                                    allowClear
                                                    placeholder="Pays"
                                                    filterOption={(input, option) =>
                                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                    }
                                                    options={(countries || []).map((c) => ({ 
                                                        value: c.name, 
                                                        label: c.name 
                                                    }))}
                                                />
                                            </Form.Item>
                                            <Form.Item name="dateOfBirth" label="Date de naissance">
                                                <DatePicker 
                                                    placeholder="Sélectionner une date"
                                                    style={{ width: "100%" }}
                                                    format="DD/MM/YYYY"
                                                />
                                            </Form.Item>
                                            <Form.Item name="placeOfBirth" label="Lieu de naissance">
                                                <Input placeholder="Lieu de naissance" />
                                            </Form.Item>
                                            <Form.Item name="gender" label="Genre">
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
                                                        Enregistrer
                                                    </Button>
                                                    <Button onClick={handleCancel}>
                                                        Annuler
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
                                                        <span>Email</span>
                                                    </Space>
                                                }
                                            >
                                                <Text copyable>{userData.email}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <Space>
                                                        <UserOutlined />
                                                        <span>Nom Complet</span>
                                                    </Space>
                                                }
                                            >
                                                <Text>{userData.firstName || ""} {userData.lastName || ""}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <Space>
                                                        <PhoneOutlined />
                                                        <span>Téléphone</span>
                                                    </Space>
                                                }
                                            >
                                                <Text copyable>{userData.phone || "Non spécifié"}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <Space>
                                                        <HomeOutlined />
                                                        <span>Adresse</span>
                                                    </Space>
                                                }
                                            >
                                                <Text>{userData.adress || "Non spécifié"}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <Space>
                                                        <GlobalOutlined />
                                                        <span>Pays</span>
                                                    </Space>
                                                }
                                            >
                                                <Text>{userData.country || "Non spécifié"}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <Space>
                                                        <CalendarOutlined />
                                                        <span>Date de naissance</span>
                                                    </Space>
                                                }
                                            >
                                                <Text>{userData.dateOfBirth ? dayjs(userData.dateOfBirth).format("DD/MM/YYYY") : "Non spécifié"}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <Space>
                                                        <HomeOutlined />
                                                        <span>Lieu de naissance</span>
                                                    </Space>
                                                }
                                            >
                                                <Text>{userData.placeOfBirth || "Non spécifié"}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <Space>
                                                        <IoTransgender />
                                                        <span>Genre</span>
                                                    </Space>
                                                }
                                            >
                                                <Text>{getGenderText(userData.gender)}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <Space>
                                                        <CalendarOutlined />
                                                        <span>Créé le</span>
                                                    </Space>
                                                }
                                            >
                                                {formatDate(userData.createdAt)}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <Space>
                                                        <ClockCircleOutlined />
                                                        <span>Mis à jour le</span>
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
                                            <span>Organisation</span>
                                        </Space>
                                    }
                                    extra={
                                        userData?.organization && canEditOrganization() && (
                                            <Button type="link" icon={<EditOutlined />} onClick={handleOrgEdit}>
                                                Modifier
                                            </Button>
                                        )
                                    }
                                    style={{ height: "100%", marginBottom: "24px" }}
                                >
                                    {!userData?.organization ? (
                                        <Text type="secondary">Aucune organisation associée</Text>
                                    ) : isEditingOrg && canEditOrganization() ? (
                                        <Form
                                            form={orgForm}
                                            layout="vertical"
                                            onFinish={handleUpdateOrganization}
                                        >
                                            <Form.Item name="name" label="Nom">
                                                <Input placeholder="Nom de l'organisation" />
                                            </Form.Item>
                                           
                                            <Form.Item name="address" label="Adresse">
                                                <Input placeholder="Adresse" />
                                            </Form.Item>
                                            <Form.Item name="phone" label="Téléphone">
                                                <Input placeholder="Téléphone" />
                                            </Form.Item>
                                            <Form.Item name="country" label="Pays">
                                                <Select
                                                    showSearch
                                                    allowClear
                                                    placeholder="Pays"
                                                    filterOption={(input, option) =>
                                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                    }
                                                    options={(countries || []).map((c) => ({ 
                                                        value: c.code, 
                                                        label: c.name 
                                                    }))}
                                                />
                                            </Form.Item>
                                            <Form.Item name="website" label="Site web">
                                                <Input placeholder="https://www.example.com" />
                                            </Form.Item>
                                            <Form.Item name="email" label="Email">
                                                <Input type="email" placeholder="email@example.com" />
                                            </Form.Item>
                                            <Form.Item>
                                                <Space>
                                                    <Button
                                                        type="primary"
                                                        loading={orgLoading}
                                                        htmlType="submit"
                                                    >
                                                        Enregistrer
                                                    </Button>
                                                    <Button onClick={handleOrgCancel}>
                                                        Annuler
                                                    </Button>
                                                </Space>
                                            </Form.Item>
                                        </Form>
                                    ) : (
                                        <>
                                            <Title level={5} style={{ marginBottom: "16px" }}>
                                                {userData.organization?.name || "Aucune organisation"}
                                            </Title>
                                            <Descriptions column={1} size="small">
                                                <Descriptions.Item label="Type">
                                                    <Tag color="blue">{userData.organization?.type || "Non spécifié"}</Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Slug">
                                                    <Text copyable>{userData.organization?.slug || "Non spécifié"}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Adresse">
                                                    <Text>{userData.organization?.address || "Non spécifié"}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Téléphone">
                                                    <Text copyable>{userData.organization?.phone || "Non spécifié"}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Pays">
                                                    <Text>{userData.organization?.country || "Non spécifié"}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Site web">
                                                    {userData.organization?.website ? (
                                                        <a href={userData.organization.website} target="_blank" rel="noreferrer">
                                                            {userData.organization.website}
                                                        </a>
                                                    ) : (
                                                        <Text>Non spécifié</Text>
                                                    )}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Email">
                                                    <Text copyable>{userData.organization?.email || "Non spécifié"}</Text>
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
                                            <span>Permissions et accès</span>
                                        </Space>
                                    }
                                    style={{ height: "100%" }}
                                >
                                    <Title level={5} style={{ marginBottom: "16px" }}>
                                        {t("profilePage.sections.role")}: <Tag color={getRoleColor(userData.role)}>{getRoleLabel(userData.role, t)}</Tag>
                                    </Title>
                                    <Divider orientation="left" orientationMargin="0">
                                        <Text type="secondary">Permissions accordées</Text>
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
                title="Changer le mot de passe"
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
                        label="Mot de passe actuel"
                        rules={[
                            {
                                required: true,
                                message: "Veuillez entrer votre mot de passe actuel",
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            placeholder="Mot de passe actuel"
                        />
                    </Form.Item>
                    <Form.Item
                        name="newPassword"
                        label="Nouveau mot de passe"
                        rules={[
                            {
                                required: true,
                                message: "Veuillez entrer votre nouveau mot de passe",
                            },
                            {
                                min: 8,
                                message: "Le mot de passe doit contenir au moins 8 caractères",
                            },
                        ]}
                        hasFeedback
                    >
                        <Input.Password
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            placeholder="Nouveau mot de passe"
                        />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label="Confirmer le nouveau mot de passe"
                        dependencies={['newPassword']}
                        hasFeedback
                        rules={[
                            {
                                required: true,
                                message: "Veuillez confirmer votre nouveau mot de passe",
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve()
                                    }
                                    return Promise.reject(new Error("Les deux mots de passe ne correspondent pas!"))
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            placeholder="Confirmer le nouveau mot de passe"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                            <Button onClick={handlePasswordCancel}>
                                Annuler
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={passwordLoading}
                            >
                                Enregistrer
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}
