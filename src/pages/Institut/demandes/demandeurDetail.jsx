// import { useEffect, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { Breadcrumb, Card, Descriptions, Avatar, Statistic, Row, Col, Divider, Tag, Space, Button, Spin } from "antd";
// import { UserOutlined, MailOutlined, PhoneOutlined, EditFilled } from "@ant-design/icons";
// import userService from "../../../services/userService";

// import {  getPermissionColor, getPermissionLabel } from "../../../auth/permissions"

// const DemandeurDetails = () => {
//     const { id } = useParams();
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const navigate = useNavigate();

//     useEffect(() => {
//         document.documentElement.setAttribute("dir", "ltr");
//         document.documentElement.classList.add("light");
//         document.documentElement.classList.remove("dark");
//         fetchUserDetails(id);
//     }, [id]);

//     const fetchUserDetails = async (userId) => {
//         setLoading(true);
//         try {
//             const response = await userService.getById(userId);
//             console.log(response);
//             setUser(response.user);
//         } catch (error) {
//             console.error("Erreur lors de la récupération de l'utilisateur:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (loading) return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;
//     if (!user) return <div>demandeur non trouvé.</div>;

//     return (
//         <div className="container-fluid relative px-3">
//             <div className="layout-specing">
//                 <div className="md:flex justify-between items-center mb-6">
//                     <h5 className="text-lg font-semibold">Détails du demandeur</h5>
//                     <Breadcrumb
//                         items={[
//                             { title: <Link to="/organisations/dashboard">Dashboard</Link> },
//                             { title: <Link to="/organisations/demandes/">Liste des demandes</Link> },
//                             { title: `${user.firstName || ""} ${user.lastName || ""}` },
//                         ]}
//                     />
//                 </div>
//                 <div className="md:flex md:justify-end justify-end items-center mb-6">
                    
//                 </div>
//                 <Card>
//                     <Descriptions title="Informations personnelles" bordered>
//                         <Descriptions.Item label="Nom complet" span={2}>
//                             <Avatar size="large" icon={<UserOutlined />} src={user.avatar} />
//                             <span className="ml-3">{user.firstName || ""} {user.lastName || ""}</span>
//                         </Descriptions.Item>
//                         <Descriptions.Item label="Email">
//                             <Link to={`mailto:${user.email}`}>
//                                 <MailOutlined /> {user.email}
//                             </Link>
//                         </Descriptions.Item>
//                         <Descriptions.Item label="Téléphone">
//                             {user.phone ? <Link to={`tel:${user.phone}`}><PhoneOutlined /> {user.phone}</Link> : "N/A"}
//                         </Descriptions.Item>
                       
                        
                       
//                     </Descriptions>
                   
//                     <Divider />
                    
//                 </Card>
//             </div>
//         </div>
//     );
// };

// export default DemandeurDetails;
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb, Card, Descriptions, Avatar, Spin, Tag, Space, Divider } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import userService from "../../../services/userService";
import { getPermissionColor, getPermissionLabel } from "../../../auth/permissions";
import { useTranslation } from "react-i18next";

const DemandeurDetails = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
        fetchUserDetails(id);
    }, [id]);

    const fetchUserDetails = async (userId) => {
        setLoading(true);
        try {
            const response = await userService.getById(userId);
            setUser(response.user);
        } catch (error) {
            console.error(t("institutDemandeurDetail.messages.loadError"), error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;
    if (!user) return <div>{t("institutDemandeurDetail.messages.notFound")}</div>;

    return (
        <div className="container-fluid relative px-3">
            <div className="layout-specing">
                <div className="md:flex justify-between items-center mb-6">
                    <h5 className="text-lg font-semibold">{t("institutDemandeurDetail.title")}</h5>
                    <Breadcrumb
                        items={[
                            { title: <Link to="/organisations/dashboard">{t("institutDemandeurDetail.breadcrumbs.dashboard")}</Link> },
                            { title: <Link to="/organisations/demandes/">{t("institutDemandeurDetail.breadcrumbs.demandes")}</Link> },
                            { title: `${user.firstName || ""} ${user.lastName || ""}` },
                        ]}
                    />
                </div>

                <Card>
                    <Descriptions title={t("institutDemandeurDetail.sections.personalInfo")} bordered column={3}>
                        <Descriptions.Item label={t("institutDemandeurDetail.sections.fullName")} span={2}>
                            <Avatar size="large" icon={<UserOutlined />} src={user.avatar} />
                            <span className="ml-3">{user.firstName || ""} {user.lastName || ""}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label={t("institutDemandeurDetail.sections.email")} span={1}>
                            <Link to={`mailto:${user.email}`}>
                                <MailOutlined /> {user.email}
                            </Link>
                        </Descriptions.Item>
                        <Descriptions.Item label={t("institutDemandeurDetail.sections.phone")} span={1}>
                            {user.phone ? <Link to={`tel:${user.phone}`}><PhoneOutlined /> {user.phone}</Link> : t("institutDemandeurDetail.common.na")}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("institutDemandeurDetail.sections.country")} span={1}>
                            {user.country || t("institutDemandeurDetail.common.na")}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("institutDemandeurDetail.sections.address")} span={1}>
                            {user.adress || t("institutDemandeurDetail.common.na")}
                        </Descriptions.Item>

                        <Descriptions.Item label={t("institutDemandeurDetail.sections.gender")} span={1}>
                            {user.gender || t("institutDemandeurDetail.common.na")}
                        </Descriptions.Item>
                       
                    </Descriptions>

                    <Divider />

                   
                </Card>
            </div>
        </div>
    );
};

export default DemandeurDetails;
