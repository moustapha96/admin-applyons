
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spin, Card, Row, Col, Typography } from "antd";
import organizationService from "../../../services/organizationservice";

const OrganizationDetails = () => {
  const { organizationId } = useParams();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await organizationService.getOrganizationById(organizationId);
        setOrganization(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'organisation:", error);
      }
      setLoading(false);
    };
    fetchOrganization();
  }, [organizationId]);

  if (loading) {
    return <Spin />;
  }

  return (
    <Card title="Détails de l'organisation">
      <Row gutter={16}>
        <Col span={8}>
          <Typography.Title level={4}>
            {organization && organization.name}
          </Typography.Title>
        </Col>
        <Col span={8}>
          <Typography.Title level={4}>
            {organization && organization.type}
          </Typography.Title>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Typography.Text>
            {organization && organization.address}
          </Typography.Text>
        </Col>
        <Col span={8}>
          <Typography.Text>
            {organization && organization.country}
          </Typography.Text>
        </Col>
      </Row>
    </Card>
  );
};

export default OrganizationDetails;
