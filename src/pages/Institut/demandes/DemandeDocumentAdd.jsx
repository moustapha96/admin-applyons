// /* eslint-disable no-unused-vars */
// "use client";

// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Breadcrumb,
//   Button,
//   Card,
//   Col,
//   DatePicker,
//   Divider,
//   Form,
//   Input,
//   Row,
//   Select,
//   Space,
//   Typography,
//   Upload,
//   message,
// } from "antd";
// import {
//   ArrowLeftOutlined,
//   InboxOutlined,
//   SaveOutlined,
// } from "@ant-design/icons";
// import dayjs from "dayjs";
// import { useAuth } from "../../../hooks/useAuth";
// import documentService from "@/services/documentService";

// const { Title, Text } = Typography;
// const { Dragger } = Upload;

// const DOC_TYPES = [
//   { label: "ATTESTATION", value: "ATTESTATION" },
//   { label: "RELEVE", value: "RELEVE" },
//   { label: "DIPLOME", value: "DIPLOME" },
//   { label: "AUTRE", value: "AUTRE" },
// ];

// function makeUploadProps(setter) {
//   return {
//     name: "file",
//     multiple: false,
//     beforeUpload: () => false, // empêche l'upload auto d'Ant
//     onRemove: () => {
//       setter(null);
//       return true;
//     },
//     onChange: (info) => {
//       const f =
//         Array.isArray(info.fileList) && info.fileList[0]?.originFileObj
//           ? info.fileList[0].originFileObj
//           : null;
//       setter(f || null);
//     },
//     accept: ".pdf,.jpg,.jpeg,.png,.webp",
//     maxCount: 1,
//   };
// }

// const generateYearOptions = () => {
//   const currentYear = new Date().getFullYear();
//   const years = [];
//   for (let year = currentYear; year >= 1990; year--) {
//     years.push({ label: year.toString(), value: year });
//   }
//   return years;
// };

// const YEAR_OPTIONS = generateYearOptions();

// export default function DemandeDocumentAdd() {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const [submitting, setSubmitting] = useState(false);
//   const [form] = Form.useForm();

//   // Fichier sélectionné
//   const [fileOriginal, setFileOriginal] = useState(null);

//   const handleCancel = () => {
//     navigate(-1);
//   };

//   const onFinish = async (values) => {
//     try {
//       setSubmitting(true);

//       // Validation basique: exiger au moins le fichier
//       if (!fileOriginal) {
//         message.error("Veuillez sélectionner un fichier.");
//         setSubmitting(false);
//         return;
//       }

//       const formData = new FormData();
//       formData.append("type", values.type);
//       formData.append("mention", values.mention ?? "");
//       if (values.dateObtention) {
//         // DatePicker -> Dayjs -> ISO
//         formData.append("dateObtention", dayjs(values.dateObtention).toISOString());
//       }

//       // Code de la demande si fourni (le backend attend 'demandeCode')
//       if (values.code && String(values.code).trim()) {
//         formData.append("demandeCode", String(values.code).trim());
//       }

//       // Fichier
//       formData.append("file", fileOriginal);

//       // Organisation source depuis l'utilisateur connecté
//       if (user?.organization?.id) {
//         formData.append("ownerOrgId", String(user.organization.id));
//       }

//       await documentService.create(formData);

//       message.success("Document ajouté avec succès.");
//       form.resetFields();
//       setFileOriginal(null);
//       navigate("/organisations/demandes");
//     } catch (e) {
//       message.error(
//         e?.response?.data?.message || e?.message || "Échec de l'ajout du document"
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="container-fluid relative px-3">
//       <div className="layout-specing">
//         {/* Header + fil d’Ariane */}
//         <div className="md:flex justify-between items-center mb-6">
//           <Space>
//             <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
//               Retour
//             </Button>
//           </Space>
//           <Breadcrumb
//             items={[
//               { title: <Link to="/organisations/dashboard">Dashboard</Link> },
//               { title: <Link to="/organisations/demandes">Demandes</Link> },
//               { title: "Ajouter un document" },
//             ]}
//           />
//         </div>

//         <div className="p-2 md:p-4">
//           <Title level={3} className="!mb-3">
//             Ajouter un document à la demande
//           </Title>

//           <Card>
//             <Form
//               form={form}
//               layout="vertical"
//               onFinish={onFinish}
//               initialValues={{}}
//             >
//               <Row gutter={[16, 8]}>
//                 <Col xs={24} md={12}>
//                   <Form.Item name="code" label="Code Demande" rules={[{ required: true, message: "Le code de la demande est requis" }]}>
//                     <Input placeholder="Saisir le code (optionnel si géré autrement)" />
//                   </Form.Item>
//                 </Col>

//                 <Col xs={24} md={12}>
//                   <Form.Item
//                     name="type"
//                     label="Type de document"
//                     rules={[{ required: true, message: "Sélectionnez le type de document" }]}
//                   >
//                     <Select
//                       options={DOC_TYPES}
//                       placeholder="Choisir un type (ex: RELEVE, DIPLOME)"
//                       showSearch
//                       optionFilterProp="label"
//                     />
//                   </Form.Item>
//                 </Col>

//                 <Col xs={24} md={12}>
//                   <Form.Item name="mention" label="Mention">
//                     <Input placeholder="Saisir la mention (ex: Bien, Très bien…)" />
//                   </Form.Item>
//                 </Col>

//                 <Col xs={24} md={12}>

//                   <Form.Item name="dateObtention" label="Année d’obtention" rules={[{ required: true, message: "Année d'obtention requise" }]}>
//                     <Select options={YEAR_OPTIONS} placeholder="Sélectionnez l'année" />
//                   </Form.Item>
//                 </Col>
//               </Row>

//               <Divider />

//               <Row gutter={[16, 8]}>
//                 <Col span={24}>
//                   <Title level={5} className="!mb-2">Fichier</Title>
//                   <Text type="secondary">
//                     Téléversez le fichier du document (PDF/JPG/PNG).
//                   </Text>
//                 </Col>

//                 <Col xs={24} md={12}>
//                   <Form.Item
//                     label="Fichier original"
//                     required
//                     tooltip="Obligatoire"
//                   >
//                     <Dragger {...makeUploadProps(setFileOriginal, message.error, t, Upload.LIST_IGNORE)}>
//                       <p className="ant-upload-drag-icon"><InboxOutlined /></p>
//                       <p className="ant-upload-text">Glissez-déposez ou cliquez pour sélectionner</p>
//                       <p className="ant-upload-hint">PDF / JPG / PNG (max 1 fichier)</p>
//                     </Dragger>
//                   </Form.Item>
//                 </Col>
//               </Row>

//               <Divider />

//               <Space className="mt-4" wrap>
//                 <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
//                   Annuler
//                 </Button>
//                 <Button
//                   type="primary"
//                   icon={<SaveOutlined />}
//                   htmlType="submit"
//                   loading={submitting}
//                 >
//                   Enregistrer le document
//                 </Button>
//               </Space>
//             </Form>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert, Breadcrumb, Button, Card, Col, DatePicker, Divider, Form, Input, Modal, Row,
  Result, Select, Space, Spin, Typography, Upload, message
} from "antd";
import { ArrowLeftOutlined, InboxOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useAuth } from "../../../hooks/useAuth";
import documentService from "@/services/documentService";
import demandeService from "@/services/demandeService";
import { useTranslation } from "react-i18next";
import { PDF_ACCEPT, createPdfBeforeUpload } from "@/utils/uploadValidation";

const { Title, Text } = Typography;
const { Dragger } = Upload;

function makeUploadProps(setter, messageError, t, listIgnore) {
  return {
    name: "file",
    multiple: false,
    beforeUpload: createPdfBeforeUpload(messageError, t, listIgnore),
    onRemove: () => { setter(null); return true; },
    onChange: (info) => {
      const f = Array.isArray(info.fileList) && info.fileList[0]?.originFileObj
        ? info.fileList[0].originFileObj
        : null;
      setter(f || null);
    },
    accept: PDF_ACCEPT,
    maxCount: 1,
  };
}

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 1990; year--) {
    years.push({ label: year.toString(), value: year });
  }
  return years;
};
const YEAR_OPTIONS = generateYearOptions();

export default function DemandeDocumentAdd() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [fileOriginal, setFileOriginal] = useState(null);
  const [resultModal, setResultModal] = useState({ visible: false, success: false, message: "", fromInvited: false });
  const [demandeInfo, setDemandeInfo] = useState(null);
  const [demandeInfoLoading, setDemandeInfoLoading] = useState(false);
  const [demandeInfoError, setDemandeInfoError] = useState(null);

  const codeFromUrl = searchParams.get("code");
  const typeFromUrl = searchParams.get("type");
  const isAcceptanceLetterOnly = typeFromUrl === "LETTRE_ACCEPTATION";

  // Charger les infos demande par code pour savoir si validée / destinataire / lettre déjà présente
  useEffect(() => {
    if (!codeFromUrl || !user?.organization?.id) {
      setDemandeInfo(null);
      setDemandeInfoError(null);
      return;
    }
    setDemandeInfoLoading(true);
    setDemandeInfoError(null);
    demandeService
      .getByCode(codeFromUrl)
      .then((res) => {
        setDemandeInfo(res?.demande ?? null);
        form.setFieldsValue({
          code: codeFromUrl,
          ...(isAcceptanceLetterOnly ? { type: "LETTRE_ACCEPTATION" } : {}),
        });
      })
      .catch((e) => {
        setDemandeInfo(null);
        setDemandeInfoError(e?.response?.data?.message || e?.message || t("demandeDocAdd.toasts.error"));
      })
      .finally(() => setDemandeInfoLoading(false));
  }, [codeFromUrl, user?.organization?.id, isAcceptanceLetterOnly, form, t]);

  // Pré-remplir le code si pas encore chargé par getByCode
  useEffect(() => {
    if (codeFromUrl && !demandeInfoLoading) {
      form.setFieldsValue((prev) => ({ ...prev, code: codeFromUrl }));
    }
  }, [codeFromUrl, demandeInfoLoading, form]);

  const isDemandeValidated = (demandeInfo?.status || "").toUpperCase() === "VALIDATED";
  const isTargetOrg = Boolean(demandeInfo?.isTargetOrganization);
  const hasAcceptanceLetter = Boolean(demandeInfo?.hasAcceptanceLetter);
  const blockAddBecauseValidated = isDemandeValidated && !isTargetOrg;
  const blockAddBecauseLetterExists = isDemandeValidated && isTargetOrg && hasAcceptanceLetter;
  const onlyAcceptanceLetterForm = isDemandeValidated && isTargetOrg && !hasAcceptanceLetter;

  // Types de document i18n
  const DOC_TYPES = [
    { label: t("demandeDocAdd.types.ATTESTATION"), value: "ATTESTATION" },
    { label: t("demandeDocAdd.types.RELEVE"), value: "RELEVE" },
    { label: t("demandeDocAdd.types.DIPLOME"), value: "DIPLOME" },
    // Passport file for application requests
    { label: t("demandeDocAdd.types.PASSPORT") || "Passport", value: "PASSPORT" },
    { label: t("demandeDocAdd.types.AUTRE"), value: "AUTRE" },
    { label: t("demandeDocAdd.types.LETTRE_ACCEPTATION"), value: "LETTRE_ACCEPTATION" },
  ];

  const handleCancel = () => navigate(-1);

  const onFinish = async (values) => {
    try {
      setSubmitting(true);

      if (!fileOriginal) {
        message.error(t("demandeDocAdd.form.fileRequired"));
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      const docType = onlyAcceptanceLetterForm ? "LETTRE_ACCEPTATION" : (values.type || "AUTRE");
      formData.append("type", docType);
      formData.append("mention", values.mention ?? "");
      if (values.dateObtention) {
        // ici on prend l'année choisie et on crée une date ISO (1er janvier de l'année)
        const year = values.dateObtention;
        const iso = dayjs(`${year}-01-01`).toISOString();
        formData.append("dateObtention", iso);
      }

      if (values.code && String(values.code).trim()) {
        formData.append("demandeCode", String(values.code).trim());
      }

      formData.append("file", fileOriginal);

      if (user?.organization?.id) {
        formData.append("ownerOrgId", String(user.organization.id));
      }

      await documentService.create(formData);
      
      // Si on vient de la page "Invited", supprimer l'invitation après l'ajout réussi
      const codeFromUrl = searchParams.get("code");
      const fromInvited = searchParams.get("fromInvited") === "true";
      
      if (fromInvited && codeFromUrl && user?.organization?.id) {
        try {
          await demandeService.deleteInviteeByDemandeCode(user.organization.id, codeFromUrl);
        } catch (e) {
          console.warn("Erreur lors de la suppression de l'invitation:", e);
        }
      }

      form.resetFields();
      setFileOriginal(null);
      setResultModal({
        visible: true,
        success: true,
        message: t("demandeDocAdd.toasts.success"),
        fromInvited: !!fromInvited,
      });
    } catch (e) {
      const errMsg = e?.response?.data?.message || e?.message || t("demandeDocAdd.toasts.error");
      setResultModal({
        visible: true,
        success: false,
        message: String(errMsg),
        fromInvited: searchParams.get("fromInvited") === "true",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const goToList = (fromInvited = false) => {
    setResultModal((prev) => ({ ...prev, visible: false }));
    navigate(fromInvited ? "/organisations/demandes/invited" : "/organisations/demandes");
  };

  const closeResultModal = () => {
    setResultModal((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        {/* Header + fil d’Ariane */}
        <div className="md:flex justify-between items-center mb-6">
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
              {t("demandeDocAdd.buttons.back")}
            </Button>
          </Space>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("demandeDocAdd.breadcrumbs.dashboard")}</Link> },
              { title: <Link to="/organisations/demandes">{t("demandeDocAdd.breadcrumbs.demandes")}</Link> },
              { title: t("demandeDocAdd.breadcrumbs.add") }
            ]}
          />
        </div>

        <div className="p-2 md:p-4">
          <Title level={3} className="!mb-3">
            {onlyAcceptanceLetterForm ? t("demandeDocAdd.titleAcceptanceLetter") : t("demandeDocAdd.title")}
          </Title>

          {demandeInfoLoading && (
            <Card>
              <div className="flex justify-center py-8">
                <Spin size="large" />
              </div>
            </Card>
          )}

          {!demandeInfoLoading && demandeInfoError && (
            <Card>
              <Alert
                type="warning"
                showIcon
                message={demandeInfoError}
                className="mb-3"
              />
              <Button onClick={handleCancel}>{t("demandeDocAdd.buttons.back")}</Button>
            </Card>
          )}

          {!demandeInfoLoading && blockAddBecauseValidated && (
            <Card>
              <Alert
                type="info"
                showIcon
                message={t("demandeDocAdd.validatedOnlyTargetCanAdd")}
                className="mb-3"
              />
              <Button onClick={handleCancel}>{t("demandeDocAdd.buttons.back")}</Button>
            </Card>
          )}

          {!demandeInfoLoading && blockAddBecauseLetterExists && (
            <Card>
              <Alert
                type="success"
                showIcon
                message={t("demandeDocAdd.acceptanceLetterAlreadyExists")}
                className="mb-3"
              />
              <Space>
                <Button onClick={handleCancel}>{t("demandeDocAdd.buttons.back")}</Button>
                <Button type="primary" onClick={() => navigate(`/organisations/demandes/${demandeInfo?.id}/details`)}>
                  {t("demandeDocAdd.buttons.seeDemande")}
                </Button>
              </Space>
            </Card>
          )}

          {!demandeInfoLoading && !demandeInfoError && !blockAddBecauseValidated && !blockAddBecauseLetterExists && (
          <Card>
            <Form form={form} layout="vertical" onFinish={onFinish}
              initialValues={onlyAcceptanceLetterForm ? { type: "LETTRE_ACCEPTATION" } : undefined}
            >
              <Row gutter={[16, 8]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="code"
                    label={t("demandeDocAdd.form.code")}
                    rules={[{ required: true, message: t("demandeDocAdd.form.codeRequired") }]}
                  >
                    <Input placeholder={t("demandeDocAdd.form.codePh")} />
                  </Form.Item>
                </Col>

                {!onlyAcceptanceLetterForm && (
                <Col xs={24} md={12}>
                  <Form.Item
                    name="type"
                    label={t("demandeDocAdd.form.type")}
                    rules={[{ required: true, message: t("demandeDocAdd.form.typeRequired") }]}
                  >
                    <Select
                      options={DOC_TYPES.filter((o) => o.value !== "LETTRE_ACCEPTATION")}
                      placeholder={t("demandeDocAdd.form.typePh")}
                      showSearch
                      optionFilterProp="label"
                    />
                  </Form.Item>
                </Col>
                )}
                {onlyAcceptanceLetterForm && (
                  <Form.Item name="type" hidden initialValue="LETTRE_ACCEPTATION">
                    <Input type="hidden" />
                  </Form.Item>
                )}

                <Col xs={24} md={12}>
                  <Form.Item name="mention" label={t("demandeDocAdd.form.mention")}>
                    <Input placeholder={t("demandeDocAdd.form.mentionPh")} />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="dateObtention"
                    label={t("demandeDocAdd.form.year")}
                    rules={[{ required: true, message: t("demandeDocAdd.form.yearRequired") }]}
                  >
                    <Select options={YEAR_OPTIONS} placeholder={t("demandeDocAdd.form.year")} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Title level={5} className="!mb-2">{t("demandeDocAdd.form.file")}</Title>
                  <Text type="secondary">{t("demandeDocAdd.form.fileHelp")}</Text>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label={t("demandeDocAdd.form.fileOriginal")}
                    required
                    tooltip={t("demandeDocAdd.upload.tooltipRequired")}
                  >
                    <Dragger {...makeUploadProps(setFileOriginal, message.error, t, Upload.LIST_IGNORE)}>
                      <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                      <p className="ant-upload-text">{t("demandeDocAdd.upload.dragTitle")}</p>
                      <p className="ant-upload-hint">{t("demandeDocAdd.upload.dragHint")}</p>
                    </Dragger>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Space className="mt-4" wrap>
                <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
                  {t("demandeDocAdd.buttons.cancel")}
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={submitting}
                >
                  {t("demandeDocAdd.buttons.save")}
                </Button>
              </Space>
            </Form>
          </Card>
          )}
        </div>
      </div>

      <Modal
        open={resultModal.visible}
        onCancel={resultModal.success ? () => goToList(resultModal.fromInvited) : closeResultModal}
        footer={null}
        closable
        width={440}
      >
        <Result
          status={resultModal.success ? "success" : "error"}
          title={resultModal.success ? t("demandeDocAdd.resultModal.successTitle") : t("demandeDocAdd.resultModal.errorTitle")}
          subTitle={resultModal.message}
          extra={[
            <Button type="primary" key="list" onClick={() => goToList(resultModal.fromInvited)}>
              {t("demandeDocAdd.resultModal.goToList")}
            </Button>,
            !resultModal.success && (
              <Button key="close" onClick={closeResultModal}>
                {t("common.ok")}
              </Button>
            ),
          ].filter(Boolean)}
        />
      </Modal>
    </div>
  );
}
