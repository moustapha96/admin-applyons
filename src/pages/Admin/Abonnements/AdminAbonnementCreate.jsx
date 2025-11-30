/* eslint-disable react/no-unescaped-entities */
// src/pages/Admin/Abonnements/AdminAbonnementCreate.jsx
/* eslint-disable no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Alert,
  Typography,
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

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function AdminAbonnementCreate() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [fetchingOrgs, setFetchingOrgs] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchOrganizations();
  }, []);

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
        organizationId: values.organizationId,
        dateDebut: values.periode?.[0]?.format("YYYY-MM-DD"),
        dateExpiration: values.periode?.[1]?.format("YYYY-MM-DD"),
        montant: Number(values.montant),
      };

      const response = await abonnementService.create(payload);
      message.success(t("adminAbonnements.create.messages.success"));
      navigate(`/admin/abonnements/${response.abonnement.id}/details`);
    } catch (error) {
      console.error("Erreur création abonnement:", error);
      message.error(
        error?.response?.data?.message ||
          t("adminAbonnements.create.messages.error")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <Title level={4}>{t("adminAbonnements.create.title")}</Title>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("adminAbonnements.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/admin/abonnements">{t("adminAbonnements.breadcrumb.abonnements")}</Link> },
              { title: t("adminAbonnements.create.breadcrumb") },
            ]}
          />
        </div>

        <Card>
          <Alert
            message={t("adminAbonnements.create.alert.title")}
            description={t("adminAbonnements.create.alert.description")}
            type="info"
            showIcon
            className="mb-6"
          />

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="organizationId"
                  label={t("adminAbonnements.create.form.organization.label")}
                  rules={[{ required: true, message: t("adminAbonnements.create.form.organization.required") }]}
                >
                  <Select
                    placeholder={t("adminAbonnements.create.form.organization.placeholder")}
                    loading={fetchingOrgs}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      String(option?.children ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {organizations.map((org) => (
                      <Select.Option key={org.id} value={org.id}>
                        {org.name} ({org.type})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="periode"
                  label={t("adminAbonnements.create.form.period.label")}
                  rules={[{ required: true, message: t("adminAbonnements.create.form.period.required") }]}
                >
                  <RangePicker
                    format="YYYY-MM-DD"
                    className="w-full"
                    disabledDate={(current) =>
                      current && current < dayjs().startOf("day")
                    }
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="montant"
                  label={t("adminAbonnements.create.form.amount.label")}
                  rules={[
                    { required: true, message: t("adminAbonnements.create.form.amount.required") },
                    { type: "number", min: 0, message: t("adminAbonnements.create.form.amount.min") },
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
                    ? t("adminAbonnements.create.form.submit.loading")
                    : t("adminAbonnements.create.form.submit.label")}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </div>
  );
}
