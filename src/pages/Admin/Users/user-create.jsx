import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "antd";
import { UserOutlined, UploadOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import userService from "../../../services/userService";
import organizationService from "../../../services/organizationService";
import { usePermissions } from "../../../hooks/usePermissions";

const { Option } = Select;

const UserCreate = () => {
    const { t } = useTranslation();
    const { permissions, getPermissionLabel, getPermissionsByRole, loading: permissionsLoading } = usePermissions();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [organizations, setOrganizations] = useState([]);
    const [fetchingOrgs, setFetchingOrgs] = useState(false);
    const navigate = useNavigate();

    // Rôle sélectionné dans le formulaire
    const selectedRole = Form.useWatch("role", form);

    // Filtrer les permissions selon le rôle sélectionné
    const filteredPermissions = selectedRole 
        ? getPermissionsByRole(selectedRole)
        : permissions;

    // Utiliser les permissions du backend filtrées par rôle
    const permissionsOptions = filteredPermissions.map((perm) => ({
        label: getPermissionLabel(perm.key) || perm.name || perm.key,
        value: perm.key,
    }));

    useEffect(() => {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");

        const fetchOrganizations = async () => {
            setFetchingOrgs(true);
            try {
                const response = await organizationService.list({ limit: 1000 });
                setOrganizations(response.organizations || []);
            } catch (error) {
                console.error("Erreur lors de la récupération des organisations:", error);
                message.error(t("adminUserCreate.messages.orgFetchError"));
            } finally {
                setFetchingOrgs(false);
            }
        };

        fetchOrganizations();
    }, []);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("email", values.email);
            formData.append("firstName", values.firstName);
            formData.append("lastName", values.lastName);
            formData.append("phone", values.phone);
            formData.append("role", values.role);
            formData.append("enabled", true);
            formData.append("gender", values.gender);
            formData.append("adress", values.adress);
            formData.append("country", values.country);
            if (["INSTITUT", "TRADUCTEUR", "SUPERVISEUR"].includes(values.role) && values.organizationId) {
                formData.append("organizationId", values.organizationId);
            }
            formData.append("password", values.password);
            formData.append("confirmPassword", values.confirmPassword);
            if (values.upload?.[0]) {
                formData.append("avatar", values.upload[0].originFileObj);
            }
            values.permissions?.forEach((permission) => {
                formData.append("permissions[]", permission);
            });
            await userService.create(formData);
            message.success(t("adminUserCreate.messages.success"));
            navigate("/admin/users");
        } catch (error) {
            console.error("Erreur lors de l'envoi des données:", error);
            message.error(error?.message || t("adminUserCreate.messages.error"));
        } finally {
            setLoading(false);
        }
    };

    const normFile = (e) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    const needsOrganization = ["INSTITUT", "TRADUCTEUR", "SUPERVISEUR"].includes(selectedRole);

    return (
        <div className="container-fluid relative px-2 sm:px-3 overflow-x-hidden max-w-full">
            <div className="layout-specing py-4 sm:py-6">
                <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                    <h5 className="text-base sm:text-lg font-semibold order-2 sm:order-1">{t("adminUserCreate.title")}</h5>
                    <Breadcrumb
                        className="order-1 sm:order-2"
                        items={[
                            { title: <Link to="/admin/dashboard">{t("adminUserCreate.breadcrumb.dashboard")}</Link> },
                            { title: <Link to="/admin/users">{t("adminUserCreate.breadcrumb.users")}</Link> },
                            { title: t("adminUserCreate.breadcrumb.new") },
                        ]}
                    />
                </div>
                <Card title={t("adminUserCreate.cardTitle")} className="mt-4 overflow-hidden">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{ enabled: true, role: "DEMANDEUR" }}
                        className="user-create-form"
                    >
                        <Row gutter={[16, 24]}>
                            <Col xs={24} sm={24} md={10} lg={6}>
                                <div className="flex flex-col items-center md:items-start">
                                    <Form.Item label={t("adminUserCreate.fields.avatar")} name="upload" valuePropName="fileList" getValueFromEvent={normFile} className="mb-0">
                                        <Upload
                                            name="avatar"
                                            listType="picture-card"
                                            showUploadList={false}
                                            beforeUpload={() => false}
                                            onChange={({ file }) => setImageUrl(URL.createObjectURL(file))}
                                            className="avatar-uploader-responsive"
                                        >
                                            {imageUrl ? (
                                                <Avatar size={128} className="!w-full !max-w-[128px] !h-auto aspect-square" src={imageUrl} icon={<UserOutlined />} />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center p-2">
                                                    <UploadOutlined className="text-2xl" />
                                                    <span className="mt-2 text-xs sm:text-sm">{t("adminUserCreate.upload.upload")}</span>
                                                </div>
                                            )}
                                        </Upload>
                                    </Form.Item>
                                </div>
                            </Col>
                            <Col xs={24} sm={24} md={14} lg={18}>
                                <Form.Item
                                    name="firstName"
                                    label={t("adminUserCreate.fields.firstName")}
                                    rules={[{ required: true, message: t("adminUserCreate.validators.firstNameRequired") }]}
                                >
                                    <Input placeholder={t("adminUserCreate.placeholders.firstName")} />
                                </Form.Item>
                                <Form.Item
                                    name="lastName"
                                    label={t("adminUserCreate.fields.lastName")}
                                    rules={[{ required: true, message: t("adminUserCreate.validators.lastNameRequired") }]}
                                >
                                    <Input placeholder={t("adminUserCreate.placeholders.lastName")} />
                                </Form.Item>
                                <Form.Item
                                    name="email"
                                    label={t("adminUserCreate.fields.email")}
                                    rules={[{ required: true, type: "email", message: t("adminUserCreate.validators.emailInvalid") }]}
                                >
                                    <Input placeholder={t("adminUserCreate.placeholders.email")} />
                                </Form.Item>
                                <Form.Item name="phone" label={t("adminUserCreate.fields.phone")}>
                                    <Input placeholder={t("adminUserCreate.placeholders.phone")} />
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
                                    <Select placeholder={t("adminUserEdit.placeholders.gender")}>
                                        <Option value="MALE">{t("adminUserEdit.roles.MALE")}</Option>
                                        <Option value="FEMALE">{t("adminUserEdit.roles.FEMALE")}</Option>
                                        <Option value="OTHER">{t("adminUserEdit.roles.OTHER")}</Option>
                                    </Select>
                                </Form.Item>

                               
                                <Form.Item
                                    name="role"
                                    label={t("adminUserCreate.fields.role")}
                                    rules={[{ required: true, message: t("adminUserCreate.validators.roleRequired") }]}
                                >
                                    <Select placeholder={t("adminUserCreate.placeholders.role")}>
                                        <Option value="DEMANDEUR">DEMANDEUR</Option>
                                        <Option value="INSTITUT">INSTITUT</Option>
                                        <Option value="TRADUCTEUR">TRADUCTEUR</Option>
                                        <Option value="SUPERVISEUR">SUPERVISEUR</Option>
                                        <Option value="ADMIN">ADMIN</Option>
                                    </Select>
                                </Form.Item>

                                {needsOrganization && (
                                    <Form.Item
                                        name="organizationId"
                                        label={t("adminUserCreate.fields.organization")}
                                        rules={[{ required: true, message: t("adminUserCreate.validators.organizationRequired") }]}
                                    >
                                        <Select
                                            placeholder={t("adminUserCreate.placeholders.organization")}
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


                                <Divider>{t("adminUserCreate.dividers.permissions")}</Divider>
                                <Form.Item name="permissions" label={t("adminUserCreate.fields.permissions")}>
                                    {permissionsLoading ? (
                                        <div>{t("adminUserCreate.loadingPermissions")}</div>
                                    ) : (
                                        <Checkbox.Group className="w-full">
                                            <Row gutter={[12, 12]}>
                                                {permissionsOptions.map((option) => (
                                                    <Col xs={24} sm={12} md={8} lg={8} key={option.value}>
                                                        <Checkbox value={option.value} className="!whitespace-normal">{option.label}</Checkbox>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Checkbox.Group>
                                    )}
                                </Form.Item>
                                <Divider>{t("adminUserCreate.dividers.password")}</Divider>
                                <Form.Item
                                    name="password"
                                    label={t("adminUserCreate.fields.password")}
                                    rules={[{ required: true, message: t("adminUserCreate.validators.passwordRequired") }]}
                                >
                                    <Input.Password placeholder={t("adminUserCreate.fields.password")} />
                                </Form.Item>
                                <Form.Item
                                    name="confirmPassword"
                                    label={t("adminUserCreate.fields.confirmPassword")}
                                    dependencies={['password']}
                                    rules={[
                                        { required: true, message: t("adminUserCreate.validators.confirmRequired") },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('password') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error(t("adminUserCreate.validators.passwordMismatch")));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password placeholder={t("adminUserCreate.fields.confirmPassword")} />
                                </Form.Item>
                                <Form.Item className="mb-0 sm:mb-4">
                                    <Button
                                        htmlType="submit"
                                        type="primary"
                                        loading={loading}
                                        icon={!loading && <PlusCircleOutlined className="mr-1 h-4 w-4" />}
                                        className="w-full sm:w-auto"
                                    >
                                        {loading ? t("adminUserCreate.buttons.submitting") : t("adminUserCreate.buttons.submit")}
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

export default UserCreate;
