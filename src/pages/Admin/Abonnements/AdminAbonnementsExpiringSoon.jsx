import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  Tag,
  Space,
  Breadcrumb,
  Button,
  Input,
  Select,
  message,
  Card,
  Typography,
  DatePicker,
  Alert
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  BellOutlined
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import abonnementService from "../../services/abonnementService";
import organizationService from "../../../services/organizationservice";
// import { useAuth } from "../../../hooks/useAuth";

const { Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

const AdminAbonnementsExpiringSoon = () => {
  const { t } = useTranslation();
  const [abonnements, setAbonnements] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    days: 30,
    organizationId: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchAbonnements();
    fetchOrganizations();
  }, [filters]);

  const fetchAbonnements = async () => {
    setLoading(true);
    try {
      const params = {
        days: filters.days,
        ...(filters.organizationId && { organizationId: filters.organizationId }),
      };
      const response = await abonnementService.expiringSoon(params);
      setAbonnements(response.abonnements);
    } catch (error) {
      console.error("Erreur lors de la récupération des abonnements:", error);
      message.error(t("adminAbonnements.messages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await organizationService.list({ limit: 1000 });
      setOrganizations(response.organizations);
    } catch (error) {
      console.error("Erreur lors de la récupération des organisations:", error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const getDaysUntilExpiration = (dateExpiration) => {
    const now = new Date();
    const end = new Date(dateExpiration);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const columns = [
    {
      title: t("adminAbonnements.columns.id"),
      dataIndex: "id",
      key: "id",
      render: (id) => `#${id.substring(0, 8)}...`,
    },
    {
      title: t("adminAbonnements.columns.organization"),
      dataIndex: ["organization", "name"],
      key: "organization",
      render: (name, record) => (
        <Link to={`/admin/organisations/${record.organizationId}/details`}>
          {name}
        </Link>
      ),
    },
    {
      title: t("adminAbonnements.expiringSoon.columns.expirationDate"),
      dataIndex: "dateExpiration",
      key: "dateExpiration",
      render: (dateExpiration) => (
        <Space>
          <CalendarOutlined />
          {new Date(dateExpiration).toLocaleDateString()}
          <Tag color={getDaysUntilExpiration(dateExpiration) <= 7 ? "red" : "orange"}>
            {t("adminAbonnements.expiringSoon.daysLabel", { count: getDaysUntilExpiration(dateExpiration) })}
          </Tag>
        </Space>
      ),
    },
    {
      title: t("adminAbonnements.columns.montant"),
      dataIndex: "montant",
      key: "montant",
      render: (montant) => `${parseFloat(montant).toLocaleString()} USD`,
    },
    {
      title: t("adminAbonnements.columns.actions"),
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small">
            <Link to={`/admin/abonnements/${record.id}/details`}>
              {t("adminAbonnements.actions.details")}
            </Link>
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/admin/abonnements/${record.id}/renew`)}
          >
            {t("adminAbonnements.actions.renew")}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <Title level={4}>
            <BellOutlined className="mr-2" />
            {t("adminAbonnements.expiringSoon.title")}
          </Title>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("adminAbonnements.breadcrumb.dashboard")}</Link> },
              { title: t("adminAbonnements.expiringSoon.breadcrumb") },
            ]}
          />
        </div>

        <Alert
          message={t("adminAbonnements.expiringSoon.alert", { days: filters.days })}
          type="warning"
          showIcon
          className="mb-6"
        />

        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-full md:w-1/3">
              <Select
                placeholder={t("adminAbonnements.filters.organization")}
                allowClear
                className="w-full"
                onChange={(value) => handleFilterChange("organizationId", value)}
                options={organizations.map(org => ({
                  value: org.id,
                  label: org.name,
                }))}
              />
            </div>
            <div className="w-full md:w-1/3">
              <Input
                type="number"
                addonBefore={t("adminAbonnements.expiringSoon.daysAddon")}
                placeholder={t("adminAbonnements.expiringSoon.daysPlaceholder")}
                value={filters.days}
                onChange={(e) => handleFilterChange("days", e.target.value)}
                min={1}
              />
            </div>
            <div className="w-full md:w-1/3 text-right">
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={fetchAbonnements}
              >
                {t("adminAbonnements.actions.refresh")}
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <Table
            columns={columns}
            dataSource={abonnements}
            loading={loading}
            rowKey="id"
            pagination={false}
            scroll={{ x: true }}
          />
        </Card>
      </div>
    </div>
  );
};

export default AdminAbonnementsExpiringSoon;
