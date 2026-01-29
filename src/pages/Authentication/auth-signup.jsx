/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoImg from "../../assets/logo.png";
import Switcher from "../../components/switcher";
import BackButton from "../../components/backButton";
import authService from "../../services/authService";
import { toast } from "sonner";
import applyonsAbout1 from "../../assets/logo.png";
import countries from "@/assets/countries.json";


// Map URL type (registration?type=xxx) vers rôle et orgType par défaut
const TYPE_TO_ROLE = {
  demandeur: "DEMANDEUR",
  institut: "INSTITUT",
  traducteur: "TRADUCTEUR",
  banque: "BANQUE",
};

const DEFAULT_ORG_TYPE_BY_ROLE = {
  INSTITUT: "UNIVERSITE",
  TRADUCTEUR: "TRADUCTEUR",
  BANQUE: "BANQUE",
};

export default function Signup() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get("type")?.toLowerCase();

  const [formData, setFormData] = useState({
    // Données utilisateur
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    adress: "",
    country: "SN", // Code ISO du pays (ex: "SN" pour Sénégal)
    gender: "MALE",
    role: "DEMANDEUR",
    birthPlace: "",         // NEW
    birthDate: "",          // NEW (YYYY-MM-DD)

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
  const navigate = useNavigate();

  // Pré-sélection du type de compte depuis l'URL (ex: /registration?type=institut ou ?type=demandeur)
  useEffect(() => {
    const role = TYPE_TO_ROLE[typeFromUrl];
    if (!role) return;
    const orgType = DEFAULT_ORG_TYPE_BY_ROLE[role];
    setFormData((prev) => ({
      ...prev,
      role,
      orgType: orgType ?? prev.orgType,
    }));
  }, [typeFromUrl]);

  const roleOptions = [
    { value: "DEMANDEUR", label: t('auth.signup.roles.DEMANDEUR') },
    { value: "INSTITUT", label: t('auth.signup.roles.INSTITUT') },
    { value: "TRADUCTEUR", label: t('auth.signup.roles.TRADUCTEUR') },
    { value: "BANQUE", label: t('auth.signup.roles.BANQUE') },
  ];

  const orgTypeOptions = {
    INSTITUT: [
      { value: "UNIVERSITE", label: t('auth.signup.orgTypes.UNIVERSITE') },
      { value: "INSTITUT", label: t('auth.signup.orgTypes.INSTITUT') },
      { value: "COLLEGE", label: t('auth.signup.orgTypes.COLLEGE') },
      // { value: "LYCEE", label: t('auth.signup.orgTypes.LYCEE') },
      // { value: "ENTREPRISE", label: t('auth.signup.orgTypes.ENTREPRISE') },
    ],
    TRADUCTEUR: [{ value: "TRADUCTEUR", label: t('auth.signup.orgTypes.TRADUCTEUR') }],
    BANQUE: [{ value: "BANQUE", label: t('auth.signup.orgTypes.BANQUE') }],
  };

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

  const roleNeedsOrganization = (role) => ["INSTITUT", "TRADUCTEUR", "BANQUE"].includes(role);
  const visibleOrgTypes = useMemo(() => orgTypeOptions[formData.role] || [], [formData.role]);

  // Fonction pour obtenir le dial_code du pays sélectionné
  const getDialCode = useMemo(() => {
    const selectedCountry = countries.find(c => c.code === formData.country || c.name === formData.country);
    return selectedCountry?.dial_code || "+221"; // +221 est le code par défaut pour le Sénégal
  }, [formData.country]);

  const isValidBirthDate = (yyyyMmDd) => {
    if (!yyyyMmDd) return false;
    const d = new Date(yyyyMmDd);
    const today = new Date();
    if (Number.isNaN(d.getTime())) return false;
    // entre 1900-01-01 et aujourd'hui
    const min = new Date("1980-01-01");
    return d >= min && d <= today;
  };

  // Validation en temps réel pour vérifier si tous les champs requis sont remplis
  const isFormValid = useMemo(() => {
    // Champs utilisateur requis
    if (!formData.firstName || !formData.lastName || !formData.gender) return false;
    if (!formData.birthPlace || !formData.birthDate || !isValidBirthDate(formData.birthDate)) return false;
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return false;
    if (!formData.password || formData.password.length < 6) return false;
    if (formData.password !== formData.confirmPassword) return false;

    // Champs organisation si nécessaire
    if (roleNeedsOrganization(formData.role)) {
      if (!formData.orgName || !formData.orgType) return false;
      if (!formData.orgEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.orgEmail)) return false;
    }

    return true;
  }, [formData, roleNeedsOrganization]);

  const validateForm = () => {
    const newErrors = {};

    // User
    if (!formData.firstName) newErrors.firstName = t('auth.signup.errors.firstNameRequired');
    if (!formData.lastName) newErrors.lastName = t('auth.signup.errors.lastNameRequired');
    if (!formData.gender) newErrors.gender = t('auth.signup.errors.genderRequired');

    if (!formData.birthPlace) newErrors.birthPlace = t('auth.signup.errors.birthPlaceRequired'); // NEW
    if (!formData.birthDate) newErrors.birthDate = t('auth.signup.errors.birthDateRequired'); // NEW
    else if (!isValidBirthDate(formData.birthDate))
      newErrors.birthDate = t('auth.signup.errors.birthDateInvalid');

    if (!formData.email) newErrors.email = t('auth.signup.errors.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('auth.signup.errors.emailInvalid');

    if (!formData.password) newErrors.password = t('auth.signup.errors.passwordRequired');
    else if (formData.password.length < 6) newErrors.password = t('auth.signup.errors.passwordMin');

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = t('auth.signup.errors.passwordMismatch');

    // Organization si nécessaire
    if (roleNeedsOrganization(formData.role)) {
      if (!formData.orgName) newErrors.orgName = t('auth.signup.errors.orgNameRequired');
      if (!formData.orgType) newErrors.orgType = t('auth.signup.errors.orgTypeRequired');
      if (!formData.orgEmail) newErrors.orgEmail = t('auth.signup.errors.orgEmailRequired');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.orgEmail))
        newErrors.orgEmail = t('auth.signup.errors.orgEmailInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "role") {
      const firstType = (orgTypeOptions[value] && orgTypeOptions[value][0]?.value) || "";
      setFormData((prev) => ({
        ...prev,
        role: value,
        orgType: firstType,
      }));
      setErrors((prev) => ({ ...prev, orgName: undefined, orgType: undefined, orgEmail: undefined }));
      return;
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateSlug = (name) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

  // Fonction pour formater le numéro de téléphone avec le dial_code
  const formatPhoneWithDialCode = (phoneNumber) => {
    if (!phoneNumber) return "";
    const phone = phoneNumber.trim();
    // Si le numéro commence déjà par le dial_code, on ne l'ajoute pas
    if (phone.startsWith(getDialCode)) {
      return phone;
    }
    // Sinon, on ajoute le dial_code
    return `${getDialCode}${phone}`;
  };

  // Mappe les chemins d'erreur backend vers les noms de champs du formulaire
  const mapBackendErrorPath = (path) => {
    if (!path) return null;
    const p = String(path);
    if (p.startsWith("user.")) return p.replace("user.", "");
    if (p.startsWith("organization.")) {
      const field = p.replace("organization.", "");
      const map = { name: "orgName", type: "orgType", email: "orgEmail", phone: "orgPhone", address: "orgAddress", website: "orgWebsite", country: "orgCountry" };
      return map[field] || `org_${field}`;
    }
    return p;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;

    setIsLoading(true);
    const username =
      formData.username ||
      `${(formData.firstName || "").toLowerCase()}_${(formData.lastName || "").toLowerCase()}`.replace(
        /[^a-z0-9_]/g,
        ""
      );

    try {
      if (formData.role === "DEMANDEUR") {
        const userPayload = {
          email: formData.email.trim(),
          password: formData.password,
          role: "DEMANDEUR",
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formatPhoneWithDialCode(formData.phone) || undefined,
          country: formData.country,
          adress: formData.adress?.trim() || undefined,
          gender: formData.gender,
          username,
          birthPlace: formData.birthPlace || undefined,
          birthDate: formData.birthDate || undefined,
        };

        await authService.register(userPayload);
        toast.success(t('auth.signup.success'));
        navigate("/auth/login", { replace: true });
      } else {
        const payload = {
          user: {
            email: formData.email.trim(),
            password: formData.password,
            role: formData.role,
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            phone: formatPhoneWithDialCode(formData.phone) || undefined,
            country: formData.country,
            adress: formData.adress?.trim() || undefined,
            gender: formData.gender,
            username,
            birthPlace: formData.birthPlace || undefined,
            birthDate: formData.birthDate || undefined,
          },
          organization: {
            name: formData.orgName.trim(),
            slug: generateSlug(formData.orgName),
            type: formData.orgType,
            email: formData.orgEmail.trim(),
            phone: (formData.orgPhone && formData.orgPhone.trim()) || undefined,
            address: formData.orgAddress?.trim() || undefined,
            website: formData.orgWebsite?.trim() || undefined,
            country: formData.country,
          },
        };

        await authService.createWithOrganization(payload);
        toast.success(t('auth.signup.success'));
        navigate("/auth/login", { replace: true });
      }
    } catch (err) {
      const data = err?.response?.data ?? err;
      const errorMessage = data?.message || err?.message || t('auth.signup.errors.general');
      toast.error(errorMessage);
      const backendErrors = data?.errors || data?.error?.details;
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        const mapped = backendErrors.reduce((acc, item) => {
          const path = item.path ?? item.field;
          const msg = item.msg ?? item.message ?? item;
          const field = mapBackendErrorPath(path);
          if (field) acc[field] = typeof msg === "string" ? msg : msg?.message || JSON.stringify(msg);
          return acc;
        }, {});
        setErrors(mapped);
      }
    } finally {
      setIsLoading(false);
    }
  };

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

              <h3 className="mb-6 font-bold !important text-2xl text-slate-800 dark:text-white text-center">
                {t('auth.signup.title')}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Bloc Infos personnelles + rôle */}
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h3 className="mb-4 font-bold !important text-2xl text-slate-700 dark:text-slate-200">
                    {t('auth.signup.personalInfo')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Rôle en premier */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">{t('auth.signup.accountType')}</label>
                      <select
                        id="role"
                        name="role"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)]"
                        value={formData.role}
                        onChange={handleChange}
                      >
                        {roleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

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

                    {/* NEW: Lieu de naissance */}
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

                    {/* NEW: Date de naissance */}
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
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          {getDialCode}
                        </span>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)]"
                          placeholder={t('auth.signup.placeholders.phone')}
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
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
                          <option key={opt.code} value={opt.code}>
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

                {/* Bloc Organisation (affiché uniquement si le rôle le requiert) */}
                {roleNeedsOrganization(formData.role) && (
                  <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                    <h3 className="mb-4 font-medium !important text-2xl text-slate-700 dark:text-slate-200">
                      {formData.role === "INSTITUT"
                        ? t('auth.signup.orgInfo.institut')
                        : formData.role === "TRADUCTEUR"
                          ? t('auth.signup.orgInfo.traducteur')
                          : t('auth.signup.orgInfo.banque')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">{t('auth.signup.orgName')}</label>
                        <input
                          id="orgName"
                          name="orgName"
                          type="text"
                          className={`w-full px-3 py-2 border ${errors.orgName ? "border-red-500" : "border-gray-300"
                            } rounded-md focus:outline-none focus:ring-[var(--applyons-blue)] focus:border-[var(--applyons-blue)]`}
                          placeholder={
                            formData.role === "INSTITUT"
                              ? t('auth.signup.placeholders.orgNameInstitut')
                              : formData.role === "TRADUCTEUR"
                                ? t('auth.signup.placeholders.orgNameTraducteur')
                                : t('auth.signup.placeholders.orgNameBanque')
                          }
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
                          {visibleOrgTypes.map((opt) => (
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
                          type="text"
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

                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>{t('auth.signup.orgNote')}</strong>
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between ">
                  
                  <div  className="flex gap-3" >
                    {/* <button
                      type="button"
                      className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      onClick={() => navigate("/auth/login")}
                    >
                      {t('auth.signup.cancel')}
                    </button> */}

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
                        {t('auth.signup.creating')}
                      </>
                    ) : formData.role === "DEMANDEUR" ? t('auth.signup.createAccount') : t('auth.signup.createAccountAndOrg')}
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

