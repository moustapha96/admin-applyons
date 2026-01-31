"use client";

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import logoImg from "../../assets/logo.png";
import Switcher from "../../components/switcher";
import BackButton from "../../components/backButton";

import applyonsAbout1 from "../../assets/logo.png";
import { CheckCircleOutlined } from "@ant-design/icons";

export default function AuthSignupSuccess() {
  const { t } = useTranslation();

  useEffect(() => {
    const htmlTag = document.documentElement;
    htmlTag.setAttribute("dir", "ltr");
    htmlTag.classList.add("light");
    htmlTag.classList.remove("dark");
  }, []);

  return (
    <>
      {/* Même structure que la page login : section plein écran + image de fond + overlay */}
      <section
        className="md:h-screen py-36 flex items-center relative bg-no-repeat bg-center bg-cover"
        style={{ backgroundImage: `url(${applyonsAbout1})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />

        <div className="container relative">
          <div className="flex justify-center">
            {/* Carte centrale (même largeur que login) */}
            <div className="max-w-[420px] w-full m-auto p-6 bg-white dark:bg-slate-900 shadow-md dark:shadow-gray-800 rounded-md">
              <div className="text-center">
                <Link to="/">
                  <img src={logoImg} className="mx-auto h-20" alt="applyons" />
                </Link>
              </div>

              <h5 className="my-6 text-xl font-semibold text-slate-800 dark:text-white text-center">
                {t("auth.signupSuccess.title")}
              </h5>

              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 56 }} />
                </div>
                <p className="text-slate-700 dark:text-slate-200 mb-2 font-medium">
                  {t("auth.signupSuccess.congratulations")}
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
                  {t("auth.signupSuccess.message")}
                </p>

                <div className="mb-2">
                  <Link
                    to="/auth/login"
                    className="py-2 px-5 ant-btn-primary inline-block font-semibold tracking-wide duration-500 text-base text-center text-white rounded-md w-full hover:opacity-90 transition-opacity"
                  >
                    {t("auth.signupSuccess.goToLogin")}
                  </Link>
                </div>
              </div>

              <div className="text-center mt-6">
                <p className="mb-0 text-slate-400 text-sm">
                  {t("auth.signupSuccess.footer", { year: new Date().getFullYear() })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Switcher />
      <BackButton />
    </>
  );
}
