import {useEffect} from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Switcher from '../../components/switcher';
import BackButton from "../../components/backButton";
import { AiOutlineCheckCircle } from "react-icons/ai";

export default function AuthSignupSuccess(){
    const { t } = useTranslation();

    useEffect(() => {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
    }, []);

    return(
        <>
        <section className="relative h-screen flex justify-center items-center bg-slate-50 dark:bg-slate-800">
            <div className="container relative">
                <div className="md:flex justify-center">
                    <div className="lg:w-2/5">
                        <div className="relative overflow-hidden rounded-md bg-white dark:bg-slate-900 shadow-sm dark:shadow-gray-700">
                            <div className="px-6 py-12 bg-emerald-600 text-center">
                                <AiOutlineCheckCircle className=" text-white text-8xl text-center w-full"/>
                                <h5 className="text-white text-xl tracking-wide uppercase font-semibold mt-2">{t('auth.signupSuccess.title')}</h5>
                            </div>

                            <div className="px-6 py-12 text-center">
                                <p className="text-black font-semibold text-xl dark:text-white">{t('auth.signupSuccess.congratulations')}</p> 
                                <p className="text-slate-400 mt-4">{t('auth.signupSuccess.message')}</p>
                                
                                <div className="mt-6">
                                    <Link to="/" className="py-2 px-5 inline-block tracking-wide border align-middle duration-500 text-base text-center bg-[var(--applyons-blue)] hover:bg-indigo-700 border-[var(--applyons-blue)] hover:border-indigobg-indigo-700 text-white rounded-md">{t('auth.signupSuccess.continue')}</Link>
                                </div>
                            </div>

                            <div className="text-center p-6 border-t border-gray-100 dark:border-gray-700">
                                    <p className="mb-0 text-[var(--applyons-orange)]">{t('auth.signupSuccess.footer', { year: new Date().getFullYear() })}</p>
                         </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <Switcher/>
        <BackButton/>
        </>
    )
}