import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Descriptions, Space, Button, message } from "antd";
import http from "@/services/http";
import { useTranslation } from "react-i18next";

export default function DocumentDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [doc, setDoc] = useState();
  const [loading, setLoading] = useState(false);

  const fetchOne = async () => {
    setLoading(true);
    try {
      const { data } = await http.get(`/documents/${id}`);
      setDoc(data?.document || data);
    } finally { setLoading(false); }
  };

  useEffect(()=>{ fetchOne(); },[id]);

  const open = async (type) => {
    try {
      const { data } = await http.get(`/documents/${id}/content`, {
        params: { type, display: true },
      });
      window.open(data?.url || data, "_blank");
    } catch {
      message.error(t("institutDocuments.details.messages.openError"));
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
