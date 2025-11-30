import {useEffect} from 'react';
import { Link } from 'react-router-dom';
import Switcher from '../../components/switcher';
import BackButton from '../../components/backButton';
import { FiThumbsUp } from 'react-icons/fi';
import { useTranslation } from "react-i18next";

export default function PageThankyou() {
    const { t } = useTranslation();

    useEffect(() => {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
    }, []);
    
    return (
            <>
            <section className="relative h-screen flex items-center justify-center text-center bg-gray-50 dark:bg-slate-800">
                <div className="container relative">
                    <div className="grid grid-cols-1">
                        <div className="title-heading text-center my-auto">
                            <div className="w-24 h-24 bg-[var(--applyons-blue)]/5 text-[var(--applyons-blue)] rounded-full text-5xl flex align-middle justify-center items-center shadow-xs dark:shadow-gray-800 mx-auto">
                                <FiThumbsUp className='size-11'/>
                            </div>
                            <h1 className="mt-6 mb-8 md:text-5xl text-3xl font-bold">
                                {t("miscThankyou.title")}
                            </h1>
                            <p className="text-slate-400 max-w-xl mx-auto">
                                {t("miscThankyou.subtitle")}
                            </p>

                            <div className="mt-6">
                                <Link
                                    to="/"
                                    className="py-2 px-5 inline-block font-semibold tracking-wide border align-middle transition duration-500 ease-in-out text-base text-center bg-[var(--applyons-blue)]/5 hover:bg-[var(--applyons-orange)] border-[var(--applyons-blue)]/10 hover:border-[var(--applyons-orange)] text-[var(--applyons-blue)] hover:text-white rounded-md"
                                >
                                    {t("miscThankyou.backToHome")}
                                </Link>
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


