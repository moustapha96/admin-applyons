"use client"

import { useState, useEffect } from "react"
import { Badge, Dropdown, List, Avatar, Typography, Button, Empty, Divider } from "antd"
import { BellOutlined, UserOutlined, MessageOutlined, BookOutlined } from "@ant-design/icons"
import moment from "moment"
import "moment/locale/fr"

const { Text } = Typography

moment.locale("fr")

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadNotifications()
    }, [])

    const loadNotifications = async () => {
        try {
            setLoading(true)
            // Simuler des notifications (à remplacer par un vrai service)
            const mockNotifications = [
                {
                    id: 1,
                    type: "comment",
                    title: "Nouveau commentaire",
                    message: 'Jean Dupont a commenté votre discussion "React vs Vue"',
                    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
                    read: false,
                    icon: <MessageOutlined />,
                    color: "#52c41a",
                },
                {
                    id: 2,
                    type: "theme",
                    title: "Nouveau thème",
                    message: 'Un nouveau thème "Intelligence Artificielle" a été créé',
                    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
                    read: false,
                    icon: <BookOutlined />,
                    color: "#1e81b0",
                },
                {
                    id: 3,
                    type: "mention",
                    title: "Vous avez été mentionné",
                    message: "Marie Martin vous a mentionné dans une discussion",
                    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                    read: true,
                    icon: <UserOutlined />,
                    color: "#faad14",
                },
            ]

            setNotifications(mockNotifications)
            setUnreadCount(mockNotifications.filter((n) => !n.read).length)
        } catch (error) {
            console.error("Erreur lors du chargement des notifications:", error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = (notificationId) => {
        setNotifications((prev) =>
            prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)),
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
    }

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
        setUnreadCount(0)
    }

    const notificationItems = (
        <div style={{ width: 350, maxHeight: 400, overflowY: "auto" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Text strong>Notifications</Text>
                    {unreadCount > 0 && (
                        <Button type="link" size="small" onClick={markAllAsRead}>
                            Tout marquer comme lu
                        </Button>
                    )}
                </div>
            </div>

            {notifications.length === 0 ? (
                <Empty description="Aucune notification" style={{ padding: "20px" }} />
            ) : (
                <List
                    dataSource={notifications}
                    renderItem={(notification) => (
                        <List.Item
                            key={notification.id}
                            style={{
                                padding: "12px 16px",
                                backgroundColor: notification.read ? "transparent" : "#f6ffed",
                                cursor: "pointer",
                            }}
                            onClick={() => markAsRead(notification.id)}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Avatar icon={notification.icon} style={{ backgroundColor: notification.color }} size="small" />
                                }
                                title={
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <Text strong={!notification.read}>{notification.title}</Text>
                                        {!notification.read && (
                                            <div
                                                style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: "50%",
                                                    backgroundColor: "#1e81b0",
                                                }}
                                            />
                                        )}
                                    </div>
                                }
                                description={
                                    <div>
                                        <Text type="secondary">{notification.message}</Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: "12px" }}>
                                            {moment(notification.createdAt).fromNow()}
                                        </Text>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            )}

            {notifications.length > 0 && (
                <>
                    <Divider style={{ margin: 0 }} />
                    <div style={{ padding: "12px 16px", textAlign: "center" }}>
                        <Button type="link" size="small">
                            Voir toutes les notifications
                        </Button>
                    </div>
                </>
            )}
        </div>
    )

    return (
        <Dropdown overlay={notificationItems} trigger={["click"]} placement="bottomRight">
            <Badge count={unreadCount} size="small">
                <BellOutlined style={{ fontSize: "18px", cursor: "pointer" }} />
            </Badge>
        </Dropdown>
    )
}

export default NotificationCenter
