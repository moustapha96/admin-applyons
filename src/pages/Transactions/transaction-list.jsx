import { useEffect, useState } from "react";
import { Table, Space, Tag, Button, Select } from "antd";
import { Link } from "react-router-dom";
import http from "@/services/http";

export default function TransactionList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statut, setStatut] = useState();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await http.get("/transactions", { params: { statut }});
      setRows(data?.transactions || data || []);
    } finally { setLoading(false); }
  };

  useEffect(()=>{ fetchData(); },[]);

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Demande", dataIndex: "demandePartageId" },
    { title: "Montant", dataIndex: "montant" },
    { title: "Type paiement", dataIndex: "typePaiement" },
    { title: "Statut", dataIndex: "statut", render: s => <Tag color={s==="SUCCESS"?"green": s==="FAILED"?"red":"blue"}>{s}</Tag> },
    { title: "Actions", render: (_,r)=>(<Space><Link to={`/transactions/${r.id}`}>Détails</Link></Space>)}
  ];

  return (
    <div>
      <h2>Transactions</h2>
      <Space style={{ marginBottom: 16 }}>
        <Select placeholder="Statut" allowClear value={statut} onChange={setStatut}
          options={["PENDING","SUCCESS","FAILED","CANCELED"].map(s=>({value:s,label:s}))} style={{ width: 200 }} />
        <Button onClick={fetchData} type="primary">Filtrer</Button>
        <Link to="/transactions/stats"><Button>Stats</Button></Link>
      </Space>
      <Table rowKey="id" loading={loading} dataSource={rows} columns={columns} />
    </div>
  );
}
