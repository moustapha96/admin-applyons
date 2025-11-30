

/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import { FiArrowRight } from "react-icons/fi";
import { Book, Calendar, File, Mail, Paperclip, User, UserMinus } from "react-feather";

// Map centralisé des routes d’admin
const ROUTES = {
    users: "/admin/users",
    activities: "/admin/activities",
    events: "/admin/events",
    resources: "/admin/resources",
    partners: "/admin/partners",
    contacts: "/admin/contacts",   // adapte si ton chemin diffère (ex: /admin/contact-requests)
    news: "/admin/news",
};

export default function DataStates({ stats }) {
    const formatStats = () => {
        return [
            {
                key: "users",
                title: "Utilisateurs",
                value: stats.users.total,
                subtitle: `${stats.users.active} actifs`,
                icon: User,
                route: ROUTES.users,
                color: "text-[var(--applyons-blue)]",
                bgColor: "bg-[var(--applyons-blue)]/5 dark:bg-[var(--applyons-blue)]/10",
                shadow: "shadow-[var(--applyons-blue)]/5 dark:shadow-[var(--applyons-blue)]/10",
            },
            {
                key: "activities",
                title: "Activités",
                value: stats.activities.total,
                subtitle: `${stats.activities.published} publiées, ${stats.activities.draft} brouillons`,
                icon: File,
                route: ROUTES.activities,
                color: "text-[var(--applyons-blue)]",
                bgColor: "bg-[var(--applyons-blue)]/5 dark:bg-[var(--applyons-blue)]/10",
                shadow: "shadow-[var(--applyons-blue)]/5 dark:shadow-[var(--applyons-blue)]/10",
            },
            {
                key: "events",
                title: "Événements",
                value: stats.events.total,
                subtitle: `${stats.events.past} passés, ${stats.events.upcoming} à venir`,
                icon: Calendar,
                route: ROUTES.events,
                color: "text-[var(--applyons-blue)]",
                bgColor: "bg-[var(--applyons-blue)]/5 dark:bg-[var(--applyons-blue)]/10",
                shadow: "shadow-[var(--applyons-blue)]/5 dark:shadow-[var(--applyons-blue)]/10",
            },
            {
                key: "resources",
                title: "Ressources",
                value: stats.resources,
                icon: Book,
                route: ROUTES.resources,
                color: "text-[var(--applyons-blue)]",
                bgColor: "bg-[var(--applyons-blue)]/5 dark:bg-[var(--applyons-blue)]/10",
                shadow: "shadow-[var(--applyons-blue)]/5 dark:shadow-[var(--applyons-blue)]/10",
            },
            {
                key: "partners",
                title: "Partenaires",
                value: stats.partners,
                icon: UserMinus,
                route: ROUTES.partners,
                color: "text-[var(--applyons-blue)]",
                bgColor: "bg-[var(--applyons-blue)]/5 dark:bg-[var(--applyons-blue)]/10",
                shadow: "shadow-[var(--applyons-blue)]/5 dark:shadow-[var(--applyons-blue)]/10",
            },
            {
                key: "contacts",
                title: "Contacts",
                value: stats.contacts.total,
                subtitle: `${stats.contacts.pending} en attente`,
                icon: Mail,
                route: ROUTES.contacts,
                color: "text-[var(--applyons-blue)]",
                bgColor: "bg-[var(--applyons-blue)]/5 dark:bg-[var(--applyons-blue)]/10",
                shadow: "shadow-[var(--applyons-blue)]/5 dark:shadow-[var(--applyons-blue)]/10",
            },
            {
                key: "news",
                title: "Actualités",
                value: stats.news.total,
                subtitle: `${stats.news.published} publiées`,
                icon: Paperclip,
                route: ROUTES.news,
                color: "text-[var(--applyons-blue)]",
                bgColor: "bg-[var(--applyons-blue)]/5 dark:bg-[var(--applyons-blue)]/10",
                shadow: "shadow-[var(--applyons-blue)]/5 dark:shadow-[var(--applyons-blue)]/10",
            },
        ];
    };

    return (
        <div className="grid xl:grid-cols-5 md:grid-cols-3 grid-cols-1 mt-6 gap-6">
            {formatStats().map((item, index) => {
                const Icon = item.icon;
                const hasRoute = Boolean(item.route);

                return (
                    <div
                        className="relative overflow-hidden rounded-md shadow-sm dark:shadow-gray-700 bg-white dark:bg-slate-900"
                        key={item.key || index}
                    >
                        <div className="p-5 flex items-center">
                            <span
                                className={`flex justify-center items-center rounded-md size-14 min-w-[56px] ${item.bgColor} ${item.shadow} ${item.color}`}
                            >
                                <Icon className="size-5" />
                            </span>
                            <span className="ms-3">
                                <span className="text-slate-400 font-semibold block">{item.title}</span>
                                <span className="flex items-center justify-between mt-1">
                                    <span className="text-xl font-semibold">
                                        <CountUp start={0} end={item.value || 0} />
                                    </span>
                                </span>
                                {item.subtitle && (
                                    <span className="text-slate-400 text-sm block mt-1">{item.subtitle}</span>
                                )}
                            </span>
                        </div>

                        <div className="px-5 py-4 bg-gray-50 dark:bg-slate-800">
                            {hasRoute ? (
                                <Link
                                    to={item.route}
                                    className="relative inline-flex items-center font-semibold tracking-wide align-middle text-base text-center border-none after:content-[''] after:absolute after:h-px after:w-0 hover:after:w-full after:end-0 hover:after:end-auto after:bottom-0 after:start-0 after:transition-all after:duration-500 text-[var(--applyons-blue)] dark:text-white/70 hover:text-[var(--applyons-blue)] dark:hover:text-white after:bg-[var(--applyons-blue)] dark:after:bg-white duration-500"
                                    aria-label={`Voir ${item.title}`}
                                >
                                    Voir les données <FiArrowRight className="ms-1" />
                                </Link>
                            ) : (
                                <span className="inline-flex items-center text-slate-400 cursor-not-allowed select-none">
                                    Voir les données <FiArrowRight className="ms-1" />
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
