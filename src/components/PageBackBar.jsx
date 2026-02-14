"use client";

import { useNavigate, useLocation } from "react-router-dom";
import { Button, Tooltip } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

/** Routes où la barre "Retour" est masquée (pages dashboard) */
const DASHBOARD_PATHS = [
  "/admin",
  "/admin/dashboard",
  "/traducteur/dashboard",
  "/organisations",
  "/organisations/dashboard",
  "/demandeur",
  "/demandeur/dashboard",
];

function PageBackBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isDashboard = DASHBOARD_PATHS.some((path) => location.pathname === path || location.pathname === path + "/");

  if (isDashboard) return null;

  const handleBack = () => navigate(-1);

  return (
    <div className="page-back-bar sticky top-[70px] z-[998] border-b border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800/95 shadow-sm backdrop-blur-sm px-3 py-2 md:px-4 md:py-2.5">
      <div className="flex items-center gap-2">
        <Tooltip title={t("common.back")}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined className="text-base" />}
            onClick={handleBack}
            className="!flex items-center justify-center !text-gray-600 dark:!text-slate-300 hover:!text-gray-900 dark:hover:!text-white hover:!bg-gray-100 dark:hover:!bg-slate-700"
            aria-label={t("common.back")}
          >
            <span className="ml-1 hidden sm:inline">{t("common.back")}</span>
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

export default PageBackBar;
