// /* eslint-disable no-unused-vars */
// "use client";

// import { useEffect, useState } from "react";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import { Breadcrumb, Button, Card, Form, Input, Select, Spin, message } from "antd";
// import { SaveOutlined } from "@ant-design/icons";
// import filiereService from "@/services/filiereService";

// export default function FiliereEditInstitut() {
//   const { id } = useParams();
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await filiereService.getById(id);       // GET /filieres/:id :contentReference[oaicite:16]{index=16}
//         const f = res?.filiere;
//         form.setFieldsValue({
//           name: f.name, code: f.code || "", description: f.description || "",
//           level: f.level || undefined,
//         });
//       } catch { message.error("Erreur de chargement"); }
//       finally { setLoading(false); }
//     })();
//   }, [id]);

//   const onSubmit = async () => {
//     try {
//       const v = await form.validateFields();
//       setLoading(true);
//       await filiereService.update(id, {                  // PUT /filieres/:id :contentReference[oaicite:17]{index=17}
//         name: v.name, code: v.code || null, description: v.description || null, level: v.level || null,
//       });
//       message.success("Mise à jour effectuée");
//       navigate(`/organisations/filieres/${id}`);
//     } catch (e) { if (!e?.errorFields) message.error(e?.response?.data?.message || e?.message); }
//     finally { setLoading(false); }
//   };

//   if (loading) return <Spin />;

//   return (
//     <div className="container-fluid relative px-3">
//       <div className="layout-specing">
//         <div className="md:flex justify-between items-center mb-6">
//           <h5 className="text-lg font-semibold">Modifier la filière</h5>
//           <Breadcrumb items={[
//             { title: <Link to="/organisations/dashboard">Dashboard</Link> },
//             { title: <Link to="/organisations/filieres">Filières</Link> },
//             { title: "Modifier" },
//           ]}/>
//         </div>

//         <Card>
//           <Form layout="vertical" form={form}>
//             <Form.Item name="name" label="Nom" rules={[{ required: true }]}><Input /></Form.Item>
//             <Form.Item name="code" label="Code"><Input /></Form.Item>
//             <Form.Item name="level" label="Niveau">
//               <Select allowClear options={[{value:"Licence",label:"Licence"},{value:"Master",label:"Master"},{value:"Doctorat",label:"Doctorat"}]} />
//             </Form.Item>
//             <Form.Item name="description" label="Description"><Input.TextArea rows={3} /></Form.Item>
//             <Button type="primary" icon={<SaveOutlined />} onClick={onSubmit}>Enregistrer</Button>
//           </Form>
//         </Card>
//       </div>
//     </div>
//   );
// }
/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Breadcrumb, Button, Card, Form, Input, Select, Spin, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import filiereService from "@/services/filiereService";
import { useTranslation } from "react-i18next";

export default function FiliereEditInstitut() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await filiereService.getById(id); // GET /filieres/:id
        const f = res?.filiere;
        form.setFieldsValue({
          name: f?.name,
          code: f?.code || "",
          description: f?.description || "",
          level: f?.level || undefined
        });
      } catch {
        message.error(t("filiereEditInstitut.toasts.loadError"));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async () => {
    try {
      const v = await form.validateFields();
      setLoading(true);
      await filiereService.update(id, {
        name: v.name,
        code: v.code || null,
        description: v.description || null,
        level: v.level || null
      });
      message.success(t("filiereEditInstitut.toasts.updated"));
      navigate(`/organisations/filieres/${id}`);
    } catch (e) {
      if (!e?.errorFields) {
        message.error(e?.response?.data?.message || e?.message || t("filiereEditInstitut.toasts.updateError"));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin />;

  const LEVEL_OPTIONS = [
    { value: "Licence", label: t("filiereEditInstitut.levels.licence") },
    { value: "Master", label: t("filiereEditInstitut.levels.master") },
    { value: "Doctorat", label: t("filiereEditInstitut.levels.doctorat") }
  ];

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("filiereEditInstitut.pageTitle")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("filiereEditInstitut.breadcrumbs.dashboard")}</Link> },
              { title: <Link to="/organisations/filieres">{t("filiereEditInstitut.breadcrumbs.filieres")}</Link> },
              { title: t("filiereEditInstitut.breadcrumbs.edit") }
            ]}
          />
        </div>

        <Card>
          <Form layout="vertical" form={form}>
            <Form.Item
              name="name"
              label={t("filiereEditInstitut.fields.name")}
              rules={[{ required: true, message: t("filiereEditInstitut.validators.nameRequired") }]}
            >
              <Input placeholder={t("filiereEditInstitut.placeholders.name")} />
            </Form.Item>

            <Form.Item name="code" label={t("filiereEditInstitut.fields.code")}>
              <Input placeholder={t("filiereEditInstitut.placeholders.code")} />
            </Form.Item>

            <Form.Item name="level" label={t("filiereEditInstitut.fields.level")}>
              <Select
                allowClear
                placeholder={t("filiereEditInstitut.placeholders.level")}
                options={LEVEL_OPTIONS}
              />
            </Form.Item>

            <Form.Item name="description" label={t("filiereEditInstitut.fields.description")}>
              <Input.TextArea rows={3} placeholder={t("filiereEditInstitut.placeholders.description")} />
            </Form.Item>

            <Button type="primary" icon={<SaveOutlined />} onClick={onSubmit}>
              {t("filiereEditInstitut.buttons.save")}
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
