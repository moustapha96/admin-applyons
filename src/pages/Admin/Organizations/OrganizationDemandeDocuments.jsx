/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  Card,
  Table,
  Space,
  Button,
  Tag,
  message,
  Modal,
  Tooltip,
  Progress,
} from "antd";
import {
  ArrowLeftOutlined,
  FilePdfOutlined,
  EyeOutlined,
  DownloadOutlined,
  LockOutlined,
  TranslationOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import documentService from "../../../services/documentService";
import { useAuth } from "../../../hooks/useAuth";

const { confirm } = Modal;

const OrganizationDemandeDocuments = () => {
  const { id: demandeId } = useParams();
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchDocuments();
  }, [demandeId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await documentService.list({ demandePartageId: demandeId });
      setDocuments(response.documents);
    } catch (error) {
      console.error("Erreur lors de la récupération des documents:", error);
      message.error("Erreur lors de la récupération des documents");
    } finally {
      setLoading(false);
    }
  };


  const handlePreviewDocument = (documentId, type = "original") => {
    const url = `/documents/${documentId}/preview?type=${type}`;
    window.open(url, "_blank");
  };

  const handleDownloadDocument = async (documentId, type = "original") => {
    try {
      const response = await documentService.getContent(documentId, { type, display: false });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `document_${documentId}_${type}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      message.error("Erreur lors du téléchargement du document");
    }
  };

  const handleDeleteDocument = async (documentId) => {
    confirm({
      title: "Supprimer ce document ?",
      icon: <ExclamationCircleOutlined />,
      content: "Cette action est irréversible.",
      okText: "Supprimer",
      okType: "danger",
      cancelText: "Annuler",
      onOk: async () => {
        try {
          await documentService.remove(documentId);
          message.success("Document supprimé avec succès");
          await fetchDocuments();
        } catch (error) {
          console.error("Erreur lors de la suppression:", error);
          message.error("Erreur lors de la suppression du document");
        }
      },
    });
  };



  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (id) => `#${id}`,
    },
   
    {
      title: "Type",
      key: "type",
      render: (_, record) => (
        <Space>
          {record.aDocument && <Tag icon={<FilePdfOutlined />} color="blue">Document</Tag>}
          {record.estTraduit && <Tag icon={<TranslationOutlined />} color="green">Traduit</Tag>}
          {record.urlChiffre && <Tag icon={<LockOutlined />} color="purple">Chiffré</Tag>}
        </Space>
      ),
    },
    {
      title: "Créé le",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Organisation",
      dataIndex: ["ownerOrg", "name"],
      key: "ownerOrg",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Prévisualiser l'original">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handlePreviewDocument(record.id, "original")}
            />
          </Tooltip>
          <Tooltip title="Télécharger l'original">
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadDocument(record.id, "original")}
            />
          </Tooltip>
          {record.estTraduit && (
            <>
              <Tooltip title="Prévisualiser la traduction">
                <Button
                  type="link"
                  icon={<TranslationOutlined />}
                  onClick={() => handlePreviewDocument(record.id, "traduit")}
                />
              </Tooltip>
              <Tooltip title="Télécharger la traduction">
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownloadDocument(record.id, "traduit")}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="Supprimer">
            <Button
              type="link"
              danger
              icon={<ExclamationCircleOutlined />}
              onClick={() => handleDeleteDocument(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Documents de la Demande</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">Dashboard</Link> },
              { title: <Link to="/demandes">Demandes</Link> },
              { title: "Documents" },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            Retour aux demandes
          </Button>
        </div>

        <Card
          title={`Documents de la demande #${demandeId}`}
        
        >
          {uploading && (
            <Progress
              percent={uploadProgress}
              status="active"
              strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
              className="mb-4"
            />
          )}

          <Table
            columns={columns}
            dataSource={documents}
            loading={loading}
            rowKey="id"
            pagination={false}
            scroll={{ x: true }}
          />
        </Card>
      </div>
    </div>
  );
};

export default OrganizationDemandeDocuments;
