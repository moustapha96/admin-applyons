// export default SettingsPage;
"use client";
import { useState, useEffect } from "react";
import {
    Card,
    Tabs,
    Form,
    Input,
    InputNumber,
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
    DollarOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import settingsService from "../../services/settingsService";

const { Title, Text } = Typography;
const { Dragger } = Upload;

const SettingsPage = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [siteSettings, setSiteSettings] = useState(null);
    const [activeTab, setActiveTab] = useState("general");
    const [generalForm] = Form.useForm();
    const [paymentForm] = Form.useForm();
    const [logoFileList, setLogoFileList] = useState([]);
    const [faviconFileList, setFaviconFileList] = useState([]);
    const [paymentSettings, setPaymentSettings] = useState(null);
    const [savingPayment, setSavingPayment] = useState(false);

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
            toast.error(t("adminConfig.toastLoadError"));
            console.error("Erreur:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadPaymentSettings = async () => {
        try {
            const res = await settingsService.getPaymentSettings();
            const data = res?.data?.data ?? res?.data ?? null;
            setPaymentSettings(data);
            const defaults = {
                currency: data?.currency || "USD",
                demandeAuthentification: data?.demandeAuthentification ?? 49,
                application: data?.application ?? 49,
                INSTITUT: data?.abonnement?.INSTITUT ?? 99,
                COLLEGE: data?.abonnement?.COLLEGE ?? 99,
                LYCEE: data?.abonnement?.LYCEE ?? 99,
                ENTREPRISE: data?.abonnement?.ENTREPRISE ?? 99,
                UNIVERSITE: data?.abonnement?.UNIVERSITE ?? 1000,
                BANQUE: data?.abonnement?.BANQUE ?? 1000,
            };
            paymentForm.setFieldsValue(defaults);
        } catch (e) {
            toast.error(t("adminConfig.toastPaymentLoadError"));
            console.error(e);
        }
    };

    const handleSavePayment = async (values) => {
        setSavingPayment(true);
        try {
            await settingsService.updatePaymentSettings({
                currency: values.currency,
                demandeAuthentification: values.demandeAuthentification,
                application: values.application,
                abonnement: {
                    INSTITUT: values.INSTITUT,
                    COLLEGE: values.COLLEGE,
                    LYCEE: values.LYCEE,
                    ENTREPRISE: values.ENTREPRISE,
                    UNIVERSITE: values.UNIVERSITE,
                    BANQUE: values.BANQUE,
                },
            });
            toast.success(t("adminConfig.toastPaymentSaved"));
            loadPaymentSettings();
        } catch (e) {
            toast.error(e?.response?.data?.message || t("adminConfig.toastSaveError"));
        } finally {
            setSavingPayment(false);
        }
    };

    const validateFile = (file, { maxMB = 2, types = [] } = {}) => {
        const sizeMB = file.size / 1024 / 1024;
        const isIco = file.name?.toLowerCase().endsWith(".ico");
        if (types.length) {
            const okType = types.includes(file.type) || (isIco && types.includes(".ico"));
            if (!okType) {
                message.error(t("adminConfig.fileTypeInvalid"));
                return Upload.LIST_IGNORE;
            }
        }
        if (sizeMB > maxMB) {
            message.error(t("adminConfig.fileTooLarge", { maxMB }));
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
            toast.success(t("adminConfig.toastGeneralSaved"));
            loadData();
        } catch (error) {
            console.log(error);
            toast.error(t("adminConfig.toastSaveError"));
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
                                {t("adminConfig.title")}
                            </Title>
                            <Text type="secondary">{t("adminConfig.subtitle")}</Text>
                        </div>
                        <Card>
                            <Tabs 
                                activeKey={activeTab} 
                                onChange={(k) => { setActiveTab(k); if (k === "payment") loadPaymentSettings(); }}
                                items={[
                                    {
                                        key: "general",
                                        label: (
                                            <span>
                                                <GlobalOutlined />
                                                {t("adminConfig.tabGeneral")}
                                            </span>
                                        ),
                                        children: (
                                            <Form
                                                form={generalForm}
                                                layout="vertical"
                                                onFinish={handleSaveGeneral}
                                                style={{ maxWidth: "800px" }}
                                            >
                                                <Title level={4}>{t("adminConfig.siteInfo")}</Title>
                                                <Form.Item
                                                    label={t("adminConfig.siteName")}
                                                    name="siteName"
                                                    rules={[{ required: true, message: t("adminConfig.siteNameRequired") }]}
                                                >
                                                    <Input placeholder={t("adminConfig.siteNamePlaceholder")} />
                                                </Form.Item>
                                                <Form.Item
                                                    label={t("adminConfig.contactEmail")}
                                                    name="contactEmail"
                                                    rules={[
                                                        { required: true, message: t("adminConfig.contactEmailRequired") },
                                                        { type: "email", message: t("adminConfig.invalidEmail") },
                                                    ]}
                                                >
                                                    <Input placeholder={t("adminConfig.contactEmailPlaceholder")} />
                                                </Form.Item>
                                                <Form.Item label={t("adminConfig.contactAddress")} name="contactAddress">
                                                    <Input placeholder={t("adminConfig.contactAddressPlaceholder")} />
                                                </Form.Item>
                                                <Form.Item label={t("adminConfig.contactPhone")} name="contactPhone">
                                                    <Input placeholder={t("adminConfig.contactPhonePlaceholder")} />
                                                </Form.Item>
                                                <Form.Item label={t("adminConfig.contactMobile")} name="contactMobile">
                                                    <Input placeholder={t("adminConfig.contactMobilePlaceholder")} />
                                                </Form.Item>
                                                <Form.Item
                                                    label={t("adminConfig.urlSite")}
                                                    name="urlSite"
                                                    rules={[{ type: "url", message: t("adminConfig.invalidUrl") }]}
                                                >
                                                    <Input placeholder={t("adminConfig.urlSitePlaceholder")} />
                                                </Form.Item>
                                                <Form.Item label={t("adminConfig.footerText")} name="footer">
                                                    <Input placeholder={t("adminConfig.footerPlaceholder")} />
                                                </Form.Item>
                                                <Divider />
                                                <Title level={4}>{t("adminConfig.logoAndFavicon")}</Title>
                                                <Space direction="vertical" style={{ width: "100%" }} size="large">
                                                    <div>
                                                        <Text strong>{t("adminConfig.logoTitle")}</Text>
                                                        <div style={{ fontSize: 12, color: "#888" }}>
                                                            {t("adminConfig.logoHint")}
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
                                                            <p className="ant-upload-drag-icon">{t("adminConfig.dragOrClick")}</p>
                                                            <p className="ant-upload-hint">{t("adminConfig.replaceLogo")}</p>
                                                        </Dragger>
                                                    </div>
                                                    <div>
                                                        <Text strong>{t("adminConfig.faviconTitle")}</Text>
                                                        <div style={{ fontSize: 12, color: "#888" }}>
                                                            {t("adminConfig.faviconHint")}
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
                                                            <p className="ant-upload-drag-icon">{t("adminConfig.dragOrClick")}</p>
                                                            <p className="ant-upload-hint">{t("adminConfig.replaceFavicon")}</p>
                                                        </Dragger>
                                                    </div>
                                                </Space>
                                                <Divider />
                                                <Title level={4}>{t("adminConfig.socialNetworks")}</Title>
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
                                                        {t("adminConfig.saveGeneral")}
                                                    </Button>
                                                </Form.Item>
                                            </Form>
                                        ),
                                    },
                                    {
                                        key: "payment",
                                        label: (
                                            <span>
                                                <DollarOutlined />
                                                {t("adminConfig.tabPayment")}
                                            </span>
                                        ),
                                        children: (
                                            <Form
                                                form={paymentForm}
                                                layout="vertical"
                                                onFinish={handleSavePayment}
                                                style={{ maxWidth: "600px" }}
                                            >
                                                <Title level={4}>{t("adminConfig.paymentTitle")}</Title>
                                                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                                                    {t("adminConfig.paymentDescription")}
                                                </Text>
                                                <Form.Item name="currency" label={t("adminConfig.currency")} rules={[{ required: true, message: t("adminConfig.currencyRequired") }]}>
                                                    <Input placeholder="USD" maxLength={3} style={{ width: 80 }} />
                                                </Form.Item>
                                                <Form.Item name="demandeAuthentification" label={t("adminConfig.demandeAuth")}>
                                                    <InputNumber min={0} step={1} style={{ width: 120 }} addonAfter={paymentForm.getFieldValue?.("currency") || "USD"} />
                                                </Form.Item>
                                                <Form.Item name="application" label={t("adminConfig.application")}>
                                                    <InputNumber min={0} step={1} style={{ width: 120 }} addonAfter={paymentForm.getFieldValue?.("currency") || "USD"} />
                                                </Form.Item>
                                                <Divider />
                                                <Title level={5}>{t("adminConfig.subscriptionByType")}</Title>
                                                <Form.Item name="INSTITUT" label="INSTITUT">
                                                    <InputNumber min={0} step={1} style={{ width: 120 }} />
                                                </Form.Item>
                                                <Form.Item name="COLLEGE" label="COLLEGE">
                                                    <InputNumber min={0} step={1} style={{ width: 120 }} />
                                                </Form.Item>
                                                <Form.Item name="LYCEE" label="LYCEE">
                                                    <InputNumber min={0} step={1} style={{ width: 120 }} />
                                                </Form.Item>
                                                <Form.Item name="ENTREPRISE" label="ENTREPRISE">
                                                    <InputNumber min={0} step={1} style={{ width: 120 }} />
                                                </Form.Item>
                                                <Form.Item name="UNIVERSITE" label="UNIVERSITE">
                                                    <InputNumber min={0} step={1} style={{ width: 120 }} />
                                                </Form.Item>
                                                <Form.Item name="BANQUE" label="BANQUE">
                                                    <InputNumber min={0} step={1} style={{ width: 120 }} />
                                                </Form.Item>
                                                <Form.Item>
                                                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={savingPayment}>
                                                        {t("adminConfig.savePayment")}
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
