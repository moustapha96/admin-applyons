/* eslint-disable react/no-unescaped-entities */
// src/pages/Admin/Abonnements/AdminAbonnementEdit.jsx
/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Form,
  InputNumber,
  Button,
  Select,
  Card,
  Breadcrumb,
  Row,
  Col,
  message,
  DatePicker,
  Spin,
  Alert,
  Typography,
  Descriptions,
  Tag,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import organizationService from "@/services/organizationService";
import abonnementService from "@/services/abonnement.service";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function AdminAbonnementEdit() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [abonnement, setAbonnement] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [fetchingOrgs, setFetchingOrgs] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchAbonnement();
    fetchOrganizations();
  }, [id]);

  const fetchAbonnement = async () => {
    setLoading(true);
    try {
      const response = await abonnementService.getById(id, { withOrg: "true" });
      const abo = response.abonnement;
      setAbonnement(abo);

      form.setFieldsValue({
        organizationId: abo.organizationId,
        periode: [dayjs(abo.dateDebut), dayjs(abo.dateExpiration)],
        montant: Number(abo.montant),
      });
    } catch (error) {
      console.error("Erreur abonnement:", error);
      message.error(t("adminAbonnements.messages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    setFetchingOrgs(true);
    try {
      const response = await organizationService.list({ limit: 1000 });
      setOrganizations(response.organizations || []);
    } catch (error) {
      console.error("Erreur organisations:", error);
      message.error(t("adminAbonnements.messages.orgLoadError"));
    } finally {
      setFetchingOrgs(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        dateDebut: values.periode?.[0]?.format("YYYY-MM-DD"),
        dateExpiration: values.periode?.[1]?.format("YYYY-MM-DD"),
        montant: Number(values.montant),
      };

      const response = await abonnementService.update(id, payload);
      message.success(t("adminAbonnements.edit.messages.success"));
      navigate(`/admin/abonnements/${response.abonnement.id}/details`);
    } catch (error) {
      console.error("Erreur mise à jour:", error);
      message.error(
        error?.response?.data?.message ||
          t("adminAbonnements.edit.messages.error")
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading || !abonnement) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const isExpired = dayjs(abonnement.dateExpiration).isBefore(dayjs(), "day");

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <Title level={4}>
            {t("adminAbonnements.edit.title", { id: abonnement.id.substring(0, 8) })}
          </Title>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("adminAbonnements.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/admin/abonnements">{t("adminAbonnements.breadcrumb.abonnements")}</Link> },
              { title: t("adminAbonnements.edit.breadcrumb") },
            ]}
          />
        </div>

        <Card className="mb-6">
          <Descriptions title={t("adminAbonnements.edit.current.title")} bordered>
            <Descriptions.Item label={t("adminAbonnements.edit.current.organization")} span={2}>
              <Text strong>{abonnement.organization?.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={t("adminAbonnements.edit.current.createdAt")}>
              {dayjs(abonnement.createdAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label={t("adminAbonnements.edit.current.status")}>
              {isExpired ? (
                <Tag color="red">{t("adminAbonnements.status.expired")}</Tag>
              ) : (
                <Tag color="green">{t("adminAbonnements.status.active")}</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card>
          <Alert
            message={t("adminAbonnements.edit.alert.title")}
            description={t("adminAbonnements.edit.alert.description")}
            type="warning"
            showIcon
            className="mb-6"
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              organizationId: abonnement.organizationId,
              periode: [dayjs(abonnement.dateDebut), dayjs(abonnement.dateExpiration)],
              montant: Number(abonnement.montant),
            }}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="organizationId"
                  label={t("adminAbonnements.edit.form.organization.label")}
                  rules={[{ required: true, message: t("adminAbonnements.edit.form.organization.required") }]}
                >
                  <Select
                    placeholder={t("adminAbonnements.edit.form.organization.placeholder")}
                    loading={fetchingOrgs}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      String(option?.children ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    disabled
                  >
                    {organizations.map((org) => (
                      <Option key={org.id} value={org.id}>
                        {org.name} ({org.type})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="periode"
                  label={t("adminAbonnements.edit.form.period.label")}
                  rules={[{ required: true, message: t("adminAbonnements.edit.form.period.required") }]}
                >
                  <RangePicker
                    format="YYYY-MM-DD"
                    className="w-full"
                    disabledDate={(current) => current && current < dayjs().startOf("day")}
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="montant"
                  label={t("adminAbonnements.edit.form.amount.label")}
                  rules={[
                    { required: true, message: t("adminAbonnements.edit.form.amount.required") },
                    { type: "number", min: 0, message: t("adminAbonnements.edit.form.amount.min") },
                  ]}
                >
                  <InputNumber
                    min={0}
                    step={100}
                    className="w-full"
                    addonAfter={t("adminAbonnements.common.currency")}
                    prefix={<DollarOutlined />}
                  />
                </Form.Item>
              </Col>

              <Col span={24} className="text-right mt-6">
                <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
                  {t("common.cancel")}
                </Button>
                <Button
                  className="ml-2"
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  {loading
                    ? t("adminAbonnements.edit.form.submit.loading")
                    : t("adminAbonnements.edit.form.submit.label")}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </div>
  );
}
