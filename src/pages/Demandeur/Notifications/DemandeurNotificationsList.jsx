"use client";

import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  Card,
  Table,
  List,
  Tag,
  Button,
  Empty,
  Typography,
  message,
  Grid,
} from "antd";
import { BellOutlined, EyeOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import {
  fetchNotificationsPage,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../../services/notificationService";

dayjs.extend(relativeTime);
dayjs.locale("fr");

const { useBreakpoint } = Grid;
const { Text, Paragraph } = Typography;

export default function DemandeurNotificationsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const loadPage = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const res = await fetchNotificationsPage({ page, limit });
      setNotifications(res.notifications || []);
      const pag = res.pagination || {};
      setPagination((p) => ({
        ...p,
        current: pag.page ?? page,
        pageSize: pag.limit ?? limit,
        total: pag.total ?? 0,
      }));
    } catch (e) {
      message.error(e?.message || t("demandeurNotifications.loadError"));
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadPage(pagination.current, pagination.pageSize);
  }, [loadPage, pagination.current, pagination.pageSize]);

  const handleTableChange = (pg) => {
    setPagination((p) => ({
      ...p,
      current: pg.current,
      pageSize: pg.pageSize || p.pageSize,
    }));
  };

  const handleMarkAsRead = async (id) => {
    if (!id) return;
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (_) {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      message.success(t("demandeurNotifications.allRead"));
    } catch (_) {
      message.error(t("demandeurNotifications.markAllError"));
    }
  };

  const handleRowClick = (record) => {
    handleMarkAsRead(record.id);
    if (record.isBroadcast || record.type === "ADMIN_BROADCAST") return;
    if (record.demandeAuthentificationId) {
      navigate(`/demandeur/demandes-authentification/${record.demandeAuthentificationId}`);
      return;
    }
    if (record.demandeId) {
      navigate(`/demandeur/mes-demandes/${record.demandeId}/details`);
      return;
    }
    if (record.link && record.link.startsWith("/")) {
      navigate(record.link);
    }
  };

  const columns = [
    {
      title: t("demandeurNotifications.columns.title"),
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div className="flex items-center gap-2">
          {!record.read && (
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          )}
          <span className={record.read ? "text-gray-500 dark:text-gray-400" : "font-medium"}>
            {title || "—"}
          </span>
        </div>
      ),
    },
    {
      title: t("demandeurNotifications.columns.message"),
      dataIndex: "message",
      key: "message",
      ellipsis: true,
      render: (msg) => <Text type="secondary">{msg || "—"}</Text>,
    },
    {
      title: t("demandeurNotifications.columns.date"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (date) => (date ? dayjs(date).fromNow() : "—"),
    },
    {
      title: t("demandeurNotifications.columns.status"),
      key: "read",
      width: 100,
      render: (_, record) =>
        record.read ? (
          <Tag color="default">{t("demandeurNotifications.read")}</Tag>
        ) : (
          <Tag color="blue">{t("demandeurNotifications.unread")}</Tag>
        ),
    },
    {
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(record);
          }}
        >
          {t("demandeurNotifications.view")}
        </Button>
      ),
    },
  ];

  const emptyNode = (
    <Empty
      description={t("demandeurNotifications.empty")}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      className="py-8"
    />
  );

  return (
    <div className="min-w-0 w-full px-3 py-3 sm:px-4 sm:py-4 md:px-5">
      <Breadcrumb
        items={[
          { title: <Link to="/demandeur/dashboard">{t("sidebar.dashboard")}</Link> },
          { title: t("demandeurNotifications.title") },
        ]}
        className="mb-3 sm:mb-4 text-xs sm:text-sm"
      />
      <Card
        className="shadow-sm dark:bg-slate-800/50 dark:border-slate-700 overflow-hidden"
        title={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 text-base sm:text-lg">
              <BellOutlined className="shrink-0" />
              {t("demandeurNotifications.title")}
            </span>
            {notifications.some((n) => !n.read) && (
              <Button
                type="link"
                size="small"
                onClick={handleMarkAllAsRead}
                className="p-0 sm:pl-2 self-start sm:self-center"
              >
                {t("demandeurNotifications.markAllRead")}
              </Button>
            )}
          </div>
        }
      >
        {isMobile ? (
          <>
            <List
              loading={loading}
              dataSource={notifications}
              locale={{ emptyText: emptyNode }}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                size: "small",
                showSizeChanger: false,
                showTotal: (total) => (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t("demandeurNotifications.total", { total })}
                  </span>
                ),
                onChange: (page, pageSize) =>
                  handleTableChange({ current: page, pageSize: pageSize || pagination.pageSize }),
              }}
              renderItem={(record) => (
                <List.Item
                  key={record.id}
                  onClick={() => handleRowClick(record)}
                  className={`cursor-pointer rounded-lg px-3 py-2 -mx-1 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                    record.isBroadcast ? "cursor-default" : ""
                  } ${!record.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                  extra={
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(record);
                      }}
                      className="shrink-0"
                    >
                      {t("demandeurNotifications.view")}
                    </Button>
                  }
                >
                  <List.Item.Meta
                    title={
                      <div className="flex flex-wrap items-center gap-2">
                        {!record.read && (
                          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                        <span
                          className={`text-sm font-medium truncate max-w-[180px] sm:max-w-none ${
                            record.read ? "text-gray-500 dark:text-gray-400" : ""
                          }`}
                        >
                          {record.title || "—"}
                        </span>
                        <Tag color={record.read ? "default" : "blue"} className="shrink-0 text-xs">
                          {record.read
                            ? t("demandeurNotifications.read")
                            : t("demandeurNotifications.unread")}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="flex flex-col gap-1 mt-0.5">
                        <Paragraph
                          type="secondary"
                          ellipsis={{ rows: 2 }}
                          className="!mb-0 text-xs sm:text-sm"
                        >
                          {record.message || "—"}
                        </Paragraph>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {record.createdAt ? dayjs(record.createdAt).fromNow() : "—"}
                        </span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </>
        ) : (
          <div className="overflow-x-auto -mx-px">
            <Table
              rowKey="id"
              loading={loading}
              dataSource={notifications}
              columns={columns}
              scroll={{ x: 640 }}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => t("demandeurNotifications.total", { total }),
                size: "small",
              }}
              onChange={handleTableChange}
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                style: { cursor: record.isBroadcast ? "default" : "pointer" },
              })}
              locale={{
                emptyText: emptyNode,
              }}
              className="responsive-table"
            />
          </div>
        )}
      </Card>
    </div>
  );
}
