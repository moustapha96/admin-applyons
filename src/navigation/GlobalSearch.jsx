"use client"

import { useState, useEffect } from "react"
import { Input, Modal, List, Avatar, Typography, Space, Tag, Empty, Spin } from "antd"
import { BookOutlined, MessageOutlined, UserOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import themeService from "../../services/themeService"
import discussionService from "../../services/discussionService"

const { Search } = Input
const { Text } = Typography

const GlobalSearch = ({ trigger }) => {
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState({
        themes: [],
        discussions: [],
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (searchTerm.length >= 2) {
            performSearch()
        } else {
            setSearchResults({ themes: [], discussions: [] })
        }
    }, [searchTerm])

    const performSearch = async () => {
        try {
            setLoading(true)

            const [themesResponse, discussionsResponse] = await Promise.all([
                themeService.getAll({ search: searchTerm, limit: 5 }),
                discussionService.getAll({ search: searchTerm, limit: 5 }),
            ])

            setSearchResults({
                themes: themesResponse.themes || [],
                discussions: discussionsResponse.discussions || [],
            })
        } catch (error) {
            console.error("Erreur lors de la recherche:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleItemClick = (type, id) => {
        setIsModalVisible(false)
        setSearchTerm("")
        navigate(`/${type}/${id}`)
    }

    const showModal = () => {
        setIsModalVisible(true)
    }

    const handleCancel = () => {
        setIsModalVisible(false)
        setSearchTerm("")
    }

    const renderSearchResults = () => {
        const { themes, discussions } = searchResults
        const hasResults = themes.length > 0 || discussions.length > 0

        if (loading) {
            return (
                <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spin />
                </div>
            )
        }

        if (!hasResults && searchTerm.length >= 2) {
            return <Empty description="Aucun résultat trouvé" style={{ padding: "20px" }} />
        }

        return (
            <div>
                {themes.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                        <Text strong style={{ color: "#1e81b0" }}>
                            Thèmes
                        </Text>
                        <List
                            size="small"
                            dataSource={themes}
                            renderItem={(theme) => (
                                <List.Item style={{ cursor: "pointer" }} onClick={() => handleItemClick("themes", theme.id)}>
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<BookOutlined />} size="small" />}
                                        title={theme.title}
                                        description={theme.description}
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                )}

                {discussions.length > 0 && (
                    <div>
                        <Text strong style={{ color: "#52c41a" }}>
                            Discussions
                        </Text>
                        <List
                            size="small"
                            dataSource={discussions}
                            renderItem={(discussion) => (
                                <List.Item style={{ cursor: "pointer" }} onClick={() => handleItemClick("discussions", discussion.id)}>
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<MessageOutlined />} size="small" />}
                                        title={
                                            <Space>
                                                {discussion.title}
                                                <Tag size="small">{discussion.theme?.title}</Tag>
                                            </Space>
                                        }
                                        description={
                                            <Space>
                                                <UserOutlined />
                                                <Text type="secondary">
                                                    {discussion.createdBy?.firstName} {discussion.createdBy?.lastName}
                                                </Text>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            <div onClick={showModal} style={{ cursor: "pointer" }}>
                {trigger}
            </div>

            <Modal title="Recherche globale" open={isModalVisible} onCancel={handleCancel} footer={null} width={600}>
                <Search
                    placeholder="Rechercher des thèmes, discussions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ marginBottom: "16px" }}
                    autoFocus
                />

                <div style={{ maxHeight: "400px", overflowY: "auto" }}>{renderSearchResults()}</div>
            </Modal>
        </>
    )
}

export default GlobalSearch
