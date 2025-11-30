import { useState, useEffect } from 'react'
import logo_light from '../../assets/images/logo-icon-64.png';
import Switcher from '../../components/switcher';
import BackButton from '../../components/backButton';
import { useTranslation } from "react-i18next";

export default function Maintenance(){
    const { t } = useTranslation();
    const [minutes, setMinutes] = useState(0);
    const [remainingSeconds, setRemainingSeconds] = useState(0);

    useEffect(() => {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
    }, []);

    useEffect(() => {

        let intervalId = setInterval(() => {
            calculateTimeRemaining()
        }, 1000);

        var seconds = 3599;
        function calculateTimeRemaining() {

            const minutes = Math.round((seconds - 30) / 60);
            const remainingSeconds = seconds % 60;

            setMinutes(minutes);
            setRemainingSeconds(remainingSeconds);

            if (seconds === 0) {
                clearInterval(intervalId);
            } else {
                seconds = seconds - 1;
            }
        }

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    return(
           <>
            <section className="relative h-screen flex items-center justify-center text-center bg-[url('../../assets/images/utility.jpg')] bg-no-repeat bg-center bg-cover">
                <div className="absolute inset-0 bg-black/25"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black"></div>
                <div className="container relative">
                    <div className="grid grid-cols-1">
                        <img src={logo_light} className="mx-auto" alt="" />
                        <h1 className="text-white mb-6 mt-8 md:text-5xl text-3xl font-bold">
                            {t("miscMaintenance.title")}
                        </h1>
                        <p className="text-white/70 text-lg max-w-xl mx-auto">
                            {t("miscMaintenance.subtitle")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 mt-10">
                        <div className="text-center">
                            <span id="maintenance" className="timer text-white text-[56px] tracking-[1px]">{ minutes }:{ remainingSeconds }</span>
                            <span className="block text-base font-semibold uppercase text-white">
                                {t("miscMaintenance.minutesLabel")}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 mt-6">
                        <div className="text-center subcribe-form">
                            <form className="relative mx-auto max-w-xl">
                                <input
                                    type="email"
                                    id="subemail"
                                    name="name"
                                    className="pt-4 pe-40 pb-4 ps-6 w-full h-[50px] outline-none text-black dark:text-white rounded-full bg-white/70 dark:bg-slate-900/70 border border-gray-100 dark:border-gray-700"
                                    placeholder={t("miscMaintenance.placeholders.email")}
                                />
                                <button
                                    type="submit"
                                    className="py-2 px-5 inline-block font-semibold tracking-wide align-middle transition duration-500 ease-in-out text-base text-center absolute top-[2px] end-[3px] h-[46px] bg-[var(--applyons-blue)] hover:bg-indigo-700 border border-[var(--applyons-blue)] hover:border-indigo-700 text-white rounded-full"
                                >
                                    {t("miscMaintenance.buttons.subscribeNow")}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
            <Switcher/>
            <BackButton/>
           </>
    )
}