import { useState } from "react";
import { Input, Button, Alert } from "antd";
import http from "@/services/http";
import { useTranslation } from "react-i18next";

export default function DocumentVerify() {
  const { t } = useTranslation();
  const [id, setId] = useState("");
  const [result, setResult] = useState();
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    setLoading(true);
    try {
      const { data } = await http.get(`/documents/${id}/verify`);
      setResult(data);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h2>{t("institutDocuments.verify.title")}</h2>
      <Input placeholder={t("institutDocuments.verify.placeholder")} value={id} onChange={e=>setId(e.target.value)} style={{ maxWidth: 320 }} />
      <Button onClick={verify} disabled={!id} loading={loading} style={{ marginLeft: 8 }}>{t("institutDocuments.verify.button")}</Button>
      {result && (
        <div style={{ marginTop: 16 }}>
          <Alert type={result?.ok ? "success" : "error"} message={result?.message || (result?.ok ? t("institutDocuments.verify.messages.ok") : t("institutDocuments.verify.messages.ko"))} />
        </div>
      )}
    </div>
  );
}
