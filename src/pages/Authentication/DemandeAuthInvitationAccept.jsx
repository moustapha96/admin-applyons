"use client";

import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoImg from "@/assets/logo.png";
import applyonsAbout1 from "@/assets/logo.png";
import Switcher from "@/components/switcher";
import BackButton from "@/components/backButton";
import demandeAuthentificationService from "@/services/demandeAuthentification.service";
import countries from "@/assets/countries.json";

// Type de compte fixe : Institut / Université / Collège (non modifiable)
const ORG_TYPE_OPTIONS = [
  { value: "UNIVERSITE", labelKey: "auth.signup.orgTypes.UNIVERSITE" },
  { value: "INSTITUT", labelKey: "auth.signup.orgTypes.INSTITUT" },
  { value: "COLLEGE", labelKey: "auth.signup.orgTypes.COLLEGE" },
];

const GENDER_OPTIONS = [
  { value: "MALE", labelKey: "auth.signup.genders.MALE" },
  { value: "FEMALE", labelKey: "auth.signup.genders.FEMALE" },
  { value: "OTHER", labelKey: "auth.signup.genders.OTHER" },
];

export default function DemandeAuthInvitationAccept() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(!!token);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "MALE",
    phone: "",
    country: "SN",
    adress: "",
    orgName: "",
    orgType: "UNIVERSITE",
    orgEmail: "",
    orgPhone: "",
    orgWebsite: "",
    orgAddress: "",
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    demandeAuthentificationService
      .getInvitationByToken(token)
      .then((res) => {
        const data = res?.data ?? res;
        setInvitation(data);
        const nameParts = (data.name || "").trim().split(/\s+/).filter(Boolean);
        setFormData((prev) => ({
          ...prev,
          email: (data.email || "").toLowerCase().trim(),
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          orgType: "UNIVERSITE",
        }));
      })
      .catch(() => setInvitation(null))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    const htmlTag = document.documentElement;
    htmlTag.setAttribute("dir", "ltr");
    htmlTag.classList.add("light");
    htmlTag.classList.remove("dark");
  }, []);

  const getDialCode = useMemo(() => {
    const c = countries.find((x) => x.code === formData.country || x.name === formData.country);
    return c?.dial_code || "+221";
  }, [formData.country]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    const fn = (formData.firstName || "").trim();
    const ln = (formData.lastName || "").trim();
    const email = (formData.email || "").trim();
    const orgName = (formData.orgName || "").trim();
    const orgEmail = (formData.orgEmail || "").trim();

    if (!fn) newErrors.firstName = t("demandesAuthentification.invitationAccept.firstNameRequired");
    else if (fn.length < 2) newErrors.firstName = t("auth.signup.errors.firstNameMinLength");
    if (!ln) newErrors.lastName = t("demandesAuthentification.invitationAccept.lastNameRequired");
    else if (ln.length < 2) newErrors.lastName = t("auth.signup.errors.lastNameMinLength");
    if (!formData.gender) newErrors.gender = t("auth.signup.errors.genderRequired");
    if (!email) newErrors.email = t("demandesAuthentification.invitationAccept.userEmailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = t("demandesAuthentification.invitationAccept.userEmailInvalid");
    if (!formData.password) newErrors.password = t("demandesAuthentification.invitationAccept.passwordRequired");
    else if (formData.password.length < 6) newErrors.password = t("demandesAuthentification.invitationAccept.passwordMin");
    if (!formData.confirmPassword) newErrors.confirmPassword = t("auth.signup.errors.confirmRequired");
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t("auth.signup.errors.passwordMismatch");
    if (!orgName) newErrors.orgName = t("demandesAuthentification.invitationAccept.orgNameRequired");
    if (!formData.orgType) newErrors.orgType = t("auth.signup.errors.orgTypeRequired");
    if (!orgEmail) newErrors.orgEmail = t("auth.signup.errors.orgEmailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgEmail)) newErrors.orgEmail = t("auth.signup.errors.orgEmailInvalid");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm() || !token) return;

    setSubmitting(true);
    try {
      await demandeAuthentificationService.acceptInvitation(token, {
        user: {
          email: formData.email.trim(),
          password: formData.password,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          gender: formData.gender,
          phone: formData.phone?.trim() || undefined,
          country: formData.country,
          adress: formData.adress?.trim() || undefined,
        },
        organization: {
          name: formData.orgName.trim(),
          type: formData.orgType,
          email: (formData.orgEmail || formData.email).trim(),
          phone: formData.orgPhone?.trim() || undefined,
          address: formData.orgAddress?.trim() || undefined,
          website: formData.orgWebsite?.trim() || undefined,
          country: formData.country,
        },
      });
      navigate("/auth/signup-success", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || t("demandesAuthentification.invitationAccept.error");
      setErrors({ _form: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-no-repeat bg-center bg-cover" style={{ backgroundImage: `url(${applyonsAbout1})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
        <div className="relative z-10 text-center text-white">
          <div className="inline-block w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <p className="mt-4">{t("demandesAuthentification.invitationAccept.loading")}</p>
        </div>
      </section>
    );
  }

  if (!token || !invitation) {
    return (
      <section className="min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: `url(${applyonsAbout1})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
        <div className="relative z-10 max-w-md w-full p-6 bg-white dark:bg-slate-900 shadow-lg rounded-lg text-center">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">{t("demandesAuthentification.invitationAccept.invalidTitle")}</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">{t("demandesAuthentification.invitationAccept.invalidDesc")}</p>
          <Link to="/auth/login" className="inline-block py-2 px-4 bg-[var(--applyons-blue)] text-white rounded-md hover:opacity-90">
            {t("demandesAuthentification.invitationAccept.backToLogin")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        className="min-h-screen py-12 md:py-20 flex items-center relative bg-no-repeat bg-center bg-cover"
        style={{ backgroundImage: `url(${applyonsAbout1})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
        <div className="container relative px-4">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-slate-900 shadow-md dark:shadow-gray-800 rounded-md">
              <div className="text-center mb-6">
                <Link to="/">
                  <img src={logoImg} className="mx-auto h-16" alt="ApplyOns" />
                </Link>
              </div>

              <h3 className="mb-2 font-bold text-2xl text-slate-800 dark:text-white text-center">
                {t("demandesAuthentification.invitationAccept.title")}
              </h3>

              <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">{t("demandesAuthentification.invitationAccept.infoMessage")}</p>
                <p className="mt-2 text-sm font-medium">
                  {t("demandesAuthentification.invitationAccept.codeADN")}: <strong>{invitation.codeADN}</strong>
                </p>
                {invitation.objet && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{invitation.objet}</p>}
              </div>

              <div className="mb-4 p-3 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>{t("demandesAuthentification.invitationAccept.accountTypeFixed")}</strong>
                </p>
              </div>

              {errors._form && (
                <div className="mb-4 p-4 rounded-lg border-2 border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600" role="alert">
                  <p className="text-sm text-red-800 dark:text-red-200">{errors._form}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h3 className="mb-4 font-bold text-2xl text-slate-700 dark:text-slate-200">{t("auth.signup.personalInfo")}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">{t("auth.signup.accountType")}</label>
                      <input
                        type="text"
                        readOnly
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 cursor-not-allowed"
                        value={t("demandesAuthentification.invitationAccept.accountTypeLabel")}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t("auth.signup.firstName")} *</label>
                      <input
                        name="firstName"
                        type="text"
                        className={`w-full px-3 py-2 border ${errors.firstName ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)] dark:bg-slate-700 dark:border-slate-600 dark:text-white`}
                        placeholder={t("auth.signup.placeholders.firstName")}
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                      {errors.firstName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t("auth.signup.lastName")} *</label>
                      <input
                        name="lastName"
                        type="text"
                        className={`w-full px-3 py-2 border ${errors.lastName ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)] dark:bg-slate-700 dark:border-slate-600 dark:text-white`}
                        placeholder={t("auth.signup.placeholders.lastName")}
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                      {errors.lastName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t("auth.signup.gender")} *</label>
                      <select
                        name="gender"
                        className={`w-full px-3 py-2 border ${errors.gender ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)] dark:bg-slate-700 dark:border-slate-600 dark:text-white`}
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        {GENDER_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                        ))}
                      </select>
                      {errors.gender && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gender}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t("auth.signup.country")}</label>
                      <select
                        name="country"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        value={formData.country}
                        onChange={handleChange}
                      >
                        {countries.map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">{t("auth.signup.email")} *</label>
                      <input
                        name="email"
                        type="email"
                        className={`w-full px-3 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)] dark:bg-slate-700 dark:border-slate-600 dark:text-white`}
                        placeholder={t("auth.signup.placeholders.email")}
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t("auth.signup.phone")}</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 dark:bg-slate-700 text-gray-500 text-sm">{getDialCode}</span>
                        <input
                          name="phone"
                          type="tel"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                          placeholder={t("auth.signup.placeholders.phone")}
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">{t("auth.signup.address")}</label>
                      <input
                        name="adress"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        placeholder={t("auth.signup.placeholders.address")}
                        value={formData.adress}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t("auth.signup.password")} *</label>
                      <div className="relative">
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          className={`w-full px-3 py-2 border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)] pr-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white`}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3" aria-hidden="true">
                          <i className={`mdi ${showPassword ? "mdi-eye-off-outline" : "mdi-eye-outline"} text-xl text-gray-500`} />
                        </button>
                      </div>
                      {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
                      <p className="mt-1 text-xs text-gray-500">{t("auth.signup.minPassword")}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t("auth.signup.confirmPassword")} *</label>
                      <div className="relative">
                        <input
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          className={`w-full px-3 py-2 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)] pr-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white`}
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3" aria-hidden="true">
                          <i className={`mdi ${showConfirmPassword ? "mdi-eye-off-outline" : "mdi-eye-outline"} text-xl text-gray-500`} />
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h3 className="mb-4 font-medium text-2xl text-slate-700 dark:text-slate-200">{t("auth.signup.orgInfo.institut")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t("auth.signup.orgName")} *</label>
                      <input
                        name="orgName"
                        type="text"
                        className={`w-full px-3 py-2 border ${errors.orgName ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)] dark:bg-slate-700 dark:border-slate-600 dark:text-white`}
                        placeholder={t("auth.signup.placeholders.orgNameInstitut")}
                        value={formData.orgName}
                        onChange={handleChange}
                      />
                      {errors.orgName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.orgName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t("auth.signup.orgType")} *</label>
                      <select
                        name="orgType"
                        className={`w-full px-3 py-2 border ${errors.orgType ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)] dark:bg-slate-700 dark:border-slate-600 dark:text-white`}
                        value={formData.orgType}
                        onChange={handleChange}
                      >
                        {ORG_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                        ))}
                      </select>
                      {errors.orgType && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.orgType}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t("auth.signup.orgEmail")} *</label>
                      <input
                        name="orgEmail"
                        type="email"
                        className={`w-full px-3 py-2 border ${errors.orgEmail ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)] dark:bg-slate-700 dark:border-slate-600 dark:text-white`}
                        placeholder={t("auth.signup.placeholders.orgEmail")}
                        value={formData.orgEmail || formData.email}
                        onChange={handleChange}
                      />
                      {errors.orgEmail && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.orgEmail}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t("auth.signup.orgPhone")}</label>
                      <input
                        name="orgPhone"
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        placeholder={t("auth.signup.placeholders.orgPhone")}
                        value={formData.orgPhone}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t("auth.signup.orgWebsite")}</label>
                      <input
                        name="orgWebsite"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        placeholder={t("auth.signup.placeholders.orgWebsite")}
                        value={formData.orgWebsite}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">{t("auth.signup.orgAddress")}</label>
                      <input
                        name="orgAddress"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        placeholder={t("auth.signup.placeholders.orgAddress")}
                        value={formData.orgAddress}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200">{t("auth.signup.orgNote")}</p>
                  </div>
                </div>

                <div className="flex justify-between flex-wrap gap-3">
                  <button
                    type="button"
                    className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
                    onClick={() => navigate("/auth/login")}
                  >
                    {t("auth.signup.login")}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="py-2 px-4 rounded-md bg-[var(--applyons-blue)] text-white hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed font-semibold"
                  >
                    {submitting ? (
                      <>
                        <span className="inline-block animate-spin mr-2">↻</span>
                        {t("auth.signup.creating")}
                      </>
                    ) : (
                      t("demandesAuthentification.invitationAccept.submit")
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("auth.login.footer", { year: new Date().getFullYear() })}</p>
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
