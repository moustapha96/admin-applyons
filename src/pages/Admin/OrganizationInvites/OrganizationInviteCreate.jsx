/* eslint-disable no-unused-vars */
"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb, Button, Card, Form, Input, message, InputNumber, Space } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import organizationInviteService from "@/services/organizationInviteService";
import { useTranslation } from "react-i18next";

const { TextArea } = Input;

export default function OrganizationInviteCreate() {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const payload = {
        inviteeEmail: values.inviteeEmail,
        inviteeName: values.inviteeName || undefined,
        inviteePhone: values.inviteePhone || undefined,
        inviteeAddress: values.inviteeAddress || undefined,
        expiresInDays: values.expiresInDays || undefined,
      };

      await organizationInviteService.create(payload);
      message.success(t("orgInviteCreate.toasts.created"));
      navigate("/admin/organization-invites");
    } catch (e) {
      if (!e?.errorFields) {
        const errorMessage = e?.response?.data?.message || e?.message || t("orgInviteCreate.toasts.createError");
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("orgInviteCreate.pageTitle")}</h5>
          <Breadcrumb
            items={[
              {
                title: <Link to="/admin/dashboard">{t("orgInviteCreate.breadcrumbs.dashboard")}</Link>,
              },
              {
                title: <Link to="/admin/organization-invites">{t("orgInviteCreate.breadcrumbs.invites")}</Link>,
              },
              { title: t("orgInviteCreate.breadcrumbs.create") },
            ]}
          />
        </div>

        <Card>
          <Form layout="vertical" form={form}>
            <Form.Item
              name="inviteeEmail"
              label={t("orgInviteCreate.fields.inviteeEmail")}
              rules={[
                { required: true, message: t("orgInviteCreate.validators.inviteeEmailRequired") },
                { type: "email", message: t("orgInviteCreate.validators.inviteeEmailInvalid") },
              ]}
            >
              <Input placeholder={t("orgInviteCreate.placeholders.inviteeEmail")} />
            </Form.Item>

            <Form.Item name="inviteeName" label={t("orgInviteCreate.fields.inviteeName")}>
              <Input placeholder={t("orgInviteCreate.placeholders.inviteeName")} />
            </Form.Item>

            <Form.Item name="inviteePhone" label={t("orgInviteCreate.fields.inviteePhone")}>
              <Input placeholder={t("orgInviteCreate.placeholders.inviteePhone")} />
            </Form.Item>

            <Form.Item name="inviteeAddress" label={t("orgInviteCreate.fields.inviteeAddress")}>
              <TextArea rows={2} placeholder={t("orgInviteCreate.placeholders.inviteeAddress")} />
            </Form.Item>

            <Form.Item
              name="expiresInDays"
              label={t("orgInviteCreate.fields.expiresInDays")}
              rules={[
                {
                  type: "number",
                  min: 1,
                  max: 365,
                  message: t("orgInviteCreate.validators.expiresInDaysRange"),
                },
              ]}
            >
              <InputNumber
                min={1}
                max={365}
                placeholder={t("orgInviteCreate.placeholders.expiresInDays")}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={loading}
                  onClick={onSubmit}
                >
                  {t("orgInviteCreate.buttons.save")}
                </Button>
                <Button onClick={() => navigate("/admin/organization-invites")}>
                  {t("orgInviteCreate.buttons.cancel")}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
