import { useEffect } from "react"
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { MdKeyboardArrowRight } from "react-icons/md";


export default function Calendar(){

    const { t } = useTranslation();

    useEffect(() => {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
    }, []);
    
    const events = [{date:'2023-09-16T13:00:00', title:'Business Lunch'}];
    return(
        <div className="container-fluid relative px-3">
            <div className="layout-specing">
                <div className="md:flex justify-between items-center">
                    <h5 className="text-lg font-semibold">{t("appsCalendar.title")}</h5>

                    <ul className="tracking-[0.5px] inline-flex items-center sm:mt-0 mt-3">
                        <li className="inline-block capitalize text-[14px] font-bold duration-500 dark:text-white/70 hover:text-[var(--applyons-blue)] dark:hover:text-white">
                            <Link to="/">{t("appsCalendar.breadcrumbs.home")}</Link>
                        </li>
                        <li className="inline-block text-base text-slate-950 dark:text-white/70 mx-0.5 ltr:rotate-0 rtl:rotate-180"><MdKeyboardArrowRight/></li>
                        <li className="inline-block capitalize text-[14px] font-bold text-[var(--applyons-blue)] dark:text-white" aria-current="page">
                            {t("appsCalendar.breadcrumbs.calendar")}
                        </li>
                    </ul>
                </div>

                <div className="grid lg:grid-cols-12 grid-cols-1 mt-6 gap-2">
                    <div className="xl:col-span-2 lg:col-span-4">
                        <div id="external-events">
                            <div className="rounded-md shadow-sm dark:shadow-gray-700 p-6 bg-white dark:bg-slate-900">
                                <span className="h6 font-semibold">{t("appsCalendar.events.allEvents")}</span>
                            
                                <div className="fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event m-1 cursor-pointer bg-[var(--applyons-blue)]">
                                    <div className="fc-event-main py-1 px-2">{t("appsCalendar.events.meeting")}</div>
                                </div>
                                <div className="fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event m-1 cursor-pointer bg-[var(--applyons-blue)]">
                                    <div className="fc-event-main py-1 px-2">{t("appsCalendar.events.operations")}</div>
                                </div>
                                <div className="fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event m-1 cursor-pointer bg-[var(--applyons-blue)]">
                                    <div className="fc-event-main py-1 px-2">{t("appsCalendar.events.lunch")}</div>
                                </div>
                                <div className="fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event m-1 cursor-pointer bg-[var(--applyons-blue)]">
                                    <div className="fc-event-main py-1 px-2">{t("appsCalendar.events.conference")}</div>
                                </div>
                                <div className="fc-event fc-h-event fc-daygrid-event fc-daygrid-block-event m-1 cursor-pointer bg-[var(--applyons-blue)]">
                                    <div className="fc-event-main py-1 px-2">{t("appsCalendar.events.businessMeeting")}</div>
                                </div>
                            
                                <div className="mt-2">
                                    <div className="flex items-center mb-0">
                                        <input className="form-checkbox rounded border-gray-200 dark:border-gray-800 text-[var(--applyons-blue)] focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 me-2" type="checkbox" value="" id="drop-remove"/>
                                        <label className="form-checkbox-label text-slate-400" htmlFor="drop-remove">
                                            {t("appsCalendar.options.removeAfterDrop")}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-10 lg:col-span-8">
                        <div id="calendar-container" className="rounded-md shadow-sm dark:shadow-gray-700 p-6 bg-white dark:bg-slate-900">
                            <FullCalendar
                                defaultView="dayGridMonth"
                                plugins={[dayGridPlugin]}
                                events={events}
                                headerToolbar = {
                                    {
                                        left:'prev,next today addEventButton',
                                        center:'title',
                                        right :'dayGridMonth,dayGridWeek,dayGridDay'  
                                    }
                                }
                             customButtons={
                                {
                                    addEventButton : {
                                        text: t("appsCalendar.options.addEvent"),
                                        click : function (){
                                            
                                        }
                                    }
                                }
                             }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}