/* eslint-disable react/no-unescaped-entities */

import { useEffect,  useState } from "react";
import { Link,  useParams } from "react-router-dom";
import {
  Breadcrumb,
  Card,
  Descriptions,
  Avatar,
  Tag,
  Space,
  Spin,
  message,
} from "antd";
import {
  GlobalOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,

} from "@ant-design/icons";
import organizationService from "../../../services/organizationService";
import { BiBuilding } from "react-icons/bi";
import { useTranslation } from "react-i18next";

const getTypeColor = (type) => {
  const colors = {
    ENTREPRISE: "blue",
    TRADUCTEUR: "purple",
    BANQUE: "gold",
    COLLEGE: "green",
    LYCEE: "cyan",
    UNIVERSITE: "geekblue",
  };
  return colors[type] || "default";
};


const defaultUsersState = {
  page: 1,
  limit: 10,
  search: "",
  role: undefined,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const DemandeurOrganisationDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const typeOptions = [
    { value: "ENTREPRISE", label: t("demandeurOrganisationDetail.types.ENTREPRISE") },
    { value: "TRADUCTEUR", label: t("demandeurOrganisationDetail.types.TRADUCTEUR") },
    { value: "BANQUE", label: t("demandeurOrganisationDetail.types.BANQUE") },
    { value: "COLLEGE", label: t("demandeurOrganisationDetail.types.COLLEGE") },
    { value: "LYCEE", label: t("demandeurOrganisationDetail.types.LYCEE") },
    { value: "UNIVERSITE", label: t("demandeurOrganisationDetail.types.UNIVERSITE") },
  ];

  const countryOptions = [
    { value: "SN", label: t("demandeurOrganisationDetail.countries.SN") },
    { value: "FR", label: t("demandeurOrganisationDetail.countries.FR") },
    { value: "US", label: t("demandeurOrganisationDetail.countries.US") },
    { value: "CA", label: t("demandeurOrganisationDetail.countries.CA") },
  ];

  const [organization, setOrganization] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(true);

  const [usersState, setUsersState] = useState(defaultUsersState);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const fetchOrganization = async (overrideUsersState) => {
    const s = { ...usersState, ...(overrideUsersState || {}) };
    setLoadingOrg(true);
    setLoadingUsers(true);
    try {
      const response = await organizationService.getById(id, {
        usersPage: s.page,
        usersLimit: s.limit,
        usersSearch: s.search || undefined,
        usersRole: s.role || undefined,
        usersSortBy: s.sortBy,
        usersSortOrder: s.sortOrder,
      });

      setOrganization(response.organization || null);
    } catch (error) {
        console.log(error)
    message.warning(error.message)
        console.error(t("demandeurOrganisationDetail.messages.loadError"), error);
      setOrganization(null);
    } finally {
      setLoadingOrg(false);
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchOrganization();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);


  if (loadingOrg && !organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!organization) {
    return <div>{t("demandeurOrganisationDetail.messages.notFound")}</div>;
  }

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("demandeurOrganisationDetail.pageTitle")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/demandeur/dashboard">{t("demandeurOrganisationDetail.breadcrumbs.dashboard")}</Link> },
              { title: organization.name },
            ]}
          />
        </div>

       
        <Card>
          <Descriptions title={t("demandeurOrganisationDetail.sections.generalInfo")} bordered column={3}>
            <Descriptions.Item label={t("demandeurOrganisationDetail.sections.name")} span={2}>
              <Space>
                <Avatar shape="square" size="large" icon={<BiBuilding />} />
                <span className="ml-3">{organization.name}</span>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t("demandeurOrganisationDetail.sections.type")} span={1}>
              <Tag color={getTypeColor(organization.type)}>
                {typeOptions.find((opt) => opt.value === organization.type)?.label || organization.type}
              </Tag>
            </Descriptions.Item>

        
            <Descriptions.Item label={t("demandeurOrganisationDetail.sections.email")} span={1}>
              <Space>
                <MailOutlined />
                <a href={`mailto:${organization.email}`}>{organization.email}</a>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label={t("demandeurOrganisationDetail.sections.phone")} span={1}>
              <Space>
                <PhoneOutlined />
                <a href={`tel:${organization.phone}`}>{organization.phone}</a>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label={t("demandeurOrganisationDetail.sections.address")} span={1}>
              <Space>
                <EnvironmentOutlined />
                <span>{organization.address || t("demandeurOrganisationDetail.common.na")}</span>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label={t("demandeurOrganisationDetail.sections.website")} span={3}>
              <Space>
                <GlobalOutlined />
                {organization.website ? (
                  <a href={organization.website} target="_blank" rel="noopener noreferrer">
                    {organization.website}
                  </a>
                ) : (
                  t("demandeurOrganisationDetail.common.na")
                )}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label={t("demandeurOrganisationDetail.sections.country")}>
              <Tag color="blue">
                {countryOptions.find((opt) => opt.value === organization.country)?.label || organization.country}
              </Tag>
            </Descriptions.Item>

            
          </Descriptions>

         
         
        </Card>

        
        
      </div>
    </div>
  );
};

export default DemandeurOrganisationDetail;
