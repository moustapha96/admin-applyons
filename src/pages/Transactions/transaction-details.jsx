import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Descriptions, Button, Space } from "antd";
import http from "@/services/http";

export default function TransactionDetails() {
  const { id } = useParams();
  const [trx, setTrx] = useState();

  useEffect(()=>{
    (async ()=>{
      const { data } = await http.get(`/transactions/${id}`);
      setTrx(data?.transaction || data);
    })();
  },[id]);

  if (!trx) return null;

  return (
    <div>
      <h2>Transaction #{id}</h2>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Demande">{trx.demandePartageId}</Descriptions.Item>
        <Descriptions.Item label="Montant">{trx.montant}</Descriptions.Item>
        <Descriptions.Item label="Type">{trx.typePaiement}</Descriptions.Item>
        <Descriptions.Item label="Statut">{trx.statut}</Descriptions.Item>
        <Descriptions.Item label="Créée le">{trx.createdAt ? new Date(trx.createdAt).toLocaleString() : "—"}</Descriptions.Item>
      </Descriptions>
      <Space style={{ marginTop: 16 }}>
        <Link to="/transactions"><Button>Retour</Button></Link>
      </Space>
    </div>
  );
}
