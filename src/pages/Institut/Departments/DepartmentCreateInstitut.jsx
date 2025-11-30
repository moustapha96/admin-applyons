// /* eslint-disable no-unused-vars */
// "use client";

// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Breadcrumb, Button, Card, Form, Input, message } from "antd";
// import { SaveOutlined } from "@ant-design/icons";
// import { useAuth } from "../../../hooks/useAuth";
// import departmentService from "@/services/departmentService";

// export default function DepartmentCreateInstitut() {
//   const { user: me } = useAuth();
//   const orgId = me?.organization?.id;
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const onSubmit = async () => {
//     try {
//       const v = await form.validateFields();
//       setLoading(true);
//       await departmentService.create({                       // POST /departments (organizationId requis) :contentReference[oaicite:5]{index=5}
//         organizationId: orgId,
//         name: v.name,
//         code: v.code || undefined,
//         description: v.description || undefined,
//       });
//       message.success("Département créé");
//       navigate("/organisations/departements");
//     } catch (e) { if (!e?.errorFields) message.error(e?.response?.data?.message || e?.message); }
//     finally { setLoading(false); }
//   };

//   return (
//     <div className="container-fluid relative px-3">
//       <div className="layout-specing">
//         <div className="md:flex justify-between items-center mb-6">
//           <h5 className="text-lg font-semibold">Nouveau département</h5>
//           <Breadcrumb items={[
//             { title: <Link to="/organisations/dashboard">Dashboard</Link> },
//             { title: <Link to="/organisations/departements">Départements</Link> },
//             { title: "Créer" },
//           ]}/>
//         </div>

//         <Card>
//           <Form layout="vertical" form={form}>
//             <Form.Item name="name" label="Nom" rules={[{ required: true }]}><Input /></Form.Item>
//             <Form.Item name="code" label="Code"><Input /></Form.Item>
//             <Form.Item name="description" label="Description"><Input.TextArea rows={3} /></Form.Item>
//             <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={onSubmit}>Enregistrer</Button>
//           </Form>
//         </Card>
//       </div>
//     </div>
//   );
// }
/* eslint-disable no-unused-vars */
"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb, Button, Card, Form, Input, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import departmentService from "@/services/departmentService";
import { useTranslation } from "react-i18next";

export default function DepartmentCreateInstitut() {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const orgId = me?.organization?.id;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async () => {
    try {
      const v = await form.validateFields();
      setLoading(true);
      await departmentService.create({
        organizationId: orgId,
        name: v.name,
        code: v.code || undefined,
        description: v.description || undefined,
      });
      message.success(t("departmentCreateInstitut.toasts.created"));
      navigate("/organisations/departements");
    } catch (e) {
      if (!e?.errorFields) {
        message.error(e?.response?.data?.message || e?.message || t("departmentCreateInstitut.toasts.createError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("departmentCreateInstitut.pageTitle")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("departmentCreateInstitut.breadcrumbs.dashboard")}</Link> },
              { title: <Link to="/organisations/departements">{t("departmentCreateInstitut.breadcrumbs.departments")}</Link> },
              { title: t("departmentCreateInstitut.breadcrumbs.create") },
            ]}
          />
        </div>

        <Card>
          <Form layout="vertical" form={form}>
            <Form.Item
              name="name"
              label={t("departmentCreateInstitut.fields.name")}
              rules={[{ required: true, message: t("departmentCreateInstitut.validators.nameRequired") }]}
            >
              <Input placeholder={t("departmentCreateInstitut.placeholders.name")} />
            </Form.Item>

            <Form.Item name="code" label={t("departmentCreateInstitut.fields.code")}>
              <Input placeholder={t("departmentCreateInstitut.placeholders.code")} />
            </Form.Item>

            <Form.Item name="description" label={t("departmentCreateInstitut.fields.description")}>
              <Input.TextArea rows={3} placeholder={t("departmentCreateInstitut.placeholders.description")} />
            </Form.Item>

            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={onSubmit}
            >
              {t("departmentCreateInstitut.buttons.save")}
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
