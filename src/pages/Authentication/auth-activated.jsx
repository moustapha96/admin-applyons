

/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";


import Switcher from "../../components/switcher";
import BackButton from "../../components/backButton";
import { toast } from "sonner";

import  authService  from "../../services/authService";
import logoImg from "../../assets/logo.png";

export default function AuthActivateAccount() {
    const { t } = useTranslation();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const email = searchParams.get("email") || "";
    const token = searchParams.get("token") || "";

   
    const [status, setStatus] = useState ("pending");
    const [isActivating, setIsActivating] = useState(true);
    const [isResending, setIsResending] = useState(false);

    const navigate = useNavigate();

    // Harmonise le html comme sur Login
    useEffect(() => {
        const htmlTag = document.documentElement;
        htmlTag.setAttribute("dir", "ltr");
        htmlTag.classList.add("light");
        htmlTag.classList.remove("dark");
    }, []);

    // Activation automatique au chargement
    useEffect(() => {
        const run = async () => {
            if (!token) {
                setStatus("error");
                setIsActivating(false);
                toast.error(t('auth.activate.errorMissing'));
                return;
            }

            try {
                const response = await authService.verifyAccount(token);
                toast.success(response?.message || t('auth.activate.successMessage'));
                setStatus("success");

                // Prépare une redirection propre vers /auth/login?email=...
                const nextEmail = (response?.user?.email || email || "").trim();
                // délai court pour que l'utilisateur lise le message
                setTimeout(() => {
                    const qs = nextEmail ? `?email=${encodeURIComponent(nextEmail)}` : "";
                    navigate(`/auth/login${qs}`);
                }, 3500);
            } catch (err) {
                console.error(err);
                setStatus("error");
                toast.error(t('auth.activate.errorExpired'));
            } finally {
                setIsActivating(false);
            }
        };

        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleResend = async () => {
        if (!email) {
            toast.warning(t('auth.activate.emailNotFound'));
            navigate("/auth/login");
            return;
        }

        try {
            setIsResending(true);
            const response = await authService.resendActivation(email);
            toast.success(response?.message || t('auth.activate.resendSuccess'));
        } catch (error) {
            console.error(error);
            toast.error(error?.message || t('auth.activate.resendError'));
        } finally {
            setIsResending(false);
        }
    };

    return (
        <>
            {/* Même structure visuelle que Login */}
            <section
                className="md:h-screen py-36 flex items-center relative bg-no-repeat bg-center bg-cover"
                style={{ backgroundImage: `url(${logoImg})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />

                <div className="container relative">
                    <div className="flex justify-center">
                        {/* Carte centrale */}
                        <div className="max-w-[480px] w-full m-auto p-6 bg-white dark:bg-slate-900 shadow-md dark:shadow-gray-800 rounded-md">
                            <div className="text-center">
                                <Link to="/">
                                    <img src={logoImg} className="mx-auto h-20" alt="applyons" />
                                </Link>
                            </div>

                            <h5 className="my-6 text-xl font-semibold text-slate-800 dark:text-white text-center">
                                {t('auth.activate.title')}
                            </h5>

                            {/* Contenu état */}
                            <div className="text-center">
                                {isActivating && (
                                    <div className="flex flex-col items-center gap-4 py-2">
                                        {/* petit spinner tailwind */}
                                        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--applyons-blue)] border-t-transparent" />
                                        <p className="text-slate-500">{t('auth.activate.activating')}</p>
                                    </div>
                                )}

                                {!isActivating && status === "success" && (
                                    <div className="p-3 rounded border border-emerald-300 bg-emerald-50 text-emerald-700">
                                        ✅ {t('auth.activate.success')}
                                    </div>
                                )}

                                {!isActivating && status === "error" && (
                                    <div className="space-y-4">
                                        <div className="p-3 rounded border border-red-300 bg-red-50 text-red-700">
                                            ❌ {t('auth.activate.error')}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleResend}
                                            disabled={isResending}
                                            className={`py-2 px-5 inline-block font-semibold tracking-wide duration-500 text-base text-center ant-btn-primary text-white rounded-md w-full ${isResending ? "opacity-60 cursor-not-allowed" : ""
                                                }`}
                                        >
                                            {isResending ? t('auth.activate.resending') : t('auth.activate.resendLink')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="text-center mt-6">
                                <Link to="/auth/login" className="text-[var(--applyons-blue)] hover:underline font-semibold">
                                    {t('auth.activate.goToLogin')}
                                </Link>
                            </div>

                            <div className="text-center mt-6">
                                <p className="mb-0 text-slate-400 text-sm">
                                    {t('auth.activate.footer', { year: new Date().getFullYear() })}
                                </p>
                            </div>
                        </div>
                        {/* /carte */}
                    </div>
                </div>
            </section>

            {/* utilitaires existants */}
            <Switcher />
            <BackButton />
        </>
    );
}
