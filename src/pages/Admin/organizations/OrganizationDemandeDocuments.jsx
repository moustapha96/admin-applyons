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
import { useTranslation } from "react-i18next";
import documentService from "../../../services/documentService";
import { useAuth } from "../../../hooks/useAuth";
import { buildImageUrl } from "@/utils/imageUtils";

const { confirm } = Modal;

const OrganizationDemandeDocuments = () => {
  const { t } = useTranslation();
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
      message.error(t("adminOrganizationDemandeDocuments.messages.loadError"));
    } finally {
      setLoading(false);
    }
  };


  const handlePreviewDocument = async (documentId, type = "original") => {
    try {
      // Utiliser getContent pour obtenir le blob avec authentification
      const blob = await documentService.getContent(documentId, { type, display: true });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Nettoyer l'URL après un délai
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      if (error.response?.status === 401) {
        message.error(t("adminOrganizationDemandeDocuments.messages.sessionExpired"));
      } else if (error.response?.status === 403) {
        message.error(t("adminOrganizationDemandeDocuments.messages.accessDenied"));
      } else {
        message.error(error?.response?.data?.message || error?.message || t("adminOrganizationDemandeDocuments.messages.openError"));
      }
    }
  };

  const handleDownloadDocument = async (documentId, type = "original") => {
    try {
      await documentService.downloadDocument(documentId, type, `document_${documentId}_${type}.pdf`);
      message.success(t("adminOrganizationDemandeDocuments.messages.downloadSuccess"));
    } catch (error) {
      if (error.response?.status === 401) {
        message.error(t("adminOrganizationDemandeDocuments.messages.sessionExpired"));
      } else if (error.response?.status === 403) {
        message.error(t("adminOrganizationDemandeDocuments.messages.accessDenied"));
      } else {
        message.error(error?.response?.data?.message || error?.message || t("adminOrganizationDemandeDocuments.messages.downloadError"));
      }
    }
  };

  const handleDeleteDocument = async (documentId) => {
    confirm({
      title: t("adminOrganizationDemandeDocuments.deleteConfirm.title"),
      icon: <ExclamationCircleOutlined />,
      content: t("adminOrganizationDemandeDocuments.deleteConfirm.content"),
      okText: t("adminOrganizationDemandeDocuments.deleteConfirm.okText"),
      okType: "danger",
      cancelText: t("adminOrganizationDemandeDocuments.deleteConfirm.cancelText"),
      onOk: async () => {
        try {
          await documentService.remove(documentId);
          message.success(t("adminOrganizationDemandeDocuments.messages.deleteSuccess"));
          await fetchDocuments();
        } catch (error) {
          console.error("Erreur lors de la suppression:", error);
          message.error(t("adminOrganizationDemandeDocuments.messages.deleteError"));
        }
      },
    });
  };



  const columns = [
    {
      title: t("adminOrganizationDemandeDocuments.table.id"),
      dataIndex: "id",
      key: "id",
      render: (id) => `#${id}`,
    },
    {
      title: t("adminOrganizationDemandeDocuments.table.type"),
      key: "type",
      render: (_, record) => (
        <Space>
          {record.aDocument && <Tag icon={<FilePdfOutlined />} color="blue">{t("adminOrganizationDemandeDocuments.table.document")}</Tag>}
          {record.estTraduit && <Tag icon={<TranslationOutlined />} color="green">{t("adminOrganizationDemandeDocuments.table.translated")}</Tag>}
          {record.urlChiffre && <Tag icon={<LockOutlined />} color="purple">{t("adminOrganizationDemandeDocuments.table.encrypted")}</Tag>}
        </Space>
      ),
    },
    {
      title: t("adminOrganizationDemandeDocuments.table.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: t("adminOrganizationDemandeDocuments.table.organization"),
      dataIndex: ["ownerOrg", "name"],
      key: "ownerOrg",
    },
    {
      title: t("adminOrganizationDemandeDocuments.table.actions"),
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={t("adminOrganizationDemandeDocuments.tooltips.previewOriginal")}>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handlePreviewDocument(record.id, "original")}
            />
          </Tooltip>
          <Tooltip title={t("adminOrganizationDemandeDocuments.tooltips.downloadOriginal")}>
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadDocument(record.id, "original")}
            />
          </Tooltip>
          {record.estTraduit && (
            <>
              <Tooltip title={t("adminOrganizationDemandeDocuments.tooltips.previewTranslation")}>
                <Button
                  type="link"
                  icon={<TranslationOutlined />}
                  onClick={() => handlePreviewDocument(record.id, "traduit")}
                />
              </Tooltip>
              <Tooltip title={t("adminOrganizationDemandeDocuments.tooltips.downloadTranslation")}>
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownloadDocument(record.id, "traduit")}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title={t("adminOrganizationDemandeDocuments.tooltips.delete")}>
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
          <h5 className="text-lg font-semibold">{t("adminOrganizationDemandeDocuments.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("adminOrganizationDemandeDocuments.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/admin/demandes">{t("adminOrganizationDemandeDocuments.breadcrumb.demandes")}</Link> },
              { title: t("adminOrganizationDemandeDocuments.breadcrumb.documents") },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            {t("adminOrganizationDemandeDocuments.buttons.back")}
          </Button>
        </div>

        <Card
          title={t("adminOrganizationDemandeDocuments.cardTitle")}
        
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
