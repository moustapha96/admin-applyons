/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoImg from "../../assets/logo.png";
import Switcher from "../../components/switcher";
import BackButton from "../../components/backButton";
import organizationInviteService from "../../services/organizationInviteService";
import { toast } from "sonner";
import applyonsAbout1 from "../../assets/logo.png";
import { message, Spin } from "antd";
import countries from "@/assets/countries.json";

export default function OrgInviteAccept() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [inviteData, setInviteData] = useState(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [formData, setFormData] = useState({
    // Données utilisateur
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    adress: "",
    country: "Senegal", // Utiliser le nom complet pour correspondre aux options du select
    gender: "MALE",
    birthPlace: "",
    birthDate: "",

    // Données organisation
    orgName: "",
    orgType: "UNIVERSITE",
    orgEmail: "",
    orgPhone: "",
    orgWebsite: "",
    orgAddress: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const genderOptions = [
    { value: "MALE", label: t('auth.signup.genders.MALE') },
    { value: "FEMALE", label: t('auth.signup.genders.FEMALE') },
    { value: "OTHER", label: t('auth.signup.genders.OTHER') },
  ];

  useEffect(() => {
    const htmlTag = document.documentElement;
    htmlTag.setAttribute("dir", "ltr");
    htmlTag.classList.add("light");
    htmlTag.classList.remove("dark");
  }, []);

  // Charger les données de l'invitation
  useEffect(() => {
    const loadInviteData = async () => {
      if (!token) {
        message.error(t('auth.orgInviteAccept.tokenMissing'));
        setLoadingInvite(false);
        return;
      }

      try {
        setLoadingInvite(true);
        const response = await organizationInviteService.getInviteByToken(token);
        const data = response?.data || response;
        
        if (!data) {
          message.error(t('auth.orgInviteAccept.inviteNotFound'));
          setLoadingInvite(false);
          return;
        }
        console.log(data);
        setInviteData(data);

        // Déterminer le type d'organisation par défaut basé sur l'organisation invitante
        let defaultOrgType = "UNIVERSITE";
        if (data.inviterOrg?.type === "TRADUCTEUR") {
          defaultOrgType = "TRADUCTEUR";
        } else if (data.inviterOrg?.type === "BANQUE") {
          defaultOrgType = "BANQUE";
        }

        // Pré-remplir les champs avec les données de l'invitation
        setFormData((prev) => ({
          ...prev,
          email:  "",
          phone:  "",
          adress:  "",
          orgEmail: data.inviteeEmail || "",
          orgName: data.inviteeName?.trim() || "", // Utiliser le nom complet au lieu de seulement le premier mot
          orgType: defaultOrgType,
        }));
      } catch (error) {
        console.error("Erreur lors du chargement de l'invitation:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Erreur lors du chargement de l'invitation";
        message.error(errorMessage);
      } finally {
        setLoadingInvite(false);
      }
    };

    if (token) {
      loadInviteData();
    } else {
      setLoadingInvite(false);
    }
  }, [token]);

  const isValidBirthDate = (dateValue) => {
    if (!dateValue) return false;
    const d = new Date(dateValue);
    const today = new Date();
    if (Number.isNaN(d.getTime())) return false;
    const min = new Date("1900-01-01");
    return d >= min && d <= today;
  };

  // Validation en temps réel
  const isFormValid = useMemo(() => {
    // Vérifier les champs utilisateur
    const firstName = formData.firstName?.trim();
    const lastName = formData.lastName?.trim();
    const birthPlace = formData.birthPlace?.trim();
    const email = formData.email?.trim();
    const orgName = formData.orgName?.trim();
    const orgEmail = formData.orgEmail?.trim();
    
    if (!firstName || !lastName || !formData.gender) return false;
    if (!birthPlace || !formData.birthDate || !isValidBirthDate(formData.birthDate)) return false;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    if (!formData.password || formData.password.length < 6) return false;
    if (formData.password !== formData.confirmPassword) return false;
    // Vérifier les champs organisation
    if (!orgName || !formData.orgType) return false;
    if (!orgEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgEmail)) return false;
    return true;
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName) newErrors.firstName = t('auth.signup.errors.firstNameRequired');
    if (!formData.lastName) newErrors.lastName = t('auth.signup.errors.lastNameRequired');
    if (!formData.gender) newErrors.gender = t('auth.signup.errors.genderRequired');
    if (!formData.birthPlace) newErrors.birthPlace = t('auth.signup.errors.birthPlaceRequired');
    if (!formData.birthDate) newErrors.birthDate = t('auth.signup.errors.birthDateRequired');
    else if (!isValidBirthDate(formData.birthDate))
      newErrors.birthDate = t('auth.signup.errors.birthDateInvalid');
    if (!formData.email) newErrors.email = t('auth.signup.errors.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('auth.signup.errors.emailInvalid');
    if (!formData.password) newErrors.password = t('auth.signup.errors.passwordRequired');
    else if (formData.password.length < 6) newErrors.password = t('auth.signup.errors.passwordMin');
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = t('auth.signup.errors.passwordMismatch');
    if (!formData.orgName) newErrors.orgName = t('auth.signup.errors.orgNameRequired');
    if (!formData.orgType) newErrors.orgType = t('auth.signup.errors.orgTypeRequired');
    if (!formData.orgEmail) newErrors.orgEmail = t('auth.signup.errors.orgEmailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.orgEmail))
      newErrors.orgEmail = t('auth.signup.errors.orgEmailInvalid');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateSlug = (name) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!token) {
      message.error(t('auth.orgInviteAccept.tokenMissingError'));
      return;
    }

    setIsLoading(true);
    const username =
      `${(formData.firstName || "").toLowerCase()}_${(formData.lastName || "").toLowerCase()}`.replace(
        /[^a-z0-9_]/g,
        ""
      );

    try {
      const payload = {
        user: {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          country: formData.country,
          adress: formData.adress,
          gender: formData.gender,
          username,
          birthPlace: formData.birthPlace,
          birthDate: formData.birthDate,
        },
        organization: {
          name: formData.orgName,
          slug: generateSlug(formData.orgName),
          type: formData.orgType,
          email: formData.orgEmail,
          phone: formData.orgPhone,
          address: formData.orgAddress,
          website: formData.orgWebsite,
          country: formData.country,
        },
      };
      console.log(payload);
      
      await organizationInviteService.acceptInvite(token, payload);
      message.success(t('auth.orgInviteAccept.successMessage'));
      navigate("/auth/login");
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message || err?.message || t('auth.orgInviteAccept.createError');
      toast.error(errorMessage);
      if (err?.response?.data?.errors) {
        setErrors(
          err.response.data.errors.reduce((acc, error) => {
            acc[error.path] = error.msg;
            return acc;
          }, {})
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Déterminer le type d'organisation et les options disponibles
  const orgTypeOptions = useMemo(() => {
    if (!inviteData?.inviterOrg?.type) return [];
    
    const orgType = inviteData.inviterOrg.type;
    if (orgType === "TRADUCTEUR") {
      return [{ value: "TRADUCTEUR", label: t('auth.signup.orgTypes.TRADUCTEUR') }];
    } else if (orgType === "BANQUE") {
      return [{ value: "BANQUE", label: t('auth.signup.orgTypes.BANQUE') }];
    } else {
      return [
        { value: "UNIVERSITE", label: t('auth.signup.orgTypes.UNIVERSITE') },
        { value: "COLLEGE", label: t('auth.signup.orgTypes.COLLEGE') },
        { value: "LYCEE", label: t('auth.signup.orgTypes.LYCEE') },
        { value: "ENTREPRISE", label: t('auth.signup.orgTypes.ENTREPRISE') },
      ];
    }
  }, [inviteData, t]);

  if (loadingInvite) {
    return (
      <section className="min-h-screen py-12 md:py-20 flex items-center relative bg-no-repeat bg-center bg-cover" style={{ backgroundImage: `url(${applyonsAbout1})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
        <div className="container relative px-4">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-slate-900 shadow-md dark:shadow-gray-800 rounded-md text-center">
              <Spin size="large" />
              <p className="mt-4 text-slate-700 dark:text-slate-200">Chargement de l'invitation...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!inviteData) {
    return (
      <section className="min-h-screen py-12 md:py-20 flex items-center relative bg-no-repeat bg-center bg-cover" style={{ backgroundImage: `url(${applyonsAbout1})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
        <div className="container relative px-4">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-slate-900 shadow-md dark:shadow-gray-800 rounded-md text-center">
              <h5 className="mb-4 text-xl font-semibold text-slate-800 dark:text-white">
                {t('auth.orgInviteAccept.pageTitle')}
              </h5>
              <p className="mb-4 text-slate-600 dark:text-slate-300">
                {t('auth.orgInviteAccept.pageSubtitle')}
              </p>
              <Link to="/auth/login" className="text-blue-600 hover:underline">
                {t('auth.orgInviteAccept.backToLogin')}
              </Link>
            </div>
          </div>
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
                  <img src={logoImg} className="mx-auto h-16" alt="applyons" />
                </Link>
              </div>

              <h5 className="mb-4 text-xl font-semibold text-slate-800 dark:text-white text-center">
                Accepter l'invitation
              </h5>

              {/* Informations de l'invitation */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  <strong>Vous avez été invité par :</strong>
                </p>
                
               
                {/* Utilisateur demandeur qui a envoyé l'invitation */}
                {inviteData.user && (
                  <div className="mb-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                    <p className="text-base font-semibold text-blue-900 dark:text-blue-100">
                      {inviteData.user.firstName} {inviteData.user.lastName}
                    </p>
                    {inviteData.user.email && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {inviteData.user.email}
                      </p>
                    )}
                   
                  </div>
                )}

                
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Bloc Infos personnelles */}
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h6 className="mb-4 text-lg font-medium text-slate-700 dark:text-slate-200">
                    {t('auth.signup.personalInfo')}
                  </h6>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('auth.signup.firstName')}</label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        className={`w-full px-3 py-2 border ${errors.firstName ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)]`}
                        placeholder={t('auth.signup.placeholders.firstName')}
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                      {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t('auth.signup.lastName')}</label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        className={`w-full px-3 py-2 border ${errors.lastName ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)]`}
                        placeholder={t('auth.signup.placeholders.lastName')}
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                      {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t('auth.signup.gender')}</label>
                      <select
                        id="gender"
                        name="gender"
                        className={`w-full px-3 py-2 border ${errors.gender ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)]`}
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        {genderOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t('auth.signup.birthPlace')}</label>
                      <select
                        id="birthPlace"
                        name="birthPlace"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)]"
                        value={formData.birthPlace}
                        onChange={handleChange}
                      >
                        {countries.map((opt) => (
                          <option key={opt.name} value={opt.name}>
                            {opt.name}
                          </option>
                        ))}
                      </select>
                      {errors.birthPlace && <p className="mt-1 text-xs text-red-600">{errors.birthPlace}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t('auth.signup.birthDate')}</label>
                      <input
                        id="birthDate"
                        name="birthDate"
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                        className={`w-full px-3 py-2 border ${errors.birthDate ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)]`}
                        value={formData.birthDate}
                        onChange={handleChange}
                      />
                      {errors.birthDate && <p className="mt-1 text-xs text-red-600">{errors.birthDate}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">{t('auth.signup.email')}</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className={`w-full px-3 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)]`}
                        placeholder={t('auth.signup.placeholders.email')}
                        value={formData.email}
                        onChange={handleChange}
                        
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t('auth.signup.phone')}</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)]"
                        placeholder={t('auth.signup.placeholders.phone')}
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t('auth.signup.country')}</label>
                      <select
                        id="country"
                        name="country"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)]"
                        value={formData.country}
                        onChange={handleChange}
                      >
                        {countries.map((opt) => (
                          <option key={opt.name} value={opt.name}>
                            {opt.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">{t('auth.signup.address')}</label>
                      <input
                        id="adress"
                        name="adress"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)]"
                        placeholder={t('auth.signup.placeholders.address')}
                        value={formData.adress}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t('auth.signup.password')}</label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          className={`w-full px-3 py-2 border ${errors.password ? "border-red-500" : "border-gray-300"
                            } rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)] pr-10`}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                        >
                          {showPassword ? (
                            <i className="mdi mdi-eye-off-outline text-xl text-gray-500" />
                          ) : (
                            <i className="mdi mdi-eye-outline text-xl text-gray-500" />
                          )}
                        </button>
                      </div>
                      {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                      <p className="mt-1 text-xs text-gray-500">{t('auth.signup.minPassword')}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t('auth.signup.confirmPassword')}</label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          className={`w-full px-3 py-2 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                            } rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)] pr-10`}
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          aria-label={showConfirmPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                        >
                          {showConfirmPassword ? (
                            <i className="mdi mdi-eye-off-outline text-xl text-gray-500" />
                          ) : (
                            <i className="mdi mdi-eye-outline text-xl text-gray-500" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bloc Organisation */}
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h6 className="mb-4 text-lg font-medium text-slate-700 dark:text-slate-200">
                    {t('auth.orgInviteAccept.orgInfo')}
                  </h6>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('auth.signup.orgName')}</label>
                      <input
                        id="orgName"
                        name="orgName"
                        type="text"
                        className={`w-full px-3 py-2 border ${errors.orgName ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)]`}
                        placeholder={t('auth.signup.placeholders.orgNameInstitut')}
                        value={formData.orgName}
                        onChange={handleChange}
                      />
                      {errors.orgName && <p className="mt-1 text-xs text-red-600">{errors.orgName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t('auth.signup.orgType')}</label>
                      <select
                        id="orgType"
                        name="orgType"
                        className={`w-full px-3 py-2 border ${errors.orgType ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)]`}
                        value={formData.orgType}
                        onChange={handleChange}
                      >
                        <option value="">{t('auth.signup.placeholders.selectType')}</option>
                        {orgTypeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {errors.orgType && <p className="mt-1 text-xs text-red-600">{errors.orgType}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t('auth.signup.orgEmail')}</label>
                      <input
                        id="orgEmail"
                        name="orgEmail"
                        type="email"
                        className={`w-full px-3 py-2 border ${errors.orgEmail ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)]`}
                        placeholder={t('auth.signup.placeholders.orgEmail')}
                        value={formData.orgEmail}
                        onChange={handleChange}
                      />
                      {errors.orgEmail && <p className="mt-1 text-xs text-red-600">{errors.orgEmail}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t('auth.signup.orgPhone')}</label>
                      <input
                        id="orgPhone"
                        name="orgPhone"
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)]"
                        placeholder={t('auth.signup.placeholders.orgPhone')}
                        value={formData.orgPhone}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">{t('auth.signup.orgWebsite')}</label>
                      <input
                        id="orgWebsite"
                        name="orgWebsite"
                        type="url"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)]"
                        placeholder={t('auth.signup.placeholders.orgWebsite')}
                        value={formData.orgWebsite}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">{t('auth.signup.orgAddress')}</label>
                      <input
                        id="orgAddress"
                        name="orgAddress"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)]"
                        placeholder={t('auth.signup.placeholders.orgAddress')}
                        value={formData.orgAddress}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Message de débogage temporaire - à retirer après résolution */}
                {!isFormValid && (
                  <div className="mb-4 p-3 rounded border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm">
                    <p className="font-semibold mb-2">{t('auth.orgInviteAccept.debugTitle')}</p>
                    <ul className="list-disc list-inside space-y-1">
                      {!formData.firstName?.trim() && <li>{t('auth.orgInviteAccept.debugFields.firstName')}</li>}
                      {!formData.lastName?.trim() && <li>{t('auth.orgInviteAccept.debugFields.lastName')}</li>}
                      {!formData.gender && <li>{t('auth.orgInviteAccept.debugFields.gender')}</li>}
                      {!formData.birthPlace?.trim() && <li>{t('auth.orgInviteAccept.debugFields.birthPlace')}</li>}
                      {(!formData.birthDate || !isValidBirthDate(formData.birthDate)) && <li>{t('auth.orgInviteAccept.debugFields.birthDate')}</li>}
                      {(!formData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) && <li>{t('auth.orgInviteAccept.debugFields.email')}</li>}
                      {(!formData.password || formData.password.length < 6) && <li>{t('auth.orgInviteAccept.debugFields.password')}</li>}
                      {formData.password !== formData.confirmPassword && <li>{t('auth.orgInviteAccept.debugFields.confirmPassword')}</li>}
                      {!formData.orgName?.trim() && <li>{t('auth.orgInviteAccept.debugFields.orgName')}</li>}
                      {!formData.orgType && <li>{t('auth.orgInviteAccept.debugFields.orgType')}</li>}
                      {(!formData.orgEmail?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.orgEmail.trim())) && <li>{t('auth.orgInviteAccept.debugFields.orgEmail')}</li>}
                    </ul>
                  </div>
                )}

                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      onClick={() => navigate("/auth/login")}
                    >
                      {t('auth.signup.login')}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !isFormValid}
                    className={`py-2 px-4 rounded-md transition-all duration-300 ${
                      isLoading
                        ? "opacity-70 cursor-not-allowed bg-[var(--applyons-blue)] text-white"
                        : isFormValid
                        ? "bg-[var(--applyons-blue)] text-white hover:bg-green-600 shadow-lg shadow-green-400/50 border-2 border-green-400 font-semibold"
                        : "bg-gray-400 text-white cursor-not-allowed opacity-60"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <span className="inline-block animate-spin mr-2">↻</span>
                        {t('auth.orgInviteAccept.creating')}
                      </>
                    ) : (
                      t('auth.orgInviteAccept.createOrg')
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('auth.login.footer', { year: new Date().getFullYear() })}
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
