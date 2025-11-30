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
    const fetchStats = async () => {
      try {
        setLoading(true)
        const res = await dashboardService.getStats()
        setStats(res?.data)
      } catch (error) {
        console.error("Error fetching stats:", error)
        toast.error(error?.message || t("traducteurDashboard.error"))
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr")
    document.documentElement.classList.add("light")
    document.documentElement.classList.remove("dark")
  }, [])

  const kpis = useMemo(() => {
    const d = stats || {}
    return [
      {
        label: t("traducteurDashboard.kpis.usersTotal"),
        value: d.users?.total ?? 0,
        sub: t("traducteurDashboard.kpis.usersActive", { count: d.users?.enabled ?? 0 }),
      },
      {
        label: t("traducteurDashboard.kpis.organizationsTotal"),
        value: d.organizations?.total ?? 0,
        sub: undefined,
      },
      {
        label: t("traducteurDashboard.kpis.demandesTotal"),
        value: d.demandes?.total ?? 0,
        sub: d.demandes?.byStatus && Object.keys(d.demandes.byStatus).length > 0
          ? t("traducteurDashboard.kpis.demandesBreakdown")
          : t("traducteurDashboard.kpis.demandesNone"),
      },
      {
        label: t("traducteurDashboard.kpis.documentsTotal"),
        value: d.documents?.total ?? 0,
        sub: t("traducteurDashboard.kpis.documentsTranslated", { count: d.documents?.translated ?? 0 }),
      },
      {
        label: t("traducteurDashboard.kpis.transactionsTotal"),
        value: d.transactions?.total ?? 0,
        sub: d.transactions?.byStatus && Object.keys(d.transactions.byStatus).length > 0
          ? t("traducteurDashboard.kpis.transactionsBreakdown")
          : t("traducteurDashboard.empty.noData"),
      },
      {
        label: t("traducteurDashboard.kpis.paymentsTotal"),
        value: d.payments?.total ?? 0,
        sub: d.payments?.byStatus && Object.keys(d.payments.byStatus).length > 0
          ? t("traducteurDashboard.kpis.paymentsBreakdown")
          : t("traducteurDashboard.empty.noData"),
      },
      {
        label: t("traducteurDashboard.kpis.abonnementsTotal"),
        value: d.abonnements?.total ?? 0,
        sub: t("traducteurDashboard.kpis.abonnementsActive", { active: d.abonnements?.active ?? 0, expiring: d.abonnements?.expiringSoon ?? 0 }),
      },
     
      {
        label: t("traducteurDashboard.kpis.contactsTotal"),
        value: d.contacts?.total ?? 0,
        sub: undefined,
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
              <PillList title={t("traducteurDashboard.breakdowns.usersByRole")} itemsObj={stats?.users?.byRole} t={t} />
              <PillList title={t("traducteurDashboard.breakdowns.orgsByType")} itemsObj={stats?.organizations?.byType} t={t} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <PillList title={t("traducteurDashboard.breakdowns.demandesByStatus")} itemsObj={stats?.demandes?.byStatus} t={t} />
              <PillList title={t("traducteurDashboard.breakdowns.transactionsByStatus")} itemsObj={stats?.transactions?.byStatus} t={t} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <PillList title={t("traducteurDashboard.breakdowns.paymentsByStatus")} itemsObj={stats?.payments?.byStatus} t={t} />
              {/* Slot libre si tu veux un autre détail plus tard */}
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">
                {t("traducteurDashboard.empty.freeSpace")}
              </div>
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
