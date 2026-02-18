import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Select, Card, Breadcrumb, Row, Col, message, Steps, DatePicker, Checkbox, Divider, Spin } from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import demandeService from "@/services/demandeService";
import organizationService from "@/services/organizationService";
import { useAuth } from "@/hooks/useAuth";
import { DATE_FORMAT } from "@/utils/dateFormat";

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const UserDemandeEdit = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const typeOptions = [
    { value: "TRADUCTION", label: t("adminUserDemandeEdit.type.TRADUCTION") },
    { value: "VERIFICATION", label: t("adminUserDemandeEdit.type.VERIFICATION") },
    { value: "AUTRE", label: t("adminUserDemandeEdit.type.AUTRE") },
  ];
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
      message.error(t("adminUserDemandeEdit.messages.loadDemandeError"));
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
      message.error(t("adminUserDemandeEdit.messages.loadOrgsError"));
      console.error(error);
    } finally {
      setFetchingOrgs(false);
    }
  };

  const steps = [
    {
      title: t("adminUserDemandeEdit.steps.basic"),
      content: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label={t("adminUserDemandeEdit.fields.type")}
              rules={[{ required: true, message: t("adminUserDemandeEdit.validation.typeRequired") }]}
            >
              <Select placeholder={t("adminUserDemandeEdit.placeholders.selectType")} disabled>
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
              label={t("adminUserDemandeEdit.fields.targetOrg")}
              rules={[{ required: true, message: t("adminUserDemandeEdit.validation.orgRequired") }]}
            >
              <Select
                placeholder={t("adminUserDemandeEdit.placeholders.selectOrg")}
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
              label={t("adminUserDemandeEdit.fields.observation")}
            >
              <TextArea rows={4} placeholder={t("adminUserDemandeEdit.placeholders.observation")} />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      title: t("adminUserDemandeEdit.steps.academic"),
      content: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="serie" label={t("adminUserDemandeEdit.fields.serie")}>
              <Input placeholder={t("adminUserDemandeEdit.placeholders.serie")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="niveau" label={t("adminUserDemandeEdit.fields.niveau")}>
              <Input placeholder={t("adminUserDemandeEdit.placeholders.niveau")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="mention" label={t("adminUserDemandeEdit.fields.mention")}>
              <Input placeholder={t("adminUserDemandeEdit.placeholders.mention")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="annee" label={t("adminUserDemandeEdit.fields.annee")}>
              <Input placeholder={t("adminUserDemandeEdit.placeholders.annee")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="countryOfSchool" label={t("adminUserDemandeEdit.fields.countryOfSchool")}>
              <Input placeholder={t("adminUserDemandeEdit.placeholders.countryOfSchool")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="secondarySchoolName" label={t("adminUserDemandeEdit.fields.secondarySchoolName")}>
              <Input placeholder={t("adminUserDemandeEdit.placeholders.secondarySchoolName")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="graduationDate" label={t("adminUserDemandeEdit.fields.graduationDate")}>
              <DatePicker style={{ width: "100%" }} format={DATE_FORMAT} />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      title: t("adminUserDemandeEdit.steps.personal"),
      content: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="dob" label={t("adminUserDemandeEdit.fields.dob")}>
              <DatePicker style={{ width: "100%" }} format={DATE_FORMAT} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="citizenship" label={t("adminUserDemandeEdit.fields.citizenship")}>
              <Input placeholder={t("adminUserDemandeEdit.fields.citizenship")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="passport" label={t("adminUserDemandeEdit.fields.passport")}>
              <Input placeholder={t("adminUserDemandeEdit.placeholders.passport")} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="isEnglishFirstLanguage"
              label={t("adminUserDemandeEdit.fields.isEnglishFirstLanguage")}
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="englishProficiencyTests" label={t("adminUserDemandeEdit.fields.englishProficiencyTests")}>
              <TextArea rows={2} placeholder={t("adminUserDemandeEdit.placeholders.englishTests")} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="testScores" label={t("adminUserDemandeEdit.fields.testScores")}>
              <TextArea rows={2} placeholder={t("adminUserDemandeEdit.placeholders.testScores")} />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      title: t("adminUserDemandeEdit.steps.financial"),
      content: (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="willApplyForFinancialAid"
              label={t("adminUserDemandeEdit.fields.willApplyForFinancialAid")}
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="hasExternalSponsorship"
              label={t("adminUserDemandeEdit.fields.hasExternalSponsorship")}
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      title: t("adminUserDemandeEdit.steps.extra"),
      content: (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="personalStatement" label={t("adminUserDemandeEdit.fields.personalStatement")}>
              <TextArea rows={4} placeholder={t("adminUserDemandeEdit.fields.personalStatement")} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="optionalEssay" label={t("adminUserDemandeEdit.fields.optionalEssay")}>
              <TextArea rows={4} placeholder={t("adminUserDemandeEdit.fields.optionalEssay")} />
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
      message.success(t("adminUserDemandeEdit.messages.updateSuccess"));
      navigate(`/user/demandes/${response.demande.id}/details`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      message.error(error?.message || t("adminUserDemandeEdit.messages.updateError"));
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
          <h5 className="text-lg font-semibold">{t("adminUserDemandeEdit.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">{t("adminUserDemandeEdit.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/user/demandes">{t("adminUserDemandeEdit.breadcrumb.myDemandes")}</Link> },
              { title: t("adminUserDemandeEdit.breadcrumb.edit") },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            {t("adminUserDemandeEdit.buttons.back")}
          </Button>
        </div>
        <Card title={t("adminUserDemandeEdit.cardTitle")} className="mt-4">
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
                    {t("adminUserDemandeEdit.buttons.prev")}
                  </Button>
                )}
              </Col>
              <Col>
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="primary"
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    {t("adminUserDemandeEdit.buttons.next")}
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    {loading ? t("adminUserDemandeEdit.buttons.updating") : t("adminUserDemandeEdit.buttons.update")}
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
