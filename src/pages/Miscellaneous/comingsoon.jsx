import { useEffect, useState } from 'react' 
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import logoImg from '../../assets/images/logo-icon-64.png'
import Switcher from '../../components/switcher';
import BackButton from '../../components/backButton';

export default function Comingsoon(){
    const { t } = useTranslation();

    useEffect(() => {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
    }, []);
    let [days,setDays] = useState();
    let [hours,setHours] = useState();
    let [minutes,setMinutes] = useState();
    let [seconds,setSeconds] = useState();

    let deadline = "December, 31, 2025";
  
    let getTime = () => {
      let time = Date.parse(deadline) - Date.now();
  
      setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
      setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
      setMinutes(Math.floor((time / 1000 / 60) % 60));
      setSeconds(Math.floor((time / 1000) % 60));
    };

    useEffect(() => {
        let interval = setInterval(() => getTime(deadline), 1000);
        return () => clearInterval(interval);
    }, []);

    return(
   <>
    <section className="relative bg-[url('../../assets/images/utility.jpg')] bg-no-repeat bg-center bg-cover">
        <div className="absolute inset-0 bg-black/25"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black"></div>
        <div className="container-fluid relative">
            <div className="grid grid-cols-1">
                <div className="flex flex-col min-h-screen justify-center md:px-10 py-10 px-4">
                    <div className="text-center">
                        <Link to="/"><img src={logoImg} className="mx-auto" alt=""/></Link>
                    </div>
                    <div className="title-heading text-center my-auto">
                        <h1 className="text-white mt-3 mb-6 md:text-5xl text-3xl font-bold">
                            {t("miscComingSoon.title")}
                        </h1>
                        <p className="text-white/70 text-lg max-w-xl mx-auto">
                            {t("miscComingSoon.subtitle")}
                        </p>
                    
                        <div id="countdown">
                            <ul className="count-down list-none inline-block text-white text-center mt-8 m-6">
                                <li  className="text-[40px] leading-[110px] size-[130px] rounded-full shadow-md bg-white/10 backdrop-opacity-30 inline-block m-2">
                                    {days}
                                    <p className='count-head'>{t("miscComingSoon.countdown.days")}</p>
                                </li>
                                <li  className="text-[40px] leading-[110px] size-[130px] rounded-full shadow-md bg-white/10 backdrop-opacity-30 inline-block m-2">
                                    {hours}
                                    <p className='count-head'>{t("miscComingSoon.countdown.hours")}</p>
                                </li>
                                <li  className="text-[40px] leading-[110px] size-[130px] rounded-full shadow-md bg-white/10 backdrop-opacity-30 inline-block m-2">
                                    {minutes}
                                    <p className='count-head'>{t("miscComingSoon.countdown.minutes")}</p>
                                </li>
                                <li  className="text-[40px] leading-[110px] size-[130px] rounded-full shadow-md bg-white/10 backdrop-opacity-30 inline-block m-2">
                                    {seconds}
                                    <p className='count-head'>{t("miscComingSoon.countdown.seconds")}</p>
                                </li>
                                <li className="h1"></li>
                            </ul>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="mb-0 text-[var(--applyons-orange)]">
                            {t("miscComingSoon.footer", { year: new Date().getFullYear() })}{" "}
                            <Link to="https://alhussein-khouma.vercel.app/" target="_blank" className="text-reset">ADM</Link>.
                        </p>
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