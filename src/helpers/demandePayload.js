// helpers/demandePayload.ts
import dayjs from "dayjs";

const toISO = (v) => (v ? dayjs(v).toDate().toISOString() : null);
const nullIfEmpty = (v) => (v === "" || v === undefined ? null : v);
const boolFromString = (v) => (v === "true" || v === "Yes");

export function buildDemandePayload(formData, me) {
    return {
        targetOrgId: Number(formData.institut_id), // <- id d’institut cible
        assignedOrgId: formData.institutTraducteurId ? Number(formData.institutTraducteurId) : null,
        userId: me.id,

        // header
        periode: nullIfEmpty(formData.periode), // ex: "Automne" ou "FALL" selon ton UI
        year: nullIfEmpty(formData.year),

        // académiques
        serie: nullIfEmpty(formData.serie),
        niveau: nullIfEmpty(formData.niveau),
        mention: nullIfEmpty(formData.mention),
        annee: nullIfEmpty(formData.annee),
        countryOfSchool: nullIfEmpty(formData.countryOfSchool),
        secondarySchoolName: nullIfEmpty(formData.secondarySchoolName),
        graduationDate: toISO(formData.graduationDate),

        // identité
        dob: toISO(formData.dob),
        citizenship: nullIfEmpty(formData.citizenship),
        passport: nullIfEmpty(formData.passport),

        // anglais
        isEnglishFirstLanguage: boolFromString(formData.isEnglishFirstLanguage),
        englishProficiencyTests: Array.isArray(formData.englishProficiencyTests) ? formData.englishProficiencyTests : [],
        testScores: nullIfEmpty(formData.testScores),

        // scolarité
        gradingScale: nullIfEmpty(formData.gradingScale),
        gpa: nullIfEmpty(formData.gpa),
        examsTaken: Array.isArray(formData.examsTaken) ? formData.examsTaken : [],
        intendedMajor: nullIfEmpty(formData.intendedMajor),

        // activités
        extracurricularActivities: nullIfEmpty(formData.extracurricularActivities),
        honorsOrAwards: nullIfEmpty(formData.honorsOrAwards),

        // famille
        parentGuardianName: nullIfEmpty(formData.parentGuardianName),
        occupation: nullIfEmpty(formData.parentOccupation),
        educationLevel: nullIfEmpty(formData.educationLevel),

        // finances
        willApplyForFinancialAid: ["Yes", "true"].includes(formData.willApplyForFinancialAid),
        hasExternalSponsorship: ["Yes", "true"].includes(formData.hasExternalSponsorship),

        // visa
        visaType: nullIfEmpty(formData.visaType),
        hasPreviouslyStudiedInUS: ["Yes", "true"].includes(formData.hasPreviouslyStudiedInUS),

        // essays
        personalStatement: nullIfEmpty(formData.personalStatement),
        optionalEssay: nullIfEmpty(formData.optionalEssay),

        // candidature
        applicationRound: nullIfEmpty(formData.applicationRound),
        howDidYouHearAboutUs: nullIfEmpty(formData.howDidYouHearAboutUs),

        // paiement (optionnel — si tu valides avant paiement comme dans ta page)
        payment: formData.paymentMethod ? {
            method: formData.paymentMethod, // "stripe" | "paypal"
            amount: Number(formData.amount || 0),
            currency: "USD",
            reference: (formData.clientSecret || formData.orderId || "").toString(),
            providerPayload: formData.paymentInfo || null,
        } : null,
    };
}