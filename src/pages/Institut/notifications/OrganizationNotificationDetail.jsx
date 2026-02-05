/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
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
  FileAddOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import organizationDemandeNotificationService from "@/services/organizationDemandeNotificationService";
import { DATE_FORMAT, DATE_TIME_FORMAT } from "@/utils/dateFormat";

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

/** Extrait le demandeur depuis une notification */
function getDemandeur(notification) {
  const demande = notification.demandePartage ?? notification.demande;
  return (
    notification.demandePartage?.demande?.user ??
    notification.demandePartage?.user ??
    demande?.user ??
    null
  );
}

/** basePath selon la route : /traducteur ou /organisations */
function useNotificationsBasePath() {
  const { pathname } = useLocation();
  return pathname.startsWith("/traducteur") ? "/traducteur" : "/organisations";
}

/** Lien détail demande selon le contexte */
function getDemandeDetailPath(basePath, demandeId) {
  if (!demandeId) return "#";
  return basePath === "/traducteur"
    ? `${basePath}/demandes/${demandeId}`
    : `${basePath}/demandes/${demandeId}/details`;
}

export default function OrganizationNotificationDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const basePath = useNotificationsBasePath();
  const { user } = useAuth();
  const orgId = user?.organization?.id;

  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadNotification = async () => {
    setLoading(true);
    try {
      const res = await organizationDemandeNotificationService.getById(id);
      const data = res?.data ?? res;
      const notif = data?.notification ?? data;
      setNotification(notif);
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          t("orgNotificationDetail.messages.loadError")
      );
      navigate(`${basePath}/notifications`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadNotification();
  }, [id]);

  const handleMarkAsViewed = async () => {
    if (!notification || notification.viewed) return;
    try {
      await organizationDemandeNotificationService.markAsViewed(id);
      message.success(t("orgNotificationDetail.messages.markedAsViewed"));
      loadNotification();
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          t("orgNotificationDetail.messages.markError")
      );
    }
  };

  if (!orgId) {
    return (
      <div className="container-fluid relative px-2 sm:px-3 overflow-x-hidden max-w-full">
        <div className="layout-specing py-4 sm:py-6">
          <Card>
            <p className="text-red-600">{t("orgNotifications.errors.noOrgId")}</p>
            <Button onClick={() => navigate(`${basePath}/notifications`)}>
              {t("orgNotificationDetail.actions.backToList")}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-fluid relative px-2 sm:px-3 overflow-x-hidden max-w-full">
        <div className="layout-specing py-4 sm:py-6">
          <div className="flex items-center justify-center min-h-[50vh] p-4">
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
          <Card>
            <p>{t("orgNotificationDetail.errors.notFound")}</p>
            <Button onClick={() => navigate(`${basePath}/notifications`)}>
              {t("orgNotificationDetail.actions.backToList")}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const demande = notification.demandePartage || notification.demande;
  const demandeId = demande?.id ?? notification.demandePartageId;
  const demandeur = getDemandeur(notification);
  const targetOrgId = notification.targetOrgId ?? notification.demandePartage?.targetOrgId;
  const isTargetOrg = targetOrgId != null && String(targetOrgId) === String(orgId);

  return (
    <div className="container-fluid relative px-2 sm:px-3 overflow-x-hidden max-w-full">
      <div className="layout-specing py-4 sm:py-6">
        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
          <h5 className="text-base sm:text-lg font-semibold order-2 sm:order-1 break-words">
            {t("orgNotificationDetail.pageTitle")}
          </h5>
          <Breadcrumb
            className="order-1 sm:order-2"
            items={[
              {
                title: (
                  <Link to={`${basePath}/dashboard`}>
                    {t("orgNotificationDetail.breadcrumbs.dashboard")}
                  </Link>
                ),
              },
              {
                title: (
                  <Link to={`${basePath}/notifications`}>
                    {t("orgNotificationDetail.breadcrumbs.notifications")}
                  </Link>
                ),
              },
              { title: <span className="break-words">{notification.id || id}</span> },
            ]}
          />
        </div>

        <div className="mb-4 sm:mb-6">
          <Space wrap size="small">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`${basePath}/notifications`)}
              className="w-full sm:w-auto"
            >
              {t("orgNotificationDetail.actions.back")}
            </Button>
           
            {!notification.viewed && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleMarkAsViewed}
                className="w-full sm:w-auto"
              >
                {t("orgNotificationDetail.actions.markAsViewed")}
              </Button>
            )}
          </Space>
        </div>

        {/* Informations principales — détails simples uniquement */}
        <Card
          className="mb-4 sm:mb-6 overflow-hidden"
          title={t("orgNotificationDetail.sections.mainInfo")}
        >
          <Descriptions
            bordered
            column={{ xs: 1, sm: 2 }}
            size="small"
            className="break-words"
          >
            <Descriptions.Item label={t("orgNotificationDetail.fields.status")}>
              <Badge
                status={notification.viewed ? "default" : "processing"}
                text={
                  notification.viewed
                    ? t("orgNotificationDetail.status.viewed")
                    : t("orgNotificationDetail.status.unviewed")
                }
              />
            </Descriptions.Item>

            <Descriptions.Item label={t("orgNotificationDetail.fields.type")}>
              <Tag color={getNotificationTypeColor(notification.type)}>
                {t(`orgNotifications.types.${notification.type || "DEFAULT"}`)}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t("orgNotificationDetail.fields.message")} span={2}>
              <div className="break-words whitespace-pre-wrap">
                {notification.message || notification.title || "—"}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label={t("orgNotificationDetail.fields.createdAt")}>
              {notification.createdAt
                ? dayjs(notification.createdAt).format(DATE_TIME_FORMAT)
                : "—"}
            </Descriptions.Item>

            {notification.viewedAt && (
              <Descriptions.Item label={t("orgNotificationDetail.fields.viewedAt")}>
                {dayjs(notification.viewedAt).format(DATE_TIME_FORMAT)}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Demandeur (infos simples) */}
        {demandeur && (
          <Card
            className="mb-4 sm:mb-6 overflow-hidden"
            title={t("orgNotificationDetail.sections.demandeur")}
          >
            <Descriptions
              bordered
              column={{ xs: 1, sm: 2 }}
              size="small"
              className="break-words"
            >
              <Descriptions.Item label={t("orgNotificationDetail.fields.demandeurName")}>
                {[demandeur.firstName ?? demandeur.first_name, demandeur.lastName ?? demandeur.last_name]
                  .filter(Boolean)
                  .join(" ") || "—"}
              </Descriptions.Item>
              <Descriptions.Item label={t("orgNotificationDetail.fields.demandeurEmail")}>
                <span className="break-all">{demandeur.email ?? "—"}</span>
              </Descriptions.Item>
              {(demandeur.dateOfBirth ?? demandeur.dob ?? demandeur.date_of_birth) && (
                <Descriptions.Item label={t("orgNotifications.columns.dateOfBirth")}>
                  {dayjs(
                    demandeur.dateOfBirth ?? demandeur.dob ?? demandeur.date_of_birth
                  ).format(DATE_FORMAT)}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        {/* Demande liée (code + liens optionnels) */}
        {(demande || demandeId) && (
          <Card
            className="mb-4 sm:mb-6 overflow-hidden"
            title={t("orgNotificationDetail.sections.demande")}
          >
            <Descriptions
              bordered
              column={{ xs: 1, sm: 2 }}
              size="small"
              className="break-words"
            >
              <Descriptions.Item label={t("orgNotificationDetail.fields.demandeCode")} span={2}>
                <Space wrap size="small">
                  <Tag color="blue">{demande?.code || demande?.id || demandeId}</Tag>
                  
                  {isTargetOrg && (demande?.code ?? demande?.id) && (
                    <Button
                      size="small"
                      type="primary"
                      icon={<FileAddOutlined />}
                      onClick={() =>
                        navigate(
                          `${basePath}/demandes/ajoute-document?code=${encodeURIComponent(demande.code || demande.id || demandeId)}`
                        )
                      }
                    >
                      {t("orgNotifications.buttons.addDocument")}
                    </Button>
                  )}
                </Space>
              </Descriptions.Item>
              {demande?.dateDemande && (
                <Descriptions.Item label={t("orgNotificationDetail.fields.demandeDate")}>
                  {dayjs(demande.dateDemande).format(DATE_TIME_FORMAT)}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}
      </div>
    </div>
  );
}
