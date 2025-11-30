"use client";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb, Button, Card, Form, Input, InputNumber, Select, DatePicker, message, Row, Col, Space } from "antd";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import transactionService from "../../../services/transactionService";


export default function AdminTransactionCreate() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (vals) => {
    try {
      setSaving(true);
      const payload = {
        demandePartageId: vals.demandePartageId,
        userId: vals.userId || undefined,
        montant: vals.montant,
        typePaiement: vals.typePaiement,
        typeTransaction: vals.typeTransaction || undefined,
        statut: vals.statut || "PENDING",
        dateTransaction: vals.dateTransaction ? vals.dateTransaction.toISOString() : undefined, // si tu gères côté back
      };
      const res = await transactionService.create(payload);
      const created = res?.transaction || res;
      message.success(t("adminTransactionCreate.messages.success"));
      navigate(`/admin/transactions/${created.id}/details`);
    } catch (e) {
      message.error(e?.response?.data?.message || t("adminTransactionCreate.messages.error"));
    } finally { setSaving(false); }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("adminTransactionCreate.title")}</h5>
          <Breadcrumb items={[
            { title: <Link to="/admin/dashboard">{t("adminTransactionCreate.breadcrumb.dashboard")}</Link> },
            { title: <Link to="/admin/transactions">{t("adminTransactionCreate.breadcrumb.transactions")}</Link> },
            { title: t("adminTransactionCreate.breadcrumb.create") },
          ]}/>
        </div>

        <Card>
          <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ statut: "PENDING" }}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label={t("adminTransactionCreate.form.demandePartageId")} name="demandePartageId" rules={[{ required: true, message: t("adminTransactionCreate.form.demandePartageIdRequired") }]}>
                  <Input placeholder={t("adminTransactionCreate.form.demandePartageIdPlaceholder")} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label={t("adminTransactionCreate.form.userId")} name="userId">
                  <Input placeholder={t("adminTransactionCreate.form.userIdPlaceholder")} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item label={t("adminTransactionCreate.form.montant")} name="montant" rules={[{ required: true, message: t("adminTransactionCreate.form.montantRequired") }]}>
                  <InputNumber min={0} className="w-full" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label={t("adminTransactionCreate.form.typePaiement")} name="typePaiement" rules={[{ required: true, message: t("adminTransactionCreate.form.typePaiementRequired") }]}>
                  <Select
                    options={[
                      { value: "STRIPE", label: t("adminTransactionCreate.form.paymentTypes.STRIPE") },
                      { value: "PAYPAL", label: t("adminTransactionCreate.form.paymentTypes.PAYPAL") },
                      { value: "CASH", label: t("adminTransactionCreate.form.paymentTypes.CASH") },
                      { value: "WIRE", label: t("adminTransactionCreate.form.paymentTypes.WIRE") },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label={t("adminTransactionCreate.form.typeTransaction")} name="typeTransaction">
                  <Input placeholder={t("adminTransactionCreate.form.typeTransactionPlaceholder")} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item label={t("adminTransactionCreate.form.statut")} name="statut">
                  <Select
                    options={[
                      { value: "PENDING", label: t("adminTransactionCreate.form.statusTypes.PENDING") },
                      { value: "COMPLETED", label: t("adminTransactionCreate.form.statusTypes.COMPLETED") },
                      { value: "FAILED", label: t("adminTransactionCreate.form.statusTypes.FAILED") },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label={t("adminTransactionCreate.form.dateTransaction")} name="dateTransaction">
                  <DatePicker className="w-full" disabledDate={(d)=> d && d > dayjs()} />
                </Form.Item>
              </Col>
            </Row>

            <Space>
              <Button onClick={()=> navigate(-1)}>{t("adminTransactionCreate.actions.cancel")}</Button>
              <Button type="primary" htmlType="submit" loading={saving}>{t("adminTransactionCreate.actions.create")}</Button>
            </Space>
          </Form>
        </Card>
      </div>
    </div>
  );
}
