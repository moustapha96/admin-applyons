/* eslint-disable react/no-unescaped-entities */
// src/pages/Admin/Abonnements/AdminAbonnementRenew.jsx
/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Form,
  InputNumber,
  Button,
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
} from "antd";
import { ArrowLeftOutlined, DollarOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import abonnementService from "@/services/abonnement.service";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function AdminAbonnementRenew() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [abonnement, setAbonnement] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchAbonnement();
  }, [id]);

  const fetchAbonnement = async () => {
    setLoading(true);
    try {
      const response = await abonnementService.getById(id, { withOrg: "true" });
      const abo = response.abonnement;
      setAbonnement(abo);

      form.setFieldsValue({
        periode: [dayjs(abo.dateExpiration), dayjs(abo.dateExpiration).add(1, "year")],
        montant: Number(abo.montant),
      });
    } catch (error) {
      console.error("Erreur abonnement:", error);
      message.error(t("adminAbonnements.messages.loadError"));
    } finally {
      setLoading(false);
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

      const response = await abonnementService.renew(id, payload);
      message.success(t("adminAbonnements.renew.messages.success"));
      navigate(`/admin/abonnements/${response.abonnement.id}/details`);
    } catch (error) {
      console.error("Erreur renouvellement:", error);
      message.error(
        error?.response?.data?.message ||
          t("adminAbonnements.renew.messages.error")
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

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <Title level={4}>
            {t("adminAbonnements.renew.title", { id: abonnement.id.substring(0, 8) })}
          </Title>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("adminAbonnements.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/admin/abonnements">{t("adminAbonnements.breadcrumb.abonnements")}</Link> },
              { title: t("adminAbonnements.renew.breadcrumb") },
            ]}
          />
        </div>

        <Card className="mb-6">
          <Descriptions title={t("adminAbonnements.renew.current.title")} bordered>
            <Descriptions.Item label={t("adminAbonnements.renew.current.organization")} span={2}>
              <Text>{abonnement.organization?.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={t("adminAbonnements.renew.current.period")}>
              {dayjs(abonnement.dateDebut).format("DD/MM/YYYY")} →
              {dayjs(abonnement.dateExpiration).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label={t("adminAbonnements.renew.current.amount")}>
              {Number(abonnement.montant).toLocaleString()} {t("adminAbonnements.common.currency")}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card>
          <Alert
            message={t("adminAbonnements.renew.alert.title")}
            description={t("adminAbonnements.renew.alert.description")}
            type="info"
            showIcon
            className="mb-6"
          />

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="periode"
                  label={t("adminAbonnements.renew.form.period.label")}
                  rules={[{ required: true, message: t("adminAbonnements.renew.form.period.required") }]}
                >
                  <RangePicker
                    format="YYYY-MM-DD"
                    className="w-full"
                    disabledDate={(current) =>
                      current && current < dayjs(abonnement.dateExpiration).startOf("day")
                    }
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="montant"
                  label={t("adminAbonnements.renew.form.amount.label")}
                  rules={[
                    { required: true, message: t("adminAbonnements.renew.form.amount.required") },
                    { type: "number", min: 0, message: t("adminAbonnements.renew.form.amount.min") },
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
                  icon={<ReloadOutlined />}
                  loading={loading}
                >
                  {loading
                    ? t("adminAbonnements.renew.form.submit.loading")
                    : t("adminAbonnements.renew.form.submit.label")}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </div>
  );
}
