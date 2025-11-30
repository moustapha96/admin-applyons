import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, Spin, message } from "antd";

export default function MonOrganisation() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);

  useEffect(() => {
    // TODO: Implémenter la récupération de l'organisation
    // const fetchOrganization = async () => {
    //   try {
    //     setLoading(true);
    //     // const data = await organizationService.getMyOrganization();
    //     // setOrganization(data);
    //   } catch (error) {
    //     message.error(t("monOrganisation.error"));
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchOrganization();
    setLoading(false);
  }, [t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
        <span className="ml-4">{t("monOrganisation.loading")}</span>
      </div>
    );
  }

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <h5 className="text-lg font-semibold mb-6">{t("monOrganisation.title")}</h5>
        <Card>
          {/* TODO: Afficher les informations de l'organisation */}
          <p>{t("monOrganisation.loading")}</p>
        </Card>
      </div>
    </div>
  );
}

