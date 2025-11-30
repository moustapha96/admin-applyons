import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic } from "antd";
import http from "@/services/http";

export default function TransactionStats() {
  const [stats, setStats] = useState({ total:0, success:0, failed:0, volume:0 });

  useEffect(()=>{
    (async ()=>{
      const { data } = await http.get("/transactions/stats");
      setStats(data || {});
    })();
  },[]);

  return (
    <Row gutter={16}>
      <Col span={6}><Card><Statistic title="Total" value={stats.total || 0} /></Card></Col>
      <Col span={6}><Card><Statistic title="Success" value={stats.success || 0} /></Card></Col>
      <Col span={6}><Card><Statistic title="Failed" value={stats.failed || 0} /></Card></Col>
      <Col span={6}><Card><Statistic title="Volume" value={stats.volume || 0} /></Card></Col>
    </Row>
  );
}
