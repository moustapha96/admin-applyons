

/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { Button, message } from "antd"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import logoImg from "../../assets/logo.png";
import applyonsAbout1 from "../../assets/logo.png";

export default function AuthInactiveScreen() {
    const { t } = useTranslation();
    const navigate = useNavigate()
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)

    const [userEmail, setUserEmail] = useState("")

    useEffect(() => {
        document.documentElement.setAttribute("dir", "ltr")
        document.documentElement.classList.add("light")
        document.documentElement.classList.remove("dark")

        const email = searchParams.get("email") || localStorage.getItem("userEmail") || "Utilisateur"
        setUserEmail(email)
    }, [searchParams])

    const handleContactSupport = () => {
        message.info("Redirection vers le support…")
        navigate("/contact-support")
    }

    const handleLogout = () => {
        localStorage.clear()
        navigate("/auth/login")
    }

    return (
        <section
            className="md:h-screen py-36 flex items-center relative bg-no-repeat bg-center bg-cover"
            style={{ backgroundImage: `url(${applyonsAbout1})` }}
        >
            {/* overlay */}
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

                        {/* Titre */}
                        <div className="text-center my-6">
                            <h5 className="text-2xl font-bold text-orange-600">{t('auth.lockScreen.title')}</h5>
                            <p className="text-slate-500 text-sm mt-1">
                                {typeof userEmail === "string" ? userEmail : "Utilisateur"}
                            </p>
                        </div>

                        {/* Message */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 text-left">
                            <h6 className="font-semibold text-orange-800 mb-2">
                                {t('auth.lockScreen.subtitle')}
                            </h6>
                            <p className="text-orange-700 text-sm leading-relaxed">
                                {t('auth.lockScreen.message')}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            <Button type="primary" className="flex-1" onClick={handleContactSupport}>
                                {t('auth.lockScreen.contactSupport')}
                            </Button>
                            <Link to="/auth/login" className="flex-1">
                                <Button className="w-full">{t('auth.lockScreen.login')}</Button>
                            </Link>
                        </div>

                        <div className="mt-3 text-center">
                            <button
                                onClick={handleLogout}
                                className="text-slate-500 hover:text-slate-700 text-sm underline"
                            >
                                {t('auth.lockScreen.logout')}
                            </button>
                        </div>

                        {/* Footer mini */}
                        <div className="text-center mt-8">
                            <p className="mb-0 text-[var(--applyons-orange)] text-sm">
                                {t('auth.lockScreen.footer', { year: new Date().getFullYear() })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
