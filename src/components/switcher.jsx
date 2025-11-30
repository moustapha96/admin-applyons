import {useEffect, useState} from 'react'
import { LiaSun } from 'react-icons/lia';
import { PiMoon } from 'react-icons/pi';
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const LANGS = [
    { key: "fr", label: "FR" },
    { key: "en", label: "EN" },
    { key: "es", label: "ES" },
    { key: "it", label: "IT" },
    { key: "de", label: "DE" },
    { key: "zh", label: "ZH" }
];

export default function Switcher() {
    const { i18n } = useTranslation();
    const [currentLang, setCurrentLang] = useState(i18n.language || 'fr');

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    useEffect(() => {
        setCurrentLang(i18n.language || 'fr');
    }, [i18n.language])

    const changeLanguage = (event) => {
        event.preventDefault();
        const currentIndex = LANGS.findIndex(lang => lang.key === currentLang);
        const nextIndex = (currentIndex + 1) % LANGS.length;
        const nextLang = LANGS[nextIndex];
        i18n.changeLanguage(nextLang.key);
        setCurrentLang(nextLang.key);
    }

    function changeMode(mode, event) {
        switch (mode) {
            case 'mode':
                if (document.documentElement.className.includes("dark")) {
                    document.documentElement.className = 'light'
                } else {
                    document.documentElement.className = 'dark'
                }
                break;
            case 'layout':
                if (event.target?.innerText === "LTR") {
                    document.documentElement.dir = "ltr"
                }
                else {
                    document.documentElement.dir = "rtl"
                }
                break;

            default:
                break;
        }
    }

    return (
        <>
            <div className="fixed top-[30%] -end-3 z-50">
                <span className="relative inline-block rotate-90">
                    <input type="checkbox" className="checkbox opacity-0 absolute" id="chk" onClick={(event) => changeMode('mode', event)} />
                    <label className="label bg-slate-900 dark:bg-white shadow-sm dark:shadow-gray-800 cursor-pointer rounded-full flex justify-between items-center p-1 w-14 h-8" htmlFor="chk">
                        <PiMoon className="text-[20px] text-yellow-500"/>
                        <LiaSun className="text-[20px] text-yellow-500"/>
                        <span className="ball bg-white dark:bg-slate-900 rounded-full absolute top-[2px] left-[2px] size-7"></span>
                    </label>
                </span>
            </div>

            <div className="fixed top-[40%] -end-3 z-50">
                <Link to="#" id="switchRtl">
                    <span className="py-1 px-3 relative inline-block rounded-b-md -rotate-90 bg-white dark:bg-slate-900 shadow-md dark:shadow-sm dark:shadow-gray-800 font-semibold rtl:block ltr:hidden" onClick={(event) => changeMode('layout', event)}>LTR</span>
                    <span className="py-1 px-3 relative inline-block rounded-b-md -rotate-90 bg-white dark:bg-slate-900 shadow-md dark:shadow-sm dark:shadow-gray-800 font-semibold ltr:block rtl:hidden" onClick={(event) => changeMode('layout', event)}>RTL</span>
                </Link>
            </div>

            <div className="fixed top-[50%] -end-3 z-50">
                <Link to="#" id="switchLang" onClick={changeLanguage}>
                    <span className="py-1 px-3 relative inline-block rounded-b-md -rotate-90 bg-white dark:bg-slate-900 shadow-md dark:shadow-sm dark:shadow-gray-800 font-semibold text-sm">
                        {currentLang.toUpperCase()}
                    </span>
                </Link>
            </div>

        </>
    )
}
