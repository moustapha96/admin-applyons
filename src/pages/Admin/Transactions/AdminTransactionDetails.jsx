"use client";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb, Button, Card, Descriptions, Space, Tag, message, Select, Divider } from "antd";
import dayjs from "dayjs";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import transactionService from "../../../services/transactionService";


export default function AdminTransactionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tx, setTx] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState();

  const load = async () => {
    try {
      const res = await transactionService.getById(id);
      setTx(res?.transaction || res);
      setNewStatus(res?.transaction?.statut);
    } catch (e) { message.error(e?.response?.data?.message || "Échec chargement"); }
  };

  useEffect(()=>{ load(); }, [id]);

  const updateStatus = async () => {
    try {
      setSaving(true);
      await transactionService.updateStatut(id, newStatus);
      message.success("Statut mis à jour");
      load();
    } catch (e) { message.error(e?.response?.data?.message || "Échec mise à jour"); }
    finally { setSaving(false); }
  };

  const statusTag = (s) => {
    const color = s === "COMPLETED" ? "green" : s === "FAILED" ? "red" : "gold";
    return <Tag color={color}>{s}</Tag>;
  };

  if (!tx) return null;

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Détail transaction</h5>
          <Breadcrumb items={[
            { title: <Link to="/admin/dashboard">Dashboard</Link> },
            { title: <Link to="/admin/transactions">Transactions</Link> },
            { title: "Détails" },
          ]}/>
        </div>

        <Card>
          <Descriptions bordered column={1} title={`Transaction #${tx.id.slice(0,8)}…`}>
            <Descriptions.Item label="Date">{tx.dateTransaction ? dayjs(tx.dateTransaction).format("DD/MM/YYYY HH:mm") : "—"}</Descriptions.Item>
            <Descriptions.Item label="Montant">{Number(tx.montant || 0).toLocaleString()} USD</Descriptions.Item>
            <Descriptions.Item label="Statut">{statusTag(tx.statut)}</Descriptions.Item>
            <Descriptions.Item label="Type paiement">{tx.typePaiement}</Descriptions.Item>
            <Descriptions.Item label="Type transaction">{tx.typeTransaction || "—"}</Descriptions.Item>
            <Descriptions.Item label="Demande">
              {tx.demandePartage
                ? <Link to={`/admin/demandes/${tx.demandePartage.id}/details`}>{tx.demandePartage.code}</Link>
                : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Utilisateur">
              {tx.user ? `${tx.user.username || tx.user.email}` : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Règlement (si lié)">
              {tx.payment ? `${tx.payment.provider} — ${tx.payment.amount} (${tx.payment.status})` : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Créé le">{tx.createdAt ? dayjs(tx.createdAt).format("DD/MM/YYYY HH:mm") : "—"}</Descriptions.Item>
            <Descriptions.Item label="Maj le">{tx.updatedAt ? dayjs(tx.updatedAt).format("DD/MM/YYYY HH:mm") : "—"}</Descriptions.Item>
          </Descriptions>

          <Divider />

          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={()=> navigate(-1)}>Retour</Button>
            <Select
              value={newStatus}
              onChange={setNewStatus}
              options={[
                { value: "PENDING", label: "PENDING" },
                { value: "COMPLETED", label: "COMPLETED" },
                { value: "FAILED", label: "FAILED" },
              ]}
              style={{ width: 200 }}
            />
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={updateStatus}>
              Enregistrer le statut
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  );
}
