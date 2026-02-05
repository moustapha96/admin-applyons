import { useState } from "react";
import { Form, Input, Switch, Button, Card, Space, Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import documentService from "@/services/documentService";
import { PDF_ACCEPT, createPdfBeforeUpload } from "@/utils/uploadValidation";

export default function DocumentUpload(){
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const [fileList, setFileList] = useState([]);

  const initialValues = {
    demandePartageId: sp.get("demandeId") || "",
    ownerOrgId: "",
    codeAdn: "",
    estTraduit: false
  };

  const customRequest = async ({ file, onSuccess, onError })=>{
    try{
      // On stocke juste le fichier, il sera envoyé avec le formulaire
      setFileList([file]);
      form.setFieldValue("codeAdn", file.name.replace(/\.[^/.]+$/, ""));
      onSuccess();
    }catch(e){
      onError(e);
    }
  };

  const submit = async (values)=>{
    try {
      const file = fileList[0]?.originFileObj;
      if (!file) {
        message.error(t("institutDocuments.upload.messages.fileRequired"));
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      if (values.demandePartageId) {
        formData.append("demandePartageId", values.demandePartageId);
      }
      if (values.ownerOrgId) {
        formData.append("ownerOrgId", values.ownerOrgId);
      }
      if (values.codeAdn) {
        formData.append("codeAdn", values.codeAdn);
      }
      formData.append("estTraduit", values.estTraduit ? "true" : "false");

      const res = await documentService.create(formData);
      message.success(t("institutDocuments.upload.messages.saveSuccess"));
      const docId = res?.document?.id || res?.id || res?.data?.document?.id;
      if (docId) {
        nav(`/documents/${docId}`);
      } else {
        nav(-1);
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || t("institutDocuments.upload.messages.saveError"));
    }
  };

  return (
    <Card title={t("institutDocuments.upload.title")}>
      <Form form={form} layout="vertical" onFinish={submit} initialValues={initialValues}>
        <Form.Item name="demandePartageId" label={t("institutDocuments.upload.labels.demandeId")} rules={[{ required:true }]}><Input /></Form.Item>
        <Form.Item name="ownerOrgId" label={t("institutDocuments.upload.labels.ownerOrg")} rules={[{ required:true }]}><Input /></Form.Item>

        <Form.Item 
          name="file" 
          label={t("institutDocuments.upload.labels.file")}
          valuePropName="fileList"
          getValueFromEvent={(e) => {
            if (Array.isArray(e)) {
              return e;
            }
            return e?.fileList;
          }}
          rules={[{ required: true, message: t("institutDocuments.upload.messages.fileRequired") }]}
        >
          <Upload.Dragger 
            customRequest={customRequest} 
            fileList={fileList}
            multiple={false} 
            accept={PDF_ACCEPT}
            beforeUpload={createPdfBeforeUpload(message.error, t, Upload.LIST_IGNORE)}
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">{t("institutDocuments.upload.uploadText")}</p>
            <p className="ant-upload-hint">{t("institutDocuments.upload.uploadHint")}</p>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item name="codeAdn" label={t("institutDocuments.upload.labels.codeAdn")}><Input /></Form.Item>
        <Form.Item name="estTraduit" label={t("institutDocuments.upload.labels.estTraduit")} valuePropName="checked"><Switch /></Form.Item>

        <Space>
          <Button type="primary" htmlType="submit">{t("institutDocuments.upload.buttons.save")}</Button>
          <Button onClick={()=>nav(-1)}>{t("institutDocuments.upload.buttons.cancel")}</Button>
        </Space>
      </Form>
    </Card>
  );
}
