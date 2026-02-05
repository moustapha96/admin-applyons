

"use client";
import { useState, useEffect } from "react";
import {
  Card, Avatar, Typography, Row, Col, Tag, Descriptions, Spin, Alert,
  Badge, Space, Button, Upload, Divider, Statistic, Form, Input, Modal, Select, DatePicker
} from "antd";
import {
  UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, CrownOutlined,
  SafetyCertificateOutlined, EditOutlined, CameraOutlined, CheckCircleOutlined,
  ClockCircleOutlined, LockOutlined, PlusCircleOutlined, HomeOutlined, GlobalOutlined, BankOutlined
} from "@ant-design/icons";
import authService from "../../services/authService";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { IoTransgender } from "react-icons/io5";
import { getPermissionColor, getPermissionLabel, getRoleLabel } from "../../auth/permissions";
import { useTranslation } from "react-i18next";
import { buildImageUrl } from "../../utils/imageUtils";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined } from "@ant-design/icons";
import countries from "../../assets/countries.json";
import dayjs from "dayjs";
import { DATE_FORMAT } from "../../utils/dateFormat";

const { Title, Text } = Typography;

// Helper pour convertir les dates string en dayjs
const isDay = (d) => dayjs.isDayjs(d);
const reviveDate = (v) => {
  if (!v) return null;
  if (isDay(v)) return v;
  const d = dayjs(v);
  return d.isValid() ? d : null;
};

export default function UserProfile() {
  const { t, i18n } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  const [form] = Form.useForm();
  const [passwordLoading, setPasswordLoading] = useState(false);
  const { refreshProfile, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
    
      setUserData(response.user);
      refreshProfile();
      form.setFieldsValue({
        firstName: response.user.firstName || "",
        lastName: response.user.lastName || "",
        email: response.user.email,
        phone: response.user.phone || "",
        adress: response.user.adress || "",
        country: response.user.country || "",
        gender: response.user.gender || "MALE",
        dateOfBirth: reviveDate(response.user.dateOfBirth),
        placeOfBirth: response.user.placeOfBirth || "",
      });
      setError(null);
    } catch (e) {
      setError(t("profilePage.alerts.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("email", userData.email);
    formData.append("firstName", userData.firstName);
    formData.append("lastName", userData.lastName);
    formData.append("phone", userData.phone);
    formData.append("adress", userData.adress);
    formData.append("country", userData.country);
    formData.append("gender", userData.gender);
    formData.append("dateOfBirth", userData.dateOfBirth || "");
    formData.append("placeOfBirth", userData.placeOfBirth || "");

    try {
      await authService.updateProfile(formData);
      toast.success(t("profilePage.toasts.avatarUpdated"));
      await fetchUserData();
    } catch (e) {
      toast.error(t("profilePage.toasts.avatarError"));
    }
    return false;
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);

  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      // Convertir la date dayjs en ISO string
      const payload = { ...values };
      if (values.dateOfBirth) {
        if (isDay(values.dateOfBirth)) {
          payload.dateOfBirth = values.dateOfBirth.toISOString();
        } else if (values.dateOfBirth instanceof Date) {
          payload.dateOfBirth = values.dateOfBirth.toISOString();
        } else {
          const d = dayjs(values.dateOfBirth);
          payload.dateOfBirth = d.isValid() ? d.toISOString() : null;
        }
      }
      await authService.updateProfile(payload);
      toast.success(t("profilePage.toasts.profileUpdated"));
      await fetchUserData();
      setIsEditing(false);
    } catch (e) {
      console.error("Error updating profile:", e);
      toast.error(t("profilePage.toasts.profileError"));
    } finally {
      setLoading(false);
    }
  };

  const showPasswordModal = () => setIsPasswordModalVisible(true);
  const handlePasswordCancel = () => {
    setIsPasswordModalVisible(false);
    passwordForm.resetFields();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth/login");
    } catch {
      navigate("/auth/login");
    }
  };

  const handlePasswordUpdate = async (values) => {
    setPasswordLoading(true);
    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success(t("profilePage.toasts.passwordUpdated"));
      setIsPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (e) {
      toast.error(t("profilePage.toasts.passwordError"));
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t("profilePage.common.na");
    // Utilise la langue active si possible
    const locale = i18n.language || "fr-FR";
    try {
      return new Date(dateString).toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getRoleColor = (role) => {
    const colors = { ADMIN: "red", MANAGER: "orange", USER: "blue", MODERATOR: "purple" };
    return colors[role] || "default";
  };

  const getStatusColor = (enabled) => (enabled ? "success" : "error");

  const getGenderText = (gender) => {
    const g = gender || "UNSPECIFIED";
    return t(`profilePage.gender.${g}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] sm:min-h-screen p-4">
        <Spin size="large" tip={t("profilePage.alerts.loading")} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid px-2 sm:px-3 py-4 sm:py-6">
        <Alert message={t("profilePage.alerts.errorTitle")} description={error} type="error" showIcon />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container-fluid px-2 sm:px-3 py-4 sm:py-6">
        <Alert
          message={t("profilePage.alerts.noDataTitle")}
          description={t("profilePage.alerts.noDataDesc")}
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <>
      <div className="container-fluid relative px-2 sm:px-3 overflow-x-hidden max-w-full">
        <div className="layout-specing py-4 sm:py-6">
          <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/30 min-h-screen sm:min-h-0">
            <Row gutter={[24, 24]}>
              {/* Header */}
              <Col xs={24}>
                <Card className="overflow-hidden" style={{ background: "linear-gradient(135deg, #1e81b0 0%,  #e28743 100%)", border: "none", borderRadius: 12 }}>
                  <Row align="middle" gutter={[24, 24]}>
                    <Col xs={24} md={6} className="flex justify-center md:justify-start">
                      <Badge count={<CheckCircleOutlined style={{ color: "#52c41a" }} />} offset={[-8, 8]}>
                        <Upload showUploadList={false} beforeUpload={handleAvatarUpload} accept="image/*">
                          <div className="relative cursor-pointer">
                            <Avatar
                              size={120}
                              src={userData.avatar ? buildImageUrl(userData.avatar) : undefined}
                              icon={<UserOutlined />}
                              className="border-4 border-white/30 transition-all shrink-0"
                            />
                            <div className="absolute bottom-0 right-0 bg-black/60 rounded-full p-2 text-white">
                              <CameraOutlined />
                            </div>
                          </div>
                        </Upload>
                      </Badge>
                    </Col>
                    <Col xs={24} md={10} className="flex flex-col justify-center">
                      <Title level={2} className="!m-0 !text-white text-base sm:text-xl md:text-2xl break-words">
                        {userData.firstName || userData.lastName || userData.username || t("profilePage.header.userFallback")}
                      </Title>
                      <Space size="middle" wrap className="mt-2 sm:mt-0">
                        <Tag color={getRoleColor(userData.role)} icon={<CrownOutlined />} className="text-xs sm:text-sm">
                          {getRoleLabel(userData.role, t)}
                        </Tag>
                        <Tag color={getStatusColor(userData.enabled)} icon={<SafetyCertificateOutlined />} className="text-xs sm:text-sm">
                          {userData.enabled ? t("profilePage.header.active") : t("profilePage.header.inactive")}
                        </Tag>
                      </Space>
                    </Col>
                    <Col xs={24} md={8} className="flex justify-center md:justify-end">
                      <Space wrap size="small" className="w-full sm:w-auto justify-center md:justify-end">
                        <Button type="primary" ghost icon={<EditOutlined />} size="large" className="w-full sm:w-auto !border-white !text-white" onClick={handleEdit}>
                          {t("profilePage.header.editProfile")}
                        </Button>
                        <Button type="default" ghost icon={<LockOutlined />} size="large" className="w-full sm:w-auto !border-white !text-white" onClick={showPasswordModal}>
                          {t("profilePage.header.password")}
                        </Button>
                        <Button type="default" ghost danger icon={<LogoutOutlined />} size="large" className="w-full sm:w-auto !border-white !text-white" onClick={handleLogout}>
                          {t("common.logout")}
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Quick stats */}
              <Col xs={24}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Card className="overflow-hidden">
                      <Statistic
                        title={t("profilePage.stats.activePerms")}
                        value={userData.permissions?.length || 0}
                        prefix={<SafetyCertificateOutlined />}
                        valueStyle={{ color: "#3f8600" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card className="overflow-hidden">
                      <Statistic
                        title={t("profilePage.stats.lastLogin")}
                        value={formatDate(userData.updatedAt)}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: "#1e81b0", fontSize: 16 }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card className="overflow-hidden">
                      <Statistic
                        title={t("profilePage.stats.memberSince")}
                        value={formatDate(userData.createdAt)}
                        prefix={<CalendarOutlined />}
                        valueStyle={{ color: "#722ed1", fontSize: 16 }}
                      />
                    </Card>
                  </Col>
                </Row>
              </Col>

              {/* Personal info */}
              <Col xs={24} lg={12}>
                <Card
                  className="overflow-hidden h-full"
                  title={
                    <Space>
                      <UserOutlined />
                      <span>{t("profilePage.sections.personalInfo")}</span>
                    </Space>
                  }
                  extra={
                    <Button type="link" icon={<EditOutlined />} onClick={handleEdit} className="p-0">
                      {t("profilePage.buttons.edit")}
                    </Button>
                  }
                >
                  {isEditing ? (
                    <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
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
                          format={DATE_FORMAT}
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
                        <Space wrap size="small">
                          <Button type="primary" loading={loading} icon={!loading && <PlusCircleOutlined />} htmlType="submit" className="w-full sm:w-auto">
                            {t("profilePage.buttons.save")}
                          </Button>
                          <Button onClick={handleCancel} className="w-full sm:w-auto">{t("profilePage.buttons.cancel")}</Button>
                        </Space>
                      </Form.Item>
                    </Form>
                  ) : (
                    <Descriptions column={{ xs: 1, sm: 2 }} size="small" className="break-words">
                      <Descriptions.Item
                        label={
                          <Space>
                            <MailOutlined />
                            <span>{t("profilePage.fields.email")}</span>
                          </Space>
                        }
                      >
                        <Text copyable className="break-all">{userData.email}</Text>
                      </Descriptions.Item>

                      <Descriptions.Item
                        label={
                          <Space>
                            <UserOutlined />
                            <span>{t("profilePage.fields.fullName")}</span>
                          </Space>
                        }
                      >
                        <Text className="break-words">{userData.firstName || ""} {userData.lastName || ""}</Text>
                      </Descriptions.Item>

                      <Descriptions.Item
                        label={
                          <Space>
                            <PhoneOutlined />
                            <span>{t("profilePage.fields.phone")}</span>
                          </Space>
                        }
                      >
                        <Text copyable className="break-all">{userData.phone || t("profilePage.gender.UNSPECIFIED")}</Text>
                      </Descriptions.Item>

                      <Descriptions.Item
                        label={
                          <Space>
                            <HomeOutlined />
                            <span>{t("profilePage.fields.adress")}</span>
                          </Space>
                        }
                      >
                        <Text className="break-words">{userData.adress || t("profilePage.gender.UNSPECIFIED")}</Text>
                      </Descriptions.Item>

                      <Descriptions.Item
                        label={
                          <Space>
                            <GlobalOutlined />
                            <span>{t("profilePage.fields.placeOfBirth")}</span>
                          </Space>
                        }
                      >
                        <Text className="break-words">{userData.placeOfBirth || t("profilePage.gender.UNSPECIFIED")}</Text>
                      </Descriptions.Item>

                      <Descriptions.Item
                        label={
                          <Space>
                            <CalendarOutlined />
                            <span>{t("profilePage.fields.dateOfBirth")}</span>
                          </Space>
                        }
                      >
                        <Text>{formatDate(userData.dateOfBirth)}</Text>
                      </Descriptions.Item>

                      <Descriptions.Item
                        label={
                          <Space>
                            <GlobalOutlined />
                            <span>{t("profilePage.fields.country")}</span>
                          </Space>
                        }
                      >
                        <Text className="break-words">{userData.country || t("profilePage.gender.UNSPECIFIED")}</Text>
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

              {/* Organization */}
              <Col xs={24} lg={12}>
                <Card
                  className="overflow-hidden h-full mb-4 sm:mb-6"
                  title={
                    <Space>
                      <BankOutlined />
                      <span>{t("profilePage.sections.organization")}</span>
                    </Space>
                  }
                >
                  <Title level={5} className="!mb-4">
                    <span className="break-words">{userData.organization?.name || t("profilePage.org.none")}</span>
                  </Title>
                  <Descriptions column={{ xs: 1, sm: 2 }} size="small" className="break-words">
                    <Descriptions.Item label={t("profilePage.fields.type")}>
                      <Tag color="blue">{userData.organization?.type || t("profilePage.org.unspecified")}</Tag>
                    </Descriptions.Item>
                    {/* <Descriptions.Item label={t("profilePage.fields.slug")}>
                      <Text copyable>{userData.organization?.slug || t("profilePage.org.unspecified")}</Text>
                    </Descriptions.Item> */}
                  </Descriptions>
                </Card>
              </Col>

              {/* Permissions */}
              <Col xs={24} lg={24}>
                <Card
                  className="overflow-hidden h-full"
                  title={
                    <Space>
                      <SafetyCertificateOutlined />
                      <span>{t("profilePage.sections.permissionsAccess")}</span>
                    </Space>
                  }
                >
                  <Title level={5} className="!mb-4">
                    {t("profilePage.sections.role")}: <Tag color={getRoleColor(userData.role)}>{getRoleLabel(userData.role, t)}</Tag>
                  </Title>
                  <Divider orientation="left" orientationMargin="0">
                    <Text type="secondary">{t("profilePage.sections.grantedPerms")}</Text>
                  </Divider>
                  <div className="max-h-[300px] overflow-y-auto">
                    <Space size={[8, 8]} wrap>
                      {(userData.permissions || []).map((permission) => (
                        <Tag
                          key={permission.id || permission.key}
                          color={getPermissionColor(permission.key)}
                          style={{ padding: "4px 8px", borderRadius: 6, fontSize: 12 }}
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

      {/* Password Modal */}
      <Modal
        title={t("profilePage.passwordModal.title")}
        open={isPasswordModalVisible}
        onCancel={handlePasswordCancel}
        footer={null}
        centered
      >
        <Form form={passwordForm} layout="vertical" onFinish={handlePasswordUpdate} autoComplete="off">
          <Form.Item
            name="currentPassword"
            label={t("profilePage.passwordModal.current")}
            rules={[{ required: true, message: t("profilePage.passwordModal.currentRequired") }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t("profilePage.placeholders.currentPwd")} />
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
            <Input.Password prefix={<LockOutlined />} placeholder={t("profilePage.placeholders.newPwd")} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={t("profilePage.passwordModal.confirm")}
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: t("profilePage.passwordModal.confirmRequired") },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                  return Promise.reject(new Error(t("profilePage.passwordModal.confirmMismatch")));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t("profilePage.placeholders.confirmPwd")} />
          </Form.Item>

          <Form.Item>
            <Space wrap size="small" className="w-full justify-end">
              <Button onClick={handlePasswordCancel} className="w-full sm:w-auto">{t("profilePage.buttons.cancel")}</Button>
              <Button type="primary" htmlType="submit" loading={passwordLoading} className="w-full sm:w-auto">
                {t("profilePage.buttons.save")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
