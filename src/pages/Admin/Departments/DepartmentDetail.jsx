// src/pages/Admin/Departments/DepartmentDetail.jsx
"use client";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Breadcrumb, Button, Card, Descriptions, Space, Tag, message } from "antd";
import dayjs from "dayjs";

import departmentService from "@/services/departmentService";

const BASE_PATH = "/admin/departments";

export default function DepartmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dep, setDep] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    (async ()=> {
      try {
        const res = await departmentService.getById(id); // le service retourne { department } ou l'objet direct
        setDep(res?.department || res);
      } catch (e) {
        message.error(e?.response?.data?.message || "Impossible de charger le département");
        navigate(BASE_PATH);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Départements</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">Dashboard</Link> },
              { title: <Link to={BASE_PATH}>Départements</Link> },
              { title: dep?.name || "Détail" },
            ]}
          />
        </div>

        <Card loading={loading} title={dep?.name ? `Département : ${dep.name}` : "Département"}>
          {dep && (
            <>
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="Nom">{dep.name}</Descriptions.Item>
                <Descriptions.Item label="Code">{dep.code || "—"}</Descriptions.Item>

                <Descriptions.Item label="Organisation" span={2}>
                  {dep.organization?.name || "—"}
                </Descriptions.Item>

                <Descriptions.Item label="Filières">
                  <Tag color="blue">{dep.filiereCount ?? 0}</Tag>
                </Descriptions.Item>


                <Descriptions.Item label="Description" span={2}>
                  {dep.description || "—"}
                </Descriptions.Item>
              </Descriptions>

              <Space className="mt-4" wrap>
                <Link to={`${BASE_PATH}/${dep.id}/filieres`}>
                  <Button>Voir les filières</Button>
                </Link>
               
                <Button onClick={() => navigate(-1)}>Retour</Button>
              </Space>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
