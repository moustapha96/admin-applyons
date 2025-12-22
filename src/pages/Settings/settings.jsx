// export default SettingsPage;
"use client";
import { useState, useEffect } from "react";
import {
    Card,
    Tabs,
    Form,
    Input,
    Button,
    Spin,
    Typography,
    Divider,
    Space,
    Upload,
    message,
} from "antd";
import {
    SaveOutlined,
    SettingOutlined,
    GlobalOutlined,
    TwitterOutlined,
    FacebookOutlined,
    LinkedinOutlined,
    InstagramOutlined,
    YoutubeOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import settingsService from "../../services/settingsService";

const { Title, Text } = Typography;
const { Dragger } = Upload;

const SettingsPage = () => {
    const [loading, setLoading] = useState(false);
    const [siteSettings, setSiteSettings] = useState(null);
    const [activeTab, setActiveTab] = useState("general");
    const [generalForm] = Form.useForm();
    const [logoFileList, setLogoFileList] = useState([]);
    const [faviconFileList, setFaviconFileList] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const siteResponse = await settingsService.getAll();
            console.log(siteResponse);
            const data = siteResponse?.data || null;
            setSiteSettings(data);
            if (data) {
                generalForm.setFieldsValue({
                    siteName: data.siteName,
                    contactEmail: data.contactEmail,
                    contactPhone: data.contactPhone,
                    contactMobile: data.contactMobile,
                    contactAddress: data.contactAddress,
                    urlSite: data.urlSite,
                    footer: data.footer,
                    twitter: data.socialMedia?.twitter,
                    facebook: data.socialMedia?.facebook,
                    linkedin: data.socialMedia?.linkedin,
                    instagram: data.socialMedia?.instagram,
                    youtube: data.socialMedia?.youtube,
                });

                // Pré-remplir les aperçus des fichiers
                setLogoFileList(
                    data.logo
                        ? [
                              {
                                  uid: "-1",
                                  name: "logo",
                                  status: "done",
                                  url: data.logo,
                              },
                          ]
                        : []
                );
                setFaviconFileList(
                    data.favicon
                        ? [
                              {
                                  uid: "-2",
                                  name: "favicon",
                                  status: "done",
                                  url: data.favicon,
                              },
                          ]
                        : []
                );
            }
        } catch (error) {
            toast.error("Erreur lors du chargement des données");
            console.error("Erreur:", error);
        } finally {
            setLoading(false);
        }
    };

    const validateFile = (file, { maxMB = 2, types = [] } = {}) => {
        const sizeMB = file.size / 1024 / 1024;
        const isIco = file.name?.toLowerCase().endsWith(".ico");
        if (types.length) {
            const okType = types.includes(file.type) || (isIco && types.includes(".ico"));
            if (!okType) {
                message.error("Type de fichier invalide.");
                return Upload.LIST_IGNORE;
            }
        }
        if (sizeMB > maxMB) {
            message.error(`Le fichier dépasse ${maxMB} Mo.`);
            return Upload.LIST_IGNORE;
        }
        return false;
    };

    const handleSaveGeneral = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("siteName", values.siteName);
            formData.append("contactEmail", values.contactEmail);
            formData.append("contactPhone", values.contactPhone);
            formData.append("contactMobile", values.contactMobile);
            formData.append("contactAddress", values.contactAddress);
            formData.append("footer", values.footer);
            formData.append("urlSite", values.urlSite);

            // Ajouter les réseaux sociaux sous forme de JSON
            formData.append(
                "socialMedia",
                JSON.stringify({
                    twitter: values.twitter,
                    facebook: values.facebook,
                    linkedin: values.linkedin,
                    instagram: values.instagram,
                    youtube: values.youtube,
                })
            );

            // Ajouter les nouveaux fichiers
            const newLogo = logoFileList.find((f) => f.originFileObj)?.originFileObj;
            const newFavicon = faviconFileList.find((f) => f.originFileObj)?.originFileObj;
            if (newLogo) formData.append("logo", newLogo);
            if (newFavicon) formData.append("favicon", newFavicon);

            await settingsService.update(formData);
            toast.success("Paramètres généraux sauvegardés avec succès");
            loadData();
        } catch (error) {
            console.log(error)
            toast.error("Erreur lors de la sauvegarde");
            console.error("Erreur:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !siteSettings) {
        return (
            <div style={{ textAlign: "center", padding: "50px" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <>
            <div className="container-fluid relative px-3">
                <div
                    className="layout-specing"
                    style={{
                        maxHeight: "calc(100vh - 100px)",
                        overflowY: "auto",
                        paddingRight: "8px",
                    }}
                >
                    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
                        <div style={{ marginBottom: "24px" }}>
                            <Title level={2}>
                                <SettingOutlined style={{ marginRight: "8px" }} />
                                Paramètres
                            </Title>
                            <Text type="secondary">Gérez les paramètres généraux de votre site</Text>
                        </div>
                        <Card>
                            <Tabs 
                                activeKey={activeTab} 
                                onChange={setActiveTab}
                                items={[
                                    {
                                        key: "general",
                                        label: (
                                            <span>
                                                <GlobalOutlined />
                                                Paramètres généraux
                                            </span>
                                        ),
                                        children: (
                                            <Form
                                                form={generalForm}
                                                layout="vertical"
                                                onFinish={handleSaveGeneral}
                                                style={{ maxWidth: "800px" }}
                                            >
                                                <Title level={4}>Informations du site</Title>
                                                <Form.Item
                                                    label="Nom du site"
                                                    name="siteName"
                                                    rules={[{ required: true, message: "Le nom du site est requis" }]}
                                                >
                                                    <Input placeholder="RIAFCO - Réseau International..." />
                                                </Form.Item>
                                                <Form.Item
                                                    label="Email de contact"
                                                    name="contactEmail"
                                                    rules={[
                                                        { required: true, message: "L'email de contact est requis" },
                                                        { type: "email", message: "Format d'email invalide" },
                                                    ]}
                                                >
                                                    <Input placeholder="contact@riafco.org" />
                                                </Form.Item>
                                                <Form.Item label="Adresse de contact" name="contactAddress">
                                                    <Input placeholder="Dakar, Sénégal" />
                                                </Form.Item>
                                                <Form.Item label="Numéro de téléphone (fixe)" name="contactPhone">
                                                    <Input placeholder="+221 33 800 90 90" />
                                                </Form.Item>
                                                <Form.Item label="Numéro de téléphone (mobile)" name="contactMobile">
                                                    <Input placeholder="+221 77 000 00 00" />
                                                </Form.Item>
                                                <Form.Item
                                                    label="URL du site web"
                                                    name="urlSite"
                                                    rules={[{ type: "url", message: "Format d'URL invalide" }]}
                                                >
                                                    <Input placeholder="https://riafco.org" />
                                                </Form.Item>
                                                <Form.Item label="Texte du footer" name="footer">
                                                    <Input placeholder="RIAFCO © 2024 - Tous droits réservés" />
                                                </Form.Item>
                                                <Divider />
                                                <Title level={4}>Logo et Favicon</Title>
                                                <Space direction="vertical" style={{ width: "100%" }} size="large">
                                                    <div>
                                                        <Text strong>Logo du site</Text>
                                                        <div style={{ fontSize: 12, color: "#888" }}>
                                                            PNG/SVG/JPG ≤ 2 Mo — recommandé ~ <em>180×60</em> (fond transparent si possible)
                                                        </div>
                                                        <Dragger
                                                            accept="image/png,image/jpeg,image/svg+xml"
                                                            maxCount={1}
                                                            multiple={false}
                                                            beforeUpload={(file) =>
                                                                validateFile(file, {
                                                                    maxMB: 2,
                                                                    types: ["image/png", "image/jpeg", "image/svg+xml"],
                                                                })
                                                            }
                                                            fileList={logoFileList}
                                                            listType="picture"
                                                            onChange={({ fileList }) => setLogoFileList(fileList.slice(-1))}
                                                            className="mt-2"
                                                        >
                                                            <p className="ant-upload-drag-icon">Glissez-déposez ou cliquez pour sélectionner</p>
                                                            <p className="ant-upload-hint">Remplace le logo actuel.</p>
                                                        </Dragger>
                                                    </div>
                                                    <div>
                                                        <Text strong>Favicon</Text>
                                                        <div style={{ fontSize: 12, color: "#888" }}>
                                                            ICO/PNG ≤ 1 Mo — recommandé <em>32×32</em> ou <em>48×48</em>
                                                        </div>
                                                        <Dragger
                                                            accept="image/png,image/x-icon,.ico"
                                                            maxCount={1}
                                                            multiple={false}
                                                            beforeUpload={(file) =>
                                                                validateFile(file, {
                                                                    maxMB: 1,
                                                                    types: ["image/png", "image/x-icon", ".ico"],
                                                                })
                                                            }
                                                            fileList={faviconFileList}
                                                            listType="picture"
                                                            onChange={({ fileList }) => setFaviconFileList(fileList.slice(-1))}
                                                            className="mt-2"
                                                        >
                                                            <p className="ant-upload-drag-icon">Glissez-déposez ou cliquez pour sélectionner</p>
                                                            <p className="ant-upload-hint">Remplace le favicon actuel.</p>
                                                        </Dragger>
                                                    </div>
                                                </Space>
                                                <Divider />
                                                <Title level={4}>Réseaux sociaux</Title>
                                                <Form.Item
                                                    label={
                                                        <span>
                                                            <TwitterOutlined /> Twitter
                                                        </span>
                                                    }
                                                    name="twitter"
                                                >
                                                    <Input placeholder="https://twitter.com/riafco" />
                                                </Form.Item>
                                                <Form.Item
                                                    label={
                                                        <span>
                                                            <FacebookOutlined /> Facebook
                                                        </span>
                                                    }
                                                    name="facebook"
                                                >
                                                    <Input placeholder="https://facebook.com/riafco" />
                                                </Form.Item>
                                                <Form.Item
                                                    label={
                                                        <span>
                                                            <LinkedinOutlined /> LinkedIn
                                                        </span>
                                                    }
                                                    name="linkedin"
                                                >
                                                    <Input placeholder="https://linkedin.com/company/riafco" />
                                                </Form.Item>
                                                <Form.Item
                                                    label={
                                                        <span>
                                                            <InstagramOutlined /> Instagram
                                                        </span>
                                                    }
                                                    name="instagram"
                                                >
                                                    <Input placeholder="https://instagram.com/riafco" />
                                                </Form.Item>
                                                <Form.Item
                                                    label={
                                                        <span>
                                                            <YoutubeOutlined /> YouTube
                                                        </span>
                                                    }
                                                    name="youtube"
                                                >
                                                    <Input placeholder="https://youtube.com/@riafco" />
                                                </Form.Item>
                                                <Form.Item>
                                                    <Button
                                                        type="primary"
                                                        htmlType="submit"
                                                        icon={<SaveOutlined />}
                                                        loading={loading}
                                                        size="large"
                                                    >
                                                        Sauvegarder les paramètres
                                                    </Button>
                                                </Form.Item>
                                            </Form>
                                        ),
                                    },
                                ]}
                            />
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SettingsPage;
