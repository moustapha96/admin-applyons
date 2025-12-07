/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    Form,
    Input,
    Button,
    Checkbox,
    Upload,
    message,
    Breadcrumb,
    Card,
    Avatar,
    Row,
    Col,
    Divider,
    Select,
    Spin
} from "antd";
import { UserOutlined, UploadOutlined,  SaveFilled, ArrowLeftOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../hooks/useAuth";
import userService from "../../../services/userService";
import { toast } from "sonner";
import organizationService from "../../../services/organizationService";
import { getPermissionLabel } from "../../../auth/permissions";
import { PERMS } from "../../../auth/permissions";
import { buildImageUrl } from "../../../utils/imageUtils";
const { Option } = Select;

const UserEdit = () => {
    const { t } = useTranslation();
    const { user: currentUser } = useAuth();
    const { id } = useParams();
    const [form] = Form.useForm();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState(null);
    const [organizations, setOrganizations] = useState([]);
    const [fetchingOrgs, setFetchingOrgs] = useState(false);
    const navigate = useNavigate();

    const permissionsOptions = Object.entries(PERMS).map(([key, value]) => ({
        label: getPermissionLabel(value, t),
        value: value,
    }));

    useEffect(() => {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
        if (id) fetchUser();
        fetchOrganizations();
    }, [id]);

    const fetchOrganizations = async () => {
        setFetchingOrgs(true);
        try {
            const response = await organizationService.list({ limit: 1000 });
            setOrganizations(response.organizations || []);
        } catch (error) {
            console.error("Erreur lors de la récupération des organisations:", error);
            message.error(t("adminUserEdit.messages.orgFetchError"));
        } finally {
            setFetchingOrgs(false);
        }
    };

    const fetchUser = async () => {
        setLoading(true);
        try {
            const response = await userService.getById(id);
            console.log(response);
            const userData = response.user;
            setUser(userData.user);
            form.setFieldsValue({
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                email: userData.email,
                phone: userData.phone || "",
                role: userData.role,
                enabled: userData.enabled,
                country : userData.country,
                gender: userData.gender,
                permissions: userData.permissions?.map(p => p.key) || [],
                adress: userData.adress,
                organizationId: userData.organizationId || userData.organization?.id,
            });
            if (userData.avatar) {
                setImageUrl(userData.avatar);
            }
        } catch (error) {
            toast.error(error.message || t("adminUserEdit.messages.loadError"));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        console.log(values);
        try {
            const formData = new FormData();
            formData.append("email", values.email);
            formData.append("firstName", values.firstName);
            formData.append("lastName", values.lastName);
            formData.append("phone", values.phone);
            formData.append("role", values.role);
            formData.append("enabled", values.enabled);
            formData.append("adress", values.adress);
            formData.append("country", values.country);
            formData.append("gender", values.gender);
            if (["INSTITUT", "TRADUCTEUR", "SUPERVISEUR"].includes(values.role) && values.organizationId) {
                formData.append("organizationId", values.organizationId);
            }
            console.log(values);
            if (values.upload?.[0]) {
                formData.append("avatar", values.upload[0].originFileObj);
            }
            values.permissions?.forEach((permission) => {
                formData.append("permissions[]", permission);
            });
            await userService.update(id, formData);
            toast.success(t("adminUserEdit.messages.updated"));
            navigate("/admin/users");
        } catch (error) {
            console.error("Erreur lors de l'envoi des données:", error);
            toast.error(error?.message || t("adminUserEdit.messages.updateError"));
        } finally {
            setLoading(false);
        }
    };

      
    const normFile = (e) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    const selectedRole = Form.useWatch("role", form);
    const needsOrganization = ["INSTITUT", "TRADUCTEUR", "SUPERVISEUR"].includes(selectedRole);

    if (loading && !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="container-fluid relative px-3">
            <div className="layout-specing">
                <div className="md:flex justify-between items-center mb-6">
                    <h5 className="text-lg font-semibold">{t("adminUserEdit.title")}</h5>
                    <Breadcrumb
                        items={[
                            { title: <Link to="/admin/dashboard">{t("adminUserEdit.breadcrumb.dashboard")}</Link> },
                            { title: <Link to="/admin/users">{t("adminUserEdit.breadcrumb.users")}</Link> },
                            { title: t("adminUserEdit.breadcrumb.edit") },
                        ]}
                    />
                </div>
                <div className="md:flex md:justify-end justify-end items-center mb-6">
                    <Button
                        onClick={() => navigate(-1)}
                        icon={<ArrowLeftOutlined />}
                    >
                        {t("adminUserEdit.actions.back")}
                    </Button>
                </div>
                <Card title={t("adminUserEdit.cardTitle")} className="mt-4">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Row gutter={16}>
                            <Col span={6}>
                                <Form.Item label={t("adminUserEdit.fields.avatar")} name="upload" valuePropName="fileList" getValueFromEvent={normFile}>
                                    <Upload
                                        name="avatar"
                                        listType="picture-card"
                                        showUploadList={false}
                                        beforeUpload={() => false}
                                        onChange={({ file }) => setImageUrl(URL.createObjectURL(file))}
                                    >
                                        {imageUrl ? (
                                            <Avatar size={128} 
                                            src={imageUrl ? imageUrl : user?.avatar ? buildImageUrl(user?.avatar) : undefined}
                                            icon={<UserOutlined />} />
                                        ) : (
                                            <div>
                                                <UploadOutlined />
                                                <div style={{ marginTop: 8 }}>{t("adminUserEdit.upload.upload")}</div>
                                            </div>
                                        )}
                                    </Upload>
                                </Form.Item>
                            </Col>
                            <Col span={18}>
                                <Form.Item
                                    name="firstName"
                                    label={t("adminUserEdit.fields.firstName")}
                                    rules={[{ required: true, message: t("adminUserEdit.validators.firstNameRequired") }]}
                                >
                                    <Input placeholder={t("adminUserEdit.placeholders.firstName")} />
                                </Form.Item>
                                <Form.Item
                                    name="lastName"
                                    label={t("adminUserEdit.fields.lastName")}
                                    rules={[{ required: true, message: t("adminUserEdit.validators.lastNameRequired") }]}
                                >
                                    <Input placeholder={t("adminUserEdit.placeholders.lastName")} />
                                </Form.Item>
                                <Form.Item
                                    name="email"
                                    label={t("adminUserEdit.fields.email")}
                                    rules={[{ required: true, type: "email", message: t("adminUserEdit.validators.emailInvalid") }]}
                                >
                                    <Input placeholder={t("adminUserEdit.fields.email")} disabled />
                                </Form.Item>
                                <Form.Item name="phone" label={t("adminUserEdit.fields.phone")}>
                                    <Input placeholder={t("adminUserEdit.placeholders.phone")} />
                                </Form.Item>

                                <Form.Item name="adress" label={t("adminUserEdit.fields.adress")}>
                                    <Input placeholder={t("adminUserEdit.placeholders.adress")} />
                                </Form.Item>


                                 <Form.Item name="country" label={t("adminUserEdit.fields.country")}>
                                    <Input placeholder={t("adminUserEdit.placeholders.country")} />
                                </Form.Item>

                           
                                <Form.Item
                                    name="gender"
                                    label={t("adminUserEdit.fields.gender")}
                                    rules={[{ required: true, message: t("adminUserEdit.validators.gender") }]}
                                >
                                    <Select
                                        placeholder={t("adminUserEdit.placeholders.gender")}
                                    >
                                        <Option value="MALE">{t("adminUserEdit.roles.MALE")}</Option>
                                        <Option value="FEMALE">{t("adminUserEdit.roles.FEMALE")}</Option>
                                        <Option value="OTHER">{t("adminUserEdit.roles.OTHER")}</Option>
                                    </Select>
                                </Form.Item>

                               

                                <Form.Item
                                    name="role"
                                    label={t("adminUserEdit.fields.role")}
                                    rules={[{ required: true, message: t("adminUserEdit.validators.roleRequired") }]}
                                >
                                    <Select
                                        // disabled={currentUser?.role !== "SUPER_ADMIN" || currentUser?.role !== "ADMIN"}
                                        placeholder={t("adminUserEdit.placeholders.role")}
                                    >

                                        <Option value="SUPER_ADMIN">SUPER_ADMIN</Option>
                                        <Option value="ADMIN">{t("adminUserEdit.roles.ADMIN")}</Option>
                                        <Option value="DEMANDEUR">DEMANDEUR</Option>
                                        <Option value="INSTITUT">INSTITUT</Option>
                                        <Option value="SUPERVISEUR">SUPERVISEUR</Option>
                                        <Option value="TRADUCTEUR">TRADUCTEUR</Option>
                                        {currentUser?.role === "SUPER_ADMIN" && <Option value="SUPER_ADMIN">{t("adminUserEdit.roles.SUPER_ADMIN")}</Option>}
                                    </Select>
                                </Form.Item>

                                {needsOrganization && (
                                    <Form.Item
                                        name="organizationId"
                                        label={t("adminUserEdit.fields.organization")}
                                        rules={[{ required: true, message: t("adminUserEdit.validators.organizationRequired") }]}
                                    >
                                        <Select
                                            placeholder={t("adminUserEdit.placeholders.organization")}
                                            loading={fetchingOrgs}
                                            showSearch
                                            optionFilterProp="label"
                                            options={organizations.map((org) => ({
                                                value: org.id,
                                                label: org.name,
                                            }))}
                                        />
                                    </Form.Item>
                                )}

                                
                                <Form.Item
                                    name="enabled"
                                    label={t("adminUserEdit.fields.status")}
                                    valuePropName="checked"
                                >
                                    <Checkbox>{t("adminUserEdit.labels.active")}</Checkbox>
                                </Form.Item>
                                <Divider>{t("adminUserEdit.dividers.permissions")}</Divider>
                                <Form.Item name="permissions" label={t("adminUserEdit.fields.permissions")}>
                                    <Checkbox.Group>
                                        <Row gutter={[0, 16]}>
                                            {permissionsOptions.map((option) => (
                                                <Col span={8} key={option.value}>
                                                    <Checkbox value={option.value}>{option.label}</Checkbox>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Checkbox.Group>
                                </Form.Item>
                                <Form.Item>
                                    <Button
                                        htmlType="submit"
                                        type="primary"
                                        loading={loading}
                                        icon={!loading && <SaveFilled className="mr-1 h-4 w-4" />}
                                    >
                                        {loading ? t("adminUserEdit.buttons.saving") : t("adminUserEdit.buttons.save")}
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default UserEdit;
