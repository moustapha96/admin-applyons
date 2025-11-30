/* eslint-disable react/no-unescaped-entities */
// src/pages/Admin/Abonnements/AdminAbonnementDetails.jsx
/* eslint-disable no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Spin,
  Typography,
  Divider,
  Timeline,
  Modal,
  message,
  Form,
  InputNumber,
  Alert,
  DatePicker,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import abonnementService from "@/services/abonnement.service";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;
const { confirm } = Modal;
const { RangePicker } = DatePicker;

export default function AdminAbonnementDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [abonnement, setAbonnement] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewModalVisible, setRenewModalVisible] = useState(false);
  const [renewForm] = Form.useForm();
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
      const response = await abonnementService.getById(id, {
        withOrg: "true",
        withPayments: "true",
      });
      setAbonnement(response.abonnement);
      setPayments(response.abonnement?.payments || []);
    } catch (error) {
      console.error("Erreur abonnement:", error);
      message.error(t("adminAbonnements.messages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (values) => {
    setLoading(true);
    try {
      const payload = {
        dateDebut: values.periode?.[0]?.format("YYYY-MM-DD"),
        dateExpiration: values.periode?.[1]?.format("YYYY-MM-DD"),
        montant: Number(values.montant),
      };
      const response = await abonnementService.renew(id, payload);
      message.success("Abonnement renouvelé avec succès");
      setRenewModalVisible(false);
      navigate(`/admin/abonnements/${response.abonnement.id}/details`);
    } catch (error) {
      console.error("Erreur renouvellement:", error);
      message.error(
        error?.response?.data?.message ||
          "Échec du renouvellement. Vérifiez les dates et le montant."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    confirm({
      title: t("adminAbonnements.modals.archiveTitle"),
      icon: <ExclamationCircleOutlined />,
      content: t("adminAbonnements.modals.archiveContent"),
      okText: t("adminAbonnements.modals.archiveOk"),
      okType: "danger",
      cancelText: t("adminAbonnements.modals.archiveCancel"),
      onOk: async () => {
        try {
          await abonnementService.softDelete(id);
          message.success(t("adminAbonnements.messages.archiveSuccess"));
          navigate("/admin/abonnements");
        } catch (error) {
          console.error("Erreur archivage:", error);
          message.error(t("adminAbonnements.messages.archiveError"));
        }
      },
    });
  };

  const handleDelete = async () => {
    confirm({
      title: t("adminAbonnements.modals.deleteTitle"),
      icon: <ExclamationCircleOutlined />,
      content: t("adminAbonnements.modals.deleteContent"),
      okText: t("adminAbonnements.modals.deleteOk"),
      okType: "danger",
      cancelText: t("adminAbonnements.modals.deleteCancel"),
      onOk: async () => {
        try {
          await abonnementService.hardDelete(id);
          message.success(t("adminAbonnements.messages.deleteSuccess"));
          navigate("/admin/abonnements");
        } catch (error) {
          console.error("Erreur suppression:", error);
          message.error(t("adminAbonnements.messages.deleteError"));
        }
      },
    });
  };

  const getStatusTag = () => {
    const now = dayjs();
    const start = dayjs(abonnement.dateDebut);
    const end = dayjs(abonnement.dateExpiration);

    if (end.isBefore(now, "day")) return <Tag color="red">{t("adminAbonnements.status.expired")}</Tag>;
    if (start.isBefore(now, "day") && end.isAfter(now, "day"))
      return <Tag color="green">{t("adminAbonnements.status.active")}</Tag>;
    return <Tag color="gold">{t("adminAbonnements.status.coming")}</Tag>;
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
            {t("adminAbonnements.details.title", { id: abonnement.id.substring(0, 8) })}
          </Title>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("adminAbonnements.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/admin/abonnements">{t("adminAbonnements.breadcrumb.abonnements")}</Link> },
              { title: t("adminAbonnements.details.breadcrumb") },
            ]}
          />
        </div>

        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            {t("common.back")}
          </Button>
        </div>

        {/* Infos abonnement */}
        <Card className="mb-6">
          <Descriptions title={t("adminAbonnements.details.info.title")} bordered column={1}>
            <Descriptions.Item label={t("adminAbonnements.details.info.id")}>
              <Text copyable>{abonnement.id}</Text>
            </Descriptions.Item>

            {abonnement.organization && (
              <Descriptions.Item label={t("adminAbonnements.details.info.organization")}>
                <Link to={`/admin/organisations/${abonnement.organization.id}/details`}>
                  {abonnement.organization.name}
                </Link>
              </Descriptions.Item>
            )}

            <Descriptions.Item label={t("adminAbonnements.details.info.period")}>
              <Space>
                <CalendarOutlined />
                {dayjs(abonnement.dateDebut).format("DD/MM/YYYY")} →
                {dayjs(abonnement.dateExpiration).format("DD/MM/YYYY")}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label={t("adminAbonnements.details.info.status")}>{getStatusTag()}</Descriptions.Item>

            <Descriptions.Item label={t("adminAbonnements.details.info.amount")}>
              <Space>
                <DollarOutlined />
                {Number(abonnement.montant).toLocaleString()} {t("adminAbonnements.common.currency")}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label={t("adminAbonnements.details.info.createdAt")}>
              {dayjs(abonnement.createdAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label={t("adminAbonnements.details.info.updatedAt")}>
              {dayjs(abonnement.updatedAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Paiements (facultatif) */}
        {payments.length > 0 && (
          <Card className="mb-6">
            <Title level={5} className="mb-4">
              {t("adminAbonnements.details.payments.title")}
            </Title>
            <Timeline>
              {payments.map((p) => (
                <Timeline.Item
                  key={p.id}
                  color={p.status === "COMPLETED" || p.status === "PAID" ? "green" : "gray"}
                >
                  <Space direction="vertical" size="small">
                    <Text strong>
                      {dayjs(p.createdAt).format("DD/MM/YYYY HH:mm")}
                    </Text>
                    <Text>
                      {t("adminAbonnements.details.payments.line", {
                        amount: p.amount,
                        currency: p.currency,
                        provider: p.provider,
                        ref: p.providerRef || "",
                      })}
                    </Text>
                    <Tag color={p.status === "COMPLETED" || p.status === "PAID" ? "green" : "gold"}>
                      {p.status}
                    </Tag>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <Title level={5} className="mb-4">
            <HistoryOutlined className="mr-2" />
            {t("adminAbonnements.details.actions.title")}
          </Title>
          <Space size="middle">
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => setRenewModalVisible(true)}
            >
              {t("adminAbonnements.actions.renew")}
            </Button>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/admin/abonnements/${id}/edit`)}
            >
              {t("adminAbonnements.actions.edit")}
            </Button>
            {!abonnement.isDeleted ? (
              <Button danger icon={<ExclamationCircleOutlined />} onClick={handleArchive}>
                {t("adminAbonnements.actions.archive")}
              </Button>
            ) : (
              <>
                <Button
                  onClick={() =>
                    abonnementService.restore(id).then(() => {
                      message.success(t("adminAbonnements.messages.restoreSuccess"));
                      fetchAbonnement();
                    })
                  }
                >
                  {t("adminAbonnements.actions.restore")}
                </Button>
                <Button danger onClick={handleDelete}>
                  {t("adminAbonnements.details.actions.deleteForever")}
                </Button>
              </>
            )}
          </Space>
        </Card>

        {/* Modal de renouvellement */}
        <Modal
          title={t("adminAbonnements.renew.modal.title")}
          open={renewModalVisible}
          onCancel={() => setRenewModalVisible(false)}
          footer={null}
          width={600}
          destroyOnClose
        >
          <Form
            form={renewForm}
            layout="vertical"
            onFinish={handleRenew}
            initialValues={{
              periode: [
                dayjs(abonnement.dateExpiration),
                dayjs(abonnement.dateExpiration).add(1, "year"),
              ],
              montant: Number(abonnement.montant),
            }}
          >
            <Alert
              message={t("adminAbonnements.renew.alert.title")}
              description={t("adminAbonnements.renew.alert.description")}
              type="info"
              showIcon
              className="mb-4"
            />

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

            <Divider />
            <Space className="w-full justify-end">
              <Button onClick={() => setRenewModalVisible(false)}>Annuler</Button>
              <Button type="primary" htmlType="submit" icon={<ReloadOutlined />} loading={loading}>
                {loading ? "Renouvellement en cours..." : "Renouveler"}
              </Button>
            </Space>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
