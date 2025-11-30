import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Select, Card, Breadcrumb, Row, Col, message, Steps, DatePicker, Checkbox, Divider, Spin } from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import demandeService from "@/services/demandeService";
import organizationService from "@/services/organizationService";
import { useAuth } from "@/hooks/useAuth";

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const typeOptions = [
  { value: "TRADUCTION", label: "Traduction" },
  { value: "VERIFICATION", label: "Vérification" },
  { value: "AUTRE", label: "Autre" },
];

const UserDemandeEdit = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [demande, setDemande] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [fetchingOrgs, setFetchingOrgs] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchDemande();
    fetchOrganizations();
  }, [id]);

  const fetchDemande = async () => {
    setLoading(true);
    try {
      const response = await demandeService.getById(id);
      setDemande(response.demande);
      form.setFieldsValue({
        type: response.demande.type,
        targetOrgId: response.demande.targetOrg?.id,
        observation: response.demande.observation,
        // académiques
        serie: response.demande.meta.serie,
        niveau: response.demande.meta.niveau,
        mention: response.demande.meta.mention,
        annee: response.demande.meta.annee,
        countryOfSchool: response.demande.meta.countryOfSchool,
        secondarySchoolName: response.demande.meta.secondarySchoolName,
        graduationDate: response.demande.meta.graduationDate ? new Date(response.demande.meta.graduationDate) : null,
        // identité
        dob: response.demande.dob ? new Date(response.demande.dob) : null,
        citizenship: response.demande.citizenship,
        passport: response.demande.passport,
        isEnglishFirstLanguage: response.demande.isEnglishFirstLanguage,
        englishProficiencyTests: response.demande.englishProficiencyTests,
        testScores: response.demande.testScores,
        // finance
        willApplyForFinancialAid: response.demande.willApplyForFinancialAid,
        hasExternalSponsorship: response.demande.hasExternalSponsorship,
        // essays
        personalStatement: response.demande.personalStatement,
        optionalEssay: response.demande.optionalEssay,
      });
    } catch (error) {
      message.error("Erreur lors de la récupération de la demande");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    setFetchingOrgs(true);
    try {
      const response = await organizationService.list({ limit: 1000, type: "TRADUCTEUR" });
      setOrganizations(response.organizations);
    } catch (error) {
      message.error("Erreur lors de la récupération des organisations");
      console.error(error);
    } finally {
      setFetchingOrgs(false);
    }
  };

  const steps = [
    {
      title: "Informations de base",
      content: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Type de demande"
              rules={[{ required: true, message: "Le type est obligatoire" }]}
            >
              <Select placeholder="Sélectionner un type" disabled>
                {typeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="targetOrgId"
              label="Organisation cible"
              rules={[{ required: true, message: "L'organisation est obligatoire" }]}
            >
              <Select
                placeholder="Sélectionner une organisation"
                loading={fetchingOrgs}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {organizations.map(org => (
                  <Option key={org.id} value={org.id}>
                    {org.name} ({org.type})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="observation"
              label="Observations"
            >
              <TextArea rows={4} placeholder="Observations supplémentaires" />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      title: "Informations académiques",
      content: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="serie"
              label="Série"
            >
              <Input placeholder="Série (ex: S, L, ES)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="niveau"
              label="Niveau"
            >
              <Input placeholder="Niveau (ex: Bac, Licence, Master)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="mention"
              label="Mention"
            >
              <Input placeholder="Mention (ex: Bien, Très Bien)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="annee"
              label="Année"
            >
              <Input placeholder="Année (ex: 2023)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="countryOfSchool"
              label="Pays de l'école"
            >
              <Input placeholder="Pays de l'école" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="secondarySchoolName"
              label="Nom de l'école"
            >
              <Input placeholder="Nom de l'école secondaire" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="graduationDate"
              label="Date de graduation"
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      title: "Informations personnelles",
      content: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dob"
              label="Date de naissance"
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="citizenship"
              label="Nationalité"
            >
              <Input placeholder="Nationalité" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="passport"
              label="Numéro de passeport"
            >
              <Input placeholder="Numéro de passeport" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="isEnglishFirstLanguage"
              label="L'anglais est-il votre première langue ?"
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="englishProficiencyTests"
              label="Tests de compétence en anglais"
            >
              <TextArea rows={2} placeholder="Tests de compétence en anglais (ex: TOEFL, IELTS)" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="testScores"
              label="Scores des tests"
            >
              <TextArea rows={2} placeholder="Scores des tests" />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      title: "Informations financières",
      content: (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="willApplyForFinancialAid"
              label="Souhaitez-vous demander une aide financière ?"
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="hasExternalSponsorship"
              label="Avez-vous un parrainage externe ?"
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      title: "Informations supplémentaires",
      content: (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="personalStatement"
              label="Déclaration personnelle"
            >
              <TextArea rows={4} placeholder="Déclaration personnelle" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="optionalEssay"
              label="Essai optionnel"
            >
              <TextArea rows={4} placeholder="Essai optionnel" />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        userId: user.id,
        graduationDate: values.graduationDate ? values.graduationDate.toISOString() : null,
        dob: values.dob ? values.dob.toISOString() : null,
      };
      const response = await demandeService.update(id, payload);
      message.success("Demande mise à jour avec succès");
      navigate(`/user/demandes/${response.demande.id}/details`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      message.error(error?.message || "Erreur lors de la mise à jour de la demande");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !demande) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Modifier la Demande</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">Dashboard</Link> },
              { title: <Link to="/user/demandes">Mes Demandes</Link> },
              { title: "Modifier la Demande" },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            Retour
          </Button>
        </div>
        <Card title="Modifier la Demande" className="mt-4">
          <Steps current={currentStep} className="mb-6">
            {steps.map((step, index) => (
              <Step key={index} title={step.title} />
            ))}
          </Steps>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            {steps[currentStep].content}
            <Divider />
            <Row justify="space-between">
              <Col>
                {currentStep > 0 && (
                  <Button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    icon={<ArrowLeftOutlined />}
                  >
                    Précédent
                  </Button>
                )}
              </Col>
              <Col>
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="primary"
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    {loading ? "Mise à jour en cours..." : "Mettre à jour"}
                  </Button>
                )}
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default UserDemandeEdit;
