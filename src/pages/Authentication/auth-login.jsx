

/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import logoImg from "../../assets/logo.png";
import Switcher from '../../components/switcher';
import BackButton from '../../components/backButton';

import authService  from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

// image de fond (tu peux en changer si tu veux)
import applyonsAbout1 from "../../assets/logo.png";

export default function AuthLogin() {
    const { t } = useTranslation();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const emailUrl = searchParams.get('email');

    const [email, setEmail] = useState(emailUrl || '');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const htmlTag = document.documentElement;
        htmlTag.setAttribute('dir', 'ltr');
        htmlTag.classList.add('light');
        htmlTag.classList.remove('dark');
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.login({ email, password });
            console.log(response);
            if (response.token && response.user) {
                localStorage.setItem("token", response.token);
                localStorage.setItem("user", JSON.stringify(response.user));
                
                login({ ...response.user, token: response.token }, rememberMe);
            } else {
                setError(t('auth.login.errorNoToken'));
            }
        } catch (err) {
            console.log(err);
            toast.error(err?.message || t('auth.login.errorLogin'));
            if (err?.code === 'ACCOUNT_INACTIVE') {
                navigate('/auth/lock-screen');
            }
            setError(
                err instanceof Error
                    ? err.message
                    : t('auth.login.errorLogin')
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Section plein écran avec image de fond + overlay dégradé */}
            <section
                className="md:h-screen py-36 flex items-center relative bg-no-repeat bg-center bg-cover"
                style={{ backgroundImage: `url(${applyonsAbout1})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />

                <div className="container relative">
                    <div className="flex justify-center">
                        {/* Carte centrale */}
                        <div className="max-w-[420px] w-full m-auto p-6 bg-white dark:bg-slate-900 shadow-md dark:shadow-gray-800 rounded-md">
                            <div className="text-center">
                                <Link to="/">
                                    <img src={logoImg} className="mx-auto h-20" alt="applyons" />
                                </Link>
                            </div>

                            <h5 className="my-6 text-xl font-semibold text-slate-800 dark:text-white text-center">
                                {t('auth.login.title')}
                            </h5>

                            <form onSubmit={handleLogin} className="text-start">
                                {error && (
                                    <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1">
                                    {/* Email */}
                                    <div className="mb-4">
                                        <label className="font-semibold" htmlFor="LoginEmail">
                                            {t('auth.login.email')}
                                        </label>
                                        <input
                                            id="LoginEmail"
                                            type="email"
                                            className="form-input mt-3 w-full py-2 px-3 h-10 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded outline-none border border-gray-200 focus:border-[var(--applyons-blue)] dark:border-gray-800 dark:focus:border-[var(--applyons-blue)] focus:ring-0"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Mot de passe + toggle */}
                                    <div className="mb-4">
                                        <label className="font-semibold" htmlFor="LoginPassword">
                                            {t('auth.login.password')}
                                        </label>
                                        <div className="relative mt-3">
                                            <input
                                                id="LoginPassword"
                                                type={showPassword ? 'text' : 'password'}
                                                className="form-input w-full py-2 px-3 h-10 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded outline-none border border-gray-200 focus:border-[var(--applyons-blue)] dark:border-gray-800 dark:focus:border-[var(--applyons-blue)] focus:ring-0 pr-10"
                                                placeholder="*******"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((s) => !s)}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                                                aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                                            >
                                                {showPassword ? (
                                                    <i className="mdi mdi-eye-off-outline text-xl" />
                                                ) : (
                                                    <i className="mdi mdi-eye-outline text-xl" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Remember + Forgot */}
                                    <div className="flex justify-between mb-4">
                                        <label className="flex items-center gap-2 select-none cursor-pointer">
                                            <input
                                                className="form-checkbox rounded border-gray-200 dark:border-gray-800 text-[var(--applyons-orange)] focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50"
                                                type="checkbox"
                                                id="RememberMe"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                            />
                                            <span className="text-slate-500">{t('auth.login.rememberMe')}</span>
                                        </label>

                                        <p className="text-slate-500 mb-0">
                                            <Link to="/auth/re-password" className="text-[var(--applyons-blue)] hover:underline">
                                                {t('auth.login.forgotPassword')}
                                            </Link>
                                        </p>
                                    </div>

                                    {/* Submit */}
                                    <div className="mb-2">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`py-2 px-5 ant-btn-primary  inline-block font-semibold tracking-wide duration-500 text-base text-center 
                                                 text-white rounded-md w-full ${isLoading ? 'opacity-60 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            {isLoading ? t('auth.login.loggingIn') : t('auth.login.loginButton')}
                                        </button>
                                    </div>

                                    {/* Lien d'inscription (optionnel) */}
                                    <div className="text-center mt-3">
                                        <span className="text-slate-500 me-2">{t('auth.login.noAccount')}</span>
                                        <Link to="/auth/signup" className="text-[var(--applyons-blue)] font-bold hover:underline">
                                            {t('auth.login.signup')}
                                        </Link>
                                    </div>


                                </div>
                            </form>

                            <div className="text-center mt-6">
                                <p className="mb-0 text-slate-400 text-sm">
                                    {t('auth.login.footer', { year: new Date().getFullYear() })}
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
