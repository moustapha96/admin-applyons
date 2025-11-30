import { useState , useEffect}  from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { inboxData } from "../../data/data";
import { MdKeyboardArrowRight, MdOutlineEventNote } from "react-icons/md";
import { BiPlus } from "react-icons/bi";
import { AiOutlineClose, AiOutlineDelete, AiOutlineInbox } from "react-icons/ai";
import { TbMailStar, TbMailUp } from "react-icons/tb";
import { RiMailSendLine } from "react-icons/ri";
import { LuMailPlus } from "react-icons/lu";

export default function Email(){
    const { t } = useTranslation();
    useEffect(() => {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
    }, []);
    
    let [composeModal, setComposeModal] = useState(false)
    let [activeIndex, setActiveIndex] = useState(0);

    return(
        <div className="container-fluid relative px-3">
            <div className="layout-specing">
                <div className="md:flex justify-between items-center">
                    <h5 className="text-lg font-semibold">{t("appsEmail.title")}</h5>

                    <ul className="tracking-[0.5px] inline-flex items-center sm:mt-0 mt-3">
                        <li className="inline-block capitalize text-[14px] font-bold duration-500 dark:text-white/70 hover:text-[var(--applyons-blue)] dark:hover:text-white">
                            <Link to="/">{t("appsEmail.breadcrumbs.home")}</Link>
                        </li>
                        <li className="inline-block text-base text-slate-950 dark:text-white/70 mx-0.5 ltr:rotate-0 rtl:rotate-180"><MdKeyboardArrowRight/></li>
                        <li className="inline-block capitalize text-[14px] font-bold text-[var(--applyons-blue)] dark:text-white" aria-current="page">
                            {t("appsEmail.breadcrumbs.emails")}
                        </li>
                    </ul>
                </div>

                <div className="grid md:grid-cols-12 grid-cols-1 mt-6 gap-2">
                    <div className="xl:col-span-2 lg:col-span-3 md:col-span-4">
                        <div className="rounded-md shadow-sm dark:shadow-gray-700 p-6 bg-white dark:bg-slate-900">
                            <Link
                                to=""
                                onClick={() => setComposeModal(!composeModal)}
                                className="py-2 px-5 inline-flex items-center justify-center font-semibold tracking-wide border align-middle duration-500 text-base text-center bg-[var(--applyons-blue)] hover:bg-indigo-700 border-[var(--applyons-blue)] hover:border-indigo-700 text-white rounded-md w-full"
                            >
                                <BiPlus className="me-1"/> {t("appsEmail.composeButton")}
                            </Link>
                            <ul className="flex-column mt-3">
                                <li role="presentation" className="ml-0">
                                    <button
                                        onClick={() => setActiveIndex(0)}
                                        className={`${activeIndex === 0 ? 'bg-[var(--applyons-blue)]  text-white' : 'text-base hover:text-[var(--applyons-blue)]'}  px-4 py-2  font-semibold rounded-md w-full  duration-500 text-start flex items-center`}
                                    >
                                        <AiOutlineInbox className="me-1"/> {t("appsEmail.menu.inbox")}
                                    </button>
                                </li>
                                <li role="presentation" className="ml-0">
                                    <button
                                        onClick={() => setActiveIndex(1)}
                                        className={`${activeIndex === 1 ? 'bg-[var(--applyons-blue)]  text-white' : 'text-base hover:text-[var(--applyons-blue)]'}  px-4 py-2  font-semibold rounded-md w-full  duration-500 text-start flex items-center`}
                                    >
                                        <TbMailStar className="me-1"/> {t("appsEmail.menu.starred")}
                                    </button>
                                </li>
                                <li role="presentation" className="ml-0">
                                    <button
                                        onClick={() => setActiveIndex(2)}
                                        className={`${activeIndex === 2 ? 'bg-[var(--applyons-blue)]  text-white' : 'text-base hover:text-[var(--applyons-blue)]'}  px-4 py-2  font-semibold rounded-md w-full  duration-500 text-start flex items-center`}
                                    >
                                        <RiMailSendLine className="me-1"/> {t("appsEmail.menu.spam")}
                                    </button>
                                </li>
                                <li role="presentation" className="ml-0">
                                    <button
                                        onClick={() => setActiveIndex(3)}
                                        className={`${activeIndex === 3 ? 'bg-[var(--applyons-blue)]  text-white' : 'text-base hover:text-[var(--applyons-blue)]'}  px-4 py-2  font-semibold rounded-md w-full  duration-500 text-start flex items-center`}
                                    >
                                        <TbMailUp className="me-1"/> {t("appsEmail.menu.sent")}
                                    </button>
                                </li>
                                <li role="presentation" className="ml-0">
                                    <button
                                        onClick={() => setActiveIndex(4)}
                                        className={`${activeIndex === 4 ? 'bg-[var(--applyons-blue)]  text-white' : 'text-base hover:text-[var(--applyons-blue)]'}  px-4 py-2  font-semibold rounded-md w-full  duration-500 text-start flex items-center`}
                                    >
                                        <LuMailPlus className="me-1"/> {t("appsEmail.menu.drafts")}
                                    </button>
                                </li>
                                <li role="presentation" className="ml-0">
                                    <button
                                        onClick={() => setActiveIndex(5)}
                                        className={`${activeIndex === 5 ? 'bg-[var(--applyons-blue)]  text-white' : 'text-base hover:text-[var(--applyons-blue)]'}  px-4 py-2  font-semibold rounded-md w-full  duration-500 text-start flex items-center`}
                                    >
                                        <AiOutlineDelete className="me-1"/> {t("appsEmail.menu.trash")}
                                    </button>
                                </li>
                                <li role="presentation" className="ml-0">
                                    <button
                                        onClick={() => setActiveIndex(6)}
                                        className={`${activeIndex === 6 ? 'bg-[var(--applyons-blue)]  text-white' : 'text-base hover:text-[var(--applyons-blue)]'}  px-4 py-2  font-semibold rounded-md w-full  duration-500 text-start flex items-center`}
                                    >
                                        <MdOutlineEventNote className="me-1"/> {t("appsEmail.menu.notes")}
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    

                    <div className={`fixed z-50 flex items-center justify-center overflow-hidden inset-0 m-auto bg-gray-900 bg-opacity-50 dark:bg-opacity-80 ${composeModal ? '' : 'hidden'}`}>
                        <div className="relative w-full h-auto max-w-xl p-4">
                            <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-sm dark:shadow-gray-700">
                                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                                    <h5 className="text-xl font-semibold">{t("appsEmail.composeTitle")}</h5>
                                    <button type="button" onClick={() => setComposeModal(!composeModal)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ms-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white">
                                       <AiOutlineClose/> 
                                    </button>
                                </div>
                                <div className="p-6 text-center">
                                    <form>
                                        <div className="grid md:grid-cols-12 grid-cols-1 gap-4">
                                            <div className="md:col-span-12">
                                                <div className="form-icon relative">
                                                    <input
                                                        name="email"
                                                        id="toemail"
                                                        type="email"
                                                        className="form-input w-full py-2 px-3 h-10 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded outline-none border border-gray-200 focus:border-[var(--applyons-blue)] dark:border-gray-800 dark:focus:border-[var(--applyons-blue)] focus:ring-0"
                                                        placeholder={t("appsEmail.placeholders.to")}
                                                    />
                                                </div>
                                            </div>

                                            <div className="md:col-span-6">
                                                <div className="form-icon relative">
                                                    <input
                                                        name="email"
                                                        id="ccemail"
                                                        type="email"
                                                        className="form-input w-full py-2 px-3 h-10 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded outline-none border border-gray-200 focus:border-[var(--applyons-blue)] dark:border-gray-800 dark:focus:border-[var(--applyons-blue)] focus:ring-0"
                                                        placeholder={t("appsEmail.placeholders.cc")}
                                                    />
                                                </div>
                                            </div>

                                            <div className="md:col-span-6">
                                                <div className="form-icon relative">
                                                    <input
                                                        name="email"
                                                        id="bccemail"
                                                        type="email"
                                                        className="form-input w-full py-2 px-3 h-10 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded outline-none border border-gray-200 focus:border-[var(--applyons-blue)] dark:border-gray-800 dark:focus:border-[var(--applyons-blue)] focus:ring-0"
                                                        placeholder={t("appsEmail.placeholders.bcc")}
                                                    />
                                                </div>
                                            </div>

                                            {/* <div className="md:col-span-12">
                                                <CKEditor
                                                    editor={ ClassicEditor }
                                                    data="<div id=&nbsp;editor&nbsp;><p>Hello,<br/><br/> If the distribution of letters and 'words' is random, the reader will not be distracted from making a neutral judgment on the visual impact and readability of the typefaces (typography), or the distribution of text on the page (layout or type area). <br/><br/>Thank you</p></div>"
                                                    onReady={ editor => {
                                                        // You can store the "editor" and use when it is needed.
                                                        console.log( 'Editor is ready to use!', editor );
                                                    } }
                                                    onChange={ ( event, editor ) => {
                                                        const data = editor.getData();
                                                        console.log( { event, editor, data } );
                                                    } }
                                                    onBlur={ ( event, editor ) => {
                                                        console.log( 'Blur.', editor );
                                                    } }
                                                    onFocus={ ( event, editor ) => {
                                                        console.log( 'Focus.', editor );
                                                    } }
                                                />
                                            </div> */}

                                            <div className="md:col-span-12">
                                                <button
                                                    type="submit"
                                                    id="submit"
                                                    name="send"
                                                    className="py-2 px-5 font-semibold tracking-wide border align-middle duration-500 text-base text-center bg-[var(--applyons-blue)] hover:bg-indigo-700 border-[var(--applyons-blue)] hover:border-indigo-700 text-white rounded-md justify-center flex items-center"
                                                >
                                                    {t("appsEmail.buttons.sendNow")}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="xl:col-span-10 lg:col-span-9 md:col-span-8">
                        <div id="myTabContent" className="">
                            {activeIndex === 0 ? 
                                <div>
                                    <div className="relative overflow-x-auto block w-full bg-white dark:bg-slate-900 shadow-sm dark:shadow-gray-700 rounded-md">
                                        <table className="w-full text-start">
                                            <thead className="text-base">
                                                <tr>
                                                    <th className="text-start p-4 w-10 min-w-[30px] max-w-[30px]">
                                                        <input className="form-checkbox rounded border-gray-200 dark:border-gray-800 text-[var(--applyons-blue)] focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50" type="checkbox" value="" id="allcheck"/>
                                                    </th>
                                                    <th className="text-center p-4 w-10 min-w-[30px] max-w-[30px]"></th>
                                                    <th className="text-start p-4 w-48 min-w-[200px]">{t("appsEmail.table.name")}</th>
                                                    <th className="text-start p-4 w-auto min-w-[300px]">{t("appsEmail.table.subject")}</th>
                                                    <th className="text-end p-4 w-48 min-w-[200px]">{t("appsEmail.table.dateTime")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {inboxData.map((item, index)=>{
                                                    return(
                                                        <tr key={index}>
                                                            <th className="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                                <input className="form-checkbox rounded border-gray-200 dark:border-gray-800 text-[var(--applyons-blue)] focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50" type="checkbox" value="" id="firstcheck"/>
                                                            </th>
                                                            <td className="text-center border-t border-gray-100 dark:border-gray-800 p-4">
                                                                <Link to=""><i className={` text-[18px]  align-middle ${item.star === true ? 'text-yellow-500 mdi mdi-star' : 'text-slate-400 mdi mdi-star-outline'}`}></i></Link>
                                                            </td>
                                                            <td className="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                                <Link to="#" className="font-semibold hover:text-[var(--applyons-blue)]">{item.name}</Link>
                                                            </td>
                                                            <td className="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                                <span className="text-slate-400">{item.subject}</span>
                                                            </td>
                                                            <td className="text-end border-t border-gray-100 dark:border-gray-800 p-4">
                                                                <span className="text-slate-400">{item.time}</span>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div>
                                            <Link to="#" className="size-8 inline-flex items-center justify-center font-semibold tracking-wide border align-middle duration-500 text-base text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full"><i className="mdi mdi-arrow-left"></i></Link>
                                            <Link to="#" className="size-8 inline-flex items-center justify-center font-semibold tracking-wide border align-middle duration-500 text-base text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full"><i className="mdi mdi-arrow-right"></i></Link>
                                        </div>

                                        <span className="text-slate-400">{t("appsEmail.pagination.showing", { from: 1, to: 10, total: 45 })}</span>
                                    </div>
                                </div> : ''
                            }
                            {activeIndex === 1 ? 
                            <div >
                                <div className="relative overflow-x-auto block w-full bg-white dark:bg-slate-900 shadow-sm dark:shadow-gray-700 rounded-md">
                                    <table className="w-full text-start">
                                        <thead className="text-base">
                                            <tr>
                                                <th className="text-start p-4 w-10 min-w-[30px] max-w-[30px]">
                                                    <input className="form-checkbox rounded border-gray-200 dark:border-gray-800 text-[var(--applyons-blue)] focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50" type="checkbox" value="" id="allcheck"/>
                                                </th>
                                                <th className="text-center p-4 w-10 min-w-[30px] max-w-[30px]"></th>
                                                <th className="text-start p-4 w-48 min-w-[200px]">{t("appsEmail.table.name")}</th>
                                                <th className="text-start p-4 w-auto min-w-[200px]">{t("appsEmail.table.subject")}</th>
                                                <th className="text-end p-4 w-48 min-w-[200px]">{t("appsEmail.table.dateTime")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <th className="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <input className="form-checkbox rounded border-gray-200 dark:border-gray-800 text-[var(--applyons-blue)] focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50" type="checkbox" value="" id="firstcheck"/>
                                                </th>
                                                <td className="text-center border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <Link to=""><i className="mdi mdi-star text-[18px] text-yellow-500 align-middle"></i></Link>
                                                </td>
                                                <td className="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <Link to="#" className="font-semibold hover:text-[var(--applyons-blue)]" data-modal-toggle="emailpreview">Sherrie Miller</Link>
                                                </td>
                                                <td className="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <span className="text-slate-400">Focused impactful open system 📷 😃</span>
                                                </td>
                                                <td className="text-end border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <span className="text-slate-400">8hours ago</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <th className="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <input className="form-checkbox rounded border-gray-200 dark:border-gray-800 text-[var(--applyons-blue)] focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50" type="checkbox" value="" id="firstcheck"/>
                                                </th>
                                                <td className="text-center border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <Link to=""><i className="mdi mdi-star text-[18px] text-yellow-500 align-middle"></i></Link>
                                                </td>
                                                <td className="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <Link to="#" className="font-semibold hover:text-[var(--applyons-blue)]" data-modal-toggle="emailpreview">Ester Casella</Link>
                                                </td>
                                                <td className="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <span className="text-slate-400">Theme Update</span>
                                                </td>
                                                <td className="text-end border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <span className="text-slate-400">7th August 2023</span>
                                                </td>
                                            </tr>
                                            
                                            <tr>
                                                <th className="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <input className="form-checkbox rounded border-gray-200 dark:border-gray-800 text-[var(--applyons-blue)] focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50" type="checkbox" value="" id="firstcheck"/>
                                                </th>
                                                <td className="text-center border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <Link to=""><i className="mdi mdi-star text-[18px] text-yellow-500 align-middle"></i></Link>
                                                </td>
                                                <td className="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <Link to="#" className="font-semibold hover:text-[var(--applyons-blue)]" data-modal-toggle="emailpreview">Richard Benavides</Link>
                                                </td>
                                                <td className="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <span className="text-slate-400">Your product has been updated!</span>
                                                </td>
                                                <td className="text-end border-t border-gray-100 dark:border-gray-800 p-4">
                                                    <span className="text-slate-400">5th August 2023</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>: ''
                            }

                            {activeIndex === 2 ? 
                                <div>
                                    <div className="relative overflow-x-auto block w-full bg-white dark:bg-slate-900 shadow-sm dark:shadow-gray-700 rounded-md p-6">
                                        <span className="text-slate-400">{t("appsEmail.empty.spam")}</span>
                                    </div>
                                </div> :''
                            }

                            {activeIndex === 3 ? 
                                <div >
                                    <div className="relative overflow-x-auto block w-full bg-white dark:bg-slate-900 shadow-sm dark:shadow-gray-700 rounded-md">
                                        <table className="w-full text-start">
                                            <thead className="text-base">
                                                <tr>
                                                    <th className="text-start p-4 w-10 min-w-[30px] max-w-[30px]">
                                                        <input className="form-checkbox rounded border-gray-200 dark:border-gray-800 text-[var(--applyons-blue)] focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50" type="checkbox" value="" id="allcheck"/>
                                                    </th>
                                                    <th className="text-center p-4 w-10 min-w-[30px] max-w-[30px]"></th>
                                                    <th className="text-start p-4 w-48 min-w-[200px]">{t("appsEmail.table.name")}</th>
                                                    <th className="text-start p-4 w-auto min-w-[200px]">{t("appsEmail.table.subject")}</th>
                                                    <th className="text-end p-4 w-48 min-w-[200px]">{t("appsEmail.table.dateTime")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <th className="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                        <input className="form-checkbox rounded border-gray-200 dark:border-gray-800 text-[var(--applyons-blue)] focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50" type="checkbox" value="" id="firstcheck"/>
                                                    </th>
                                                    <td className="text-center border-t border-gray-100 dark:border-gray-800 p-4">
                                                        <Link to=""><i className="mdi mdi-star-outline text-[18px] text-slate-400 align-middle"></i></Link>
                                                    </td>
                                                    <td className="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                        <Link to="#" className="font-semibold hover:text-[var(--applyons-blue)]" data-modal-toggle="emailpreview">Calvin Carlo</Link>
                                                    </td>
                                                    <td className="text-start border-t border-gray-100 dark:border-gray-800 p-4">
                                                        <span className="text-slate-400">Techwind Customization</span>
                                                    </td>
                                                    <td className="text-end border-t border-gray-100 dark:border-gray-800 p-4">
                                                        <span className="text-slate-400">03:05PM</span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div> :''
                            }
                            {activeIndex === 4 ? 
                                <div>
                                    <div className="relative overflow-x-auto block w-full bg-white dark:bg-slate-900 shadow-sm dark:shadow-gray-700 rounded-md p-6">
                                        <span className="text-slate-400">{t("appsEmail.empty.drafts")}</span>
                                    </div>
                                </div> : ''
                            }
                            {activeIndex === 5 ? 
                                <div>
                                    <div className="relative overflow-x-auto block w-full bg-white dark:bg-slate-900 shadow-sm dark:shadow-gray-700 rounded-md p-6">
                                        <span className="text-slate-400">{t("appsEmail.empty.trash")}</span>
                                    </div>
                                </div> :''
                            }
                            {activeIndex === 6 ? 
                                <div className="hidden " id="note" role="tabpanel" aria-labelledby="note-tab">
                                    <div className="relative overflow-x-auto block w-full bg-white dark:bg-slate-900 shadow-sm dark:shadow-gray-700 rounded-md p-6">
                                        <span className="text-slate-400">{t("appsEmail.empty.notes")}</span>
                                    </div>
                                </div> : ''
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}