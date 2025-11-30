"use client"

import { Breadcrumb as AntBreadcrumb } from "antd"
import { HomeOutlined, BookOutlined, MessageOutlined } from "@ant-design/icons"
import { useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

const Breadcrumb = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [breadcrumbItems, setBreadcrumbItems] = useState([])

    useEffect(() => {
        const pathSegments = location.pathname.split("/").filter(Boolean)
        const items = []

        // Toujours ajouter l'accueil
        items.push({
            title: (
                <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    <HomeOutlined /> Accueil
                </span>
            ),
        })

        // Construire le breadcrumb basé sur le chemin
        if (pathSegments.length > 0) {
            const firstSegment = pathSegments[0]

            switch (firstSegment) {
                case "themes":
                    items.push({
                        title: (
                            <span onClick={() => navigate("/themes")} style={{ cursor: "pointer" }}>
                                <BookOutlined /> Thèmes
                            </span>
                        ),
                    })

                    if (pathSegments[1] && pathSegments[1] !== "new") {
                        items.push({
                            title: pathSegments[2] === "edit" ? "Modifier" : "Détails",
                        })
                    } else if (pathSegments[1] === "new") {
                        items.push({
                            title: "Nouveau thème",
                        })
                    }
                    break

                case "discussions":
                    items.push({
                        title: (
                            <span onClick={() => navigate("/discussions")} style={{ cursor: "pointer" }}>
                                <MessageOutlined /> Discussions
                            </span>
                        ),
                    })

                    if (pathSegments[1] && pathSegments[1] !== "new") {
                        items.push({
                            title: pathSegments[2] === "edit" ? "Modifier" : "Détails",
                        })
                    } else if (pathSegments[1] === "new") {
                        items.push({
                            title: "Nouvelle discussion",
                        })
                    }
                    break

                case "dashboard":
                    // Déjà ajouté l'accueil
                    break

                default:
                    items.push({
                        title: firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1),
                    })
            }
        }

        setBreadcrumbItems(items)
    }, [location.pathname, navigate])

    return <AntBreadcrumb items={breadcrumbItems} style={{ margin: "16px 0" }} />
}

export default Breadcrumb
