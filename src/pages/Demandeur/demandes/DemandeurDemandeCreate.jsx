
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  DatePicker,
  Checkbox,
  Divider,
  Row,
  Col,
  Steps,
  message,
  Popconfirm,
  List,
  Typography,
  Modal,
  Spin,
} from "antd";
import {
  BankOutlined,
  BookOutlined,
  FileTextOutlined,
  TeamOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import demandeService from "@/services/demandeService";
import organizationService from "@/services/organizationService";
import filiereService from "@/services/filiereService";
import { useAuth } from "@/hooks/useAuth";
import OrgNotifyPicker from "@/components/OrgNotifyPicker";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../../../components/payment/CheckoutForm";
import paymentService, { getPayPalConfig } from "../../../services/paymentService";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from "react-router-dom";
import countries from "@/assets/countries.json";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

/** ====== Payment Config (devient fallback seulement) ====== */
const DEFAULT_CURRENCY = "USD";
const DRAFT_KEY = "demande:draft:v4";

const isDay = (d) => dayjs.isDayjs(d);
const reviveDate = (v) => {
  if (!v) return null;
  if (isDay(v)) return v;
  const d = dayjs(v);
  return d.isValid() ? d : null;
};
const serializeFormValues = (values) => {
  const out = { ...values };
  ["dob", "graduationDate"].forEach((k) => {
    const v = values?.[k];
    if (!v) {
      out[k] = null;
      return;
    }
    if (isDay(v)) out[k] = v.toDate().toISOString();
    else if (v instanceof Date) out[k] = v.toISOString();
    else {
      const d = dayjs(v);
      out[k] = d.isValid() ? d.toDate().toISOString() : null;
    }
  });
  return out;
};
const toISO = (d) => {
  if (!d) return null;
  if (isDay(d)) return d.toDate().toISOString();
  if (d instanceof Date) return d.toISOString();
  const parsed = dayjs(d);
  return parsed.isValid() ? parsed.toDate().toISOString() : null;
};
const nullIfEmpty = (v) => (v === "" || v === undefined ? null : v);
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());

// Helper pour ajouter l'astérisque rouge aux champs obligatoires
const RequiredLabel = ({ children }) => (
  <span>
    {children}
    <span style={{ color: "#ff4d4f", marginLeft: 4 }}>*</span>
  </span>
);

export default function DemandeurDemandeCreate() {
  /** State */
  const { t } = useTranslation();
  const { user: me } = useAuth();
  console.log("ME:", me);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastPaymentMeta, setLastPaymentMeta] = useState(null);
  // Paiement
  const [paymentMethod, setPaymentMethod] = useState(null); // "stripe" | "paypal"
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stripe
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState(""); // pi_..._secret_...
  const [initializingStripe, setInitializingStripe] = useState(false);

  // Orgs/filieres
  const [orgs, setOrgs] = useState([]);
  const [tradOrgs, setTradOrgs] = useState([]);
  const [allFilieres, setAllFilieres] = useState([]); // Toutes les filières chargées une fois
  const [filieresLoading, setFilieresLoading] = useState(false);

  // Invitations / notifications
  const [invites, setInvites] = useState([]);
  const [invite, setInvite] = useState({ name: "", email: "" });
  const [selectedNotifyOrgIds, setSelectedNotifyOrgIds] = useState([]);

  // Draft
  const [savingDraft, setSavingDraft] = useState(false);

  // Prix dynamique
  const [price, setPrice] = useState({ amount: 49, currency: DEFAULT_CURRENCY }); // fallback
  const priceLabel = useMemo(
    () => `${Number(price.amount || 0).toFixed(2)} ${String(price.currency || DEFAULT_CURRENCY).toUpperCase()}`,
    [price],
  );

  /** ------- DRAFT ------- */
  const saveDraft = useCallback(() => {
    try {
      setSavingDraft(true);
      const rawValues = form.getFieldsValue(true);
      const values = serializeFormValues(rawValues);
      const draft = {
        values,
        current,
        invites,
        selectedNotifyOrgIds,
        // Sauvegarder les infos de paiement seulement si elles existent
        // mais elles seront réinitialisées après création de demande
        paymentMethod: paymentMethod || null,
        paymentCompleted: paymentCompleted || false,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setSavingDraft(false);
    } catch (e) {
      console.error("Échec sauvegarde brouillon:", e);
      // Pas de message d'erreur
    }
  }, [form, current, invites, selectedNotifyOrgIds, paymentMethod, paymentCompleted]);

  const loadDraft = useCallback(() => {
    try {
      setIsLoadingDraft(true);
      const draft = localStorage.getItem(DRAFT_KEY);
      const parsed = draft ? JSON.parse(draft) : null;
      const values = { ...(parsed?.values || {}) };
      values.dob = reviveDate(values.dob);
      values.graduationDate = reviveDate(values.graduationDate);
      
      // Si pas de date de naissance dans le brouillon, utiliser celle de l'utilisateur connecté
      if (!values.dob && me && (me.dateOfBirth || me.birthDate)) {
        const userDob = me.dateOfBirth || me.birthDate;
        if (userDob) {
          const dobValue = reviveDate(userDob);
          if (dobValue) {
            values.dob = dobValue;
          }
        }
      }
      
      if (!draft) {
        // Pas de brouillon, mais on peut quand même initialiser la date de naissance
        if (values.dob) {
          form.setFieldsValue({ dob: values.dob });
        }
        setIsLoadingDraft(false);
        return;
      }
      
      // Charger d'abord targetOrgId pour que les filières soient filtrées
      if (values.targetOrgId) {
        form.setFieldsValue({ targetOrgId: values.targetOrgId });
        // Attendre que toutes les filières soient chargées avant de définir intendedMajor
        let checkCount = 0;
        const maxChecks = 30; // Maximum 3 secondes (30 * 100ms)
        const checkFilieresLoaded = setInterval(() => {
          checkCount++;
          if (allFilieres.length > 0 || !filieresLoading || checkCount >= maxChecks) {
            clearInterval(checkFilieresLoaded);
            form.setFieldsValue(values);
            setCurrent(parsed.current ?? 0);
            setInvites(parsed.invites ?? []);
            setSelectedNotifyOrgIds(parsed.selectedNotifyOrgIds ?? []);
            setPaymentMethod(parsed.paymentMethod ?? null);
            setPaymentCompleted(parsed.paymentCompleted ?? false);
            setIsLoadingDraft(false);
            // Pas de message de succès
          }
        }, 100);
      } else {
        form.setFieldsValue(values);
        setCurrent(parsed.current ?? 0);
        setInvites(parsed.invites ?? []);
        setSelectedNotifyOrgIds(parsed.selectedNotifyOrgIds ?? []);
        setPaymentMethod(parsed.paymentMethod ?? null);
        setPaymentCompleted(parsed.paymentCompleted ?? false);
        setIsLoadingDraft(false);
        // Pas de message de succès
      }
    } catch (e) {
      console.error("Échec chargement brouillon:", e);
      setIsLoadingDraft(false);
    }
  }, [form, t, allFilieres, filieresLoading, me]);

  const resetDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      // Pas de message
    } catch (e) {
      console.error("Échec réinitialisation brouillon:", e);
      // Pas de message d'erreur
    }
  };

  /** Reset form completely (dev mode only) */
  const resetForm = () => {
    try {
      // Réinitialiser le formulaire
      form.resetFields();
      // Réinitialiser l'état
      setCurrent(0);
      setInvites([]);
      setSelectedNotifyOrgIds([]);
      setPaymentMethod(null);
      setPaymentCompleted(false);
      setLastPaymentMeta(null);
      setClientSecret("");
      // Supprimer le brouillon
      resetDraft();
      // Réinitialiser la date de naissance avec celle de l'utilisateur
      if (me && (me.dateOfBirth || me.birthDate)) {
        const userDob = me.dateOfBirth || me.birthDate;
        if (userDob) {
          const dobValue = reviveDate(userDob);
          if (dobValue) {
            form.setFieldsValue({ dob: dobValue });
          }
        }
      }
      console.log("Formulaire réinitialisé");
    } catch (e) {
      console.error("Erreur lors de la réinitialisation:", e);
    }
  };

  // Suppression de l'auto-save automatique - l'utilisateur enregistrera manuellement

  /** Load draft on mount */
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  /** Initialize date of birth from user profile if not already set */
  useEffect(() => {
    if (me && (me.dateOfBirth || me.birthDate)) {
      const currentDob = form.getFieldValue("dob");
      // Si le champ n'a pas encore de valeur, initialiser avec la date de l'utilisateur
      if (!currentDob) {
        const userDob = me.dateOfBirth || me.birthDate;
        if (userDob) {
          const dobValue = reviveDate(userDob);
          if (dobValue) {
            form.setFieldsValue({ dob: dobValue });
          }
        }
      }
    }
  }, [me, form]);

  /** Load organizations */
  useEffect(() => {
    (async () => {
      try {
        const res = await organizationService.list({ limit: 500 });
        const all = res?.organizations ?? res?.data?.organizations ?? [];
        setOrgs(all.filter((o) => o.type !== "TRADUCTEUR"));
        setTradOrgs(all.filter((o) => o.type === "TRADUCTEUR"));
      } catch {
        message.error(t("demandeurDemandeCreate.messages.orgLoadError"));
      }
    })();
  }, [t]);

  /** Prix dynamique */
  useEffect(() => {
    (async () => {
      try {
        const res = await paymentService.getPriceDemandeDemandeur();
        console.log("PRICE:", res);
        const amt = Number(res?.amount);
        const cur = String(res?.currency || DEFAULT_CURRENCY).toUpperCase();
        if (!amt || amt <= 0) {
          message.error(t("demandeurDemandeCreate.messages.priceInvalid"));
        } else {
          setPrice({ amount: amt, currency: cur });
        }
      } catch (e) {
        console.error(e);
        // message.error("Impossible de récupérer le prix de l’abonnement. Utilisation du fallback local.");
      }
    })();
  }, [t]);

  /** Load all filieres once on mount */
  useEffect(() => {
    const loadAllFilieres = async () => {
      setFilieresLoading(true);
      try {
        const res = await filiereService.list({
          page: 1,
          limit: 10000, // Charger toutes les filières en une fois
          withDepartment: true, // Pour avoir les infos d'organisation
        });
        const list = res?.filieres || res?.data?.filieres || [];
        setAllFilieres(list);
      } catch {
        setAllFilieres([]);
        message.error(t("demandeurDemandeCreate.messages.filieresLoadError"));
      } finally {
        setFilieresLoading(false);
      }
    };
    loadAllFilieres();
  }, [t]);

  /** Filter filieres by target org (client-side) */
  const targetOrgId = Form.useWatch("targetOrgId", form);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [previousTargetOrgId, setPreviousTargetOrgId] = useState(null);
  
  // Filtrer les filières côté client selon targetOrgId
  const filieres = useMemo(() => {
    if (!targetOrgId) return [];
    return allFilieres.filter((f) => {
      // Vérifier différents chemins possibles pour l'organisation
      const orgId = f?.department?.organization?.id || 
                    f?.department?.organizationId || 
                    f?.organizationId ||
                    f?.organization?.id;
      return orgId === targetOrgId;
    });
  }, [allFilieres, targetOrgId]);

  // Ne réinitialiser intendedMajor que si l'organisation a vraiment changé (pas lors du chargement initial ou du brouillon)
  useEffect(() => {
    if (previousTargetOrgId !== null && previousTargetOrgId !== targetOrgId && !isLoadingDraft) {
      form.setFieldsValue({ intendedMajor: undefined });
    }
    setPreviousTargetOrgId(targetOrgId);
  }, [targetOrgId, form, isLoadingDraft, previousTargetOrgId]);

  /** ------- STRIPE INIT ------- */
  useEffect(() => {
    (async () => {
      try {
        const response = await paymentService.getPublishableKey(); // { publishable_key }
        const publishableKey = response?.publishable_key;
        if (!publishableKey) throw new Error("Clé publique Stripe manquante");
        const stripe = await loadStripe(publishableKey);
        setStripePromise(stripe);
      } catch (error) {
        console.error("Erreur configuration Stripe:", error);
        message.error(t("demandeurDemandeCreate.messages.stripeInitError"));
      }
    })();
  }, [t]);

  /** ------- CHOIX PAIEMENT ------- */
  const handlePaymentSelection = async (method) => {
    setPaymentMethod(method);
    setShowPaymentModal(true);

    if (method === "stripe") {
      // Créer/renouveler un PaymentIntent à la demande
      try {
        setInitializingStripe(true);
        const amountCents = Math.round(Number(price.amount || 0) * 100);
        if (!me?.id || amountCents <= 0) throw new Error("Paramètres Stripe invalides");
        const resp = await paymentService.createPaymentIntentDemandeur({
          demandeurId: me.id,
          amount: amountCents, // en cents
          currency: String(price.currency || DEFAULT_CURRENCY),
        });
        const cs = resp?.clientSecret || resp?.client_secret;
        if (!cs?.includes("_secret_")) throw new Error(t("demandeurDemandeCreate.messages.stripeSecretInvalid"));
        setClientSecret(cs);
      } catch (e) {
        console.error(e);
        message.error(e?.message || t("demandeurDemandeCreate.messages.paymentIntentError"));
      } finally {
        setInitializingStripe(false);
      }
    }
  };

  const handlePayment = async (method, paymentData) => {
    try {
      if (method === "stripe") {
        const status = paymentData?.status || "succeeded";
        const providerRef = paymentData?.id || paymentData?.payment_intent || "unknown";
        setLastPaymentMeta({
          provider: "stripe",
          providerRef,
          status,
          amount: Number(price.amount),
          currency: String(price.currency || DEFAULT_CURRENCY),
          paymentType: "card",
          paymentInfo: paymentData || null,
        });
        setPaymentCompleted(true);
        setShowPaymentModal(false);
        // Sauvegarder l'état après le paiement
        setTimeout(() => saveDraft(), 100);
        // Pas de message de succès
        return;
      }

      if (method === "paypal") {
        const status = paymentData?.status || "COMPLETED";
        const providerRef = paymentData?.id || "unknown";
        const capturedAmt =
          paymentData?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ??
          paymentData?.purchase_units?.[0]?.amount?.value ??
          price.amount;

        const capturedCur =
          paymentData?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code ??
          paymentData?.purchase_units?.[0]?.amount?.currency_code ??
          price.currency;

        setLastPaymentMeta({
          provider: "paypal",
          providerRef,
          status,
          amount: Number(capturedAmt || price.amount),
          currency: String(capturedCur || price.currency || DEFAULT_CURRENCY),
          paymentType: "paypal",
          paymentInfo: paymentData || null,
        });
        setPaymentCompleted(true);
        setShowPaymentModal(false);
        // Sauvegarder l'état après le paiement
        setTimeout(() => saveDraft(), 100);
        // Pas de message de succès
        return;
      }
    } catch (error) {
      console.error("Erreur paiement:", error);
      message.error(t("demandeurDemandeCreate.messages.paymentError", { error: error.message }));
    }
  };

  /** ------- Étapes ------- */
  const PERIODES = useMemo(
    () => [
      { value: "FALL", label: t("demandeurDemandeCreate.options.periods.FALL") },
      { value: "WINTER", label: t("demandeurDemandeCreate.options.periods.WINTER") },
      { value: "SPRING", label: t("demandeurDemandeCreate.options.periods.SPRING") },
      { value: "SUMMER", label: t("demandeurDemandeCreate.options.periods.SUMMER") },
    ],
    [t]
  );

  const YEAR_OPTIONS = useMemo(() => {
    const start = dayjs().year();
    return Array.from({ length: 11 }, (_, i) => {
      const y = String(start + i);
      return { value: y, label: y };
    });
  }, []);

  const YEAR_OPTIONS_PAST = useMemo(() => {
    const currentYear = dayjs().year();
    return Array.from({ length: 31 }, (_, i) => {
      const y = String(currentYear - i);
      return { value: y, label: y };
    });
  }, []);

  const steps = [
    { title: t("demandeurDemandeCreate.steps.identity"), icon: <BankOutlined /> },
    { title: t("demandeurDemandeCreate.steps.academic"), icon: <BookOutlined /> },
    { title: t("demandeurDemandeCreate.steps.target"), icon: <FileTextOutlined /> },
    { title: t("demandeurDemandeCreate.steps.program"), icon: <FileTextOutlined /> },
    { title: t("demandeurDemandeCreate.steps.essays"), icon: <FileTextOutlined /> },
    { title: t("demandeurDemandeCreate.steps.invitations"), icon: <TeamOutlined /> },
    { title: t("demandeurDemandeCreate.steps.payment"), icon: <CreditCardOutlined /> },
  ];

  const next = async () => {
    if (current === 2) await form.validateFields(["targetOrgId"]);
    setCurrent((c) => c + 1);
  };
  const prev = () => setCurrent((c) => c - 1);

  /** ------- Submit ------- */
  const onFinish = async (values) => {
    if (!paymentCompleted) {
      message.warning(t("demandeurDemandeCreate.messages.paymentRequired"));
      return;
    }
    try {
      setLoading(true);
      setIsSubmitting(true);

      const englishProficiencyTests = Array.isArray(values.englishProficiencyTests)
        ? values.englishProficiencyTests
        : values.englishProficiencyTests || null;
      const examsTaken = Array.isArray(values.examsTaken) ? values.examsTaken : values.examsTaken || null;

      let intendedMajorText = values.intendedMajor;
      if (typeof intendedMajorText === "object" && intendedMajorText?.label) intendedMajorText = intendedMajorText.label;

      const payload = {
        targetOrgId: values.targetOrgId,
        assignedOrgId: values.assignedOrgId || null,
        userId: me?.id,
        notifyOrgIds: selectedNotifyOrgIds,

        // Programme
        periode: nullIfEmpty(values.periode),
        year: nullIfEmpty(values.year),

        // Identité & académique
        observation: nullIfEmpty(values.observation),
        serie: nullIfEmpty(values.serie),
        niveau: nullIfEmpty(values.niveau),
        mention: nullIfEmpty(values.mention),
        annee: nullIfEmpty(values.annee),
        countryOfSchool: nullIfEmpty(values.countryOfSchool),
        secondarySchoolName: nullIfEmpty(values.secondarySchoolName),
        graduationDate: toISO(values.graduationDate),
        dob: toISO(values.dob),
        citizenship: nullIfEmpty(values.citizenship),
        passport: nullIfEmpty(values.passport),

        // Langue & examens
        isEnglishFirstLanguage: !!values.isEnglishFirstLanguage,
        englishProficiencyTests,
        testScores: nullIfEmpty(values.testScores),
        gradingScale: nullIfEmpty(values.gradingScale),
        gpa: nullIfEmpty(values.gpa),
        examsTaken,

        // Filière
        intendedMajor: nullIfEmpty(intendedMajorText),

        // Divers
        extracurricularActivities: nullIfEmpty(values.extracurricularActivities),
        honorsOrAwards: nullIfEmpty(values.honorsOrAwards),
        parentGuardianName: nullIfEmpty(values.parentGuardianName),
        occupation: nullIfEmpty(values.occupation),
        educationLevel: nullIfEmpty(values.educationLevel),
        willApplyForFinancialAid: !!values.willApplyForFinancialAid,
        hasExternalSponsorship: !!values.hasExternalSponsorship,
        visaType: nullIfEmpty(values.visaType),
        hasPreviouslyStudiedInUS: !!values.hasPreviouslyStudiedInUS,
        personalStatement: nullIfEmpty(values.personalStatement),
        optionalEssay: nullIfEmpty(values.optionalEssay),
        applicationRound: nullIfEmpty(values.applicationRound),
        howDidYouHearAboutUs: nullIfEmpty(values.howDidYouHearAboutUs),

        // Invitations
        invitedOrganizations: invites,

        // Paiement
        paymentMethod,
        paymentCompleted,
        pricePaid: Number(price.amount),
        currency: String(price.currency || DEFAULT_CURRENCY),
      };

      const created = await demandeService.create(payload);
      const d = created?.demande || created;
      const data = {
        demandePartageId: d.id,
        provider: lastPaymentMeta.provider,
        providerRef: lastPaymentMeta.providerRef,
        status:
          lastPaymentMeta.provider === "stripe"
            ? (lastPaymentMeta.status || "succeeded").toUpperCase()
            : (lastPaymentMeta.status || "COMPLETED").toUpperCase(),
        amount: Number(lastPaymentMeta.amount || price.amount),
        currency: String(lastPaymentMeta.currency || price.currency || DEFAULT_CURRENCY),
        paymentType: lastPaymentMeta.paymentType,   // "card" | "paypal"
        paymentInfo: lastPaymentMeta.paymentInfo || null,
      };
      console.log(data);
      await paymentService.create({
        demandePartageId: d.id,
        provider: lastPaymentMeta.provider,
        providerRef: lastPaymentMeta.providerRef,
        status:
          lastPaymentMeta.provider === "stripe"
            ? (lastPaymentMeta.status || "succeeded").toUpperCase()
            : (lastPaymentMeta.status || "COMPLETED").toUpperCase(),
        amount: Number(lastPaymentMeta.amount || price.amount),
        currency: String(lastPaymentMeta.currency || price.currency || DEFAULT_CURRENCY),
        paymentType: lastPaymentMeta.paymentType,   // "card" | "paypal"
        paymentInfo: lastPaymentMeta.paymentInfo || null,
      });

      // Pas de message de succès
      
      // Sauvegarder tous les champs du formulaire dans le localStorage (sauf paiement)
      try {
        const rawValues = form.getFieldsValue(true);
        const values = serializeFormValues(rawValues);
        
        // Créer un nouveau brouillon avec tous les champs sauf ceux liés au paiement
        const draft = {
          values,
          current: 0, // Réinitialiser à l'étape 0 pour une nouvelle demande
          invites,
          selectedNotifyOrgIds,
          // Ne pas sauvegarder paymentMethod et paymentCompleted
          paymentMethod: null,
          paymentCompleted: false,
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        
        // Réinitialiser les états de paiement dans le composant
        setPaymentMethod(null);
        setPaymentCompleted(false);
        setLastPaymentMeta(null);
        setClientSecret("");
      } catch (e) {
        console.error("Échec sauvegarde brouillon après création:", e);
      }
      
      navigate(`/demandeur/mes-demandes/${d.id}/details`);
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.message || t("demandeurDemandeCreate.messages.creationError"));
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  /** ------- UI ------- */
  return (
    <PayPalScriptProvider options={getPayPalConfig()}>
      <div className="container-fluid relative px-3" style={{ background: "#f9f9f9", minHeight: "100vh", paddingTop: 20, paddingBottom: 48 }}>
        <div className="layout-specing" style={{ maxWidth: 800, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "Arial, sans-serif", fontSize: 28, fontWeight: "normal", color: "#333", marginBottom: 20 }}>
            {t("demandeurDemandeCreate.pageTitle")}
          </h1>

          <Card style={{ marginBottom: 20, borderRadius: 0, boxShadow: "0 0 10px rgba(0,0,0,0.05)", background: "white", border: "none" }}>
            <Steps
              current={current}
              onChange={(step) => setCurrent(step)}
              items={steps.map((step, idx) => ({
                title: step.title,
                icon: current > idx ? <CheckCircleOutlined /> : step.icon,
                status: current > idx ? "finish" : current === idx ? "process" : "wait",
              }))}
              style={{ padding: "12px 0" }}
            />
          </Card>

          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: 16 }}>
                  {steps[current].icon}
                </div>
                <div>
                  <div style={{ fontFamily: "Arial, sans-serif", fontSize: 18, fontWeight: 600, color: "#333" }}>{steps[current].title}</div>
                  <div style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#666", fontWeight: 400 }}>
                    {t("demandeurDemandeCreate.stepCounter", { current: current + 1, total: steps.length })}
                  </div>
                </div>
              </div>
            }
            style={{ borderRadius: 0, boxShadow: "0 0 10px rgba(0,0,0,0.05)", overflow: "hidden", background: "white", border: "none" }}
          >
            <style>{`
              .ant-form-item-label > label {
                height: auto !important;
                min-height: 22px;
                line-height: 1.5;
                display: block;
                width: 100%;
              }
              .ant-form-item {
                margin-bottom: 24px;
              }
              .ant-form-item-label {
                padding-bottom: 4px;
              }
              .ant-input,
              .ant-select-selector,
              .ant-picker {
                width: 100% !important;
              }
              .ant-col {
                display: flex;
                flex-direction: column;
              }
            `}</style>
            <Form 
              form={form} 
              layout="vertical" 
              preserve 
              onFinish={onFinish}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              {/* STEP 0 - Identité */}
              <div style={{ display: current === 0 ? "block" : "none" }}>
                <h2 style={{ fontFamily: "Arial, sans-serif", fontSize: 18, fontWeight: 600, color: "#333", borderBottom: "2px solid #ccc", paddingBottom: 5, marginTop: 30, marginBottom: 20 }}>
                  {t("demandeurDemandeCreate.sections.personalInfo")}
                </h2>
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label={
                        <span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>
                          <RequiredLabel>{t("demandeurDemandeCreate.fields.dateOfBirth")}</RequiredLabel>
                        </span>
                      }
                      name="dob"
                      rules={[{ required: true, message: t("common.required") }]}
                      getValueProps={(v) => ({ value: reviveDate(v) })}
                    >
                      <DatePicker className="w-full" size="large" allowClear />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label={
                        <span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>
                          <RequiredLabel>{t("demandeurDemandeCreate.fields.countryOfCitizenship")}</RequiredLabel>
                        </span>
                      }
                      name="citizenship"
                      rules={[{ required: true, message: t("common.required") }]}
                    >
                      <Select
                        allowClear
                        showSearch
                        size="large"
                        placeholder={t("demandeurDemandeCreate.placeholders.selectCountry")}
                        options={(countries || []).map((f) => ({ value: f.name, label: f.name }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label={
                        <span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>
                          <RequiredLabel>{t("demandeurDemandeCreate.fields.passportNumber")}</RequiredLabel>
                        </span>
                      }
                      name="passport"
                      rules={[{ required: true, message: t("common.required") }]}
                    >
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* STEP 1 - Académique */}
              <div style={{ display: current === 1 ? "block" : "none" }}>
                <h2 style={{ fontFamily: "Arial, sans-serif", fontSize: 18, fontWeight: 600, color: "#333", borderBottom: "2px solid #ccc", paddingBottom: 5, marginBottom: 20 }}>
                  {t("demandeurDemandeCreate.sections.englishProficiency")}
                </h2>
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label={<span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>{t("demandeurDemandeCreate.fields.isEnglishFirstLanguage")}</span>}
                      name="isEnglishFirstLanguage"
                    >
                      <Select
                        allowClear
                        size="large"
                        placeholder={t("demandeurDemandeCreate.placeholders.selectLevel")}
                        options={[
                          { value: true, label: t("demandeurDemandeCreate.fields.yes") },
                          { value: false, label: t("common.no") || "Non" }
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label={<span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>{t("demandeurDemandeCreate.fields.englishProficiencyTest")}</span>}
                      name="englishProficiencyTests"
                    >
                      <Select
                        mode="multiple"
                        size="large"
                        placeholder={t("demandeurDemandeCreate.placeholders.selectTests")}
                        options={[
                          { value: "TOEFL", label: t("demandeurDemandeCreate.options.englishTests.TOEFL") },
                          { value: "IELTS", label: t("demandeurDemandeCreate.options.englishTests.IELTS") },
                          { value: "Duolingo English Test", label: t("demandeurDemandeCreate.options.englishTests.Duolingo English Test") },
                          { value: "PTE Academic", label: t("demandeurDemandeCreate.options.englishTests.PTE Academic") },
                          { value: "None", label: t("demandeurDemandeCreate.options.englishTests.None") },
                        ]}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label={<span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>{t("demandeurDemandeCreate.fields.testScores")}</span>}
                      name="testScores"
                    >
                      <Input.TextArea rows={3} />
                    </Form.Item>
                  </Col>
                </Row>

                <h2 style={{ fontFamily: "Arial, sans-serif", fontSize: 18, fontWeight: 600, color: "#333", borderBottom: "2px solid #ccc", paddingBottom: 5, marginTop: 30, marginBottom: 20 }}>
                  {t("demandeurDemandeCreate.sections.academicBackground")}
                </h2>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>
                          <RequiredLabel>{t("demandeurDemandeCreate.fields.secondarySchoolName")}</RequiredLabel>
                        </span>
                      }
                      name="secondarySchoolName"
                      rules={[{ required: true, message: t("common.required") }]}
                    >
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>
                          <RequiredLabel>{t("demandeurDemandeCreate.fields.countryOfSchool")}</RequiredLabel>
                        </span>
                      }
                      name="countryOfSchool"
                      rules={[{ required: true, message: t("common.required") }]}
                    >
                      <Select
                        allowClear
                        showSearch
                        size="large"
                        placeholder={t("demandeurDemandeCreate.placeholders.selectCountry")}
                        options={(countries || []).map((f) => ({ value: f.name, label: f.name }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label={
                        <span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>
                          <RequiredLabel>{t("demandeurDemandeCreate.fields.graduationDate")}</RequiredLabel>
                        </span>
                      }
                      name="graduationDate"
                      rules={[{ required: true, message: t("common.required") }]}
                      getValueProps={(v) => ({ value: reviveDate(v) })}
                    >
                      <DatePicker className="w-full" size="large" allowClear />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label={
                        <span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>
                          <RequiredLabel>{t("demandeurDemandeCreate.fields.gradingScale")}</RequiredLabel>
                        </span>
                      }
                      name="gradingScale"
                      rules={[{ required: true, message: t("common.required") }]}
                    >
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label={
                        <span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>
                          <RequiredLabel>{t("demandeurDemandeCreate.fields.gpa")}</RequiredLabel>
                        </span>
                      }
                      name="gpa"
                      rules={[{ required: true, message: t("common.required") }]}
                    >
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={<span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>{t("demandeurDemandeCreate.fields.examsTaken")}</span>}
                      name="examsTaken"
                    >
                      <Select
                        mode="multiple"
                        size="large"
                        placeholder={t("demandeurDemandeCreate.placeholders.selectExams")}
                        options={[
                          { value: "A-Levels", label: t("demandeurDemandeCreate.options.exams.A-Levels") },
                          { value: "IB Diploma", label: t("demandeurDemandeCreate.options.exams.IB Diploma") },
                          { value: "WAEC/NECO", label: t("demandeurDemandeCreate.options.exams.WAEC/NECO") },
                          { value: "French Baccalauréat", label: t("demandeurDemandeCreate.options.exams.French Baccalauréat") },
                          { value: "National Exams", label: t("demandeurDemandeCreate.options.exams.National Exams") },
                        ]}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* STEP 2 - Cible */}
              <div style={{ display: current === 2 ? "block" : "none" }}>
                <h2 style={{ fontFamily: "Arial, sans-serif", fontSize: 18, fontWeight: 600, color: "#333", borderBottom: "2px solid #ccc", paddingBottom: 5, marginBottom: 20 }}>
                  {t("demandeurDemandeCreate.sections.target") || "Cible"}
                </h2>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>
                          <RequiredLabel>{t("demandeurDemandeCreate.fields.targetOrg")}</RequiredLabel>
                        </span>
                      }
                      name="targetOrgId"
                      rules={[{ required: true, message: t("demandeurDemandeCreate.messages.required") }]}
                    >
                      <Select
                        showSearch
                        size="large"
                        placeholder={t("demandeurDemandeCreate.placeholders.chooseOrganization")}
                        options={orgs.map((o) => ({ value: o.id, label: `${o.name} — ${o.type}` }))}
                        onChange={(value) => {
                          // Ne réinitialiser intendedMajor que si on change vraiment d'organisation
                          const currentTargetOrgId = form.getFieldValue("targetOrgId");
                          if (currentTargetOrgId && currentTargetOrgId !== value) {
                            form.setFieldsValue({ intendedMajor: undefined });
                          }
                        }}
                        style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={<span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>{t("demandeurDemandeCreate.fields.translationOrg")}</span>}
                      name="assignedOrgId"
                    >
                      <Select
                        allowClear
                        showSearch
                        size="large"
                        placeholder={t("demandeurDemandeCreate.placeholders.chooseOrganization")}
                        options={tradOrgs.map((o) => ({ value: o.id, label: `${o.name} — TRADUCTEUR` }))}
                        style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* STEP 3 - Programme souhaité */}
              <div style={{ display: current === 3 ? "block" : "none" }}>
                <h2 style={{ fontFamily: "Arial, sans-serif", fontSize: 18, fontWeight: 600, color: "#333", borderBottom: "2px solid #ccc", paddingBottom: 5, marginBottom: 20 }}>
                  {t("demandeurDemandeCreate.sections.intendedProgram")}
                </h2>
                <Row gutter={16}>
                  <Col xs={24}>
                    <Form.Item
                      label={
                        <span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>
                          <RequiredLabel>{t("demandeurDemandeCreate.fields.intendedMajor")}</RequiredLabel>
                        </span>
                      }
                      name="intendedMajor"
                      rules={[{ required: true, message: t("demandeurDemandeCreate.messages.required") }]}
                    >
                      <Select
                        allowClear
                        showSearch
                        size="large"
                        placeholder={targetOrgId ? t("demandeurDemandeCreate.placeholders.selectMajor") : t("demandeurDemandeCreate.placeholders.chooseOrgFirst")}
                        loading={filieresLoading}
                        disabled={!targetOrgId}
                        options={(filieres || []).map((f) => ({ value: f.name, label: f.name }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>
                          <RequiredLabel>{t("demandeurDemandeCreate.fields.preferredStartTerm")}</RequiredLabel>
                        </span>
                      }
                      name="periode"
                      rules={[{ required: true, message: t("common.required") }]}
                    >
                      <Select allowClear size="large" placeholder={t("demandeurDemandeCreate.placeholders.selectTerm")} options={PERIODES} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>
                          <RequiredLabel>{t("demandeurDemandeCreate.fields.year")}</RequiredLabel>
                        </span>
                      }
                      name="year"
                      rules={[{ required: true, message: t("common.required") }]}
                    >
                      <Select allowClear size="large" placeholder={t("demandeurDemandeCreate.placeholders.selectYear")} options={YEAR_OPTIONS} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>


              {/* STEP 4 - Activités, famille, finances, visa, essais, soumission */}
              <div style={{ display: current === 4 ? "block" : "none" }}>
                <h2 style={{ fontFamily: "Arial, sans-serif", fontSize: 18, fontWeight: 600, color: "#333", borderBottom: "2px solid #ccc", paddingBottom: 5, marginBottom: 20 }}>
                  {t("demandeurDemandeCreate.sections.activities")}
                </h2>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={<span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>{t("demandeurDemandeCreate.fields.extracurricularActivities")}</span>}
                      name="extracurricularActivities"
                    >
                      <Input.TextArea rows={4} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={<span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>{t("demandeurDemandeCreate.fields.honorsOrAwards")}</span>}
                      name="honorsOrAwards"
                    >
                      <Input.TextArea rows={4} />
                    </Form.Item>
                  </Col>
                </Row>

                <h2 style={{ fontFamily: "Arial, sans-serif", fontSize: 18, fontWeight: 600, color: "#333", borderBottom: "2px solid #ccc", paddingBottom: 5, marginTop: 30, marginBottom: 20 }}>
                  {t("demandeurDemandeCreate.sections.familyInfo")}
                </h2>
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label={
                        <span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>
                          <RequiredLabel>{t("demandeurDemandeCreate.fields.parentGuardianName")}</RequiredLabel>
                        </span>
                      }
                      name="parentGuardianName"
                      rules={[{ required: true, message: t("common.required") }]}
                    >
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label={
                        <span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>
                          <RequiredLabel>{t("demandeurDemandeCreate.fields.occupation")}</RequiredLabel>
                        </span>
                      }
                      name="occupation"
                      rules={[{ required: true, message: t("common.required") }]}
                    >
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label={
                        <span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>
                          <RequiredLabel>{t("demandeurDemandeCreate.fields.educationLevel")}</RequiredLabel>
                        </span>
                      }
                      name="educationLevel"
                      rules={[{ required: true, message: t("common.required") }]}
                    >
                      <Select
                        allowClear
                        size="large"
                        placeholder={t("demandeurDemandeCreate.placeholders.selectLevel")}
                        options={[
                          { value: "No formal education", label: t("demandeurDemandeCreate.options.educationLevels.No formal education") },
                          { value: "Secondary", label: t("demandeurDemandeCreate.options.educationLevels.Secondary") },
                          { value: "Bachelor's", label: t("demandeurDemandeCreate.options.educationLevels.Bachelor's") },
                          { value: "Graduate", label: t("demandeurDemandeCreate.options.educationLevels.Graduate") },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <h2 style={{ fontFamily: "Arial, sans-serif", fontSize: 18, fontWeight: 600, color: "#333", borderBottom: "2px solid #ccc", paddingBottom: 5, marginTop: 30, marginBottom: 20 }}>
                  {t("demandeurDemandeCreate.sections.financialInfo")}
                </h2>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={<span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>{t("demandeurDemandeCreate.fields.willApplyForFinancialAid")}</span>}
                      name="willApplyForFinancialAid"
                    >
                      <Select
                        allowClear
                        size="large"
                        placeholder={t("demandeurDemandeCreate.placeholders.selectLevel")}
                        options={[
                          { value: true, label: t("demandeurDemandeCreate.fields.yes") },
                          { value: false, label: t("common.no") || "Non" }
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={<span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>{t("demandeurDemandeCreate.fields.hasExternalSponsorship")}</span>}
                      name="hasExternalSponsorship"
                    >
                      <Select
                        allowClear
                        size="large"
                        placeholder={t("demandeurDemandeCreate.placeholders.selectLevel")}
                        options={[
                          { value: true, label: t("demandeurDemandeCreate.fields.yes") },
                          { value: false, label: t("common.no") || "Non" }
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <h2 style={{ fontFamily: "Arial, sans-serif", fontSize: 18, fontWeight: 600, color: "#333", borderBottom: "2px solid #ccc", paddingBottom: 5, marginTop: 30, marginBottom: 20 }}>
                  {t("demandeurDemandeCreate.sections.visaInfo")}
                </h2>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={<span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>{t("demandeurDemandeCreate.fields.visaType")}</span>}
                      name="visaType"
                    >
                      <Select
                        allowClear
                        size="large"
                        placeholder={t("demandeurDemandeCreate.placeholders.selectVisaType")}
                        options={[
                          { value: "None", label: t("demandeurDemandeCreate.options.visaTypes.None") },
                          { value: "F-1 Student Visa", label: t("demandeurDemandeCreate.options.visaTypes.F-1 Student Visa") },
                          { value: "J-1 Exchange", label: t("demandeurDemandeCreate.options.visaTypes.J-1 Exchange") },
                          { value: "Other", label: t("demandeurDemandeCreate.options.visaTypes.Other") },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={<span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>{t("demandeurDemandeCreate.fields.hasPreviouslyStudiedInUS")}</span>}
                      name="hasPreviouslyStudiedInUS"
                    >
                      <Select
                        allowClear
                        size="large"
                        placeholder={t("demandeurDemandeCreate.placeholders.selectLevel")}
                        options={[
                          { value: true, label: t("demandeurDemandeCreate.fields.yes") },
                          { value: false, label: t("common.no") || "Non" }
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <h2 style={{ fontFamily: "Arial, sans-serif", fontSize: 18, fontWeight: 600, color: "#333", borderBottom: "2px solid #ccc", paddingBottom: 5, marginTop: 30, marginBottom: 20 }}>
                  {t("demandeurDemandeCreate.sections.essays")}
                </h2>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={<span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>{t("demandeurDemandeCreate.fields.personalStatement")}</span>}
                      name="personalStatement"
                    >
                      <Input.TextArea rows={6} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={<span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>{t("demandeurDemandeCreate.fields.optionalEssay")}</span>}
                      name="optionalEssay"
                    >
                      <Input.TextArea rows={6} />
                    </Form.Item>
                  </Col>
                </Row>

                <h2 style={{ fontFamily: "Arial, sans-serif", fontSize: 18, fontWeight: 600, color: "#333", borderBottom: "2px solid #ccc", paddingBottom: 5, marginTop: 30, marginBottom: 20 }}>
                  {t("demandeurDemandeCreate.sections.submission")}
                </h2>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={<span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>{t("demandeurDemandeCreate.fields.applicationRound")}</span>}
                      name="applicationRound"
                    >
                      <Select
                        allowClear
                        size="large"
                        placeholder={t("demandeurDemandeCreate.placeholders.selectRound")}
                        options={[
                          { value: "Regular Decision", label: t("demandeurDemandeCreate.options.applicationRounds.Regular Decision") },
                          { value: "Early Action", label: t("demandeurDemandeCreate.options.applicationRounds.Early Action") },
                          { value: "Early Decision", label: t("demandeurDemandeCreate.options.applicationRounds.Early Decision") },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={<span style={{ fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>{t("demandeurDemandeCreate.fields.howDidYouHearAboutUs")}</span>}
                      name="howDidYouHearAboutUs"
                    >
                      <Select
                        allowClear
                        size="large"
                        placeholder={t("demandeurDemandeCreate.placeholders.selectResult")}
                        options={[
                          { value: "FACEBOOK", label: t("demandeurDemandeCreate.options.howDidYouHear.FACEBOOK") },
                          { value: "TWITTER", label: t("demandeurDemandeCreate.options.howDidYouHear.TWITTER") },
                          { value: "INSTAGRAM", label: t("demandeurDemandeCreate.options.howDidYouHear.INSTAGRAM") },
                          { value: "LINKEDIN", label: t("demandeurDemandeCreate.options.howDidYouHear.LINKEDIN") },
                          { value: "AUTRE", label: t("demandeurDemandeCreate.options.howDidYouHear.AUTRE") },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* STEP 5 — Invitations + Summary */}
              <div style={{ display: current === 5 ? "block" : "none" }}>
                <h2 style={{ fontFamily: "Arial, sans-serif", fontSize: 18, fontWeight: 600, color: "#333", borderBottom: "2px solid #ccc", paddingBottom: 5, marginBottom: 20 }}>
                  {t("demandeurDemandeCreate.sections.inviteOrgs")}
                </h2>
                <Card style={{ background: "#fafafa", marginBottom: 16, border: "1px solid #e0e0e0" }}>
                  <Row gutter={12} className="mb-2">
                    <Col xs={24} md={12}>
                      <Input
                        placeholder={t("demandeurDemandeCreate.placeholders.name")}
                        size="large"
                        value={invite.name}
                        onChange={(e) => setInvite((s) => ({ ...s, name: e.target.value }))}
                      />
                    </Col>
                    <Col xs={24} md={12}>
                      <Input
                        placeholder={t("demandeurDemandeCreate.placeholders.email")}
                        size="large"
                        value={invite.email}
                        onChange={(e) => setInvite((s) => ({ ...s, email: e.target.value }))}
                      />
                    </Col>
                  </Row>
                  <Button
                    type="primary"
                    onClick={() => {
                      const n = String(invite.name || "").trim();
                      const e = String(invite.email || "").trim().toLowerCase();
                      if (n.length < 2) return message.warning(t("demandeurDemandeCreate.invitations.nameRequired"));
                      if (!isEmail(e)) return message.warning(t("demandeurDemandeCreate.invitations.emailInvalid"));
                      if (invites.some((x) => x.email === e)) return message.info(t("demandeurDemandeCreate.invitations.alreadyInList"));
                      const next = [...invites, { name: n, email: e }];
                      setInvites(next);
                      setInvite({ name: "", email: "" });
                    }}
                    size="large"
                  >
                    {t("demandeurDemandeCreate.buttons.add")}
                  </Button>
                </Card>

                <List
                  bordered
                  dataSource={invites}
                  locale={{ emptyText: t("demandeurDemandeCreate.invitations.noOrgsInvited") }}
                  style={{ marginBottom: 24 }}
                  renderItem={(item) => (
                    <List.Item
                      key={item.email}
                      actions={[
                        <Button
                          key="edit"
                          size="small"
                          onClick={() => {
                            setInvite({ name: item.name, email: item.email });
                            setInvites((arr) => arr.filter((i) => i.email !== item.email));
                          }}
                        >
                          {t("common.edit") || "Modifier"}
                        </Button>,
                        <Button
                          key="delete"
                          danger
                          size="small"
                          onClick={() => setInvites((arr) => arr.filter((i) => i.email !== item.email))}
                        >
                          {t("demandeurDemandeCreate.buttons.remove")}
                        </Button>,
                      ]}
                    >
                      <Space direction="vertical" size={0}>
                        <Text strong>
                          {item.name}
                        </Text>
                        <Text type="secondary">
                          {item.email}
                        </Text>
                      </Space>
                    </List.Item>
                  )}
                />

                <h2 style={{ fontFamily: "Arial, sans-serif", fontSize: 18, fontWeight: 600, color: "#333", borderBottom: "2px solid #ccc", paddingBottom: 5, marginTop: 30, marginBottom: 20 }}>
                  {t("demandeurDemandeCreate.sections.notifyOrgs")}
                </h2>
                <OrgNotifyPicker
                  orgs={orgs}
                  targetOrgId={form.getFieldValue("targetOrgId")}
                  value={selectedNotifyOrgIds}
                  onChange={(ids) => setSelectedNotifyOrgIds(ids)}
                />

                <h2 style={{ fontFamily: "Arial, sans-serif", fontSize: 18, fontWeight: 600, color: "#333", borderBottom: "2px solid #ccc", paddingBottom: 5, marginTop: 30, marginBottom: 20 }}>
                  {t("demandeurDemandeCreate.sections.summary")}
                </h2>
                <Summary form={form} invites={invites} orgs={orgs} tradOrgs={tradOrgs} t={t} me={me} />
              </div>

              {/* STEP 6 - Payment */}
              <div style={{ display: current === 6 ? "block" : "none" }}>
                <h2 style={{ fontFamily: "Arial, sans-serif", fontSize: 18, fontWeight: 600, color: "#333", borderBottom: "2px solid #ccc", paddingBottom: 5, marginBottom: 20 }}>
                  {t("demandeurDemandeCreate.sections.choosePayment")}
                </h2>

                <Card style={{ background: "#f5f5f5", color: "#333", marginBottom: 24, border: "1px solid #ccc" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ fontFamily: "Arial, sans-serif", color: "#333", margin: 0, fontSize: 18 }}>{t("demandeurDemandeCreate.payment.processingFee")}</h3>
                      <p style={{ fontFamily: "Arial, sans-serif", color: "#666", margin: "4px 0 0 0" }}>{t("demandeurDemandeCreate.payment.oneTimePayment")}</p>
                    </div>
                    <div style={{ fontFamily: "Arial, sans-serif", fontSize: 32, fontWeight: 700, color: "#333" }}>
                      {priceLabel}
                    </div>
                  </div>
                </Card>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Card
                      hoverable
                      style={{
                        border: paymentMethod === "stripe" ? "2px solid #1890ff" : "1px solid #d9d9d9",
                        borderRadius: 8,
                        cursor: "pointer",
                        transition: "all 0.3s",
                      }}
                      onClick={() => handlePaymentSelection("stripe")}
                    >
                      <div style={{ textAlign: "center", padding: "24px 0" }}>
                        <CreditCardOutlined style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }} />
                        <h3 style={{ fontFamily: "Arial, sans-serif", fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{t("demandeurDemandeCreate.payment.stripe")}</h3>
                        <p style={{ fontFamily: "Arial, sans-serif", color: "#8c8c8c", marginBottom: 12 }}>{t("demandeurDemandeCreate.payment.secureCreditCard")}</p>
                        <div style={{ display: "inline-block", padding: "4px 12px", background: "#52c41a", color: "white", borderRadius: 12, fontSize: 12, fontWeight: 500 }}>
                          {t("demandeurDemandeCreate.payment.recommended")}
                        </div>
                      </div>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card
                      hoverable
                      style={{
                        border: paymentMethod === "paypal" ? "2px solid #1890ff" : "1px solid #d9d9d9",
                        borderRadius: 8,
                        cursor: "pointer",
                        transition: "all 0.3s",
                      }}
                      onClick={() => handlePaymentSelection("paypal")}
                    >
                      <div style={{ textAlign: "center", padding: "24px 0" }}>
                        <svg style={{ width: 48, height: 48, marginBottom: 16 }} viewBox="0 0 24 24" fill="#0070BA">
                          <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.028.15a.805.805 0 0 1-.794.68H7.72a.483.483 0 0 1-.477-.558L9.22 7.08a.964.964 0 0 1 .952-.814h4.242c.94 0 1.814.078 2.592.28 1.318.34 2.29 1.098 2.817 2.218z" />
                        </svg>
                        <h3 style={{ fontFamily: "Arial, sans-serif", fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{t("demandeurDemandeCreate.payment.paypal")}</h3>
                        <p style={{ fontFamily: "Arial, sans-serif", color: "#8c8c8c", marginBottom: 12 }}>{t("demandeurDemandeCreate.payment.paypalAccount")}</p>
                        <div style={{ display: "inline-block", padding: "4px 12px", background: "#f0f0f0", color: "#595959", borderRadius: 12, fontSize: 12, fontWeight: 500 }}>
                          {t("demandeurDemandeCreate.payment.available")}
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>

                {paymentCompleted && (
                  <Card style={{ marginTop: 24, background: "#f6ffed", border: "1px solid #b7eb8f" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <CheckCircleOutlined style={{ fontSize: 24, color: "#52c41a" }} />
                      <div>
                        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#52c41a" }}>{t("demandeurDemandeCreate.payment.paymentConfirmed")}</h4>
                        <p style={{ margin: "4px 0 0 0", color: "#389e0d" }}>{t("demandeurDemandeCreate.payment.canSubmitNow")}</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              <Divider className="!mt-6" />
              <div className="flex items-center justify-between">
                <Space>
                  {current > 0 && (
                    <Button onClick={prev} size="large">
                      {t("demandeurDemandeCreate.buttons.previous")}
                    </Button>
                  )}
                  {/* Bouton de réinitialisation en mode dev */}
                  {process.env.NODE_ENV === 'development' && (
                    <Button 
                      danger 
                      onClick={resetForm} 
                      size="large"
                      style={{ marginLeft: 8 }}
                    >
                      🔄 Réinitialiser (Dev)
                    </Button>
                  )}
                </Space>
                <Space>
                  <Button 
                    onClick={saveDraft} 
                    size="large"
                    loading={savingDraft}
                  >
                    {t("demandeurDemandeCreate.buttons.save") || "Enregistrer"}
                  </Button>
                  {current < 6 && (
                    <Button type="primary" onClick={next} size="large">
                      {t("demandeurDemandeCreate.buttons.next")}
                    </Button>
                  )}
                  {current === 6 && (
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading || isSubmitting}
                      size="large"
                      disabled={!paymentCompleted}
                      style={{
                        background: paymentCompleted ? "#52c41a" : undefined,
                        borderColor: paymentCompleted ? "#52c41a" : undefined,
                      }}
                    >
                      {paymentCompleted ? t("demandeurDemandeCreate.buttons.createApplication") : t("demandeurDemandeCreate.buttons.completePayment")}
                    </Button>
                  )}
                </Space>
              </div>
            </Form>
          </Card>

          {/* ------ MODAL PAIEMENT (Stripe / PayPal) ------ */}
          <Modal
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {paymentMethod === "stripe" ? (
                  <>
                    <CreditCardOutlined style={{ fontSize: 24, color: "#1890ff" }} />
                    <span>{t("demandeurDemandeCreate.payment.modalTitleStripe")}</span>
                  </>
                ) : (
                  <>
                    <svg style={{ width: 24, height: 24 }} viewBox="0 0 24 24" fill="#0070BA">
                      <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.028.15a.805.805 0 0 1-.794.68H7.72a.483.483 0 0 1-.477-.558L9.22 7.08a.964.964 0 0 1 .952-.814h4.242c.94 0 1.814.078 2.592.28 1.318.34 2.29 1.098 2.817 2.218z" />
                    </svg>
                    <span>{t("demandeurDemandeCreate.payment.modalTitlePaypal")}</span>
                  </>
                )}
              </div>
            }
            open={showPaymentModal}
            onCancel={() => setShowPaymentModal(false)}
            footer={null}
            width={600}
            centered
            destroyOnClose
          >
            <div style={{ padding: "24px 0" }}>
              <div
                style={{
                  background: "#f0f5ff",
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 24,
                  border: "1px solid #adc6ff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 16 }}>{t("demandeurDemandeCreate.payment.processingFeeLabel")}</h4>
                    <p style={{ margin: "4px 0 0 0", color: "#8c8c8c", fontSize: 14 }}>
                      {t("demandeurDemandeCreate.payment.securePaymentBy")}{" "}
                      {paymentMethod === "stripe" ? t("demandeurDemandeCreate.payment.stripe") : t("demandeurDemandeCreate.payment.paypal")}
                    </p>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#1890ff" }}>{priceLabel}</div>
                </div>
              </div>

              {paymentMethod === "stripe" && (
                initializingStripe ? (
                  <div style={{ textAlign: "center", padding: 24 }}>
                    <Spin size="large" tip={t("demandeurDemandeCreate.payment.initializing")} />
                  </div>
                ) : (stripePromise && clientSecret) ? (
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
                    <CheckoutForm
                      amount={Number(price.amount)}
                      currency={String(price.currency)}
                      clientSecret={clientSecret}
                      onPaymentSuccess={(pi) => handlePayment("stripe", pi)}
                    />
                  </Elements>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <Button onClick={() => handlePaymentSelection("stripe")}>
                      {t("demandeurDemandeCreate.payment.resetStripe")}
                    </Button>
                  </div>
                )
              )}

              {paymentMethod === "paypal" && (
                <PayPalButtons
                  style={{ layout: "vertical" }}
                  createOrder={async () => {
                    const resp = await paymentService.createPaypalOrder({
                      demandeurId: me?.id,
                      amount: Number(price.amount),
                      currency: String(price.currency || DEFAULT_CURRENCY),
                    });
                    return resp?.orderID;
                  }}
                  onApprove={async (data, actions) => {
                    const order = await actions.order.capture();
                    await handlePayment("paypal", order);
                  }}
                  onError={(err) => {
                    console.error("PayPal error:", err);
                    message.error(t("demandeurDemandeCreate.messages.paypalError", { error: err?.message || "inconnue" }));
                  }}
                />
              )}
            </div>
          </Modal>

          {isSubmitting && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0, 0, 0, 0.5)",
                zIndex: 9999,
              }}
            >
              <Card style={{ padding: 24, textAlign: "center" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    border: "4px solid #f3f3f3",
                    borderTop: "4px solid #1890ff",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 16px",
                  }}
                />
                <h4 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{t("demandeurDemandeCreate.payment.processing")}</h4>
                <p style={{ margin: "8px 0 0 0", color: "#8c8c8c" }}>{t("demandeurDemandeCreate.payment.pleaseWait")}</p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PayPalScriptProvider>
  );
}

/** ---- Récap visuel ---- */
function Summary({ form, invites, orgs, tradOrgs, t, me }) {
  const v = form.getFieldsValue(true);
  
  // Helper pour vérifier si une valeur est vide
  const isEmpty = (val) => {
    if (val === null || val === undefined || val === "") return true;
    if (typeof val === "string" && val.trim() === "") return true;
    if (val === "—") return true;
    return false;
  };

  // Helper pour formater une valeur (retourne null si vide)
  const formatValue = (val) => {
    if (isEmpty(val)) return null;
    return val;
  };

  const Item = ({ label, value }) => {
    const formattedValue = formatValue(value);
    if (formattedValue === null) return null;
    return (
      <div className="mb-1">
        <span className="font-medium">{label}:</span> <span>{formattedValue}</span>
      </div>
    );
  };

  // Helper pour obtenir le nom de l'organisation par ID (retourne null si vide)
  const getOrgName = (orgId) => {
    if (!orgId) return null;
    const org = [...orgs, ...tradOrgs].find((o) => o.id === orgId);
    return org ? org.name : null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1) IDENTITÉ (à partir de l'utilisateur connecté, pas des champs du formulaire) */}
      <Card size="small" title={t("demandeurDemandeCreate.summary.identity")} style={{ borderRadius: 8 }}>
        <Item
          label={t("demandeurDemandeCreate.summary.fullName")}
          value={me ? `${me.firstName || ""} ${me.lastName || ""}`.trim() || me.email : null}
        />
        <Item
          label={t("demandeurDemandeCreate.summary.email")}
          value={me?.email}
        />
        <Item
          label={t("demandeurDemandeCreate.fields.dateOfBirth")}
          value={v.dob ? dayjs(v.dob).format("DD/MM/YYYY") : null}
        />
        <Item
          label={t("demandeurDemandeCreate.fields.countryOfCitizenship")}
          value={v.citizenship || me?.citizenship}
        />
        <Item
          label={t("demandeurDemandeCreate.fields.passportNumber")}
          value={v.passport}
        />
      </Card>

      {/* 2) ACADÉMIQUE */}
      <Card size="small" title={t("demandeurDemandeCreate.summary.academic")} style={{ borderRadius: 8 }}>
        <Item
          label={t("demandeurDemandeCreate.summary.serieLevelMention")}
          value={[v.serie, v.niveau, v.mention].filter(Boolean).join(" / ") || null}
        />
        <Item
          label={t("demandeurDemandeCreate.summary.schoolYear")}
          value={v.annee}
        />
        <Item
          label={t("demandeurDemandeCreate.fields.secondarySchoolName")}
          value={v.secondarySchoolName}
        />
        <Item
          label={t("demandeurDemandeCreate.fields.countryOfSchool")}
          value={v.countryOfSchool}
        />
        <Item
          label={t("demandeurDemandeCreate.fields.graduationDate")}
          value={v.graduationDate ? dayjs(v.graduationDate).format("DD/MM/YYYY") : null}
        />
        <Item
          label={t("demandeurDemandeCreate.fields.gradingScale")}
          value={v.gradingScale}
        />
        <Item
          label={t("demandeurDemandeCreate.fields.gpa")}
          value={v.gpa}
        />
      </Card>

      {/* 3) CIBLE (avec filière souhaitée ici) */}
      <Card size="small" title={t("demandeurDemandeCreate.summary.target")} style={{ borderRadius: 8 }}>
        <Item
          label={t("demandeurDemandeCreate.fields.targetOrg")}
          value={getOrgName(v.targetOrgId)}
        />
        <Item
          label={t("demandeurDemandeCreate.fields.translationOrg")}
          value={getOrgName(v.assignedOrgId)}
        />
        <Item
          label={t("demandeurDemandeCreate.fields.intendedMajor")}
          value={v.intendedMajor}
        />
        <Item
          label={t("demandeurDemandeCreate.fields.preferredStartTerm")}
          value={v.periode}
        />
        <Item
          label={t("demandeurDemandeCreate.fields.year")}
          value={v.year}
        />
        <Item
          label={t("demandeurDemandeCreate.summary.observation")}
          value={v.observation}
        />
      </Card>

      {/* 4) FAMILLE */}
      <Card size="small" title={t("demandeurDemandeCreate.sections.familyInfo")} style={{ borderRadius: 8 }}>
        <Item
          label={t("demandeurDemandeCreate.fields.parentGuardianName")}
          value={v.parentGuardianName}
        />
        <Item
          label={t("demandeurDemandeCreate.fields.occupation")}
          value={v.occupation}
        />
        <Item
          label={t("demandeurDemandeCreate.fields.educationLevel")}
          value={v.educationLevel}
        />
      </Card>

      {/* 5) INVITATIONS */}
      <Card size="small" title={t("demandeurDemandeCreate.summary.invitations")} style={{ borderRadius: 8 }}>
        {invites?.length ? (
          invites.map((it) => (
            <div key={it.email}>
              • {it.name} {it.roleKey ? `(${it.roleKey})` : ""} — <i>{it.email}</i>
            </div>
          ))
        ) : (
          <div>—</div>
        )}
      </Card>
    </div>
  );
}
