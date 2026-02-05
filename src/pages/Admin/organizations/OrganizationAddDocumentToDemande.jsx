import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Upload,
  Card,
  Breadcrumb,
  Row,
  Col,
  message,
  Spin,
  Select,
  Divider,
  Alert,
  Progress
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
  FilePdfOutlined,
  LockOutlined
} from "@ant-design/icons";
import documentService from "../../../services/documentService";
import { useAuth } from "../../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { PDF_ACCEPT, createPdfBeforeUpload } from "@/utils/uploadValidation";

const { Option } = Select;
const { Dragger } = Upload;

const OrganizationAddDocumentToDemande = () => {
  const { t } = useTranslation();
  const { id: demandeId } = useParams();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [organizations, setOrganizations] = useState([]);
  const [fetchingOrgs, setFetchingOrgs] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setFetchingOrgs(true);
    try {
      // Récupérer les organisations disponibles (ex: agences de traduction)
      // À adapter selon votre API
      const response = await fetch("/api/organisations?type=TRADUCTEUR");
      const data = await response.json();
      setOrganizations(data.organizations);
    } catch (error) {
      message.error("Erreur lors de la récupération des organisations");
      console.error(error);
    } finally {
      setFetchingOrgs(false);
    }
  };

  const handleUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Le fichier sera uploadé directement avec le formulaire via documentService.create
      // On stocke juste le fichier pour l'envoyer plus tard
      setFileList([file]);
      form.setFieldsValue({
        codeAdn: file.name.replace(/\.[^/.]+$/, ""),
      });
      setUploadProgress(100);
      onSuccess();
    } catch (error) {
      console.error("Erreur lors de la préparation du fichier:", error);
      message.error("Erreur lors de la préparation du document");
      onError();
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Récupérer le fichier depuis fileList
      const file = fileList[0]?.originFileObj;
      if (!file) {
        message.error("Veuillez sélectionner un fichier");
        setLoading(false);
        return;
      }

      // Créer FormData avec le fichier et les autres données
      const formData = new FormData();
      formData.append("file", file);
      formData.append("demandePartageId", demandeId);
      formData.append("ownerOrgId", values.ownerOrgId);
      if (values.codeAdn) {
        formData.append("codeAdn", values.codeAdn);
      }
      formData.append("estTraduit", "false");
      formData.append("aDocument", "true");

      const response = await documentService.create(formData);
      message.success("Document ajouté à la demande avec succès");
      navigate(`/demandes/${demandeId}/documents`);
    } catch (error) {
      console.error("Erreur lors de l'ajout du document:", error);
      message.error(error?.response?.data?.message || error?.message || "Erreur lors de l'ajout du document à la demande");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Ajouter un document à la demande</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">Dashboard</Link> },
              { title: <Link to="/demandes">Demandes</Link> },
              { title: "Ajouter un document" },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            Retour
          </Button>
        </div>

        <Card title="Ajouter un document">
          <Alert
            message="Informations"
            description="Téléchargez un document PDF pour cette demande. Le document sera automatiquement chiffré après l'ajout."
            type="info"
            showIcon
            className="mb-4"
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="ownerOrgId"
                  label="Organisation propriétaire"
                  rules={[{ required: true, message: "L'organisation est obligatoire" }]}
                >
                  <Select
                    placeholder="Sélectionner une organisation"
                    loading={fetchingOrgs}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {organizations.map(org => (
                      <Option key={org.id} value={org.id}>
                        {org.name} ({org.type})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="codeAdn"
                  label="Code ADN (optionnel)"
                  tooltip="Un identifiant unique pour ce document (ex: numéro de série)"
                >
                  <Input placeholder="Code ADN" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="file"
                  label="Document"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => {
                    if (Array.isArray(e)) {
                      return e;
                    }
                    return e?.fileList;
                  }}
                  rules={[{ required: true, message: "Un document est obligatoire" }]}
                >
                  <Dragger
                    customRequest={handleUpload}
                    fileList={fileList}
                    maxCount={1}
                    accept={PDF_ACCEPT}
                    disabled={uploading}
                    beforeUpload={createPdfBeforeUpload(message.error, t, Upload.LIST_IGNORE)}
                  >
                    <p className="ant-upload-drag-icon">
                      <FilePdfOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
                    </p>
                    <p className="ant-upload-text">Cliquez ou glissez-déposez un fichier PDF</p>
                    <p className="ant-upload-hint">
                      {uploading ? (
                        <>
                          Préparation en cours... <Spin size="small" />
                        </>
                      ) : (
                        "Seuls les fichiers PDF sont acceptés"
                      )}
                    </p>
                  </Dragger>
                </Form.Item>
              </Col>

              {uploading && (
                <Col span={24}>
                  <Progress
                    percent={uploadProgress}
                    status="active"
                    strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
                  />
                </Col>
              )}

              <Col span={24}>
                <Divider />
                <Alert
                  message="Sécurité"
                  description={
                    <>
                      <p>Ce document sera automatiquement chiffré après l'ajout.</p>
                      <p>
                        <LockOutlined /> Le chiffrement utilise AES-256 et la blockchain pour garantir
                        l'intégrité.
                      </p>
                    </>
                  }
                  type="success"
                  showIcon
                  className="mb-4"
                />
              </Col>

              <Col span={24} className="text-right">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  size="large"
                >
                  {loading ? "Ajout en cours..." : "Ajouter le document"}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationAddDocumentToDemande;
