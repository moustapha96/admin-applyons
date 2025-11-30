"use client"

import { FloatButton } from "antd"
import { PlusOutlined, MessageOutlined, BookOutlined, QuestionCircleOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"

const QuickActions = () => {
    const navigate = useNavigate()

    const handleAction = (action) => {
        switch (action) {
            case "new-theme":
                navigate("/themes/new")
                break
            case "new-discussion":
                navigate("/discussions/new")
                break
            case "help":
                // Ouvrir l'aide ou modal d'aide
                console.log("Aide demandée")
                break
            default:
                break
        }
    }

    return (
        <FloatButton.Group
            trigger="click"
            type="primary"
            style={{ right: 24 }}
            icon={<PlusOutlined />}
            tooltip="Actions rapides"
        >
            <FloatButton icon={<BookOutlined />} tooltip="Nouveau thème" onClick={() => handleAction("new-theme")} />
            <FloatButton
                icon={<MessageOutlined />}
                tooltip="Nouvelle discussion"
                onClick={() => handleAction("new-discussion")}
            />
            <FloatButton icon={<QuestionCircleOutlined />} tooltip="Aide" onClick={() => handleAction("help")} />
        </FloatButton.Group>
    )
}

export default QuickActions
