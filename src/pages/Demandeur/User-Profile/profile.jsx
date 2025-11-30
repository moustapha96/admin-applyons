
// "use client";
// import { useState, useEffect } from "react";
// import {
//   Card, Avatar, Typography, Row, Col, Tag, Descriptions, Spin, Alert,
//   Badge, Space, Button, Upload, Statistic, Form, Input, Modal
// } from "antd";
// import {
//   UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, CrownOutlined,
//   SafetyCertificateOutlined, EditOutlined, CameraOutlined, CheckCircleOutlined,
//   ClockCircleOutlined, LockOutlined, PlusCircleOutlined, HomeOutlined, GlobalOutlined
// } from "@ant-design/icons";
// import authService from "../../../services/authService";
// import { toast } from "sonner";
// import { useAuth } from "../../../hooks/useAuth";
// import { IoTransgender } from "react-icons/io5";
// import { useTranslation } from "react-i18next";

// const { Title, Text } = Typography;

// export default function DemandeurUserProfile() {
//   const { t, i18n } = useTranslation();
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
//   const [passwordForm] = Form.useForm();
//   const [form] = Form.useForm();
//   const [passwordLoading, setPasswordLoading] = useState(false);
//   const { refreshProfile } = useAuth();

//   useEffect(() => { fetchUserData(); /* eslint-disable-next-line */ }, []);

//   const fetchUserData = async () => {
//     try {
//       setLoading(true);
//       const response = await authService.getProfile();
//       setUserData(response.user);
//       refreshProfile();
//       form.setFieldsValue({
//         firstName: response.user.firstName || "",
//         lastName: response.user.lastName || "",
//         email: response.user.email,
//         phone: response.user.phone || "",
//         adress: response.user.adress || "",
//         country: response.user.country || "",
//         gender: response.user.gender || "MALE",
//       });
//       setError(null);
//     } catch (e) {
//       console.error("Error fetching user data:", e);
//       setError(t("profilePage.alerts.loadError"));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAvatarUpload = async (file) => {
//     const formData = new FormData();
//     formData.append("avatar", file);
//     formData.append("email", userData.email);
//     formData.append("firstName", userData.firstName);
//     formData.append("lastName", userData.lastName);
//     formData.append("phone", userData.phone);
//     formData.append("adress", userData.adress);
//     formData.append("country", userData.country);
//     formData.append("gender", userData.gender);

//     try {
//       await authService.updateProfile(formData);
//       toast.success(t("profilePage.toasts.avatarUpdated"));
//       await fetchUserData();
//     } catch (e) {
//       console.error("Error uploading avatar:", e);
//       toast.error(t("profilePage.toasts.avatarError"));
//     }
//     return false;
//   };

//   const handleEdit = () => setIsEditing(true);
//   const handleCancel = () => setIsEditing(false);

//   const handleUpdateProfile = async (values) => {
//     setLoading(true);
//     try {
//       await authService.updateProfile(values);
//       toast.success(t("profilePage.toasts.profileUpdated"));
//       await fetchUserData();
//       setIsEditing(false);
//     } catch (e) {
//       console.error("Error updating profile:", e);
//       toast.error(t("profilePage.toasts.profileError"));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showPasswordModal = () => setIsPasswordModalVisible(true);
//   const handlePasswordCancel = () => {
//     setIsPasswordModalVisible(false);
//     passwordForm.resetFields();
//   };

//   const handlePasswordUpdate = async (values) => {
//     setPasswordLoading(true);
//     try {
//       await authService.changePassword({
//         currentPassword: values.currentPassword,
//         newPassword: values.newPassword,
//       });
//       toast.success(t("profilePage.toasts.passwordUpdated"));
//       setIsPasswordModalVisible(false);
//       passwordForm.resetFields();
//     } catch (e) {
//       console.error("Error updating password:", e);
//       toast.error(t("profilePage.toasts.passwordError"));
//     } finally {
//       setPasswordLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return t("profilePage.common.na");
//     const locale = i18n.language || "fr-FR";
//     try {
//       return new Date(dateString).toLocaleDateString(locale, {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } catch {
//       return dateString;
//     }
//   };

//   const getRoleColor = (role) => {
//     const colors = { ADMIN: "red", MANAGER: "orange", USER: "blue", MODERATOR: "purple" };
//     return colors[role] || "default";
//   };
//   const getStatusColor = (enabled) => (enabled ? "success" : "error");
//   const getGenderText = (gender) => t(`profilePage.gender.${gender || "UNSPECIFIED"}`);

//   if (loading) {
//     return (
//       <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
//         <Spin tip={t("profilePage.alerts.loading")} />
//       </div>
//     );
//   }

//   if (error) {
//     return <Alert message={t("profilePage.alerts.errorTitle")} description={error} type="error" showIcon style={{ margin: 20 }} />;
//   }

//   if (!userData) {
//     return (
//       <Alert
//         message={t("profilePage.alerts.noDataTitle")}
//         description={t("profilePage.alerts.noDataDesc")}
//         type="warning"
//         showIcon
//         style={{ margin: 20 }}
//       />
//     );
//   }

//   return (
//     <>
//       <div className="container-fluid relative px-3">
//         <div className="layout-specing">
//           <div style={{ padding: 24, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
//             <Row gutter={[24, 24]}>
//               {/* Header */}
//               <Col span={24}>
//                 <Card style={{ background: "linear-gradient(135deg, #1e81b0 0%,  #e28743 100%)", border: "none", borderRadius: 12 }}>
//                   <Row align="middle" gutter={24}>
//                     <Col>
//                       <Badge count={<CheckCircleOutlined style={{ color: "#52c41a" }} />} offset={[-8, 8]}>
//                         <Upload showUploadList={false} beforeUpload={handleAvatarUpload} accept="image/*">
//                           <Avatar
//                             size={120}
//                             src={userData.avatar}
//                             icon={<UserOutlined />}
//                             style={{ cursor: "pointer", border: "4px solid rgba(255,255,255,0.3)", transition: "all 0.3s ease" }}
//                           />
//                           <div style={{ position: "absolute", bottom: 0, right: 0, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: "50%", padding: 8, color: "white" }}>
//                             <CameraOutlined />
//                           </div>
//                         </Upload>
//                       </Badge>
//                     </Col>
//                     <Col flex={1}>
//                       <Title level={2} style={{ color: "white", margin: 0 }}>
//                         {userData.firstName || userData.lastName || userData.username || t("profilePage.header.userFallback")}
//                       </Title>
//                       <Space size="middle" style={{ marginTop: 8 }}>
//                         <Tag color={getRoleColor(userData.role)} icon={<CrownOutlined />} style={{ fontSize: 14, padding: "4px 12px" }}>
//                           {userData.role}
//                         </Tag>
//                         <Tag color={getStatusColor(userData.enabled)} icon={<SafetyCertificateOutlined />} style={{ fontSize: 14, padding: "4px 12px" }}>
//                           {userData.enabled ? t("profilePage.header.active") : t("profilePage.header.inactive")}
//                         </Tag>
//                       </Space>
//                     </Col>
//                     <Col>
//                       <Space>
//                         <Button type="primary" ghost icon={<EditOutlined />} size="large" style={{ borderColor: "white", color: "white" }} onClick={handleEdit}>
//                           {t("profilePage.header.editProfile")}
//                         </Button>
//                         <Button type="default" ghost icon={<LockOutlined />} size="large" style={{ borderColor: "white", color: "white" }} onClick={showPasswordModal}>
//                           {t("profilePage.header.password")}
//                         </Button>
//                       </Space>
//                     </Col>
//                   </Row>
//                 </Card>
//               </Col>

//               {/* Stats */}
//               <Col span={24}>
//                 <Row gutter={16}>
//                   <Col xs={24} sm={12}>
//                     <Card>
//                       <Statistic
//                         title={t("profilePage.stats.lastLogin")}
//                         value={formatDate(userData.updatedAt)}
//                         prefix={<ClockCircleOutlined />}
//                         valueStyle={{ color: "#1e81b0", fontSize: 16 }}
//                       />
//                     </Card>
//                   </Col>
//                   <Col xs={24} sm={12}>
//                     <Card>
//                       <Statistic
//                         title={t("profilePage.stats.memberSince")}
//                         value={formatDate(userData.createdAt)}
//                         prefix={<CalendarOutlined />}
//                         valueStyle={{ color: "#722ed1", fontSize: 16 }}
//                       />
//                     </Card>
//                   </Col>
//                 </Row>
//               </Col>

//               {/* Personal info */}
//               <Col xs={24} lg={16}>
//                 <Card
//                   title={<span><UserOutlined />{" "}{t("profilePage.sections.personalInfo")}</span>}
//                   extra={<Button type="link" icon={<EditOutlined />} onClick={handleEdit}>{t("profilePage.buttons.edit")}</Button>}
//                   style={{ height: "100%" }}
//                 >
//                   {isEditing ? (
//                     <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
//                       <Form.Item name="firstName" label={t("profilePage.fields.firstName")}>
//                         <Input placeholder={t("profilePage.placeholders.firstName")} />
//                       </Form.Item>
//                       <Form.Item name="lastName" label={t("profilePage.fields.lastName")}>
//                         <Input placeholder={t("profilePage.placeholders.lastName")} />
//                       </Form.Item>
//                       <Form.Item name="email" label={t("profilePage.fields.email")}>
//                         <Input disabled />
//                       </Form.Item>
//                       <Form.Item name="phone" label={t("profilePage.fields.phone")}>
//                         <Input placeholder={t("profilePage.placeholders.phone")} />
//                       </Form.Item>
//                       <Form.Item name="adress" label={t("profilePage.fields.adress")}>
//                         <Input placeholder={t("profilePage.placeholders.adress")} />
//                       </Form.Item>
//                       <Form.Item name="country" label={t("profilePage.fields.country")}>
//                         <Input placeholder={t("profilePage.placeholders.country")} />
//                       </Form.Item>
//                       <Form.Item name="gender" label={t("profilePage.fields.gender")}>
//                         <Input disabled value={getGenderText(userData.gender)} />
//                       </Form.Item>
//                       <Form.Item>
//                         <Space>
//                           <Button type="primary" loading={loading} icon={!loading && <PlusCircleOutlined />} htmlType="submit">
//                             {t("profilePage.buttons.save")}
//                           </Button>
//                           <Button onClick={handleCancel}>{t("profilePage.buttons.cancel")}</Button>
//                         </Space>
//                       </Form.Item>
//                     </Form>
//                   ) : (
//                     <Descriptions column={1} size="middle">
//                       <Descriptions.Item label={<span><MailOutlined />{" "}{t("profilePage.fields.email")}</span>}>
//                         <Text copyable>{userData.email}</Text>
//                       </Descriptions.Item>
//                       <Descriptions.Item label={<span><UserOutlined />{" "}{t("profilePage.fields.fullName")}</span>}>
//                         <Text>{userData.firstName || ""} {userData.lastName || ""}</Text>
//                       </Descriptions.Item>
//                       <Descriptions.Item label={<span><PhoneOutlined />{" "}{t("profilePage.fields.phone")}</span>}>
//                         <Text copyable>{userData.phone || t("profilePage.gender.UNSPECIFIED")}</Text>
//                       </Descriptions.Item>
//                       <Descriptions.Item label={<span><HomeOutlined />{" "}{t("profilePage.fields.adress")}</span>}>
//                         <Text>{userData.adress || t("profilePage.gender.UNSPECIFIED")}</Text>
//                       </Descriptions.Item>
//                       <Descriptions.Item label={<span><GlobalOutlined />{" "}{t("profilePage.fields.country")}</span>}>
//                         <Text>{userData.country || t("profilePage.gender.UNSPECIFIED")}</Text>
//                       </Descriptions.Item>
//                       <Descriptions.Item label={<span><IoTransgender />{" "}{t("profilePage.fields.gender")}</span>}>
//                         <Text>{getGenderText(userData.gender)}</Text>
//                       </Descriptions.Item>
//                       <Descriptions.Item label={<span><CalendarOutlined />{" "}{t("profilePage.fields.createdAt")}</span>}>
//                         {formatDate(userData.createdAt)}
//                       </Descriptions.Item>
//                       <Descriptions.Item label={<span><ClockCircleOutlined />{" "}{t("profilePage.fields.updatedAt")}</span>}>
//                         {formatDate(userData.updatedAt)}
//                       </Descriptions.Item>
//                     </Descriptions>
//                   )}
//                 </Card>
//               </Col>
//             </Row>
//           </div>
//         </div>
//       </div>

//       {/* Password Modal */}
//       <Modal
//         title={t("profilePage.passwordModal.title")}
//         open={isPasswordModalVisible}
//         onCancel={handlePasswordCancel}
//         footer={null}
//         centered
//       >
//         <Form form={passwordForm} layout="vertical" onFinish={handlePasswordUpdate} autoComplete="off">
//           <Form.Item
//             name="currentPassword"
//             label={t("profilePage.passwordModal.current")}
//             rules={[{ required: true, message: t("profilePage.passwordModal.currentRequired") }]}
//           >
//             <Input.Password prefix={<LockOutlined />} placeholder={t("profilePage.placeholders.currentPwd")} />
//           </Form.Item>
//           <Form.Item
//             name="newPassword"
//             label={t("profilePage.passwordModal.new")}
//             rules={[
//               { required: true, message: t("profilePage.passwordModal.newRequired") },
//               { min: 8, message: t("profilePage.passwordModal.newMin") },
//             ]}
//             hasFeedback
//           >
//             <Input.Password prefix={<LockOutlined />} placeholder={t("profilePage.placeholders.newPwd")} />
//           </Form.Item>
//           <Form.Item
//             name="confirmPassword"
//             label={t("profilePage.passwordModal.confirm")}
//             dependencies={["newPassword"]}
//             hasFeedback
//             rules={[
//               { required: true, message: t("profilePage.passwordModal.confirmRequired") },
//               ({ getFieldValue }) => ({
//                 validator(_, value) {
//                   if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
//                   return Promise.reject(new Error(t("profilePage.passwordModal.confirmMismatch")));
//                 },
//               }),
//             ]}
//           >
//             <Input.Password prefix={<LockOutlined />} placeholder={t("profilePage.placeholders.confirmPwd")} />
//           </Form.Item>
//           <Form.Item>
//             <Space style={{ width: "100%", justifyContent: "flex-end" }}>
//               <Button onClick={handlePasswordCancel}>{t("profilePage.buttons.cancel")}</Button>
//               <Button type="primary" htmlType="submit" loading={passwordLoading}>
//                 {t("profilePage.buttons.save")}
//               </Button>
//             </Space>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import {
  Card, Avatar, Typography, Row, Col, Tag, Descriptions, Spin, Alert,
  Badge, Space, Button, Upload, Statistic, Form, Input, Modal, Select
} from "antd";
import {
  UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, CrownOutlined,
  SafetyCertificateOutlined, EditOutlined, CameraOutlined, CheckCircleOutlined,
  ClockCircleOutlined, LockOutlined, PlusCircleOutlined, HomeOutlined, GlobalOutlined
} from "@ant-design/icons";
import authService from "../../../services/authService";
import { toast } from "sonner";
import { useAuth } from "../../../hooks/useAuth";
import { IoTransgender } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { getRoleLabel } from "../../../auth/permissions";
import { buildImageUrl } from "../../../utils/imageUtils";

const { Title, Text } = Typography;
const { Option } = Select;

export default function DemandeurUserProfile() {
  const { t, i18n } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  const [form] = Form.useForm();
  const [passwordLoading, setPasswordLoading] = useState(false);
  const { refreshProfile } = useAuth();

  useEffect(() => { fetchUserData(); /* eslint-disable-next-line */ }, []);

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
      });
      setError(null);
    } catch (e) {
      console.error("Error fetching user data:", e);
      setError(t("profilePage.alerts.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("email", userData.email);
    formData.append("firstName", userData.firstName || "");
    formData.append("lastName", userData.lastName || "");
    formData.append("phone", userData.phone || "");
    formData.append("adress", userData.adress || "");
    formData.append("country", userData.country || "");
    formData.append("gender", userData.gender || "UNSPECIFIED");

    try {
      await authService.updateProfile(formData);
      toast.success(t("profilePage.toasts.avatarUpdated"));
      await fetchUserData();
    } catch (e) {
      console.error("Error uploading avatar:", e);
      toast.error(t("profilePage.toasts.avatarError"));
    }
    return false;
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);

  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      await authService.updateProfile(values);
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
      console.error("Error updating password:", e);
      toast.error(t("profilePage.toasts.passwordError"));
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t("profilePage.common.na");
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
    const colors = { ADMIN: "red", MANAGER: "orange", USER: "blue", MODERATOR: "purple", DEMANDEUR: "blue" };
    return colors[role] || "default";
  };
  const getStatusColor = (enabled) => (enabled ? "success" : "error");
  const getGenderText = (gender) => t(`profilePage.gender.${gender || "UNSPECIFIED"}`);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <Spin tip={t("profilePage.alerts.loading")} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message={t("profilePage.alerts.errorTitle")}
        description={error}
        type="error"
        showIcon
        style={{ margin: 20 }}
      />
    );
  }

  if (!userData) {
    return (
      <Alert
        message={t("profilePage.alerts.noDataTitle")}
        description={t("profilePage.alerts.noDataDesc")}
        type="warning"
        showIcon
        style={{ margin: 20 }}
      />
    );
  }

  return (
    <>
      <div className="container-fluid relative px-3">
        <div className="layout-specing">
          <div style={{ padding: 24, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            <Row gutter={[24, 24]}>
              {/* Header */}
              <Col span={24}>
                <Card
                  style={{
                    background: "linear-gradient(135deg, #1e81b0 0%,  #e28743 100%)",
                    border: "none",
                    borderRadius: 12
                  }}
                >
                  <Row align="middle" gutter={24}>
                    <Col>
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <Badge
                          count={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                          offset={[-8, 8]}
                        >
                          <Upload showUploadList={false} beforeUpload={handleAvatarUpload} accept="image/*">
                            <div style={{ position: "relative", cursor: "pointer" }}>
                              <Avatar
                                size={120}
                                src={userData.avatar ? buildImageUrl(userData.avatar) : undefined}
                                icon={<UserOutlined />}
                                style={{
                                  border: "4px solid rgba(255,255,255,0.3)",
                                  transition: "all 0.3s ease"
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 0,
                                  right: 0,
                                  backgroundColor: "rgba(0,0,0,0.6)",
                                  borderRadius: "50%",
                                  padding: 8,
                                  color: "white"
                                }}
                              >
                                <CameraOutlined />
                              </div>
                            </div>
                          </Upload>
                        </Badge>
                      </div>
                    </Col>

                    <Col flex={1}>
                      <Space direction="vertical" size={4} style={{ width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                          <Title level={2} style={{ color: "white", margin: 0 }}>
                            {userData.firstName || userData.lastName || userData.username || t("profilePage.header.userFallback")}
                          </Title>

                          {/* Sélecteur de langue */}
                          <Select
                            size="middle"
                            value={i18n.language}
                            onChange={(lng) => i18n.changeLanguage(lng)}
                            style={{ minWidth: 140 }}
                          >
                            <Option value="fr">Français</Option>
                            <Option value="en">English</Option>
                            <Option value="es">Español</Option>
                            <Option value="it">Italiano</Option>
                            <Option value="de">Deutsch</Option>
                            <Option value="zh">中文</Option>
                          </Select>
                        </div>

                        <Space size="middle" style={{ marginTop: 8 }}>
                          <Tag
                            color={getRoleColor(userData.role)}
                            icon={<CrownOutlined />}
                            style={{ fontSize: 14, padding: "4px 12px" }}
                          >
                            {getRoleLabel(userData.role, t)}
                          </Tag>
                          <Tag
                            color={getStatusColor(userData.enabled)}
                            icon={<SafetyCertificateOutlined />}
                            style={{ fontSize: 14, padding: "4px 12px" }}
                          >
                            {userData.enabled ? t("profilePage.header.active") : t("profilePage.header.inactive")}
                          </Tag>
                        </Space>
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
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Stats */}
              <Col span={24}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Card>
                      <Statistic
                        title={t("profilePage.stats.lastLogin")}
                        value={formatDate(userData.updatedAt)}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: "#1e81b0", fontSize: 16 }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card>
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
              <Col xs={24} lg={16}>
                <Card
                  title={<span><UserOutlined />{" "}{t("profilePage.sections.personalInfo")}</span>}
                  extra={<Button type="link" icon={<EditOutlined />} onClick={handleEdit}>{t("profilePage.buttons.edit")}</Button>}
                  style={{ height: "100%" }}
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
                      <Form.Item name="country" label={t("profilePage.fields.country")}>
                        <Input placeholder={t("profilePage.placeholders.country")} />
                      </Form.Item>
                      <Form.Item name="gender" label={t("profilePage.fields.gender")}>
                        <Input disabled value={getGenderText(userData.gender)} />
                      </Form.Item>
                      <Form.Item>
                        <Space>
                          <Button type="primary" loading={loading} icon={!loading && <PlusCircleOutlined />} htmlType="submit">
                            {t("profilePage.buttons.save")}
                          </Button>
                          <Button onClick={handleCancel}>{t("profilePage.buttons.cancel")}</Button>
                        </Space>
                      </Form.Item>
                    </Form>
                  ) : (
                    <Descriptions column={1} size="middle">
                      <Descriptions.Item label={<span><MailOutlined />{" "}{t("profilePage.fields.email")}</span>}>
                        <Text copyable>{userData.email}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label={<span><UserOutlined />{" "}{t("profilePage.fields.fullName")}</span>}>
                        <Text>{(userData.firstName || "") + " " + (userData.lastName || "")}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label={<span><PhoneOutlined />{" "}{t("profilePage.fields.phone")}</span>}>
                        <Text copyable>{userData.phone || t("profilePage.gender.UNSPECIFIED")}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label={<span><HomeOutlined />{" "}{t("profilePage.fields.adress")}</span>}>
                        <Text>{userData.adress || t("profilePage.gender.UNSPECIFIED")}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label={<span><GlobalOutlined />{" "}{t("profilePage.fields.country")}</span>}>
                        <Text>{userData.country || t("profilePage.gender.UNSPECIFIED")}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label={<span><IoTransgender />{" "}{t("profilePage.fields.gender")}</span>}>
                        <Text>{getGenderText(userData.gender)}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label={<span><CalendarOutlined />{" "}{t("profilePage.fields.createdAt")}</span>}>
                        {formatDate(userData.createdAt)}
                      </Descriptions.Item>
                      <Descriptions.Item label={<span><ClockCircleOutlined />{" "}{t("profilePage.fields.updatedAt")}</span>}>
                        {formatDate(userData.updatedAt)}
                      </Descriptions.Item>
                    </Descriptions>
                  )}
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
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={handlePasswordCancel}>{t("profilePage.buttons.cancel")}</Button>
              <Button type="primary" htmlType="submit" loading={passwordLoading}>
                {t("profilePage.buttons.save")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
