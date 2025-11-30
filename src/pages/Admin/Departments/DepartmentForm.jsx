// src/pages/Admin/Departments/DepartmentForm.jsx
/* eslint-disable react/prop-types */
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Breadcrumb, Button, Card, Form, Input, Select, Space, message } from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";

import departmentService from "@/services/departmentService";
import organizationService from "@/services/organizationService";
import { useOrgScope } from "@/hooks/useOrgScope";        // doit renvoyer { isAdmin, organizationId, organizationName? }
import { useAuth } from "@/hooks/useAuth";                // fallback pour récupérer le nom de l’orga

const BASE_PATH = "/admin/departments";

export default function DepartmentForm({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams(); // utilisé en mode "edit"

  const { isAdmin, organizationId: scopedOrgId } = useOrgScope?.() ?? { isAdmin: true, organizationId: undefined };
  const { user } = useAuth();

  const [form] = Form.useForm();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(mode === "edit");

  // Nom d’orga en lecture seule pour non-admin
  const readonlyOrgName = useMemo(() => {
    return user?.organization?.name || "Votre organisation";
  }, [user]);

  // Charger la liste des organisations (ADMIN)
  const loadOrgs = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await organizationService.list({ limit: 500, sortBy: "name", sortOrder: "asc" });
      setOrgs(res?.organizations ?? []);
    } catch (e) {
      message.error(e?.response?.data?.message || "Erreur chargement organisations");
    }
  }, [isAdmin]);

  useEffect(() => { loadOrgs(); }, [loadOrgs]);

  // Précharger les données en édition
  useEffect(() => {
    if (mode === "edit" && id) {
      (async () => {
        try {
          const res = await departmentService.getById(id);
          const d = res?.department || res;
          form.setFieldsValue({
            organizationId: d.organizationId,
            name: d.name,
            code: d.code || "",
            description: d.description || "",
          });
        } catch (e) {
          message.error(e?.response?.data?.message || "Impossible de charger le département");
        } finally {
          setLoading(false);
        }
      })();
    } else {
      // création : si non-admin, forcer organizationId au scope
      if (!isAdmin && scopedOrgId) {
        form.setFieldsValue({ organizationId: scopedOrgId });
      }
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, id, isAdmin, scopedOrgId]);

  const submit = async (values) => {
    try {
      const payload = {
        organizationId: isAdmin ? values.organizationId : scopedOrgId,
        name: values.name?.trim(),
        code: values.code || undefined,
        description: values.description || undefined,
      };

      if (!payload.organizationId) {
        message.error("Organisation requise");
        return;
      }

      if (mode === "create") {
        await departmentService.create(payload);
        message.success("Département créé");
      } else {
        await departmentService.update(id, payload);
        message.success("Département mis à jour");
      }
      navigate(`${BASE_PATH}`);
    } catch (e) {
      const msg = e?.response?.data?.message;
      if (e?.response?.status === 409) {
        message.error(msg || "Un département du même nom existe déjà");
      } else {
        message.error(msg || "Échec de sauvegarde");
      }
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Départements</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">Dashboard</Link> },
              { title: <Link to={BASE_PATH}>Départements</Link> },
              { title: mode === "create" ? "Nouveau" : "Modifier" },
            ]}
          />
        </div>

        <Card title={mode === "create" ? "Nouveau département" : "Modifier le département"} loading={loading}>
          <Form layout="vertical" form={form} onFinish={submit}>
            {isAdmin ? (
              <Form.Item
                label="Organisation"
                name="organizationId"
                rules={[{ required: true, message: "Organisation requise" }]}
              >
                <Select
                  showSearch
                  placeholder="Choisir l'organisation"
                  optionFilterProp="label"
                  options={orgs.map((o) => ({ value: o.id, label: `${o.name} — ${o.type}` }))}
                />
              </Form.Item>
            ) : (
              <>
                {/* affichage lecture seule du nom d’orga */}
                <Form.Item label="Organisation">
                  <Input value={readonlyOrgName} disabled />
                </Form.Item>
                {/* garder organizationId dans le form state pour submit */}
                <Form.Item name="organizationId" hidden initialValue={scopedOrgId}>
                  <Input type="hidden" />
                </Form.Item>
              </>
            )}

            <Form.Item label="Nom" name="name" rules={[{ required: true, message: "Nom requis" }]}>
              <Input placeholder="Ex. Département Informatique" />
            </Form.Item>

            <Form.Item label="Code" name="code">
              <Input placeholder="Ex. INFO" />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input.TextArea rows={4} placeholder="Description du département (optionnel)" />
            </Form.Item>

            <Space>
              <Button onClick={() => navigate(-1)}>Annuler</Button>
              <Button type="primary" htmlType="submit">
                Enregistrer
              </Button>
            </Space>
          </Form>
        </Card>
      </div>
    </div>
  );
}
