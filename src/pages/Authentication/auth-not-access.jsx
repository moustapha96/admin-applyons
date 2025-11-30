

"use client"

import { useEffect } from "react"
import { Button } from "antd"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import logoImg from "../../assets/logo.png";
import lockImg from "../../assets/logo.png";

export default function AuthNotAccess() {
    const { t } = useTranslation();
    const navigate = useNavigate()

    useEffect(() => {
        document.documentElement.setAttribute("dir", "ltr")
        document.documentElement.classList.add("light")
        document.documentElement.classList.remove("dark")
    }, [])

    const handleBack = () => navigate(-1)

    return (
        <section
            className="md:h-screen py-36 flex items-center relative bg-no-repeat bg-center bg-cover"
            style={{ backgroundImage: `url(${lockImg})` }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />

            <div className="container relative">
                <div className="flex justify-center">
                    <div className="max-w-[480px] w-full m-auto p-6 bg-white dark:bg-slate-900 shadow-md dark:shadow-gray-800 rounded-md">
                        {/* Logo */}
                        <div className="text-center">
                            <Link to="/">
                                <img src={logoImg} className="mx-auto h-20" alt="applyons Logo" />
                            </Link>
                        </div>

                        {/* Titre + message */}
                        <div className="text-center my-6">
                            <h5 className="text-2xl font-bold text-red-600">{t('auth.notAccess.title')}</h5>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 text-left">
                                <h6 className="font-semibold text-red-800 mb-2">
                                    {t('auth.notAccess.messageTitle')}
                                </h6>
                                <p className="text-red-700 text-sm leading-relaxed">
                                    {t('auth.notAccess.message')}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button type="primary" onClick={handleBack}>
                                {t('auth.notAccess.back')}
                            </Button>
                            <Link to="/" className="inline-flex items-center justify-center">
                                <Button>{t('auth.notAccess.home')}</Button>
                            </Link>
                        </div>

                        {/* Footer mini */}
                        <div className="text-center mt-8">
                            <p className="mb-0 text-[var(--applyons-orange)] text-sm">
                                {t('auth.notAccess.footer', { year: new Date().getFullYear() })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
