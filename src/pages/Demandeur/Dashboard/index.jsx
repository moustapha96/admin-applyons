// /* eslint-disable react/prop-types */
// import { useEffect, useMemo, useState } from "react";
// import { toast } from "sonner";
// import { useAuth } from "../../../hooks/useAuth";
// import dashboardService from "../../../services/dashboardService";

// // Petites cartes KPI
// function StatCard({ label, value, sublabel }) {
//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
//       <div className="text-sm text-slate-500">{label}</div>
//       <div className="mt-1 text-2xl font-semibold">{value ?? 0}</div>
//       {sublabel && <div className="mt-1 text-xs text-slate-400">{sublabel}</div>}
//     </div>
//   );
// }

// export default function DemandeurDashboard() {
//   const [payload, setPayload] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const { user } = useAuth();

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         setLoading(true);
//         const res = await dashboardService.getDemandeurStats(user.id);
//         setPayload(res);
//       } catch (error) {
//         console.error("Error fetching demandeur stats:", error);
//         toast.error(error?.message || "Erreur lors de la récupération des statistiques");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchStats();
//   }, [user.id]);

//   useEffect(() => {
//     document.documentElement.setAttribute("dir", "ltr");
//     document.documentElement.classList.add("light");
//     document.documentElement.classList.remove("dark");
//   }, []);

//   // Extraction des données
//   const data = payload?.data || {};
//   const widgets = data.widgets || {};
//   const tables = data.tables || {};

//   // Calcul des KPIs
//   const kpis = useMemo(() => {
//     return [
//       {
//         label: "Mes demandes",
//         value: widgets.myDemandes?.total ?? 0,
//         sublabel:
//           widgets.myDemandes?.byStatus && Object.keys(widgets.myDemandes.byStatus).length > 0
//             ? "Voir la répartition ci-dessous"
//             : "Aucune demande",
//       },
//       {
//         label: "Mes documents",
//         value: widgets.myDocuments?.total ?? 0,
//         sublabel: `Traduit: ${widgets.myDocuments?.translated ?? 0}`,
//       },
//       {
//         label: "Mes transactions",
//         value: widgets.myTransactions?.total ?? 0,
//         sublabel:
//           widgets.myTransactions?.byStatus && Object.keys(widgets.myTransactions.byStatus).length > 0
//             ? "Voir la répartition ci-dessous"
//             : "—",
//       },
//       {
//         label: "Mes paiements",
//         value: widgets.myPayments?.total ?? 0,
//         sublabel:
//           widgets.myPayments?.byStatus && Object.keys(widgets.myPayments.byStatus).length > 0
//             ? "Voir la répartition ci-dessous"
//             : "—",
//       },
//     ];
//   }, [widgets]);

//   // Formatage des dates
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleString("fr-FR", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   return (
//     <div className="container-fluid relative px-3">
//       <div className="layout-specing">
//         <div className="mb-6 flex items-center justify-between">
//           <div>
//             <h5 className="text-xl font-bold">
//               Bonjour, {user?.firstName} {user?.lastName}
//             </h5>
//             <h6 className="font-semibold text-slate-400">Bienvenue sur votre tableau de bord</h6>
//           </div>
//         </div>

//         {/* Loader */}
//         {loading && (
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
//             ))}
//           </div>
//         )}

//         {/* Contenu principal */}
//         {!loading && payload && (
//           <>
//             {/* KPIs */}
//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
//               {kpis.map((k) => (
//                 <StatCard key={k.label} label={k.label} value={k.value} sublabel={k.sublabel} />
//               ))}
//             </div>

           
//             <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              
//               <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
//                 <h6 className="font-medium">Activité récente :</h6>
//                 <ul className="mt-2 list-disc pl-5 text-xs text-slate-600">
//                   {tables.allDemandes?.map((demande) => (
//                     <li key={demande.id}>
//                       Demande <strong>{demande.code}</strong> — {demande.status} —{" "}
//                       {formatDate(demande.createdAt)}
//                     </li>
//                   ))}
//                   {tables.allPayments?.map((paiement) => (
//                     <li key={paiement.id}>
//                       Paiement <strong>{paiement.provider}</strong> — {paiement.status} —{" "}
//                       {paiement.amount} {paiement.currency} — {formatDate(paiement.createdAt)}
//                     </li>
//                   ))}
//                   {(!tables.allDemandes || tables.allDemandes.length === 0) &&
//                     (!tables.allPayments || tables.allPayments.length === 0) && (
//                       <li className="list-none text-slate-400">Aucune activité récente</li>
//                     )}
//                 </ul>
//               </div>
//             </div>
//           </>
//         )}

//         {/* Message si pas de données */}
//         {!loading && !payload && (
//           <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
//             Aucune donnée à afficher.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

/* eslint-disable react/prop-types */
"use client";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../hooks/useAuth";
import dashboardService from "../../../services/dashboardService";
import { useTranslation } from "react-i18next";

// Petites cartes KPI
function StatCard({ label, value, sublabel }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value ?? 0}</div>
      {sublabel && <div className="mt-1 text-xs text-slate-400">{sublabel}</div>}
    </div>
  );
}

export default function DemandeurDashboard() {
  const { t, i18n } = useTranslation();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getDemandeurStats(user.id);
        setPayload(res);
      } catch (error) {
        console.error("Error fetching demandeur stats:", error);
        toast.error(error?.message || t("demandeurDashboard.toasts.loadError"));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.id, t]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  // Extraction des données
  const data = payload?.data || {};
  const widgets = data.widgets || {};
  const tables = data.tables || {};

  // Calcul des KPIs
  const kpis = useMemo(() => {
    return [
      {
        label: t("demandeurDashboard.kpis.myRequests"),
        value: widgets.myDemandes?.total ?? 0,
        sublabel:
          widgets.myDemandes?.byStatus && Object.keys(widgets.myDemandes.byStatus).length > 0
            ? t("demandeurDashboard.kpis.seeBreakdown")
            : t("demandeurDashboard.kpis.none"),
      },
      {
        label: t("demandeurDashboard.kpis.myDocuments"),
        value: widgets.myDocuments?.total ?? 0,
        sublabel: t("demandeurDashboard.kpis.translatedCount", {
          count: widgets.myDocuments?.translated ?? 0,
        }),
      },
      {
        label: t("demandeurDashboard.kpis.myTransactions"),
        value: widgets.myTransactions?.total ?? 0,
        sublabel:
          widgets.myTransactions?.byStatus && Object.keys(widgets.myTransactions.byStatus).length > 0
            ? t("demandeurDashboard.kpis.seeBreakdown")
            : "—",
      },
      {
        label: t("demandeurDashboard.kpis.myPayments"),
        value: widgets.myPayments?.total ?? 0,
        sublabel:
          widgets.myPayments?.byStatus && Object.keys(widgets.myPayments.byStatus).length > 0
            ? t("demandeurDashboard.kpis.seeBreakdown")
            : "—",
      },
    ];
  }, [widgets, t]);

  // Formatage des dates selon la langue
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString(
        i18n.language === "zh" ? "zh-CN" :
        i18n.language === "de" ? "de-DE" :
        i18n.language === "es" ? "es-ES" :
        i18n.language === "it" ? "it-IT" :
        i18n.language === "en" ? "en-US" : "fr-FR",
        { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
      );
    } catch {
      return dateString || t("demandeurDashboard.common.na");
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h5 className="text-xl font-bold">
              {t("demandeurDashboard.header.hello", {
                firstName: user?.firstName || "",
                lastName: user?.lastName || ""
              })}
            </h5>
            <h6 className="font-semibold text-slate-400">
              {t("demandeurDashboard.header.welcome")}
            </h6>
          </div>
        </div>

        {/* Loader */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        )}

        {/* Contenu principal */}
        {!loading && payload && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {kpis.map((k) => (
                <StatCard key={k.label} label={k.label} value={k.value} sublabel={k.sublabel} />
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                <h6 className="font-medium">{t("demandeurDashboard.activity.title")}</h6>
                <ul className="mt-2 list-disc pl-5 text-xs text-slate-600">
                  {tables.allDemandes?.map((demande) => (
                    <li key={demande.id}>
                      {t("demandeurDashboard.activity.requestLine", {
                        code: demande.code,
                        status: demande.status,
                        date: formatDate(demande.createdAt)
                      })}
                    </li>
                  ))}
                  {tables.allPayments?.map((paiement) => (
                    <li key={paiement.id}>
                      {t("demandeurDashboard.activity.paymentLine", {
                        provider: paiement.provider,
                        status: paiement.status,
                        amount: paiement.amount,
                        currency: paiement.currency,
                        date: formatDate(paiement.createdAt)
                      })}
                    </li>
                  ))}
                  {(!tables.allDemandes || tables.allDemandes.length === 0) &&
                    (!tables.allPayments || tables.allPayments.length === 0) && (
                      <li className="list-none text-slate-400">
                        {t("demandeurDashboard.activity.none")}
                      </li>
                    )}
                </ul>
              </div>
            </div>
          </>
        )}

        {/* Message si pas de données */}
        {!loading && !payload && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            {t("demandeurDashboard.empty")}
          </div>
        )}
      </div>
    </div>
  );
}
