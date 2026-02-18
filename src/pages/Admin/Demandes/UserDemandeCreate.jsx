/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Breadcrumb,
  Row,
  Col,
  message,
  Steps,
  DatePicker,
  Checkbox,
  Divider,
  Modal,
  Alert
} from "antd";
import {
  ArrowLeftOutlined,
  DollarOutlined,
  CreditCardOutlined,
  
} from "@ant-design/icons";
import demandeService from "@/services/demandeService";
import organizationService from "@/services/organizationService";
import paymentService from "@/services/paymentService";
import { useAuth } from "@/hooks/useAuth";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useTranslation } from "react-i18next";
import { DATE_FORMAT } from "@/utils/dateFormat";

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { confirm } = Modal;

const UserDemandeCreate = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const typeOptions = [
    { value: "TRADUCTION", label: t("adminUserDemandeCreate.type.TRADUCTION") },
    { value: "VERIFICATION", label: t("adminUserDemandeCreate.type.VERIFICATION") },
    { value: "AUTRE", label: t("adminUserDemandeCreate.type.AUTRE") },
  ];
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [organizations, setOrganizations] = useState([]);
  const [translatorOrgs, setTranslatorOrgs] = useState([]);
  const [fetchingOrgs, setFetchingOrgs] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [formData, setFormData] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const navigate = useNavigate();

  // Charger Stripe.js
  useEffect(() => {
    const loadStripeScript = async () => {
      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
      setStripePromise(stripe);
    };
    loadStripeScript();
  }, []);

  // Récupérer les organisations
  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setFetchingOrgs(true);
    try {
      // Récupérer les organisations cibles (ex: universités, entreprises)
      const targetResponse = await organizationService.list({
        limit: 1000,
        type: { in: ["UNIVERSITE", "ENTREPRISE", "COLLEGE", "LYCEE"] }
      });
      setOrganizations(targetResponse.organizations);

      // Récupérer les organisations de traduction
      const translatorResponse = await organizationService.list({
        limit: 1000,
        type: "TRADUCTEUR"
      });
      setTranslatorOrgs(translatorResponse.organizations);
    } catch (error) {
      message.error(t("adminUserDemandeCreate.messages.loadOrgsError"));
      console.error(error);
    } finally {
      setFetchingOrgs(false);
    }
  };

  const steps = [
    {
      title: t("adminUserDemandeCreate.steps.basic"),
      content: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label={t("adminUserDemandeCreate.fields.type")}
              rules={[{ required: true, message: t("adminUserDemandeCreate.validation.typeRequired") }]}
            >
              <Select placeholder={t("adminUserDemandeCreate.placeholders.selectType")}>
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
              label={t("adminUserDemandeCreate.fields.targetOrg")}
              rules={[{ required: true, message: t("adminUserDemandeCreate.validation.targetOrgRequired") }]}
            >
              <Select
                placeholder={t("adminUserDemandeCreate.placeholders.selectTargetOrg")}
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
          <Col span={12}>
            <Form.Item
              name="assignedOrgId"
              label={t("adminUserDemandeCreate.fields.assignedOrg")}
              rules={[{ required: true, message: t("adminUserDemandeCreate.validation.assignedOrgRequired") }]}
            >
              <Select
                placeholder={t("adminUserDemandeCreate.placeholders.selectAssignedOrg")}
                loading={fetchingOrgs}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {translatorOrgs.map(org => (
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
              label={t("adminUserDemandeCreate.fields.observation")}
            >
              <TextArea rows={4} placeholder={t("adminUserDemandeCreate.placeholders.observation")} />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      title: t("adminUserDemandeCreate.steps.academic"),
      content: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="serie" label={t("adminUserDemandeCreate.fields.serie")}>
              <Input placeholder={t("adminUserDemandeCreate.placeholders.serie")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="niveau" label={t("adminUserDemandeCreate.fields.niveau")}>
              <Input placeholder={t("adminUserDemandeCreate.placeholders.niveau")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="mention" label={t("adminUserDemandeCreate.fields.mention")}>
              <Input placeholder={t("adminUserDemandeCreate.placeholders.mention")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="annee" label={t("adminUserDemandeCreate.fields.annee")}>
              <Input placeholder={t("adminUserDemandeCreate.placeholders.annee")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="countryOfSchool" label={t("adminUserDemandeCreate.fields.countryOfSchool")}>
              <Input placeholder={t("adminUserDemandeCreate.placeholders.countryOfSchool")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="secondarySchoolName" label={t("adminUserDemandeCreate.fields.secondarySchoolName")}>
              <Input placeholder={t("adminUserDemandeCreate.placeholders.secondarySchoolName")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="graduationDate" label={t("adminUserDemandeCreate.fields.graduationDate")}>
              <DatePicker style={{ width: "100%" }} format={DATE_FORMAT} />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      title: t("adminUserDemandeCreate.steps.personal"),
      content: (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="dob" label={t("adminUserDemandeCreate.fields.dob")}>
              <DatePicker style={{ width: "100%" }} format={DATE_FORMAT} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="citizenship" label={t("adminUserDemandeCreate.fields.citizenship")}>
              <Input placeholder={t("adminUserDemandeCreate.fields.citizenship")} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="passport" label={t("adminUserDemandeCreate.fields.passport")}>
              <Input placeholder={t("adminUserDemandeCreate.placeholders.passport")} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="isEnglishFirstLanguage"
              label={t("adminUserDemandeCreate.fields.isEnglishFirstLanguage")}
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="englishProficiencyTests" label={t("adminUserDemandeCreate.fields.englishProficiencyTests")}>
              <TextArea rows={2} placeholder={t("adminUserDemandeCreate.placeholders.englishTests")} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="testScores" label={t("adminUserDemandeCreate.fields.testScores")}>
              <TextArea rows={2} placeholder={t("adminUserDemandeCreate.placeholders.testScores")} />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      title: t("adminUserDemandeCreate.steps.financial"),
      content: (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="willApplyForFinancialAid"
              label={t("adminUserDemandeCreate.fields.willApplyForFinancialAid")}
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="hasExternalSponsorship"
              label={t("adminUserDemandeCreate.fields.hasExternalSponsorship")}
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      title: t("adminUserDemandeCreate.steps.extra"),
      content: (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="personalStatement" label={t("adminUserDemandeCreate.fields.personalStatement")}>
              <TextArea rows={4} placeholder={t("adminUserDemandeCreate.fields.personalStatement")} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="optionalEssay" label={t("adminUserDemandeCreate.fields.optionalEssay")}>
              <TextArea rows={4} placeholder={t("adminUserDemandeCreate.fields.optionalEssay")} />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      title: t("adminUserDemandeCreate.steps.payment"),
      content: (
        <div className="text-center p-4">
          <Alert
            message={t("adminUserDemandeCreate.payment.alert")}
            type="info"
            showIcon
            className="mb-4"
          />
          <Button
            type="primary"
            icon={<DollarOutlined />}
            size="large"
            onClick={() => {
              form.validateFields()
                .then(values => {
                  setFormData(values);
                  setPaymentModalVisible(true);
                })
                .catch(error => {
                    console.error("Erreur lors de la validation des champs:", error);
                  message.error(t("adminUserDemandeCreate.messages.fillRequired"));
                });
            }}
          >
            {t("adminUserDemandeCreate.payment.payNow")}
          </Button>
        </div>
      ),
    },
  ];

  // Soumission du formulaire après paiement réussi
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        userId: user.id,
        status: "PENDING",
        dateDemande: new Date(),
        graduationDate: values.graduationDate ? values.graduationDate.toISOString() : null,
        dob: values.dob ? values.dob.toISOString() : null,
      };
      const response = await demandeService.create(payload);
      message.success(t("adminUserDemandeCreate.messages.createSuccess"));
      navigate(`/user/demandes/${response.demande.id}/details`);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      message.error(error?.message || t("adminUserDemandeCreate.messages.createError"));
    } finally {
      setLoading(false);
    }
  };

  // Gestion du paiement Stripe
  const handleStripePayment = async () => {
    if (!stripePromise) {
      message.error(t("adminUserDemandeCreate.messages.stripeNotLoaded"));
      return;
    }

    setPaymentLoading(true);
    try {
      // 1. Créer un paiement dans le backend
      const paymentResponse = await paymentService.create({
        provider: "stripe",
        amount: 49, // Montant en FCFA (à ajuster)
        currency: "USD",
        paymentType: "DEMANDE_PAYMENT",
        metadata: {
          demandeData: JSON.stringify(formData),
          userId: user.id,
        },
      });

      // 2. Obtenir le clientSecret pour Stripe
      const { clientSecret } = paymentResponse;
      setClientSecret(clientSecret);

      // 3. Afficher le formulaire Stripe
      setPaymentMethod("stripe-form");
    } catch (error) {
      console.error("Erreur lors de la création du paiement Stripe:", error);
      message.error(t("adminUserDemandeCreate.messages.paymentPrepError"));
    } finally {
      setPaymentLoading(false);
    }
  };

  // Gestion du paiement PayPal
  const handlePayPalPayment = async () => {
    setPaymentLoading(true);
    try {
      // 1. Créer un paiement dans le backend
      const paymentResponse = await paymentService.create({
        provider: "paypal",
        amount: 49, // Montant en FCFA (à ajuster)
        currency: "USD",
        paymentType: "DEMANDE_PAYMENT",
        metadata: {
          demandeData: JSON.stringify(formData),
          userId: user.id,
        },
      });

      // 2. Rediriger vers PayPal
      window.location.href = paymentResponse.approvalUrl;
    } catch (error) {
      console.error("Erreur lors de la création du paiement PayPal:", error);
      message.error(t("adminUserDemandeCreate.messages.paymentPrepError"));
    } finally {
      setPaymentLoading(false);
    }
  };

  // Composant pour le formulaire Stripe
  const StripeForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmitStripe = async (event) => {
      event.preventDefault();
      setPaymentLoading(true);

      if (!stripe || !elements) {
        message.error(t("adminUserDemandeCreate.messages.stripeNotLoaded"));
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (error) {
        console.error("Erreur Stripe:", error);
        message.error(error.message);
        setPaymentLoading(false);
      } else if (paymentIntent.status === "succeeded") {
        message.success(t("adminUserDemandeCreate.messages.paymentSuccess"));
        setPaymentModalVisible(false);

        // Soumettre le formulaire après paiement réussi
        handleSubmit(formData);
      }
    };

    return (
      <form onSubmit={handleSubmitStripe}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
        <Button
          type="primary"
          htmlType="submit"
          loading={paymentLoading}
          className="mt-4"
          block
        >
          {paymentLoading ? t("adminUserDemandeCreate.payment.processing") : t("adminUserDemandeCreate.payment.payAmount")}
        </Button>
      </form>
    );
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("adminUserDemandeCreate.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">{t("adminUserDemandeCreate.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/user/demandes">{t("adminUserDemandeCreate.breadcrumb.myDemandes")}</Link> },
              { title: t("adminUserDemandeCreate.breadcrumb.new") },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            {t("adminUserDemandeCreate.buttons.back")}
          </Button>
        </div>
        <Card title={t("adminUserDemandeCreate.cardTitle")} className="mt-4">
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
                    {t("adminUserDemandeCreate.buttons.prev")}
                  </Button>
                )}
              </Col>
              <Col>
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="primary"
                    onClick={() => {
                      form.validateFields()
                        .then(() => setCurrentStep(currentStep + 1))
                        .catch(() => message.error(t("adminUserDemandeCreate.messages.fillRequired")));
                    }}
                  >
                    {t("adminUserDemandeCreate.buttons.next")}
                  </Button>
                ) : null}
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Modal de paiement */}
        <Modal
          title={t("adminUserDemandeCreate.payment.chooseMethod")}
          visible={paymentModalVisible}
          onCancel={() => setPaymentModalVisible(false)}
          footer={null}
          width={500}
        >
          {paymentMethod === "stripe-form" ? (
            <Elements stripe={stripePromise}>
              <StripeForm />
            </Elements>
          ) : (
            <div className="text-center p-4">
              <Button
                type="primary"
                icon={<CreditCardOutlined />}
                size="large"
                className="mb-2"
                style={{ width: "100%" }}
                onClick={handleStripePayment}
                loading={paymentLoading && paymentMethod === "stripe"}
              >
                {t("adminUserDemandeCreate.payment.stripe")}
              </Button>
              <Button
                type="default"
                icon={<DollarOutlined />}
                size="large"
                style={{ width: "100%" }}
                onClick={handlePayPalPayment}
                loading={paymentLoading && paymentMethod === "paypal"}
              >
                {t("adminUserDemandeCreate.payment.paypal")}
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default UserDemandeCreate;
