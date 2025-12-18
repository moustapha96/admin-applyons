/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  Card,
  Descriptions,
  Space,
  Button,
  Tag,
  Spin,
  Badge,
  message,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  BellOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import organizationDemandeNotificationService from "@/services/organizationDemandeNotificationService";

const getNotificationTypeColor = (type) => {
  const colors = {
    DEMANDE_CREATED: "blue",
    DEMANDE_UPDATED: "orange",
    DEMANDE_ASSIGNED: "green",
    DOCUMENT_ADDED: "purple",
    INVITATION_SENT: "cyan",
    DEFAULT: "default",
  };
  return colors[type] || colors.DEFAULT;
};

export default function AdminOrganizationNotificationDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadNotification = async () => {
    setLoading(true);
    try {
      const res = await organizationDemandeNotificationService.getById(id);
      const data = res?.data || res;
      setNotification(data);
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          t("adminOrgNotificationDetail.messages.loadError")
      );
      navigate("/admin/organisations/notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadNotification();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleMarkAsViewed = async () => {
    if (!notification || notification.viewed) return;
    try {
      await organizationDemandeNotificationService.markAsViewed(id);
      message.success(t("adminOrgNotificationDetail.messages.markedAsViewed"));
      loadNotification();
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          t("adminOrgNotificationDetail.messages.markError")
      );
    }
  };

  if (loading) {
    return (
      <div className="container-fluid relative px-3">
        <div className="layout-specing">
          <div className="flex items-center justify-center min-h-screen">
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="container-fluid relative px-3">
        <div className="layout-specing">
          <Card>
            <p>{t("adminOrgNotificationDetail.errors.notFound")}</p>
            <Button onClick={() => navigate("/admin/organisations/notifications")}>
              {t("adminOrgNotificationDetail.actions.backToList")}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const demande = notification.demandePartage || notification.demande;
  const user = notification.user || notification.createdBy;
  const targetOrg = notification.targetOrg;
  const notifiedOrg = notification.notifiedOrg;

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">
            {t("adminOrgNotificationDetail.pageTitle")}
          </h5>
          <Breadcrumb
            items={[
              {
                title: (
                  <Link to="/admin/dashboard">
                    {t("adminOrgNotificationDetail.breadcrumbs.dashboard")}
                  </Link>
                ),
              },
              {
                title: (
                  <Link to="/admin/organisations/notifications">
                    {t("adminOrgNotificationDetail.breadcrumbs.notifications")}
                  </Link>
                ),
              },
              { title: notification.id || id },
            ]}
          />
        </div>

        <div className="mb-4">
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              {t("adminOrgNotificationDetail.actions.back")}
            </Button>
            {!notification.viewed && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleMarkAsViewed}
              >
                {t("adminOrgNotificationDetail.actions.markAsViewed")}
              </Button>
            )}
          </Space>
        </div>

        {/* Informations principales */}
        <Card className="mb-6" title={t("adminOrgNotificationDetail.sections.mainInfo")}>
          <Descriptions bordered column={2}>
            <Descriptions.Item label={t("adminOrgNotificationDetail.fields.id")} span={2}>
              <Tag color="blue">{notification.id}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t("adminOrgNotificationDetail.fields.status")}>
              <Badge
                status={notification.viewed ? "default" : "processing"}
                text={
                  notification.viewed
                    ? t("adminOrgNotificationDetail.status.viewed")
                    : t("adminOrgNotificationDetail.status.unviewed")
                }
              />
            </Descriptions.Item>

            <Descriptions.Item label={t("adminOrgNotificationDetail.fields.type")}>
              <Tag color={getNotificationTypeColor(notification.type)}>
                {t(
                  `adminOrgNotificationDetail.types.${notification.type || "DEFAULT"}`
                )}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t("adminOrgNotificationDetail.fields.message")} span={2}>
              <div style={{ whiteSpace: "pre-wrap" }}>
                {notification.message || notification.title || "—"}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label={t("adminOrgNotificationDetail.fields.createdAt")}>
              {notification.createdAt
                ? dayjs(notification.createdAt).format("DD/MM/YYYY HH:mm:ss")
                : "—"}
            </Descriptions.Item>

            {notification.notifiedAt && (
              <Descriptions.Item label={t("adminOrgNotificationDetail.fields.notifiedAt")}>
                {dayjs(notification.notifiedAt).format("DD/MM/YYYY HH:mm:ss")}
              </Descriptions.Item>
            )}

            {notification.viewedAt && (
              <Descriptions.Item label={t("adminOrgNotificationDetail.fields.viewedAt")}>
                {dayjs(notification.viewedAt).format("DD/MM/YYYY HH:mm:ss")}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Demande liée */}
        {demande && (
          <Card className="mb-6" title={t("adminOrgNotificationDetail.sections.demande")}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label={t("adminOrgNotificationDetail.fields.demandeCode")}>
                <Space>
                  <Tag color="blue">{demande.code || demande.id}</Tag>
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/admin/demandes/${demande.id}/details`)}
                  >
                    {t("adminOrgNotificationDetail.actions.viewDemande")}
                  </Button>
                </Space>
              </Descriptions.Item>

              {demande.status && (
                <Descriptions.Item label={t("adminOrgNotificationDetail.fields.demandeStatus")}>
                  <Tag color="blue">{demande.status}</Tag>
                </Descriptions.Item>
              )}

              {demande.dateDemande && (
                <Descriptions.Item label={t("adminOrgNotificationDetail.fields.demandeDate")}>
                  {dayjs(demande.dateDemande).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        {/* Organisations */}
        {(targetOrg || notifiedOrg) && (
          <Card className="mb-6" title={t("adminOrgNotificationDetail.sections.organizations")}>
            <Descriptions bordered column={2}>
              {targetOrg && (
                <Descriptions.Item label={t("adminOrgNotificationDetail.fields.targetOrg")}>
                  <Space>
                    <span>{targetOrg.name}</span>
                    {targetOrg.id && (
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() =>
                          navigate(`/admin/organisations/${targetOrg.id}/details`)
                        }
                      >
                        {t("adminOrgNotificationDetail.actions.viewOrg")}
                      </Button>
                    )}
                  </Space>
                </Descriptions.Item>
              )}

              {notifiedOrg && (
                <Descriptions.Item label={t("adminOrgNotificationDetail.fields.notifiedOrg")}>
                  <Space>
                    <span>{notifiedOrg.name}</span>
                    {notifiedOrg.id && (
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() =>
                          navigate(`/admin/organisations/${notifiedOrg.id}/details`)
                        }
                      >
                        {t("adminOrgNotificationDetail.actions.viewOrg")}
                      </Button>
                    )}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        {/* Utilisateur */}
        {user && (
          <Card className="mb-6" title={t("adminOrgNotificationDetail.sections.user")}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label={t("adminOrgNotificationDetail.fields.userEmail")}>
                <Space>
                  <span>{user.email || user.username || "—"}</span>
                  {user.id && (
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/admin/users/${user.id}/details`)}
                    >
                      {t("adminOrgNotificationDetail.actions.viewUser")}
                    </Button>
                  )}
                </Space>
              </Descriptions.Item>

              {(user.firstName || user.lastName) && (
                <Descriptions.Item label={t("adminOrgNotificationDetail.fields.userName")}>
                  {`${user.firstName || ""} ${user.lastName || ""}`.trim() || "—"}
                </Descriptions.Item>
              )}

              {user.role && (
                <Descriptions.Item label={t("adminOrgNotificationDetail.fields.userRole")}>
                  <Tag color="blue">{user.role}</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        {/* Métadonnées */}
        <Card title={t("adminOrgNotificationDetail.sections.metadata")}>
          <Descriptions bordered column={2} size="small">
            {notification.createdBy && (
              <Descriptions.Item label={t("adminOrgNotificationDetail.fields.createdBy")}>
                {notification.createdBy.email || notification.createdBy.id || "—"}
              </Descriptions.Item>
            )}

            {notification.updatedAt && (
              <Descriptions.Item label={t("adminOrgNotificationDetail.fields.updatedAt")}>
                {dayjs(notification.updatedAt).format("DD/MM/YYYY HH:mm:ss")}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      </div>
    </div>
  );
}
