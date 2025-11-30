// /* eslint-disable no-unused-vars */
// "use client";

// import { useEffect, useState } from "react";
// import { Link, useParams, useNavigate } from "react-router-dom";
// import { Breadcrumb, Button, Card, Descriptions, Tag, message, Popconfirm } from "antd";
// import filiereService from "@/services/filiereService";
// import dayjs from "dayjs";

// export default function FiliereDetailInstitut() {
//   const { id } = useParams();
//   const [f, setF] = useState(null);
//   const navigate = useNavigate();

//   const load = async () => {
//     try {
//       const res = await filiereService.getById(id);     // détail filière (avec department) :contentReference[oaicite:18]{index=18}
//       setF(res?.filiere || null);
//     } catch { message.error("Erreur de chargement"); }
//   };

//   useEffect(() => { load(); }, [id]);

//   const remove = async () => {
//     try { await filiereService.remove(id); message.success("Supprimée"); navigate("/organisations/filieres"); }
//     catch (e) { message.error(e?.response?.data?.message || e?.message); }
//   };

//   if (!f) return null;

//   return (
//     <div className="container-fluid relative px-3">
//       <div className="layout-specing">
//         <div className="md:flex justify-between items-center mb-6">
//           <h5 className="text-lg font-semibold">Filière</h5>
//           <Breadcrumb items={[
//             { title: <Link to="/organisations/dashboard">Dashboard</Link> },
//             { title: <Link to="/organisations/filieres">Filières</Link> },
//             { title: f.name },
//           ]}/>
//         </div>

//         <div className="mb-4 flex gap-2">
//           <Link to={`/organisations/filieres/${id}/edit`}><Button type="primary">Modifier</Button></Link>
//           <Popconfirm title="Supprimer cette filière ?" onConfirm={remove}><Button danger>Supprimer</Button></Popconfirm>
//         </div>

//         <Card title="Informations">
//           <Descriptions bordered column={1} size="small">
//             <Descriptions.Item label="Nom">{f.name}</Descriptions.Item>
//             <Descriptions.Item label="Code">{f.code || "—"}</Descriptions.Item>
//             <Descriptions.Item label="Niveau"><Tag>{f.level || "—"}</Tag></Descriptions.Item>
//             <Descriptions.Item label="Département">{f.department?.name}</Descriptions.Item>
//             <Descriptions.Item label="Description">{f.description || "—"}</Descriptions.Item>
//             <Descriptions.Item label="Créée le">{dayjs(f.createdAt).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
//           </Descriptions>
//         </Card>
//       </div>
//     </div>
//   );
// }
/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Breadcrumb, Button, Card, Descriptions, Tag, message, Popconfirm } from "antd";
import filiereService from "@/services/filiereService";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

export default function FiliereDetailInstitut() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [f, setF] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await filiereService.getById(id);
      setF(res?.filiere || null);
    } catch {
      message.error(t("filiereDetailInstitut.messages.loadError"));
    }
  };

  useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [id]);

  const remove = async () => {
    try {
      await filiereService.remove(id);
      message.success(t("filiereDetailInstitut.messages.deleted"));
      navigate("/organisations/filieres");
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("filiereDetailInstitut.messages.deleteError"));
    }
  };

  if (!f) return null;

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("filiereDetailInstitut.pageTitle")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("filiereDetailInstitut.breadcrumbs.dashboard")}</Link> },
              { title: <Link to="/organisations/filieres">{t("filiereDetailInstitut.breadcrumbs.filieres")}</Link> },
              { title: f.name }
            ]}
          />
        </div>

        <div className="mb-4 flex gap-2">
          <Link to={`/organisations/filieres/${id}/edit`}>
            <Button type="primary">{t("filiereDetailInstitut.buttons.edit")}</Button>
          </Link>
          <Popconfirm title={t("filiereDetailInstitut.buttons.confirmDeleteTitle")} onConfirm={remove}>
            <Button danger>{t("filiereDetailInstitut.buttons.delete")}</Button>
          </Popconfirm>
        </div>

        <Card title={t("filiereDetailInstitut.cards.infoTitle")}>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label={t("filiereDetailInstitut.fields.name")}>{f.name}</Descriptions.Item>
            <Descriptions.Item label={t("filiereDetailInstitut.fields.code")}>{f.code || "—"}</Descriptions.Item>
            <Descriptions.Item label={t("filiereDetailInstitut.fields.level")}><Tag>{f.level || "—"}</Tag></Descriptions.Item>
            <Descriptions.Item label={t("filiereDetailInstitut.fields.department")}>{f.department?.name}</Descriptions.Item>
            <Descriptions.Item label={t("filiereDetailInstitut.fields.description")}>{f.description || "—"}</Descriptions.Item>
            <Descriptions.Item label={t("filiereDetailInstitut.fields.createdAt")}>
              {dayjs(f.createdAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
}
