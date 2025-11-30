
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import logoImg from "../../assets/logo.png";
import applyonsAbout1 from "../../assets/logo.png";

import Switcher from "../../components/switcher";
import BackButton from "../../components/backButton";
import authService from "../../services/authService";
import { toast } from "sonner";

export default function AuthResetPassword() {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const html = document.documentElement;
        html.setAttribute("dir", "ltr");
        html.classList.add("light");
        html.classList.remove("dark");
    }, []);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const body = { email };
            await authService.forgotPassword(email);
            console.log("Email envoyé");
            toast.success(t('auth.resetPassword.success'));
            navigate("/auth/login");
        } catch (err) {
            console.error("Erreur lors de l'envoi de l'email :", err);
            toast.error(t('auth.resetPassword.error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Même design que le login : fond image + overlay + carte centrée */}
            <section
                className="md:h-screen py-36 flex items-center relative bg-no-repeat bg-center bg-cover"
                style={{ backgroundImage: `url(${applyonsAbout1})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />

                <div className="container relative">
                    <div className="flex justify-center">
                        <div className="max-w-[460px] w-full m-auto p-6 bg-white dark:bg-slate-900 shadow-md dark:shadow-gray-800 rounded-md">
                            {/* Logo */}
                            <div className="text-center">
                                <Link to="/">
                                    <img src={logoImg} className="mx-auto h-20" alt="applyons Logo" />
                                </Link>
                            </div>

                            {/* Titre / sous-titre */}
                            <div className="text-center my-6">
                                <h5 className="text-xl font-semibold">{t('auth.resetPassword.title')}</h5>
                                <p className="text-slate-500 mt-1">
                                    {t('auth.resetPassword.subtitle')}
                                </p>
                            </div>

                            {/* Formulaire */}
                            <form onSubmit={handleResetPassword} className="text-start">
                                <div className="grid grid-cols-1">
                                    <div className="mb-4">
                                        <label className="font-semibold" htmlFor="ResetEmail">
                                            {t('auth.resetPassword.email')}
                                        </label>
                                        <input
                                            id="ResetEmail"
                                            type="email"
                                            className="form-input mt-3 w-full py-2 px-3 h-10 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded outline-none border border-gray-200 focus:border-[var(--applyons-blue)] dark:border-gray-800 dark:focus:border-[var(--applyons-blue)] focus:ring-0"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`py-2 px-5 inline-block tracking-wide align-middle duration-500 text-base text-center ant-btn-primary text-white rounded-md w-full ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                                                }`}
                                        >
                                            {isLoading ? t('auth.resetPassword.sending') : t('auth.resetPassword.sendLink')}
                                        </button>
                                    </div>

                                    <div className="text-center">
                                        <Link
                                            to="/auth/login"
                                            className="text-[var(--applyons-orange)] font-bold inline-block hover:underline"
                                        >
                                            {t('auth.resetPassword.login')}
                                        </Link>
                                    </div>
                                </div>
                            </form>

                            {/* Footer mini */}
                            <div className="text-center mt-6">
                                <p className="mb-0 text-slate-400 text-sm">
                                    {t('auth.resetPassword.footer', { year: new Date().getFullYear() })}
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
