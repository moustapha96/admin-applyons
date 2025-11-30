import {useEffect, useState}  from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import client1 from '../../assets/images/client/01.jpg';
import client5 from '../../assets/images/client/05.jpg';
import client12 from '../../assets/images/client/12.jpg';

import SimpleBarReact from "simplebar-react";
import 'simplebar-react/dist/simplebar.min.css';

import { userData } from "../../data/data";
import { MdKeyboardArrowRight } from "react-icons/md";

export default function Chat(){
    const { t } = useTranslation();
    const [open, setOpen] = useState(false)
    useEffect(() => {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');

        const DropdownHandler = ()=>{
            setOpen(false)
        }
        document.addEventListener('mousedown', DropdownHandler)
        return()=>{
            document.removeEventListener('mousedown', DropdownHandler)
        }
    }, []);
    
    return(
        <div className="container-fluid relative px-3">
            <div className="layout-specing">
                <div className="md:flex justify-between items-center">
                    <h5 className="text-lg font-semibold">{t("appsChat.title")}</h5>

                    <ul className="tracking-[0.5px] inline-flex items-center sm:mt-0 mt-3">
                        <li className="inline-block capitalize text-[14px] font-bold duration-500 dark:text-white/70 hover:text-[var(--applyons-blue)] dark:hover:text-white">
                            <Link to="/">{t("appsChat.breadcrumbs.home")}</Link>
                        </li>
                        <li className="inline-block text-base text-slate-950 dark:text-white/70 mx-0.5 ltr:rotate-0 rtl:rotate-180"><MdKeyboardArrowRight/></li>
                        <li className="inline-block capitalize text-[14px] font-bold text-[var(--applyons-blue)] dark:text-white" aria-current="page">
                            {t("appsChat.breadcrumbs.chatbox")}
                        </li>
                    </ul>
                </div>

                <div className="grid md:grid-cols-12 grid-cols-1 mt-6 gap-2">
                    <div className="xl:col-span-3 lg:col-span-5 md:col-span-5">
                        <div className="rounded-md shadow-sm dark:shadow-gray-700 bg-white dark:bg-slate-900">
                            <div className="text-center p-6 border-b border-gray-100 dark:border-gray-800">
                                <img src={client5} className="size-20 rounded-full shadow-sm dark:shadow-gray-700 mx-auto" alt=""/>
                                <h5 className="mt-3 font-semibold text-xl mb-0">Cristina Julia</h5>
                                <p className="text-slate-400 mb-0">UI / UX Designer</p>
                            </div>
                            <SimpleBarReact className="p-2 max-h-[500px]">
                                {userData.map((item, index) => {
                                    return(
                                        <Link to="#" className="flex items-center p-2 rounded-md relative bg-gray-50 dark:bg-slate-800" key={index}>
                                        <div className="relative">
                                            <img src={item.image} className="size-11 rounded-full shadow-sm dark:shadow-gray-700" alt=""/>
                                            {item.active === true ?  <span className="absolute top-0.5 start-0.5 flex items-center justify-center bg-green-600 text-white text-[10px] font-bold rounded-full size-2 after:content-[''] after:absolute after:size-2 after:bg-green-600 after:top-0 after:end-0 after:rounded-full after:animate-ping"></span> :
                                            <span className="absolute top-0.5 start-0.5 flex items-center justify-center bg-red-600 text-white text-[10px] font-bold rounded-full size-2"></span>
                                            }
                                           
                                        </div>
                                        <div className="overflow-hidden flex-1 ms-2">
                                            <div className="flex justify-between">
                                                <h6 className="font-semibold">{item.name}</h6>
                                                <small className="text-slate-400">{item.lastSeen}</small>
                                            </div>
                                            <div className="text-slate-400 truncate">{item.msg}</div>
                                        </div>
                                    </Link>
                                    )
                                })}
                            </SimpleBarReact>
                        </div>
                    </div>

                    <div className="xl:col-span-9 lg:col-span-7 md:col-span-7">
                        <div className="rounded-md shadow-sm dark:shadow-gray-700 bg-white dark:bg-slate-900">
                            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 p-4">
                                <div className="flex">
                                    <img src={client12} className="size-11 rounded-full shadow-sm dark:shadow-gray-700" alt=""/>
                                    <div className="overflow-hidden ms-3">
                                        <Link to="#" className="block font-semibold text-truncate">Calvin Carlo</Link>
                                        <span className="text-slate-400 flex items-center text-sm">
                                            <span className="bg-green-600 text-white text-[10px] font-bold rounded-full size-2 me-1"></span>
                                            {t("appsChat.status.online")}
                                        </span>
                                    </div>
                                </div>

                                <div className="dropdown relative">
                                    <button onClick={() => setOpen(!open)} className="dropdown-toggle items-center" type="button">
                                        <span className="size-8 inline-flex items-center justify-center tracking-wide align-middle duration-500 text-[20px] text-center bg-[var(--applyons-blue)]/5 hover:bg-[var(--applyons-orange)] border-[var(--applyons-blue)]/10 hover:border-[var(--applyons-orange)] text-[var(--applyons-blue)] hover:text-white rounded-full"><i className="mdi mdi-dots-vertical"></i></span>
                                    </button>
                                    <div className={`dropdown-menu absolute end-0 m-0 mt-4 z-10 w-44 rounded-md overflow-hidden bg-white dark:bg-slate-900 shadow-sm dark:shadow-gray-700 ${open ?  '' : 'hidden'}`}>
                                        <ul className="py-2 text-start">
                                            <li className="ml-0">
                                                <Link to="" className="block font-medium py-1.5 px-4 hover:text-[var(--applyons-blue)]">
                                                    <i className="mdi mdi-account-outline"></i> {t("appsChat.menu.profile")}
                                                </Link>
                                            </li>
                                            <li className="ml-0">
                                                <Link to="" className="block font-medium py-1.5 px-4 hover:text-[var(--applyons-blue)]">
                                                    <i className="mdi mdi-cog-outline"></i> {t("appsChat.menu.profileSettings")}
                                                </Link>
                                            </li>
                                            <li className="ml-0">
                                                <Link to="" className="block font-medium py-1.5 px-4 hover:text-[var(--applyons-blue)]">
                                                    <i className="mdi mdi-trash-can-outline"></i> {t("appsChat.menu.delete")}
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <SimpleBarReact className="p-4 list-none mb-0 max-h-[565px] bg-[url('../../assets/images/bg-chat.png')] bg-no-repeat bg-center bg-cover" >
                                <ul>
                                    <li>
                                        <div className="inline-block">
                                            <div className="flex mb-3">
                                                <div className="relative">
                                                    <img src={client1} className="size-9 min-w-[36px] rounded-full shadow-sm dark:shadow-gray-700" alt=""/>
                                                    <span className="absolute top-0.5 start-0.5 flex items-center justify-center bg-green-600 text-white text-[10px] font-bold rounded-full size-2 after:content-[''] after:absolute after:size-2 after:bg-green-600 after:top-0 after:end-0 after:rounded-full after:animate-ping"></span>
                                                </div>
                                                    
                                                <div className="ms-2 max-w-lg">
                                                    <p className="bg-white dark:bg-slate-900 text-slate-400 text-sm shadow-sm dark:shadow-gray-700 px-3 py-2 rounded mb-1">Hey Cristina</p>
                                                    <span className="text-slate-400 text-sm"><i className="mdi mdi-clock-outline me-1"></i>59 min ago</span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>

                                    <li className="text-end">
                                        <div className="inline-block">
                                            <div className="flex mb-3">
                                                <div className="relative order-2">
                                                    <img src={client5} className="size-9 min-w-[36px] rounded-full shadow-sm dark:shadow-gray-700" alt=""/>
                                                    <span className="absolute top-0.5 end-0.5 flex items-center justify-center bg-green-600 text-white text-[10px] font-bold rounded-full size-2 after:content-[''] after:absolute after:size-2 after:bg-green-600 after:top-0 after:end-0 after:rounded-full after:animate-ping"></span>
                                                </div>
                                                    
                                                <div className="me-2 max-w-lg">
                                                    <p className="bg-white dark:bg-slate-900 text-slate-400 text-sm shadow-sm dark:shadow-gray-700 px-3 py-2 rounded mb-1">Hello Calvin</p>
                                                    <span className="text-slate-400 text-sm"><i className="mdi mdi-clock-outline me-1"></i>45 min ago</span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>

                                    <li className="text-end">
                                        <div className="inline-block">
                                            <div className="flex mb-3">
                                                <div className="relative order-2">
                                                    <img src={client5} className="size-9 min-w-[36px] rounded-full shadow-sm dark:shadow-gray-700" alt=""/>
                                                    <span className="absolute top-0.5 end-0.5 flex items-center justify-center bg-green-600 text-white text-[10px] font-bold rounded-full size-2 after:content-[''] after:absolute after:size-2 after:bg-green-600 after:top-0 after:end-0 after:rounded-full after:animate-ping"></span>
                                                </div>
                                                    
                                                <div className="me-2 max-w-lg">
                                                    <p className="bg-white dark:bg-slate-900 text-slate-400 text-sm shadow-sm dark:shadow-gray-700 px-3 py-2 rounded mb-1">How can i help you?</p>
                                                    <span className="text-slate-400 text-sm"><i className="mdi mdi-clock-outline me-1"></i>44 min ago</span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>

                                    <li>
                                        <div className="inline-block">
                                            <div className="flex mb-3">
                                                <div className="relative">
                                                    <img src={client1} className="size-9 min-w-[36px] rounded-full shadow-sm dark:shadow-gray-700" alt=""/>
                                                    <span className="absolute top-0.5 start-0.5 flex items-center justify-center bg-green-600 text-white text-[10px] font-bold rounded-full size-2 after:content-[''] after:absolute after:size-2 after:bg-green-600 after:top-0 after:end-0 after:rounded-full after:animate-ping"></span>
                                                </div>
                                                    
                                                <div className="ms-2 max-w-lg">
                                                    <p className="bg-white dark:bg-slate-900 text-slate-400 text-sm shadow-sm dark:shadow-gray-700 px-3 py-2 rounded mb-1">Nice to meet you</p>
                                                    <span className="text-slate-400 text-sm"><i className="mdi mdi-clock-outline me-1"></i>42 min ago</span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>

                                    <li>
                                        <div className="inline-block">
                                            <div className="flex mb-3">
                                                <div className="relative">
                                                    <img src={client1} className="size-9 min-w-[36px] rounded-full shadow-sm dark:shadow-gray-700" alt=""/>
                                                    <span className="absolute top-0.5 start-0.5 flex items-center justify-center bg-green-600 text-white text-[10px] font-bold rounded-full size-2 after:content-[''] after:absolute after:size-2 after:bg-green-600 after:top-0 after:end-0 after:rounded-full after:animate-ping"></span>
                                                </div>
                                                    
                                                <div className="ms-2 max-w-lg">
                                                    <p className="bg-white dark:bg-slate-900 text-slate-400 text-sm shadow-sm dark:shadow-gray-700 px-3 py-2 rounded mb-1">Hope you are doing fine?</p>
                                                    <span className="text-slate-400 text-sm"><i className="mdi mdi-clock-outline me-1"></i>40 min ago</span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>

                                    <li className="text-end">
                                        <div className="inline-block">
                                            <div className="flex mb-3">
                                                <div className="relative order-2">
                                                    <img src={client5} className="size-9 min-w-[36px] rounded-full shadow-sm dark:shadow-gray-700" alt=""/>
                                                    <span className="absolute top-0.5 end-0.5 flex items-center justify-center bg-green-600 text-white text-[10px] font-bold rounded-full size-2 after:content-[''] after:absolute after:size-2 after:bg-green-600 after:top-0 after:end-0 after:rounded-full after:animate-ping"></span>
                                                </div>
                                                    
                                                <div className="me-2 max-w-lg">
                                                    <p className="bg-white dark:bg-slate-900 text-slate-400 text-sm shadow-sm dark:shadow-gray-700 px-3 py-2 rounded mb-1">I&apos;m good thanks for asking</p>
                                                    <span className="text-slate-400 text-sm"><i className="mdi mdi-clock-outline me-1"></i>38 min ago</span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>

                                    <li>
                                        <div className="inline-block">
                                            <div className="flex mb-3">
                                                <div className="relative">
                                                    <img src={client1} className="size-9 min-w-[36px] rounded-full shadow-sm dark:shadow-gray-700" alt=""/>
                                                    <span className="absolute top-0.5 start-0.5 flex items-center justify-center bg-green-600 text-white text-[10px] font-bold rounded-full size-2 after:content-[''] after:absolute after:size-2 after:bg-green-600 after:top-0 after:end-0 after:rounded-full after:animate-ping"></span>
                                                </div>
                                                    
                                                <div className="ms-2 max-w-lg">
                                                    <p className="bg-white dark:bg-slate-900 text-slate-400 text-sm shadow-sm dark:shadow-gray-700 px-3 py-2 rounded mb-1">I am intrested to know more about your prices and services you offer</p>
                                                    <span className="text-slate-400 text-sm"><i className="mdi mdi-clock-outline me-1"></i>35 min ago</span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>

                                    <li className="text-end">
                                        <div className="inline-block">
                                            <div className="flex mb-3">
                                                <div className="relative order-2">
                                                    <img src={client1} className="size-9 min-w-[36px] rounded-full shadow-sm dark:shadow-gray-700" alt=""/>
                                                    <span className="absolute top-0.5 end-0.5 flex items-center justify-center bg-green-600 text-white text-[10px] font-bold rounded-full size-2 after:content-[''] after:absolute after:size-2 after:bg-green-600 after:top-0 after:end-0 after:rounded-full after:animate-ping"></span>
                                                </div>
                                                    
                                                <div className="me-2 max-w-lg">
                                                    <p className="bg-white dark:bg-slate-900 text-slate-400 text-sm shadow-sm dark:shadow-gray-700 px-3 py-2 rounded mb-1">Sure please check below link to find more useful information <Link to="https://shreethemes.in/techwind/" target="_blank" className="text-[var(--applyons-blue)]">https://shreethemes.in/techwind/</Link></p>
                                                    <span className="text-slate-400 text-sm"><i className="mdi mdi-clock-outline me-1"></i>29 min ago</span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>

                                    <li>
                                        <div className="inline-block">
                                            <div className="flex mb-3">
                                                <div className="relative">
                                                    <img src={client1} className="size-9 min-w-[36px] rounded-full shadow-sm dark:shadow-gray-700" alt=""/>
                                                    <span className="absolute top-0.5 start-0.5 flex items-center justify-center bg-green-600 text-white text-[10px] font-bold rounded-full size-2 after:content-[''] after:absolute after:size-2 after:bg-green-600 after:top-0 after:end-0 after:rounded-full after:animate-ping"></span>
                                                </div>
                                                    
                                                <div className="ms-2 max-w-lg">
                                                    <p className="bg-white dark:bg-slate-900 text-slate-400 text-sm shadow-sm dark:shadow-gray-700 px-3 py-2 rounded mb-1">Thank you 😊</p>
                                                    <span className="text-slate-400 text-sm"><i className="mdi mdi-clock-outline me-1"></i>26 min ago</span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>

                                    <li className="text-end">
                                        <div className="inline-block">
                                            <div className="flex mb-3">
                                                <div className="relative order-2">
                                                    <img src={client5} className="size-9 min-w-[36px] rounded-full shadow-sm dark:shadow-gray-700" alt=""/>
                                                    <span className="absolute top-0.5 end-0.5 flex items-center justify-center bg-green-600 text-white text-[10px] font-bold rounded-full size-2 after:content-[''] after:absolute after:size-2 after:bg-green-600 after:top-0 after:end-0 after:rounded-full after:animate-ping"></span>
                                                </div>
                                                    
                                                <div className="me-2 max-w-lg">
                                                    <p className="bg-white dark:bg-slate-900 text-slate-400 text-sm shadow-sm dark:shadow-gray-700 px-3 py-2 rounded mb-1">Welcome</p>
                                                    <span className="text-slate-400 text-sm"><i className="mdi mdi-clock-outline me-1"></i>15 min ago</span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>

                                    <li>
                                        <div className="inline-block">
                                            <div className="flex items-center mb-3">
                                                <div className="relative">
                                                    <img src={client1}className="size-9 min-w-[36px] rounded-full shadow-sm dark:shadow-gray-700" alt=""/>
                                                    <span className="absolute top-0.5 start-0.5 flex items-center justify-center bg-green-600 text-white text-[10px] font-bold rounded-full size-2 after:content-[''] after:absolute after:size-2 after:bg-green-600 after:top-0 after:end-0 after:rounded-full after:animate-ping"></span>
                                                </div>
                                                    
                                                <div className="ms-2 max-w-lg">
                                                    <p className="text-slate-400 text-sm rounded mb-1">
                                                        {t("appsChat.typing", { name: "Frank Williams" })}
                                                        <span className="animate-typing ms-1">
                                                            <span className="dot inline-block size-1 bg-slate-400 -mr-px opacity-60 rounded-full"></span>
                                                            <span className="dot inline-block size-1 bg-slate-400 -mr-px opacity-60 rounded-full"></span>
                                                            <span className="dot inline-block size-1 bg-slate-400 -mr-px opacity-60 rounded-full"></span>
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </SimpleBarReact>

                            <div className="p-2 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex ">
                                    <input
                                        type="text"
                                        className="form-input w-full py-2 px-3 h-9 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded outline-none border border-gray-100 dark:border-gray-800 focus:ring-0"
                                        placeholder={t("appsChat.placeholders.message")}
                                    />

                                    <div className="min-w-[125px] text-end space-x-1">
                                        <Link to="#" className="size-9 inline-flex items-center justify-center tracking-wide align-middle duration-500 text-[16px] text-center bg-[var(--applyons-blue)] hover:bg-indigo-700 border-[var(--applyons-blue)] hover:border-indigo-700 text-white rounded-md"><i className="mdi mdi-send"></i></Link>
                                        <Link to="#" className="size-9 inline-flex items-center justify-center tracking-wide align-middle duration-500 text-[16px] text-center bg-[var(--applyons-blue)] hover:bg-indigo-700 border-[var(--applyons-blue)] hover:border-indigo-700 text-white rounded-md"><i className="mdi mdi-emoticon-happy-outline"></i></Link>
                                        <Link to="#" className="size-9 inline-flex items-center justify-center tracking-wide align-middle duration-500 text-[16px] text-center bg-[var(--applyons-blue)] hover:bg-indigo-700 border-[var(--applyons-blue)] hover:border-indigo-700 text-white rounded-md"><i className="mdi mdi-paperclip"></i></Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}