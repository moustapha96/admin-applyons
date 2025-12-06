import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Descriptions, Space, Button, message } from "antd";
import documentService from "@/services/documentService";
import { useTranslation } from "react-i18next";
import { buildImageUrl } from "@/utils/imageUtils";

export default function DocumentDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [doc, setDoc] = useState();
  const [loading, setLoading] = useState(false);

  const fetchOne = async () => {
    setLoading(true);
    try {
      const data = await documentService.getById(id);
      setDoc(data?.document || data);
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || t("institutDocuments.details.messages.loadError"));
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(()=>{ fetchOne(); },[id]);

  const open = async (type) => {
    try {
      // Utiliser getContent pour obtenir le blob avec authentification
      const blob = await documentService.getContent(id, { type, display: true });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Nettoyer l'URL après un délai
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      if (error.response?.status === 401) {
        message.error(t("institutDocuments.details.messages.sessionExpired") || "Session expirée. Veuillez vous reconnecter.");
      } else if (error.response?.status === 403) {
        message.error(t("institutDocuments.details.messages.accessDenied") || "Vous n'avez pas accès à ce document.");
      } else {
        message.error(error?.response?.data?.message || error?.message || t("institutDocuments.details.messages.openError"));
      }
    }
  };

  if (!doc) return null;

  return (
    <div>
      <h2>{t("institutDocuments.details.title", { id })}</h2>
      <Descriptions bordered column={1} loading={loading}>
        <Descriptions.Item label={t("institutDocuments.details.labels.demande")}>{doc.demandePartageId}</Descriptions.Item>
        <Descriptions.Item label={t("institutDocuments.details.labels.ownerOrg")}>{doc.ownerOrgId}</Descriptions.Item>
        <Descriptions.Item label={t("institutDocuments.details.labels.traduit")}>{doc.estTraduit ? t("institutDocuments.details.yes") : t("institutDocuments.details.no")}</Descriptions.Item>
        <Descriptions.Item label={t("institutDocuments.details.labels.chiffre")}>{doc.isEncrypted ? t("institutDocuments.details.yes") : t("institutDocuments.details.no")}</Descriptions.Item>
       
      </Descriptions>

      <Space style={{ marginTop: 16 }}>
        <Button onClick={()=>open("original")}>{t("institutDocuments.details.buttons.viewOriginal")}</Button>
        <Button onClick={()=>open("traduit")}>{t("institutDocuments.details.buttons.viewTranslated")}</Button>
        <Button onClick={()=>open("chiffre")}>{t("institutDocuments.details.buttons.viewEncrypted")}</Button>
        <Link to="/documents"><Button>{t("institutDocuments.details.buttons.back")}</Button></Link>
      </Space>
    </div>
  );
}
