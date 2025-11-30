import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ErrorPage() {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-800">
            <h1 className="text-6xl font-bold text-red-500 dark:text-red-400">{t("errorPage.error404")}</h1>
            <p className="text-2xl mb-10">{t("errorPage.pageNotFound")}</p>
            <Link to="/" className="py-2 px-5 inline-block font-semibold tracking-wide border align-middle duration-500 text-base text-center bg-[var(--applyons-blue)] hover:bg-indigo-700 border-[var(--applyons-blue)] hover:border-indigo-700 text-white rounded-md">{t("errorPage.backToHome")}</Link>
        </div>
    )
}
