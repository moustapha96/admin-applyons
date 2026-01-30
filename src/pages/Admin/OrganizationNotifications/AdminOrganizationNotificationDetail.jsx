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
} from "antd";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  CheckCircleOutlined,
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
      const data = res?.data ?? res;
      setNotification(data?.notification ?? data);
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
      <div className="container-fluid relative px-2 sm:px-3 overflow-x-hidden max-w-full">
        <div className="layout-specing py-4 sm:py-6">
          <div className="flex items-center justify-center min-h-[50vh] sm:min-h-screen p-4">
            <Spin size="large" tip={t("common.loading")} />
          </div>
        </div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="container-fluid relative px-2 sm:px-3 overflow-x-hidden max-w-full">
        <div className="layout-specing py-4 sm:py-6">
          <Card className="overflow-hidden">
            <p className="break-words">{t("adminOrgNotificationDetail.errors.notFound")}</p>
            <Button onClick={() => navigate("/admin/organisations/notifications")} className="w-full sm:w-auto">
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
    <div className="container-fluid relative px-2 sm:px-3 overflow-x-hidden max-w-full">
      <div className="layout-specing py-4 sm:py-6">
        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
          <h5 className="text-base sm:text-lg font-semibold order-2 sm:order-1 break-words">
            {t("adminOrgNotificationDetail.pageTitle")}
          </h5>
          <Breadcrumb
            className="order-1 sm:order-2"
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
              { title: <span className="break-words">{notification.id || id}</span> },
            ]}
          />
        </div>

        <div className="mb-4 sm:mb-6">
          <Space wrap size="small">
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="w-full sm:w-auto">
              {t("adminOrgNotificationDetail.actions.back")}
            </Button>
            {!notification.viewed && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleMarkAsViewed}
                className="w-full sm:w-auto"
              >
                {t("adminOrgNotificationDetail.actions.markAsViewed")}
              </Button>
            )}
          </Space>
        </div>

        {/* Informations principales */}
        <Card className="mb-4 sm:mb-6 overflow-hidden" title={t("adminOrgNotificationDetail.sections.mainInfo")}>
          <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" className="break-words">
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
              <div className="break-words whitespace-pre-wrap">
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
          <Card className="mb-4 sm:mb-6 overflow-hidden" title={t("adminOrgNotificationDetail.sections.demande")}>
            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" className="break-words">
              <Descriptions.Item label={t("adminOrgNotificationDetail.fields.demandeCode")}>
                <Space wrap size="small">
                  <Tag color="blue">{demande.code || demande.id}</Tag>
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/admin/demandes/${demande.id}/details`)}
                    className="w-full sm:w-auto"
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
          <Card className="mb-4 sm:mb-6 overflow-hidden" title={t("adminOrgNotificationDetail.sections.organizations")}>
            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" className="break-words">
              {targetOrg && (
                <Descriptions.Item label={t("adminOrgNotificationDetail.fields.targetOrg")}>
                  <Space wrap size="small">
                    <span className="break-words">{targetOrg.name}</span>
                    {targetOrg.id && (
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/admin/organisations/${targetOrg.id}`)}
                        className="w-full sm:w-auto"
                      >
                        {t("adminOrgNotificationDetail.actions.viewOrg")}
                      </Button>
                    )}
                  </Space>
                </Descriptions.Item>
              )}

              {notifiedOrg && (
                <Descriptions.Item label={t("adminOrgNotificationDetail.fields.notifiedOrg")}>
                  <Space wrap size="small">
                    <span className="break-words">{notifiedOrg.name}</span>
                    {notifiedOrg.id && (
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/admin/organisations/${notifiedOrg.id}`)}
                        className="w-full sm:w-auto"
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
          <Card className="mb-4 sm:mb-6 overflow-hidden" title={t("adminOrgNotificationDetail.sections.user")}>
            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" className="break-words">
              <Descriptions.Item label={t("adminOrgNotificationDetail.fields.userEmail")}>
                <Space wrap size="small">
                  <span className="break-all">{user.email || user.username || "—"}</span>
                  {user.id && (
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/admin/users/${user.id}/details`)}
                      className="w-full sm:w-auto"
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
        <Card className="overflow-hidden" title={t("adminOrgNotificationDetail.sections.metadata")}>
          <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" className="break-words">
            {notification.createdBy && (
              <Descriptions.Item label={t("adminOrgNotificationDetail.fields.createdBy")}>
                <span className="break-all">
                  {typeof notification.createdBy === "object"
                    ? (notification.createdBy.email || notification.createdBy.id || "—")
                    : String(notification.createdBy)}
                </span>
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
