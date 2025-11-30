// /* eslint-disable no-unused-vars */
// "use client";
// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import { Button, Card, Descriptions, Space, Tag, Typography, Divider, Breadcrumb } from "antd";
// import demandeService from "@/services/demandeService";
// import dayjs from "dayjs";

// const { Title } = Typography;

// export default function DemandeurDemandeDetail() {
//   const { demandeId } = useParams();
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       const res = await demandeService.getById(demandeId);
//       console.log(res)
//       setData(res);
//       setLoading(false);
//     })();
//   }, [demandeId]);

//   const d = data?.demande, p = data?.payment, t = data?.transaction;

//   return (
//     <div className="container-fluid relative px-3">
//       <div className="layout-specing">
//         <div className="md:flex justify-between items-center mb-4">
//           <h5 className="text-lg font-semibold">Détail de ma demande</h5>
//           <Breadcrumb items={[
//             { title: <Link to="/demandeur/dashboard">Dashboard</Link> },
//             { title: <Link to="/demandeur/mes-demandes">Mes demandes</Link> },
//             { title: d?.code || "Détail" },
//           ]}/>
//         </div>

//         <Card loading={loading}>
//           <Space style={{ width: "100%", justifyContent: "space-between" }} className="mb-2">
//             <Title level={4} style={{ margin: 0 }}>{d?.code || "—"}</Title>
//             <Space>
//               <Link to={`/demandeur/mes-demandes/${demandeId}/documents`}><Button>Documents</Button></Link>
//             </Space>
//           </Space>

//           {!!d && (
//             <>
//               <Descriptions bordered size="small" column={2} title="Dossier">
//                 <Descriptions.Item label="Code">{d.code || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Statut"><Tag>{d.status || "—"}</Tag></Descriptions.Item>
//                 <Descriptions.Item label="Organisation cible">{d.targetOrg?.name || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Traducteur">
//                   {d.assignedOrg?.name ? <Tag color="geekblue">{d.assignedOrg.name}</Tag> : "—"}
//                 </Descriptions.Item>
//                 <Descriptions.Item label="Créée le" span={2}>{d.dateDemande ? dayjs(d.dateDemande).format("DD/MM/YYYY HH:mm") : "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Période">{d.periode || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Année">{d.year || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Observation" span={2}>{d.observation || "—"}</Descriptions.Item>
//               </Descriptions>

//               <Divider>Académique</Divider>
//               <Descriptions bordered size="small" column={2}>
//                 <Descriptions.Item label="Série">{d.serie || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Niveau">{d.niveau || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Mention">{d.mention || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Année scol.">{d.annee || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Pays école">{d.countryOfSchool || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Établissement">{d.secondarySchoolName || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Date diplôme" span={2}>{d.graduationDate ? dayjs(d.graduationDate).format("DD/MM/YYYY") : "—"}</Descriptions.Item>
//               </Descriptions>

//               <Divider>Identité</Divider>
//               <Descriptions bordered size="small" column={2}>
//                 <Descriptions.Item label="Naissance">{d.dob ? dayjs(d.dob).format("DD/MM/YYYY") : "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Nationalité">{d.citizenship || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Passeport">{d.passport || "—"}</Descriptions.Item>
//               </Descriptions>

//               <Divider>Anglais / Tests</Divider>
//               <Descriptions bordered size="small" column={2}>
//                 <Descriptions.Item label="Anglais L1">{d.isEnglishFirstLanguage ? "Oui" : "Non"}</Descriptions.Item>
//                 <Descriptions.Item label="Scores">{d.testScores || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Tests (JSON)" span={2}><pre style={{whiteSpace:"pre-wrap",margin:0}}>{d.englishProficiencyTests ? JSON.stringify(d.englishProficiencyTests) : "—"}</pre></Descriptions.Item>
//               </Descriptions>

//               <Divider>Scolarité / Notes</Divider>
//               <Descriptions bordered size="small" column={2}>
//                 <Descriptions.Item label="Grading scale">{d.gradingScale || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="GPA">{d.gpa || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Examens (JSON)" span={2}><pre style={{whiteSpace:"pre-wrap",margin:0}}>{d.examsTaken ? JSON.stringify(d.examsTaken) : "—"}</pre></Descriptions.Item>
//                 <Descriptions.Item label="Filière souhaitée" span={2}>{d.intendedMajor || "—"}</Descriptions.Item>
//               </Descriptions>

//               <Divider>Activités & Distinctions</Divider>
//               <Descriptions bordered size="small" column={2}>
//                 <Descriptions.Item label="Activités" span={2}>{d.extracurricularActivities || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Distinctions" span={2}>{d.honorsOrAwards || "—"}</Descriptions.Item>
//               </Descriptions>

//               <Divider>Famille</Divider>
//               <Descriptions bordered size="small" column={2}>
//                 <Descriptions.Item label="Parent/Tuteur">{d.parentGuardianName || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Profession">{d.occupation || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Niveau d'éducation">{d.educationLevel || "—"}</Descriptions.Item>
//               </Descriptions>

//               <Divider>Financier</Divider>
//               <Descriptions bordered size="small" column={2}>
//                 <Descriptions.Item label="Aid. financière">{d.willApplyForFinancialAid ? "Oui" : "Non"}</Descriptions.Item>
//                 <Descriptions.Item label="Parrainage externe">{d.hasExternalSponsorship ? "Oui" : "Non"}</Descriptions.Item>
//               </Descriptions>

//               <Divider>Visa</Divider>
//               <Descriptions bordered size="small" column={2}>
//                 <Descriptions.Item label="Type">{d.visaType || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Déjà étudié aux USA">{d.hasPreviouslyStudiedInUS ? "Oui" : "Non"}</Descriptions.Item>
//               </Descriptions>

//               <Divider>Essays</Divider>
//               <Descriptions bordered size="small" column={2}>
//                 <Descriptions.Item label="Personal statement" span={2}>{d.personalStatement || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Optional essay" span={2}>{d.optionalEssay || "—"}</Descriptions.Item>
//               </Descriptions>

//               <Divider>Candidature</Divider>
//               <Descriptions bordered size="small" column={2}>
//                 <Descriptions.Item label="Round">{d.applicationRound || "—"}</Descriptions.Item>
//                 <Descriptions.Item label="Découverte">{d.howDidYouHearAboutUs || "—"}</Descriptions.Item>
//               </Descriptions>

//               {/* <Card className="mt-4" size="small" title="Paiement / Transaction">
//                 {p || t ? (
//                   <Descriptions size="small" column={2}>
//                     {t && <>
//                       <Descriptions.Item label="Transaction Statut">{t.statut}</Descriptions.Item>
//                       <Descriptions.Item label="Montant">{t.montant}</Descriptions.Item>
//                     </>}
//                     {p && <>
//                       <Descriptions.Item label="Provider">{p.provider}</Descriptions.Item>
//                       <Descriptions.Item label="Status">{p.status}</Descriptions.Item>
//                       <Descriptions.Item label="Montant">{p.amount} {p.currency}</Descriptions.Item>
//                       <Descriptions.Item label="Type">{p.paymentType}</Descriptions.Item>
//                     </>}
//                   </Descriptions>
//                 ) : "Aucun paiement enregistré."}
//               </Card> */}
//             </>
//           )}
//         </Card>
//       </div>
//     </div>
//   );
// }

/* eslint-disable no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button, Card, Descriptions, Space, Tag, Typography, Divider, Breadcrumb } from "antd";
import demandeService from "@/services/demandeService";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

const statusColor = (s) =>
  s === "VALIDATED" ? "green" :
  s === "REJECTED" ? "red" :
  s === "IN_PROGRESS" ? "gold" : "blue";

export default function DemandeurDemandeDetail() {
  const { t, i18n } = useTranslation();
  const { demandeId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await demandeService.getById(demandeId);
      setData(res);
      setLoading(false);
    })();
  }, [demandeId]);

  const d = data?.demande, p = data?.payment, tr = data?.transaction;

  const fmtDateTime = (v) =>
    v ? dayjs(v).locale(i18n.language || "fr").format("DD/MM/YYYY HH:mm") : t("demandeDetail.common.na");
  const fmtDate = (v) =>
    v ? dayjs(v).locale(i18n.language || "fr").format("DD/MM/YYYY") : t("demandeDetail.common.na");

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-4">
          <h5 className="text-lg font-semibold">{t("demandeDetail.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/demandeur/dashboard">{t("demandeDetail.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/demandeur/mes-demandes">{t("demandeDetail.breadcrumb.mine")}</Link> },
              { title: d?.code || t("demandeDetail.breadcrumb.detail") },
            ]}
          />
        </div>

        <Card loading={loading}>
          <Space style={{ width: "100%", justifyContent: "space-between" }} className="mb-2">
            <Title level={4} style={{ margin: 0 }}>{d?.code || t("demandeDetail.common.na")}</Title>
            <Space>
              <Link to={`/demandeur/mes-demandes/${demandeId}/documents`}>
                <Button>{t("demandeDetail.actions.documents")}</Button>
              </Link>
            </Space>
          </Space>

          {!!d && (
            <>
              {/* Dossier */}
              <Descriptions bordered size="small" column={2} title={t("demandeDetail.sections.case")}>
                <Descriptions.Item label={t("demandeDetail.fields.code")}>{d.code || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.status")}>
                  <Tag color={statusColor(d.status)}>{t(`demandeurDemandes.status.${d.status || "PENDING"}`)}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.targetOrg")}>
                  {d.targetOrg?.name || t("demandeDetail.common.na")}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.assignedOrg")}>
                  {d.assignedOrg?.name ? <Tag color="geekblue">{d.assignedOrg.name}</Tag> : t("demandeDetail.common.na")}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.createdAt")} span={2}>
                  {fmtDateTime(d.dateDemande)}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.periode")}>
                  {d.periode ? t(`demandeurDemandes.periods.${d.periode}`) : t("demandeDetail.common.na")}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.year")}>{d.year || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.observation")} span={2}>
                  {d.observation || t("demandeDetail.common.na")}
                </Descriptions.Item>
              </Descriptions>

              {/* Académique */}
              <Divider>{t("demandeDetail.sections.academic")}</Divider>
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label={t("demandeDetail.fields.serie")}>{d.serie || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.niveau")}>{d.niveau || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.mention")}>{d.mention || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.schoolYear")}>{d.annee || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.countryOfSchool")}>{d.countryOfSchool || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.secondarySchoolName")}>{d.secondarySchoolName || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.graduationDate")} span={2}>
                  {fmtDate(d.graduationDate)}
                </Descriptions.Item>
              </Descriptions>

              {/* Identité */}
              <Divider>{t("demandeDetail.sections.identity")}</Divider>
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label={t("demandeDetail.fields.dob")}>{fmtDate(d.dob)}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.citizenship")}>{d.citizenship || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.passport")}>{d.passport || t("demandeDetail.common.na")}</Descriptions.Item>
              </Descriptions>

              {/* Anglais / Tests */}
              <Divider>{t("demandeDetail.sections.englishTests")}</Divider>
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label={t("demandeDetail.fields.isEnglishFirstLanguage")}>
                  {d.isEnglishFirstLanguage ? t("demandeDetail.common.yes") : t("demandeDetail.common.no")}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.testScores")}>{d.testScores || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.englishProficiencyTests")} span={2}>
                  <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                    {d.englishProficiencyTests ? JSON.stringify(d.englishProficiencyTests) : t("demandeDetail.common.na")}
                  </pre>
                </Descriptions.Item>
              </Descriptions>

              {/* Scolarité / Notes */}
              <Divider>{t("demandeDetail.sections.schooling")}</Divider>
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label={t("demandeDetail.fields.gradingScale")}>{d.gradingScale || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.gpa")}>{d.gpa || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.examsTaken")} span={2}>
                  <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                    {d.examsTaken ? JSON.stringify(d.examsTaken) : t("demandeDetail.common.na")}
                  </pre>
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.intendedMajor")} span={2}>
                  {d.intendedMajor || t("demandeDetail.common.na")}
                </Descriptions.Item>
              </Descriptions>

              {/* Activités & Distinctions */}
              <Divider>{t("demandeDetail.sections.activities")}</Divider>
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label={t("demandeDetail.fields.extracurricularActivities")} span={2}>
                  {d.extracurricularActivities || t("demandeDetail.common.na")}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.honorsOrAwards")} span={2}>
                  {d.honorsOrAwards || t("demandeDetail.common.na")}
                </Descriptions.Item>
              </Descriptions>

              {/* Famille */}
              <Divider>{t("demandeDetail.sections.family")}</Divider>
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label={t("demandeDetail.fields.parentGuardianName")}>{d.parentGuardianName || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.occupation")}>{d.occupation || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.educationLevel")}>{d.educationLevel || t("demandeDetail.common.na")}</Descriptions.Item>
              </Descriptions>

              {/* Financier */}
              <Divider>{t("demandeDetail.sections.finance")}</Divider>
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label={t("demandeDetail.fields.willApplyForFinancialAid")}>
                  {d.willApplyForFinancialAid ? t("demandeDetail.common.yes") : t("demandeDetail.common.no")}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.hasExternalSponsorship")}>
                  {d.hasExternalSponsorship ? t("demandeDetail.common.yes") : t("demandeDetail.common.no")}
                </Descriptions.Item>
              </Descriptions>

              {/* Visa */}
              <Divider>{t("demandeDetail.sections.visa")}</Divider>
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label={t("demandeDetail.fields.visaType")}>{d.visaType || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.hasPreviouslyStudiedInUS")}>
                  {d.hasPreviouslyStudiedInUS ? t("demandeDetail.common.yes") : t("demandeDetail.common.no")}
                </Descriptions.Item>
              </Descriptions>

              {/* Essays */}
              <Divider>{t("demandeDetail.sections.essays")}</Divider>
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label={t("demandeDetail.fields.personalStatement")} span={2}>
                  {d.personalStatement || t("demandeDetail.common.na")}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.optionalEssay")} span={2}>
                  {d.optionalEssay || t("demandeDetail.common.na")}
                </Descriptions.Item>
              </Descriptions>

              {/* Candidature */}
              <Divider>{t("demandeDetail.sections.application")}</Divider>
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label={t("demandeDetail.fields.applicationRound")}>{d.applicationRound || t("demandeDetail.common.na")}</Descriptions.Item>
                <Descriptions.Item label={t("demandeDetail.fields.howDidYouHearAboutUs")}>{d.howDidYouHearAboutUs || t("demandeDetail.common.na")}</Descriptions.Item>
              </Descriptions>

              {/* Paiement / Transaction (optionnel) */}
              {/* <Card className="mt-4" size="small" title={t("demandeDetail.sections.paymentTransaction")}>
                {p || tr ? (
                  <Descriptions size="small" column={2}>
                    {tr && <>
                      <Descriptions.Item label={t("demandeDetail.fields.txStatus")}>{tr.statut}</Descriptions.Item>
                      <Descriptions.Item label={t("demandeDetail.fields.txAmount")}>{tr.montant}</Descriptions.Item>
                    </>}
                    {p && <>
                      <Descriptions.Item label={t("demandeDetail.fields.provider")}>{p.provider}</Descriptions.Item>
                      <Descriptions.Item label={t("demandeDetail.fields.paymentStatus")}>{p.status}</Descriptions.Item>
                      <Descriptions.Item label={t("demandeDetail.fields.amount")}>{p.amount} {p.currency}</Descriptions.Item>
                      <Descriptions.Item label={t("demandeDetail.fields.paymentType")}>{p.paymentType}</Descriptions.Item>
                    </>}
                  </Descriptions>
                ) : t("demandeDetail.empty.noPayment")}
              </Card> */}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
