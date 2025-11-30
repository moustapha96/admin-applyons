
/* eslint-disable no-unused-vars */
"use client"

import { useEffect, useState } from "react";
import { Form, Input, Button, Card, Typography, Alert } from "antd";
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import logoImg from "../../assets/logo.png";
import applyonsAbout1 from "../../assets/logo.png";

import Switcher from "../../components/switcher";
import BackButton from "../../components/backButton";
import authService from "../../services/authService";

const { Title, Text } = Typography;

export default function AuthNewPassword() {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");
    const navigate = useNavigate();

    useEffect(() => {
        const htmlTag = document.documentElement;
        htmlTag.setAttribute("dir", "ltr");
        htmlTag.classList.add("light");
        htmlTag.classList.remove("dark");
    }, []);

    useEffect(() => {
        if (!token) navigate("/auth/login");
    }, [token, navigate]);

    const validatePassword = (_, value) => {
        if (!value) return Promise.reject(new Error(t('auth.newPassword.errors.passwordRequired')));
        if (value.length < 8) return Promise.reject(new Error(t('auth.newPassword.errors.passwordMin')));
        if (!/(?=.*[a-z])/.test(value)) return Promise.reject(new Error(t('auth.newPassword.errors.passwordLowercase')));
        if (!/(?=.*[A-Z])/.test(value)) return Promise.reject(new Error(t('auth.newPassword.errors.passwordUppercase')));
        if (!/(?=.*\d)/.test(value)) return Promise.reject(new Error(t('auth.newPassword.errors.passwordNumber')));
        return Promise.resolve();
    };

    const validateConfirmPassword = (_, value) => {
        if (!value) return Promise.reject(new Error(t('auth.newPassword.errors.confirmRequired')));
        if (value !== form.getFieldValue("newPassword")) return Promise.reject(new Error(t('auth.newPassword.errors.confirmMismatch')));
        return Promise.resolve();
    };

    const handleResetPassword = async (values) => {
        if (!token) return;
        setIsLoading(true);
        setError("");
        const body = {
            token,
            newPassword: values.newPassword
        }
        console.log(body)
        try {
            await authService.resetPassword({ token, newPassword: values.newPassword });
            setSuccess(true);
            setTimeout(() => navigate("/auth/login"), 2000);
        } catch (err) {
            console.error("Erreur lors de la réinitialisation:", err);
            setError(
                err?.response?.data?.message ||
                t('auth.newPassword.error')
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) return null;

    // Écran de succès (même fond + carte centrée)
    if (success) {
        return (
            <>
                <section
                    className="md:h-screen py-36 flex items-center relative bg-no-repeat bg-center bg-cover"
                    style={{ backgroundImage: `url(${applyonsAbout1})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
                    <div className="container relative">
                        <div className="flex justify-center">
                            <Card className="w-full max-w-md">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <Title level={3} className="!text-green-600">{t('auth.newPassword.success')}</Title>
                                    <Text className="text-gray-600">
                                        {t('auth.newPassword.successSubtitle')}
                                    </Text>
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>
                <Switcher />
                <BackButton />
            </>
        );
    }

    return (
        <>
            {/* Fond plein écran + overlay, carte centrée */}
            <section
                className="md:h-screen py-36 flex items-center relative bg-no-repeat bg-center bg-cover"
                style={{ backgroundImage: `url(${applyonsAbout1})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />

                <div className="container relative">
                    <div className="flex justify-center">
                        <div className="max-w-[460px] w-full m-auto p-6 bg-white dark:bg-slate-900 shadow-md dark:shadow-gray-800 rounded-md">
                            <div className="text-center">
                                <Link to="/">
                                    <img src={logoImg} className="mx-auto h-20" alt="applyons Logo" />
                                </Link>
                            </div>

                            <div className="text-center my-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <LockOutlined className="text-2xl text-blue-600" />
                                </div>
                                <Title level={3} className="!mb-1">{t('auth.newPassword.title')}</Title>
                                <Text className="text-gray-600">{t('auth.newPassword.subtitle')}</Text>
                            </div>

                            {error && <Alert message={error} type="error" showIcon className="mb-4" />}

                            <Form
                                form={form}
                                name="resetPassword"
                                onFinish={handleResetPassword}
                                layout="vertical"
                                size="large"
                            >
                                <Form.Item
                                    name="newPassword"
                                    label={t('auth.newPassword.newPassword')}
                                    rules={[{ validator: validatePassword }]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined />}
                                        placeholder={t('auth.newPassword.placeholders.newPassword')}
                                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="confirmPassword"
                                    label={t('auth.newPassword.confirmPassword')}
                                    rules={[{ validator: validateConfirmPassword }]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined />}
                                        placeholder={t('auth.newPassword.placeholders.confirmPassword')}
                                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                    />
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={isLoading} block size="large">
                                        {isLoading ? t('auth.newPassword.changing') : t('auth.newPassword.change')}
                                    </Button>
                                </Form.Item>
                            </Form>

                            <div className="text-center">
                                <Text className="text-gray-500">
                                    {t('auth.newPassword.rememberPassword')}{" "}
                                    <Button type="link" onClick={() => navigate("/auth/login")} className="p-0">
                                        {t('auth.newPassword.login')}
                                    </Button>
                                </Text>
                            </div>

                            <div className="text-center mt-6">
                                <p className="mb-0 text-slate-400 text-sm">
                                    {t('auth.newPassword.footer', { year: new Date().getFullYear() })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Switcher />
            <BackButton />
        </>
    );
}
