import { Form, Input, Switch, Button, Card, Space, Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { httpPost } from "../../utils/http";
import { useTranslation } from "react-i18next";

export default function DocumentUpload(){
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [sp] = useSearchParams();
  const nav = useNavigate();

  const initialValues = {
    demandePartageId: sp.get("demandeId") || "",
    ownerOrgId: "",
    codeAdn: "",
    urlOriginal: "",
    estTraduit: false
  };

  const customRequest = async ({ file, onSuccess, onError })=>{
    try{
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method:"POST", body: fd, credentials:"include" });
      const data = await res.json();
      if(!res.ok) throw new Error(data?.message || t("institutDocuments.upload.messages.uploadFailed"));
      form.setFieldValue("urlOriginal", data.url);
      message.success(t("institutDocuments.upload.messages.uploadSuccess"));
      onSuccess(data);
    }catch(e){
      onError(e);
    }
  };

  const submit = async (values)=>{
    const res = await httpPost("/api/documents", values);
    message.success(t("institutDocuments.upload.messages.saveSuccess"));
    nav(`/documents/${res?.document?.id}`);
  };

  return (
    <Card title={t("institutDocuments.upload.title")}>
      <Form form={form} layout="vertical" onFinish={submit} initialValues={initialValues}>
        <Form.Item name="demandePartageId" label={t("institutDocuments.upload.labels.demandeId")} rules={[{ required:true }]}><Input /></Form.Item>
        <Form.Item name="ownerOrgId" label={t("institutDocuments.upload.labels.ownerOrg")} rules={[{ required:true }]}><Input /></Form.Item>

        <Form.Item label={t("institutDocuments.upload.labels.file")}>
          <Upload.Dragger name="file" customRequest={customRequest} multiple={false} accept=".pdf,.png,.jpg,.jpeg">
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">{t("institutDocuments.upload.uploadText")}</p>
            <p className="ant-upload-hint">{t("institutDocuments.upload.uploadHint")}</p>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item name="urlOriginal" label={t("institutDocuments.upload.labels.urlOriginal")}>
          <Input placeholder={t("institutDocuments.upload.urlPlaceholder")} />
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
