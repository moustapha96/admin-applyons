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

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { confirm } = Modal;

const typeOptions = [
  { value: "TRADUCTION", label: "Traduction" },
  { value: "VERIFICATION", label: "Vérification" },
  { value: "AUTRE", label: "Autre" },
];

const UserDemandeCreate = () => {
  const { user } = useAuth();
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
      message.error("Erreur lors de la récupération des organisations");
      console.error(error);
    } finally {
      setFetchingOrgs(false);
    }
  };

  // Étapes du formulaire
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
              <Select placeholder="Sélectionner un type">
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
              rules={[{ required: true, message: "L'organisation cible est obligatoire" }]}
            >
              <Select
                placeholder="Sélectionner une organisation cible"
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
              label="Organisation de traduction"
              rules={[{ required: true, message: "L'organisation de traduction est obligatoire" }]}
            >
              <Select
                placeholder="Sélectionner une organisation de traduction"
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
    {
      title: "Paiement",
      content: (
        <div className="text-center p-4">
          <Alert
            message="Veuillez procéder au paiement pour finaliser votre demande."
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
                  message.error("Veuillez remplir tous les champs obligatoires.");
                });
            }}
          >
            Payer maintenant
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
      message.success("Demande créée avec succès");
      navigate(`/user/demandes/${response.demande.id}/details`);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      message.error(error?.message || "Erreur lors de la création de la demande");
    } finally {
      setLoading(false);
    }
  };

  // Gestion du paiement Stripe
  const handleStripePayment = async () => {
    if (!stripePromise) {
      message.error("Stripe n'est pas chargé. Veuillez réessayer.");
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
      message.error("Erreur lors de la préparation du paiement");
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
      message.error("Erreur lors de la préparation du paiement");
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
        message.error("Stripe n'est pas chargé. Veuillez réessayer.");
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
        message.success("Paiement réussi !");
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
          {paymentLoading ? "Traitement..." : "Payer 49 USD"}
        </Button>
      </form>
    );
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Nouvelle Demande</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">Dashboard</Link> },
              { title: <Link to="/user/demandes">Mes Demandes</Link> },
              { title: "Nouvelle Demande" },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            Retour
          </Button>
        </div>
        <Card title="Nouvelle Demande" className="mt-4">
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
                    onClick={() => {
                      form.validateFields()
                        .then(() => setCurrentStep(currentStep + 1))
                        .catch(() => message.error("Veuillez remplir tous les champs obligatoires."));
                    }}
                  >
                    Suivant
                  </Button>
                ) : null}
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Modal de paiement */}
        <Modal
          title="Choisir un moyen de paiement"
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
                Payer avec Stripe
              </Button>
              <Button
                type="default"
                icon={<DollarOutlined />}
                size="large"
                style={{ width: "100%" }}
                onClick={handlePayPalPayment}
                loading={paymentLoading && paymentMethod === "paypal"}
              >
                Payer avec PayPal
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default UserDemandeCreate;
