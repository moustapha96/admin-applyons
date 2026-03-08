"use client";

import { useState } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  message,
  Breadcrumb,
  Typography,
  Alert,
} from "antd";
import { SendOutlined, BellOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { sendBroadcastNotification } from "../../../services/notificationService";

const { TextArea } = Input;
const { Title, Text } = Typography;

const AUDIENCE_OPTIONS = [
  { value: "ALL_DEMANDEURS", labelKey: "adminSendNotification.audience.allDemandeurs" },
  { value: "ALL_INSTITUTS", labelKey: "adminSendNotification.audience.allInstituts" },
  { value: "BY_ORG_TYPE", labelKey: "adminSendNotification.audience.byOrgType" },
];

const ORG_TYPE_OPTIONS = [
  "INSTITUT",
  "COLLEGE",
  "BANQUE",
  "UNIVERSITE",
  "LYCEE",
  "ENTREPRISE",
  "TRADUCTEUR",
];

export default function AdminSendNotification() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const audience = Form.useWatch("audience", form);
  const showOrgType = audience === "BY_ORG_TYPE";

  const onFinish = async (values) => {
    setLoading(true);
    setLastResult(null);
    try {
      const payload = {
        audience: values.audience,
        title: (values.title || "").trim(),
        message: (values.message || "").trim(),
      };
      if (values.audience === "BY_ORG_TYPE" && values.orgType) {
        payload.orgType = values.orgType;
      }
      const result = await sendBroadcastNotification(payload);
      const sentCount = result?.sentCount ?? result?.data?.sentCount ?? 0;
      setLastResult(typeof result === "object" && result ? { ...result, sentCount: result.sentCount ?? sentCount } : { success: true, sentCount: 0, audience: payload.audience });
      message.success(
        t("adminSendNotification.success", { count: sentCount })
      );
      form.resetFields();
    } catch (err) {
      const msg =
        err?.message || err?.response?.data?.message || t("adminSendNotification.error");
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Breadcrumb
        items={[
          { title: <Link to="/admin">{t("adminSendNotification.breadcrumb.admin")}</Link> },
          { title: t("adminSendNotification.breadcrumb.send") },
        ]}
        className="mb-4"
      />
      <Card className="shadow-sm dark:bg-slate-800/50 dark:border-slate-700">
        <Title level={4} className="flex items-center gap-2 mb-4">
          <BellOutlined />
          {t("adminSendNotification.title")}
        </Title>
        <Text type="secondary" className="block mb-4">
          {t("adminSendNotification.description")}
        </Text>

        {lastResult && (
          <Alert
            type="success"
            message={t("adminSendNotification.lastSent", {
              count: lastResult.sentCount,
              audience: lastResult.audience,
            })}
            className="mb-4"
            showIcon
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ audience: "ALL_DEMANDEURS" }}
        >
          <Form.Item
            name="audience"
            label={t("adminSendNotification.fields.audience")}
            rules={[{ required: true, message: t("adminSendNotification.required.audience") }]}
          >
            <Select
              placeholder={t("adminSendNotification.placeholders.audience")}
              options={AUDIENCE_OPTIONS.map((o) => ({
                value: o.value,
                label: t(o.labelKey),
              }))}
            />
          </Form.Item>

          {showOrgType && (
            <Form.Item
              name="orgType"
              label={t("adminSendNotification.fields.orgType")}
              rules={[
                {
                  required: true,
                  message: t("adminSendNotification.required.orgType"),
                },
              ]}
            >
              <Select
                placeholder={t("adminSendNotification.placeholders.orgType")}
                options={ORG_TYPE_OPTIONS.map((type) => ({
                  value: type,
                  label: t(`adminSendNotification.orgTypes.${type}`, type),
                }))}
              />
            </Form.Item>
          )}

          <Form.Item
            name="title"
            label={t("adminSendNotification.fields.title")}
            rules={[{ required: true, message: t("adminSendNotification.required.title") }]}
          >
            <Input
              placeholder={t("adminSendNotification.placeholders.title")}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="message"
            label={t("adminSendNotification.fields.message")}
            rules={[{ required: true, message: t("adminSendNotification.required.message") }]}
          >
            <TextArea
              placeholder={t("adminSendNotification.placeholders.message")}
              rows={5}
              maxLength={2000}
              showCount
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SendOutlined />}
            >
              {t("adminSendNotification.submit")}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
