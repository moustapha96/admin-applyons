import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next";

import Order from "../components/dashboard/order"
import Chat from "../components/dashboard/chat"
import TopProduct from "../components/dashboard/topProduct"
import DataStates from "../components/dataStates"
import { BiExport } from "react-icons/bi"

export default function Index() {
    const { t } = useTranslation();

    useEffect(() => {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
    }, []);
    return(
        <>
        <div className="container-fluid relative px-3">
            <div className="layout-specing">
                <div className="flex justify-between items-center">
                    <div>
                        <h5 className="text-xl font-bold">
                            {t("dashboardIndex.greeting", { name: "Cristina" })}
                        </h5>
                        <h6 className="text-slate-400 font-semibold">
                            {t("dashboardIndex.welcome")}
                        </h6>
                    </div>

                    <div className="flex items-center">
                        <div className="position-relative">
                            <select className="form-select form-input w-full py-2 h-10 bg-white dark:bg-slate-900 dark:text-slate-200 rounded outline-none border border-gray-100 focus:border-gray-200 dark:border-gray-800 dark:focus:border-gray-700 focus:ring-0" id="yearchart">
                                <option value="Y" defaultValue>{t("dashboardIndex.filters.yearly")}</option>
                                <option value="M">{t("dashboardIndex.filters.monthly")}</option>
                                <option value="W">{t("dashboardIndex.filters.weekly")}</option>
                                <option value="T">{t("dashboardIndex.filters.today")}</option>
                            </select>
                        </div>

                        <Link to="" className="ms-1">
                            <span className="py-[7px] px-6 font-semibold tracking-wide border align-middle duration-500 text-base text-center bg-[var(--applyons-blue)]/5 hover:bg-[var(--applyons-orange)] border-[var(--applyons-blue)]/10 hover:border-[var(--applyons-orange)] text-[var(--applyons-blue)] hover:text-white rounded-md sm:inline-block hidden">
                                <BiExport className="inline"/> {t("dashboardIndex.export")}
                            </span>

                            <span className="size-10 items-center justify-center tracking-wide align-middle duration-500 text-base text-center rounded-md border bg-[var(--applyons-blue)]/5 hover:bg-[var(--applyons-orange)] border-[var(--applyons-blue)]/10 hover:border-[var(--applyons-orange)] text-[var(--applyons-blue)] hover:text-white sm:hidden inline-flex">
                                <BiExport/>
                            </span>
                        </Link>
                    </div>
                </div>
                <DataStates/>
             

                <div className="grid lg:grid-cols-12 grid-cols-1 mt-6 gap-6">
                    <Order/>
                    <Chat/>
                    <TopProduct/>
                </div>
            </div>
        </div>
        </>
    )
}