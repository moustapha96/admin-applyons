/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../hooks/useAuth"
import dashboardService from "../../../services/dashboardService"

// Petites cartes KPI
function StatCard({ label, value, sublabel }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value ?? 0}</div>
      {sublabel ? <div className="mt-1 text-xs text-slate-400">{sublabel}</div> : null}
    </div>
  )
}

function PillList({ title, itemsObj, t }) {
  const entries = Object.entries(itemsObj || {})
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-medium text-slate-700">{title}</div>
      {entries.length === 0 ? (
        <div className="mt-2 text-xs text-slate-400">{t("traducteurDashboard.empty.noItems")}</div>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {entries.map(([key, count]) => (
            <span
              key={key}
              className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium text-slate-700"
            >
              <span className="mr-1 rounded-full bg-slate-200/60 px-1.5 py-0.5 text-[10px]">{count}</span>
              {key}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TraducteurDashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.id) return
    const fetchStats = async () => {
      try {
        setLoading(true)
        const res = await dashboardService.getTraducteurStats(user.id)
        setStats(res?.data)
      } catch (error) {
        console.error("Error fetching stats:", error)
        toast.error(error?.message || t("traducteurDashboard.error"))
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [user?.id, t])

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr")
    document.documentElement.classList.add("light")
    document.documentElement.classList.remove("dark")
  }, [])

  const kpis = useMemo(() => {
    const widgets = stats?.widgets || {}
    const translatedByMe = widgets.translatedByMe || {}
    const toTranslate = widgets.toTranslate || {}
    const performance = widgets.performance || {}
    const demandes = widgets.demandes || {}
    
    // Calculer le total des demandes depuis le tableau
    const demandesTotal = Array.isArray(demandes.total)
      ? demandes.total.reduce((sum, item) => sum + (item._count?._all || 0), 0)
      : 0
    
    // Calculer le total des documents à traduire
    const toTranslateTotal = Array.isArray(toTranslate.total) ? toTranslate.total.length : 0
    
    // Calculer les traductions validées et en attente
    const validated = translatedByMe.byStatus?.VALIDATED || 0
    const pending = translatedByMe.byStatus?.PENDING || 0
    
    // Performance ce mois vs mois dernier
    const thisMonthTotal = Array.isArray(performance.thisMonth)
      ? performance.thisMonth.reduce((sum, item) => sum + (item._count?._all || 0), 0)
      : 0
    const lastMonthTotal = performance.lastMonth || 0
    
    return [
      {
        label: t("traducteurDashboard.kpis.translatedTotal"),
        value: translatedByMe.total ?? 0,
        sub: t("traducteurDashboard.kpis.translatedBreakdown", { validated, pending }),
      },
      {
        label: t("traducteurDashboard.kpis.toTranslateTotal"),
        value: toTranslateTotal,
        sub: t("traducteurDashboard.kpis.toTranslateSub"),
      },
      {
        label: t("traducteurDashboard.kpis.performanceThisMonth"),
        value: thisMonthTotal,
        sub: t("traducteurDashboard.kpis.performanceComparison", { lastMonth: lastMonthTotal }),
      },
      {
        label: t("traducteurDashboard.kpis.demandesTotal"),
        value: demandesTotal,
        sub: t("traducteurDashboard.kpis.demandesBreakdown"),
      },
    ]
  }, [stats, t])

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h5 className="text-xl font-bold">
              {t("traducteurDashboard.hello", { firstName: user?.firstName || "", lastName: user?.lastName || "" })}
            </h5>
            <h6 className="font-semibold text-slate-400">{t("traducteurDashboard.welcome")}</h6>
          </div>
        </div>

        {/* Loader/empty */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        )}

        {!loading && stats && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {kpis.map((k) => (
                <StatCard key={k.label} label={k.label} value={k.value} sublabel={k.sub} />
              ))}
            </div>

            {/* Breakdowns */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <PillList 
                title={t("traducteurDashboard.breakdowns.translatedByType")} 
                itemsObj={stats?.widgets?.translatedByMe?.byType} 
                t={t} 
              />
              <PillList 
                title={t("traducteurDashboard.breakdowns.translatedByStatus")} 
                itemsObj={stats?.widgets?.translatedByMe?.byStatus} 
                t={t} 
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <PillList 
                title={t("traducteurDashboard.breakdowns.translationsByType")} 
                itemsObj={stats?.charts?.translationsByType} 
                t={t} 
              />
              <PillList 
                title={t("traducteurDashboard.breakdowns.demandesByType")} 
                itemsObj={(() => {
                  const demandesTotal = stats?.widgets?.demandes?.total || []
                  const result = {}
                  demandesTotal.forEach(item => {
                    const type = item.type || t("traducteurDashboard.common.other")
                    result[type] = item._count?._all || 0
                  })
                  return result
                })()} 
                t={t} 
              />
            </div>
          </>
        )}

        {!loading && !stats && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            {t("traducteurDashboard.empty.noData")}
          </div>
        )}
      </div>
    </div>
  )
}
