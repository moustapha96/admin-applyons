

/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useMemo, useState } from "react";
import { Modal, Form, Input, Select, Upload, Button, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import documentService from "@/services/documentService";
import { useAuth } from "../hooks/useAuth";

const { Dragger } = Upload;

const TYPE_OPTIONS = [
    { label: "Certificat", value: "CERTIFICAT" },
    { label: "Attestation", value: "ATTESTATION" },
    { label: "Diplôme", value: "DIPLOME" },
    { label: "Relevé de notes", value: "RELEVE" },
    { label: "Autre", value: "AUTRE" },
];

const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1990; year--) {
        years.push({ label: year.toString(), value: year });
    }
    return years;
};

const YEAR_OPTIONS = generateYearOptions();

export default function DemandeAddDocumentModal({ open, onClose, onSuccess, demandeId }) {
    const [form] = Form.useForm();
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [uploadedOk, setUploadedOk] = useState(false);
    const needCode = !demandeId;

    const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

    const beforeUpload = (file) => {
        const isOk = ["application/pdf", "image/png", "image/jpeg"].includes(file.type);
        if (!isOk) message.error("Formats acceptés: PDF, PNG, JPG");
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) message.error("Le fichier doit être < 10 Mo");
        return isOk && isLt10M;
    };

    const watchType = Form.useWatch("type", form);
    const watchYear = Form.useWatch("dateObtention", form);
    const watchCode = Form.useWatch("codeDemande", form);
    const watchFiles = Form.useWatch("file", form) || [];
    const hasFile = watchFiles.length > 0 && !!watchFiles[0]?.originFileObj;

    const canSubmit = useMemo(() => {
        if (!watchType) return false;
        if (!watchYear) return false;
        if (!hasFile) return false;
        if (needCode && !watchCode) return false;
        return true;
    }, [watchType, watchYear, hasFile, needCode, watchCode]);

    const handleOk = async () => {
        try {
            await form.validateFields();
            setSubmitting(true);
            const values = form.getFieldsValue();
            const formData = new FormData();
            formData.append("type", values.type);
            formData.append("mention", values.mention ?? "");
            if (values.dateObtention) {
                formData.append("dateObtention", new Date(values.dateObtention, 0, 1).toISOString());
            }
            if (demandeId) formData.append("demandeId", demandeId);
            else formData.append("demandeCode", values.codeDemande.trim());

            const fileObj = values.file?.[0]?.originFileObj;
            if (!fileObj) {
                message.error("Veuillez sélectionner un fichier.");
                setSubmitting(false);
                return;
            }
            formData.append("file", fileObj);
            formData.append("ownerOrgId", user.organization.id);

            await documentService.create(formData);
            setUploadedOk(true);
            message.success("Document ajouté avec succès");
            form.resetFields();
            onSuccess?.();
        } catch (e) {
            console.error(e);
            if (e?.errorFields) {
                message.error("Veuillez corriger les erreurs dans le formulaire.");
            } else {
                message.error(e?.message || "Échec de l’ajout du document");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        // if (!uploadedOk) {
        //     message.warning("Ajoutez et enregistrez le document avant de fermer.");
        //     return;
        // }
        onClose?.();
    };

    return (
        <Modal
            title={demandeId ? "Ajouter un document à la demande" : "Ajouter un document (via code de demande)"}
            open={open}
            onCancel={handleCancel}
            onOk={handleOk}
            okText="Enregistrer"
            confirmLoading={submitting}
            destroyOnHidden
            maskClosable={false}
            keyboard={false}
            closable={!submitting}
            okButtonProps={{ disabled: !canSubmit || submitting }}
        >
            <Form layout="vertical" form={form}>
                {!demandeId && (
                    <Form.Item
                        name="codeDemande"
                        label="Code de la demande"
                        rules={[{ required: true, message: "Le code de la demande est requis" }]}
                    >
                        <Input placeholder="Ex: DEM-2025-0001" />
                    </Form.Item>
                )}
                <Form.Item name="type" label="Type de document" rules={[{ required: true, message: "Type requis" }]}>
                    <Select options={TYPE_OPTIONS} placeholder="Choisir un type" />
                </Form.Item>
                <Form.Item name="mention" label="Mention (facultatif)">
                    <Input placeholder="Ex: Très bien, Bien, ... ou commentaire" />
                </Form.Item>
                <Form.Item name="dateObtention" label="Année d’obtention" rules={[{ required: true, message: "Année requise" }]}>
                    <Select options={YEAR_OPTIONS} placeholder="Sélectionnez l'année" />
                </Form.Item>
                <Form.Item
                    name="file"
                    label="Fichier"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    rules={[{ required: true, message: "Fichier requis" }]}
                    extra="PDF/PNG/JPG, max 10 Mo."
                >
                    <Dragger
                        multiple={false}
                        maxCount={1}
                        beforeUpload={beforeUpload}
                        customRequest={({ onSuccess }) => setTimeout(() => onSuccess?.("ok"), 0)}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Cliquez ou glissez-déposez le fichier ici</p>
                    </Dragger>
                </Form.Item>
            </Form>
        </Modal>
    );
}
