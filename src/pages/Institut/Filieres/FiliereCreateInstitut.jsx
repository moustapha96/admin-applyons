// /* eslint-disable no-unused-vars */
// "use client";

// import { useEffect, useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { Breadcrumb, Button, Card, Form, Input, Select, message } from "antd";
// import { SaveOutlined } from "@ant-design/icons";
// import { useAuth } from "../../../hooks/useAuth";
// import filiereService from "@/services/filiereService";
// import departmentService from "@/services/departmentService";

// export default function FiliereCreateInstitut() {
//   const { user: me } = useAuth();
//   const orgId = me?.organization?.id;
//   const [form] = Form.useForm();
//   const [deps, setDeps] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const qs = new URLSearchParams(useLocation().search);
//   const prefillDepartmentId = qs.get("departmentId") || undefined;

//   useEffect(() => {
//     (async () => {
//       const res = await departmentService.list({ page: 1, limit: 200, organizationId: orgId }); // deps org :contentReference[oaicite:14]{index=14}
//       setDeps(res?.departments || []);
//       if (prefillDepartmentId) form.setFieldsValue({ departmentId: prefillDepartmentId });
//     })();
//   }, [orgId, prefillDepartmentId]);

//   const onSubmit = async () => {
//     try {
//       const v = await form.validateFields();
//       setLoading(true);
//       await filiereService.create({              // POST /filieres (departmentId requis) :contentReference[oaicite:15]{index=15}
//         departmentId: v.departmentId,
//         name: v.name,
//         code: v.code || undefined,
//         description: v.description || undefined,
//         level: v.level || undefined,
//       });
//       message.success("Filière créée");
//       navigate("/organisations/filieres");
//     } catch (e) { if (!e?.errorFields) message.error(e?.response?.data?.message || e?.message); }
//     finally { setLoading(false); }
//   };

//   return (
//     <div className="container-fluid relative px-3">
//       <div className="layout-specing">
//         <div className="md:flex justify-between items-center mb-6">
//           <h5 className="text-lg font-semibold">Nouvelle filière</h5>
//           <Breadcrumb items={[
//             { title: <Link to="/organisations/dashboard">Dashboard</Link> },
//             { title: <Link to="/organisations/filieres">Filières</Link> },
//             { title: "Créer" },
//           ]}/>
//         </div>

//         <Card>
//           <Form layout="vertical" form={form}>
//             <Form.Item name="departmentId" label="Département" rules={[{ required: true, message: "Choisir le département" }]}>
//               <Select placeholder="Sélectionner un département" options={deps.map(d => ({ value: d.id, label: d.name }))} />
//             </Form.Item>
//             <Form.Item name="name" label="Nom" rules={[{ required: true }]}><Input /></Form.Item>
//             <Form.Item name="code" label="Code"><Input /></Form.Item>
//             <Form.Item name="level" label="Niveau">
//               <Select allowClear options={[{value:"Licence",label:"Licence"},{value:"Master",label:"Master"},{value:"Doctorat",label:"Doctorat"}]} />
//             </Form.Item>
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

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Breadcrumb, Button, Card, Form, Input, Select, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import filiereService from "@/services/filiereService";
import departmentService from "@/services/departmentService";
import { useTranslation } from "react-i18next";

export default function FiliereCreateInstitut() {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const orgId = me?.organization?.id;

  const [form] = Form.useForm();
  const [deps, setDeps] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const qs = new URLSearchParams(useLocation().search);
  const prefillDepartmentId = qs.get("departmentId") || undefined;

  useEffect(() => {
    (async () => {
      try {
        const res = await departmentService.list({ page: 1, limit: 200, organizationId: orgId });
        setDeps(res?.departments || []);
        if (prefillDepartmentId) form.setFieldsValue({ departmentId: prefillDepartmentId });
      } catch {
        message.error(t("filiereCreateInstitut.toasts.depsLoadError"));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, prefillDepartmentId]);

  const onSubmit = async () => {
    try {
      const v = await form.validateFields();
      setLoading(true);
      await filiereService.create({
        departmentId: v.departmentId,
        name: v.name,
        code: v.code || undefined,
        description: v.description || undefined,
        level: v.level || undefined
      });
      message.success(t("filiereCreateInstitut.toasts.created"));
      navigate("/organisations/filieres");
    } catch (e) {
      if (!e?.errorFields) {
        message.error(e?.response?.data?.message || e?.message || t("filiereCreateInstitut.toasts.createError"));
      }
    } finally {
      setLoading(false);
    }
  };

  const LEVEL_OPTIONS = [
    { value: "Licence", label: t("filiereCreateInstitut.levels.licence") },
    { value: "Master", label: t("filiereCreateInstitut.levels.master") },
    { value: "Doctorat", label: t("filiereCreateInstitut.levels.doctorat") }
  ];

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("filiereCreateInstitut.pageTitle")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("filiereCreateInstitut.breadcrumbs.dashboard")}</Link> },
              { title: <Link to="/organisations/filieres">{t("filiereCreateInstitut.breadcrumbs.filieres")}</Link> },
              { title: t("filiereCreateInstitut.breadcrumbs.create") }
            ]}
          />
        </div>

        <Card>
          <Form layout="vertical" form={form}>
            <Form.Item
              name="departmentId"
              label={t("filiereCreateInstitut.fields.department")}
              rules={[{ required: true, message: t("filiereCreateInstitut.validators.departmentRequired") }]}
            >
              <Select
                placeholder={t("filiereCreateInstitut.placeholders.selectDepartment")}
                options={deps.map((d) => ({ value: d.id, label: d.name }))}
              />
            </Form.Item>

            <Form.Item
              name="name"
              label={t("filiereCreateInstitut.fields.name")}
              rules={[{ required: true, message: t("filiereCreateInstitut.validators.nameRequired") }]}
            >
              <Input placeholder={t("filiereCreateInstitut.placeholders.name")} />
            </Form.Item>

            <Form.Item name="code" label={t("filiereCreateInstitut.fields.code")}>
              <Input placeholder={t("filiereCreateInstitut.placeholders.code")} />
            </Form.Item>

            <Form.Item name="level" label={t("filiereCreateInstitut.fields.level")}>
              <Select allowClear placeholder={t("filiereCreateInstitut.placeholders.level")} options={LEVEL_OPTIONS} />
            </Form.Item>

            <Form.Item name="description" label={t("filiereCreateInstitut.fields.description")}>
              <Input.TextArea rows={3} placeholder={t("filiereCreateInstitut.placeholders.description")} />
            </Form.Item>

            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={onSubmit}
            >
              {t("filiereCreateInstitut.buttons.save")}
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
