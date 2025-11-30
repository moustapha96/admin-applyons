

// /* eslint-disable no-unused-vars */
// "use client";
// import { useEffect, useState, useCallback } from "react";
// import { Link } from "react-router-dom";
// import {
//   Breadcrumb, Card, Table, Button, Modal, Form, InputNumber,
//   Row, Col, Space, Tag, Typography, message, Radio, Spin, Select,
//   Popconfirm,
//   DatePicker
// } from "antd";
// import dayjs from "dayjs";
// import { PlusOutlined } from "@ant-design/icons";
// import { useAuth } from "../../../hooks/useAuth";
// import abonnementService from "../../../services/abonnement.service";
// import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
// import { Elements } from "@stripe/react-stripe-js";
// import { loadStripe } from "@stripe/stripe-js";
// import CheckoutForm from "../../../components/payment/CheckoutForm";
// import paymentService from "@/services/paymentService";

// const { Text } = Typography;
// const { RangePicker } = DatePicker;
// const CURRENCY = "USD";

// export default function InstitutAbonnementsListe() {
//   const { user } = useAuth();
//   const orgId = user?.organization?.id;

//   // ===== États =====
//   const [active, setActive] = useState(null);
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
//   const [filters, setFilters] = useState({
//     activeOnly: false,
//     expiredOnly: false,
//     dateFrom: null,
//     dateTo: null,
//     minMontant: null,
//     maxMontant: null,
//     sortBy: "createdAt",
//     sortOrder: "desc",
//   });

//   // ===== Modals =====
//   const [openCreate, setOpenCreate] = useState(false);
//   const [openRenew, setOpenRenew] = useState(false);
//   const [editingRow, setEditingRow] = useState(null);
//   const [form] = Form.useForm();
//   const [formRenew] = Form.useForm();
//   const [modalStep, setModalStep] = useState(1); // 1=form, 2=paiement
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(""); // 'stripe' | 'paypal'
//   const [paymentAmount, setPaymentAmount] = useState(0);
//   const [paymentStatus, setPaymentStatus] = useState(null);
//   const [loadingPayment, setLoadingPayment] = useState(false);

//   // ===== Stripe =====
//   const [stripePromise, setStripePromise] = useState(null);
//   const [clientSecret, setClientSecret] = useState("");
//   const [initializingStripe, setInitializingStripe] = useState(false);

//   // ===== PayPal =====
//   const [paypalOptions, setPaypalOptions] = useState(null);

//   // ===== Chargement des données =====
//   const loadActive = useCallback(async () => {
//     if (!orgId) return;
//     try {
//       const res = await abonnementService.getActiveForOrg(orgId);
//       setActive(res?.abonnement || null);
//     } catch {
//       setActive(null);
//     }
//   }, [orgId]);

//   const loadList = useCallback(
//     async (_page = pagination.page, _limit = pagination.limit) => {
//       if (!orgId) return;
//       setLoading(true);
//       try {
//         const params = {
//           organizationId: orgId,
//           page: _page,
//           limit: _limit,
//           sortBy: filters.sortBy,
//           sortOrder: filters.sortOrder,
//           activeOnly: filters.activeOnly || undefined,
//           expiredOnly: filters.expiredOnly || undefined,
//           dateFrom: filters.dateFrom || undefined,
//           dateTo: filters.dateTo || undefined,
//           minMontant: filters.minMontant ?? undefined,
//           maxMontant: filters.maxMontant ?? undefined,
//         };
//         const res = await abonnementService.list(params);
//         setRows(res.abonnements || []);
//         setPagination({
//           page: res.pagination?.page || _page,
//           limit: res.pagination?.limit || _limit,
//           total: res.pagination?.total || 0,
//         });
//       } catch (e) {
//         message.error(e?.message || "Échec de chargement");
//       } finally {
//         setLoading(false);
//       }
//     },
//     [orgId, filters, pagination.page, pagination.limit]
//   );

//   useEffect(() => {
//     loadActive();
//     loadList(1, pagination.limit);
//   }, [orgId, loadActive, loadList]);

//   // ===== Gestion des filtres =====
//   const applyFilter = () => loadList(1, pagination.limit);
//   const clearFilter = () => {
//     setFilters({
//       activeOnly: false,
//       expiredOnly: false,
//       dateFrom: null,
//       dateTo: null,
//       minMontant: null,
//       maxMontant: null,
//       sortBy: "createdAt",
//       sortOrder: "desc",
//     });
//     loadList(1, pagination.limit);
//   };

//   // ===== Gestion des actions =====
//   const onSoftDelete = async (row) => {
//     try {
//       await abonnementService.softDelete(row.id);
//       message.success("Abonnement archivé");
//       loadActive();
//       loadList(pagination.page, pagination.limit);
//     } catch (e) {
//       message.error(e?.message || "Échec archivage");
//     }
//   };

//   const onRestore = async (row) => {
//     try {
//       await abonnementService.restore(row.id);
//       message.success("Abonnement restauré");
//       loadActive();
//       loadList(pagination.page, pagination.limit);
//     } catch (e) {
//       message.error(e?.message || "Échec restauration");
//     }
//   };

//   const onHardDelete = async (row) => {
//     try {
//       await abonnementService.hardDelete(row.id);
//       message.success("Abonnement supprimé définitivement");
//       loadActive();
//       loadList(pagination.page, pagination.limit);
//     } catch (e) {
//       if (e?.code === "ABO_NOT_ARCHIVED") {
//         message.error("Archive d'abord avant suppression définitive.");
//       } else {
//         message.error(e?.message || "Échec suppression");
//       }
//     }
//   };

//   const openRenewModal = (row) => {
//     setEditingRow(row);
//     formRenew.resetFields();
//     setOpenRenew(true);
//   };

//   // ===== Gestion des modals =====
//   const openCreateModal = () => {
//     setOpenCreate(true);
//     setModalStep(1);
//     setSelectedPaymentMethod("");
//     setPaymentStatus(null);
//     setPaymentAmount(0);
//     setStripePromise(null);
//     setClientSecret("");
//     setInitializingStripe(false);
//     setPaypalOptions(null);
//     form.resetFields();
//   };

//   const goToPayment = async () => {
//     try {
//       const v = await form.validateFields();
//       const amount = Number(v.montant || 0);
//       if (!v.paymentMethod) return message.error("Choisissez un mode de paiement");
//       if (!amount || amount <= 0) return message.error("Montant invalide");

//       setPaymentAmount(amount);
//       setSelectedPaymentMethod(v.paymentMethod);

//       if (v.paymentMethod === "stripe") {
//         setInitializingStripe(true);
//         try {
//           const resp = await paymentService.createPaymentIntentInstitut({
//             institutId: orgId,
//             amount: Math.round(amount * 100),
//             currency: CURRENCY,
//           });
//           const clientSecretNext = resp?.clientSecret || resp?.client_secret;
//           const publishableKey = resp?.publishableKey || resp?.publishable_key;
//           if (!clientSecretNext) throw new Error("Client secret Stripe manquant");
//           if (!publishableKey) throw new Error("Clé publique Stripe manquante");
//           setClientSecret(clientSecretNext);
//           setStripePromise(loadStripe(publishableKey));
//         } catch (e) {
//           message.error(e?.message || "Impossible d'initialiser Stripe");
//           return;
//         } finally {
//           setInitializingStripe(false);
//         }
//       }

//       if (v.paymentMethod === "paypal") {
//         try {
//           const cfg = await paymentService.getPayPalConfig();
//           setPaypalOptions({
//             clientId: cfg?.clientId || cfg?.client_id || "",
//             currency: (cfg?.currency || CURRENCY).toUpperCase(),
//             intent: cfg?.intent || "capture",
//           });
//         } catch (e) {
//           message.error(e?.message || "Configuration PayPal indisponible");
//           return;
//         }
//       }

//       setModalStep(2);
//     } catch (e) {
//       message.error(e?.message || "Erreur de validation");
//     }
//   };

//   const finalizeAfterPayment = async (paymentMethod, paymentData) => {
//     const payload = {
//       organizationId: orgId,
//       dateDebut: dayjs().startOf("day").toISOString(),
//       dateExpiration: dayjs().add(1, "year").endOf("day").toISOString(),
//       montant: paymentAmount,
//       paymentMethod: paymentMethod === "paypal" ? "PayPal" : "Stripe",
//       paymentInfo: paymentData,
//       currency: CURRENCY,
//     };
//     await abonnementService.create(payload);
//   };

//   const handlePayment = async (pm, data) => {
//     try {
//       setLoadingPayment(true);
//       setPaymentStatus("success");
//       await finalizeAfterPayment(pm, data);
//       message.success("Abonnement créé");
//       setOpenCreate(false);
//       form.resetFields();
//       loadActive();
//       loadList(1, pagination.limit);
//     } catch (e) {
//       setPaymentStatus("failed");
//       if (e?.code === "ABO_OVERLAP") {
//         message.error("Chevauchement d'abonnement sur cette période.");
//       } else if (e?.code === "INVALID_PERIOD") {
//         message.error("Période invalide : début doit être avant la fin.");
//       } else {
//         message.error(e?.message || "Échec création d’abonnement");
//       }
//     } finally {
//       setLoadingPayment(false);
//     }
//   };

//   // ===== Colonnes du tableau =====
//   const columns = [
//     {
//       title: "Période",
//       key: "periode",
//       render: (_, r) => (
//         <span>
//           {dayjs(r.dateDebut).format("DD/MM/YYYY")} → {dayjs(r.dateExpiration).format("DD/MM/YYYY")}
//         </span>
//       ),
//     },
//     {
//       title: "Montant",
//       dataIndex: "montant",
//       align: "right",
//       render: (v) => <Text strong>{Number(v).toLocaleString("fr-FR")} USD</Text>,
//     },
//     {
//       title: "Statut",
//       key: "statut",
//       render: (_, r) => {
//         const now = dayjs();
//         const isActive = now.isAfter(dayjs(r.dateDebut)) && now.isBefore(dayjs(r.dateExpiration));
//         return r.isDeleted ? (
//           <Tag>Archivé</Tag>
//         ) : isActive ? (
//           <Tag color="green">Actif</Tag>
//         ) : dayjs(r.dateExpiration).isBefore(now) ? (
//           <Tag color="volcano">Expiré</Tag>
//         ) : (
//           <Tag>À venir</Tag>
//         );
//       },
//       width: 120,
//     },
//     {
//       title: "Créé le",
//       dataIndex: "createdAt",
//       render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm"),
//       width: 170,
//     },
    
//   ];

//   // ===== Rendu =====
//   return (
//     <div className="container-fluid relative px-3">
//       <div className="layout-specing">
//         <div className="md:flex justify-between items-center mb-6">
//           <h5 className="text-lg font-semibold">Mes abonnements</h5>
//           <Breadcrumb
//             items={[
//               { title: <Link to="/organisations/dashboard">Dashboard</Link> },
//               { title: "Abonnements" },
//             ]}
//           />
//         </div>

//         <Row gutter={[16, 16]}>
        

//           {/* Filtres */}
//           <Col xs={24} md={14}>
//             <Card title="Filtres">
//               <Space wrap>
//                 <Radio.Group
//                   value={filters.activeOnly ? "active" : filters.expiredOnly ? "expired" : "all"}
//                   onChange={(e) => {
//                     const v = e.target.value;
//                     setFilters((f) => ({
//                       ...f,
//                       activeOnly: v === "active",
//                       expiredOnly: v === "expired",
//                     }));
//                   }}
//                 >
//                   <Radio.Button value="all">Tous</Radio.Button>
//                   <Radio.Button value="active">Actifs</Radio.Button>
//                   <Radio.Button value="expired">Expirés</Radio.Button>
//                 </Radio.Group>
//                 <Radio.Group
//                   value={filters.sortOrder}
//                   onChange={(e) => setFilters((f) => ({ ...f, sortOrder: e.target.value }))}
//                 >
//                   <Radio.Button value="asc">ASC</Radio.Button>
//                   <Radio.Button value="desc">DESC</Radio.Button>
//                 </Radio.Group>
//                 <Button type="primary" onClick={applyFilter}>Appliquer</Button>
//                 <Button onClick={clearFilter}>Réinitialiser</Button>
//               </Space>
//             </Card>
//           </Col>

//           {/* Historique des abonnements */}
//           <Col span={24}>
//             <Card title="Historique des abonnements">
//               <Table
//                 rowKey="id"
//                 loading={loading}
//                 dataSource={rows}
//                 columns={columns}
//                 pagination={{
//                   current: pagination.page,
//                   pageSize: pagination.limit,
//                   total: pagination.total,
//                   onChange: (page, pageSize) => {
//                     setPagination((p) => ({ ...p, page, limit: pageSize }));
//                     loadList(page, pageSize);
//                   },
//                 }}
//                 scroll={{ x: true }}
//               />
//             </Card>
//           </Col>
//         </Row>

//         {/* Modal création + paiement */}
//         <Modal
//           title={modalStep === 1 ? "Créer un abonnement" : "Procéder au paiement"}
//           open={openCreate}
//           onCancel={() => setOpenCreate(false)}
//           footer={
//             modalStep === 1 ? (
//               <Space>
//                 <Button onClick={() => setOpenCreate(false)}>Annuler</Button>
//                 <Button type="primary" onClick={goToPayment}>Continuer vers le paiement</Button>
//               </Space>
//             ) : null
//           }
//           width={720}
//           centered
//           destroyOnHidden
//         >
//           {modalStep === 1 && (
//             <Form form={form} layout="vertical">
//               <Form.Item label="Période">
//                 <Text>
//                   Du <b>{dayjs().format("DD/MM/YYYY")}</b> au <b>{dayjs().add(1, "year").format("DD/MM/YYYY")}</b>
//                 </Text>
//               </Form.Item>
//               <Row gutter={12}>
//                 <Col xs={24} md={12}>
//                   <Form.Item
//                     label="Montant (USD)"
//                     name="montant"
//                     rules={[{ required: true, message: "Montant requis" }]}
//                   >
//                     <InputNumber className="w-full" min={1} precision={2} />
//                   </Form.Item>
//                 </Col>
//                 <Col xs={24} md={12}>
//                   <Form.Item
//                     label="Méthode de paiement"
//                     name="paymentMethod"
//                     rules={[{ required: true, message: "Choisir une méthode" }]}
//                   >
//                     <Select
//                       placeholder="Choisir…"
//                       options={[
//                         { value: "stripe", label: "Stripe" },
//                         { value: "paypal", label: "PayPal" },
//                       ]}
//                       onChange={setSelectedPaymentMethod}
//                     />
//                   </Form.Item>
//                 </Col>
//               </Row>
//             </Form>
//           )}

//           {modalStep === 2 && (
//             <Card className="border-2 border-blue-200" bodyStyle={{ paddingTop: 8 }}>
//               <div className="mb-4" style={{ background: "#f0f5ff", padding: 12, borderRadius: 8 }}>
//                 <Text>Montant à payer : <b>${Number(paymentAmount).toFixed(2)} {CURRENCY}</b></Text>
//               </div>

//               {/* Stripe */}
//               {selectedPaymentMethod === "stripe" && (
//                 initializingStripe ? (
//                   <div style={{ textAlign: "center", padding: 24 }}>
//                     <Spin size="large" tip="Initialisation du paiement…" />
//                   </div>
//                 ) : clientSecret && stripePromise ? (
//                   <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
//                     <CheckoutForm
//                       amount={Number(paymentAmount)}
//                       currency={CURRENCY}
//                       clientSecret={clientSecret}
//                       onPaymentSuccess={(pi) => handlePayment("stripe", pi)}
//                     />
//                   </Elements>
//                 ) : (
//                   <Button onClick={goToPayment}>Réinitialiser Stripe</Button>
//                 )
//               )}

//               {/* PayPal */}
//               {selectedPaymentMethod === "paypal" && (
//                 paypalOptions ? (
//                   <PayPalScriptProvider options={paypalOptions}>
//                     <PayPalButtons
//                       style={{ layout: "vertical" }}
//                       createOrder={(data, actions) => {
//                         return actions.order.create({
//                           purchase_units: [
//                             {
//                               amount: {
//                                 value: Number(paymentAmount).toFixed(2),
//                                 currency_code: paypalOptions.currency,
//                               },
//                             },
//                           ],
//                         });
//                       }}
//                       onApprove={(data, actions) =>
//                         actions.order.capture().then((order) => handlePayment("paypal", order))
//                       }
//                       onError={(err) => {
//                         console.error("PayPal Error", err);
//                         message.error("Erreur PayPal");
//                       }}
//                       onCancel={() => message.warning("Paiement annulé")}
//                     />
//                   </PayPalScriptProvider>
//                 ) : (
//                   <div style={{ textAlign: "center", padding: 24 }}>
//                     <Spin size="large" tip="Configuration PayPal…" />
//                   </div>
//                 )
//               )}

//               {/* Statut */}
//               {paymentStatus === "success" && (
//                 <div className="mt-4" style={{ background: "#f6ffed", color: "#389e0d", padding: 12, borderRadius: 8 }}>
//                   Paiement confirmé. Création de l’abonnement…
//                 </div>
//               )}
//               {paymentStatus === "failed" && (
//                 <div className="mt-4" style={{ background: "#fff1f0", color: "#cf1322", padding: 12, borderRadius: 8 }}>
//                   Échec du paiement.
//                 </div>
//               )}
//             </Card>
//           )}
//         </Modal>

//         {/* Modal renouvellement */}
//         <Modal
//           title="Renouveler l’abonnement"
//           open={openRenew}
//           onCancel={() => {
//             setOpenRenew(false);
//             setEditingRow(null);
//           }}
//           onOk={async () => {
//             try {
//               const v = await formRenew.validateFields();
//               const [dStart, dEnd] = v.periode;
//               const payload = {
//                 dateDebut: dStart.startOf("day").toISOString(),
//                 dateExpiration: dEnd.endOf("day").toISOString(),
//                 montant: v.montant,
//               };
//               await abonnementService.renew(editingRow.id, payload);
//               message.success("Abonnement renouvelé avec succès !");
//               setOpenRenew(false);
//               loadActive();
//               loadList(1, pagination.limit);
//             } catch (e) {
//               message.error(e?.message || "Échec du renouvellement");
//             }
//           }}
//           okText="Renouveler"
//         >
//           <Form form={formRenew} layout="vertical">
//             <Form.Item
//               label="Période"
//               name="periode"
//               rules={[{ required: true, message: "Sélectionnez la nouvelle période" }]}
//             >
//               <RangePicker className="w-full" />
//             </Form.Item>
//             <Form.Item
//               label="Montant (USD)"
//               name="montant"
//               initialValue={editingRow?.montant ? Number(editingRow.montant) : undefined}
//               rules={[{ required: true, message: "Montant requis" }]}
//             >
//               <InputNumber className="w-full" min={0} precision={0} />
//             </Form.Item>
//           </Form>
//         </Modal>
//       </div>
//     </div>
//   );
// }
/* eslint-disable no-unused-vars */
"use client";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb, Card, Table, Button, Modal, Form, InputNumber,
  Row, Col, Space, Tag, Typography, message, Radio, Spin, Select, DatePicker
} from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { PlusOutlined } from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import abonnementService from "../../../services/abonnement.service";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../../../components/payment/CheckoutForm";
import paymentService from "@/services/paymentService";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const CURRENCY = "USD";

export default function InstitutAbonnementsListe() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const orgId = user?.organization?.id;

  const [active, setActive] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({
    activeOnly: false,
    expiredOnly: false,
    dateFrom: null,
    dateTo: null,
    minMontant: null,
    maxMontant: null,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Modals & paiement
  const [openCreate, setOpenCreate] = useState(false);
  const [openRenew, setOpenRenew] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [form] = Form.useForm();
  const [formRenew] = Form.useForm();
  const [modalStep, setModalStep] = useState(1); // 1=form, 2=paiement
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(""); // 'stripe' | 'paypal'
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  // Stripe
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [initializingStripe, setInitializingStripe] = useState(false);

  // PayPal
  const [paypalOptions, setPaypalOptions] = useState(null);

  // ===== Data loaders =====
  const loadActive = useCallback(async () => {
    if (!orgId) return;
    try {
      const res = await abonnementService.getActiveForOrg(orgId);
      setActive(res?.abonnement || null);
    } catch {
      setActive(null);
    }
  }, [orgId]);

  const loadList = useCallback(
    async (_page = pagination.page, _limit = pagination.limit) => {
      if (!orgId) return;
      setLoading(true);
      try {
        const params = {
          organizationId: orgId,
          page: _page,
          limit: _limit,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          activeOnly: filters.activeOnly || undefined,
          expiredOnly: filters.expiredOnly || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          minMontant: filters.minMontant ?? undefined,
          maxMontant: filters.maxMontant ?? undefined,
        };
        const res = await abonnementService.list(params);
        setRows(res.abonnements || []);
        setPagination({
          page: res.pagination?.page || _page,
          limit: res.pagination?.limit || _limit,
          total: res.pagination?.total || 0,
        });
      } catch (e) {
        message.error(t("institutAbos.toasts.loadError"));
      } finally {
        setLoading(false);
      }
    },
    [orgId, filters, pagination.page, pagination.limit, t]
  );

  useEffect(() => {
    loadActive();
    loadList(1, pagination.limit);
  }, [orgId, loadActive, loadList]);

  // ===== Filters handlers =====
  const applyFilter = () => loadList(1, pagination.limit);
  const clearFilter = () => {
    setFilters({
      activeOnly: false,
      expiredOnly: false,
      dateFrom: null,
      dateTo: null,
      minMontant: null,
      maxMontant: null,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    loadList(1, pagination.limit);
  };

  // ===== Actions & modals =====
  const openCreateModal = () => {
    setOpenCreate(true);
    setModalStep(1);
    setSelectedPaymentMethod("");
    setPaymentStatus(null);
    setPaymentAmount(0);
    setStripePromise(null);
    setClientSecret("");
    setInitializingStripe(false);
    setPaypalOptions(null);
    form.resetFields();
  };

  const goToPayment = async () => {
    try {
      const v = await form.validateFields();
      const amount = Number(v.montant || 0);
      if (!v.paymentMethod) return message.error(t("institutAbos.createModal.methodRequired"));
      if (!amount || amount <= 0) return message.error(t("institutAbos.createModal.amountRequired"));

      setPaymentAmount(amount);
      setSelectedPaymentMethod(v.paymentMethod);

      if (v.paymentMethod === "stripe") {
        setInitializingStripe(true);
        try {
          const resp = await paymentService.createPaymentIntentInstitut({
            institutId: orgId,
            amount: Math.round(amount * 100),
            currency: CURRENCY,
          });
          const clientSecretNext = resp?.clientSecret || resp?.client_secret;
          const publishableKey = resp?.publishableKey || resp?.publishable_key;
          if (!clientSecretNext) throw new Error(t("institutAbos.toasts.stripeSecretMissing"));
          if (!publishableKey) throw new Error(t("institutAbos.toasts.stripeKeyMissing"));
          setClientSecret(clientSecretNext);
          setStripePromise(loadStripe(publishableKey));
        } catch (e) {
          message.error(t("institutAbos.toasts.stripeInitErr"));
          return;
        } finally {
          setInitializingStripe(false);
        }
      }

      if (v.paymentMethod === "paypal") {
        try {
          const cfg = await paymentService.getPayPalConfig();
          setPaypalOptions({
            clientId: cfg?.clientId || cfg?.client_id || "",
            currency: (cfg?.currency || CURRENCY).toUpperCase(),
            intent: cfg?.intent || "capture",
          });
        } catch (e) {
          message.error(t("institutAbos.toasts.paypalErr"));
          return;
        }
      }

      setModalStep(2);
    } catch (e) {
      message.error(e?.message || t("institutAbos.toasts.loadError"));
    }
  };

  const finalizeAfterPayment = async (paymentMethod, paymentData) => {
    const payload = {
      organizationId: orgId,
      dateDebut: dayjs().startOf("day").toISOString(),
      dateExpiration: dayjs().add(1, "year").endOf("day").toISOString(),
      montant: paymentAmount,
      paymentMethod: paymentMethod === "paypal" ? "PayPal" : "Stripe",
      paymentInfo: paymentData,
      currency: CURRENCY,
    };
    await abonnementService.create(payload);
  };

  const handlePayment = async (pm, data) => {
    try {
      setLoadingPayment(true);
      setPaymentStatus("success");
      await finalizeAfterPayment(pm, data);
      message.success(t("institutAbos.toasts.subscriptionCreated"));
      setOpenCreate(false);
      form.resetFields();
      loadActive();
      loadList(1, pagination.limit);
    } catch (e) {
      setPaymentStatus("failed");
      if (e?.code === "ABO_OVERLAP") {
        message.error(t("institutAbos.toasts.overlap"));
      } else if (e?.code === "INVALID_PERIOD") {
        message.error(t("institutAbos.toasts.invalidPeriod"));
      } else {
        message.error(t("institutAbos.toasts.createFailed"));
      }
    } finally {
      setLoadingPayment(false);
    }
  };

  // ===== Table columns =====
  const columns = [
    {
      title: t("institutAbos.table.period"),
      key: "periode",
      render: (_, r) => (
        <span>
          {dayjs(r.dateDebut).format("DD/MM/YYYY")} → {dayjs(r.dateExpiration).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: t("institutAbos.table.amount"),
      dataIndex: "montant",
      align: "right",
      render: (v) => <Text strong>{Number(v).toLocaleString("fr-FR")} {t("institutAbos.table.currency")}</Text>,
    },
    {
      title: t("institutAbos.table.status"),
      key: "statut",
      render: (_, r) => {
        const now = dayjs();
        const isActive = now.isAfter(dayjs(r.dateDebut)) && now.isBefore(dayjs(r.dateExpiration));
        return r.isDeleted ? (
          <Tag>{t("institutAbos.table.archived")}</Tag>
        ) : isActive ? (
          <Tag color="green">{t("institutAbos.table.active")}</Tag>
        ) : dayjs(r.dateExpiration).isBefore(now) ? (
          <Tag color="volcano">{t("institutAbos.table.expired")}</Tag>
        ) : (
          <Tag>{t("institutAbos.table.upcoming")}</Tag>
        );
      },
      width: 120,
    },
    {
      title: t("institutAbos.table.createdAt"),
      dataIndex: "createdAt",
      render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm"),
      width: 170,
    }
  ];

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("institutAbos.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("institutAbos.breadcrumbs.dashboard")}</Link> },
              { title: t("institutAbos.breadcrumbs.abos") }
            ]}
          />
        </div>

        <Row gutter={[16, 16]}>
          {/* Filtres */}
          <Col xs={24} md={14}>
            <Card title={t("institutAbos.filters.title")}>
              <Space wrap>
                <Radio.Group
                  value={filters.activeOnly ? "active" : filters.expiredOnly ? "expired" : "all"}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFilters((f) => ({
                      ...f,
                      activeOnly: v === "active",
                      expiredOnly: v === "expired",
                    }));
                  }}
                >
                  <Radio.Button value="all">{t("institutAbos.filters.all")}</Radio.Button>
                  <Radio.Button value="active">{t("institutAbos.filters.active")}</Radio.Button>
                  <Radio.Button value="expired">{t("institutAbos.filters.expired")}</Radio.Button>
                </Radio.Group>

                <Radio.Group
                  value={filters.sortOrder}
                  onChange={(e) => setFilters((f) => ({ ...f, sortOrder: e.target.value }))}
                >
                  <Radio.Button value="asc">{t("institutAbos.filters.orderAsc")}</Radio.Button>
                  <Radio.Button value="desc">{t("institutAbos.filters.orderDesc")}</Radio.Button>
                </Radio.Group>

                <Button type="primary" onClick={applyFilter}>{t("institutAbos.filters.apply")}</Button>
                <Button onClick={clearFilter}>{t("institutAbos.filters.reset")}</Button>
              </Space>
            </Card>
          </Col>

          {/* Historique */}
          <Col span={24}>
            <Card title={t("institutAbos.history.title")}>
              <Table
                rowKey="id"
                loading={loading}
                dataSource={rows}
                columns={columns}
                pagination={{
                  current: pagination.page,
                  pageSize: pagination.limit,
                  total: pagination.total,
                  onChange: (page, pageSize) => {
                    setPagination((p) => ({ ...p, page, limit: pageSize }));
                    loadList(page, pageSize);
                  },
                }}
                scroll={{ x: true }}
              />
            </Card>
          </Col>
        </Row>

        {/* Modal création + paiement */}
        <Modal
          title={modalStep === 1 ? t("institutAbos.createModal.titleForm") : t("institutAbos.createModal.titlePay")}
          open={openCreate}
          onCancel={() => setOpenCreate(false)}
          footer={
            modalStep === 1 ? (
              <Space>
                <Button onClick={() => setOpenCreate(false)}>{t("institutAbos.createModal.btnCancel")}</Button>
                <Button type="primary" onClick={goToPayment}>{t("institutAbos.createModal.btnContinue")}</Button>
              </Space>
            ) : null
          }
          width={720}
          centered
          destroyOnHide
        >
          {modalStep === 1 && (
            <Form form={form} layout="vertical">
              <Form.Item label={t("institutAbos.createModal.periodLabel")}>
                <Text>
                  {t("institutAbos.createModal.periodTextFrom")} <b>{dayjs().format("DD/MM/YYYY")}</b>{" "}
                  {t("institutAbos.createModal.periodTextTo")} <b>{dayjs().add(1, "year").format("DD/MM/YYYY")}</b>
                </Text>
              </Form.Item>
              <Row gutter={12}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={t("institutAbos.createModal.amountLabel")}
                    name="montant"
                    rules={[{ required: true, message: t("institutAbos.createModal.amountRequired") }]}
                  >
                    <InputNumber className="w-full" min={1} precision={2} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={t("institutAbos.createModal.methodLabel")}
                    name="paymentMethod"
                    rules={[{ required: true, message: t("institutAbos.createModal.methodRequired") }]}
                  >
                    <Select
                      placeholder={t("institutAbos.createModal.methodPlaceholder")}
                      options={[
                        { value: "stripe", label: t("institutAbos.createModal.methodStripe") },
                        { value: "paypal", label: t("institutAbos.createModal.methodPaypal") },
                      ]}
                      onChange={setSelectedPaymentMethod}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          )}

          {modalStep === 2 && (
            <Card className="border-2 border-blue-200" bodyStyle={{ paddingTop: 8 }}>
              <div className="mb-4" style={{ background: "#f0f5ff", padding: 12, borderRadius: 8 }}>
                <Text>
                  {t("institutAbos.createModal.toPay")} :{" "}
                  <b>${Number(paymentAmount).toFixed(2)} {CURRENCY}</b>
                </Text>
              </div>

              {/* Stripe */}
              {selectedPaymentMethod === "stripe" && (
                initializingStripe ? (
                  <div style={{ textAlign: "center", padding: 24 }}>
                    <Spin size="large" tip={t("institutAbos.toasts.stripeInit")} />
                  </div>
                ) : clientSecret && stripePromise ? (
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
                    <CheckoutForm
                      amount={Number(paymentAmount)}
                      currency={CURRENCY}
                      clientSecret={clientSecret}
                      onPaymentSuccess={(pi) => handlePayment("stripe", pi)}
                    />
                  </Elements>
                ) : (
                  <Button onClick={goToPayment}>{t("institutAbos.createModal.stripeRetry")}</Button>
                )
              )}

              {/* PayPal */}
              {selectedPaymentMethod === "paypal" && (
                paypalOptions ? (
                  <PayPalScriptProvider options={paypalOptions}>
                    <PayPalButtons
                      style={{ layout: "vertical" }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [
                            {
                              amount: {
                                value: Number(paymentAmount).toFixed(2),
                                currency_code: paypalOptions.currency,
                              },
                            },
                          ],
                        });
                      }}
                      onApprove={(data, actions) =>
                        actions.order.capture().then((order) => handlePayment("paypal", order))
                      }
                      onError={() => message.error(t("institutAbos.toasts.paypalErr"))}
                      onCancel={() => message.warning(t("institutAbos.toasts.paypalCancel"))}
                    />
                  </PayPalScriptProvider>
                ) : (
                  <div style={{ textAlign: "center", padding: 24 }}>
                    <Spin size="large" tip={t("institutAbos.toasts.paypalLoading")} />
                  </div>
                )
              )}

              {paymentStatus === "success" && (
                <div className="mt-4" style={{ background: "#f6ffed", color: "#389e0d", padding: 12, borderRadius: 8 }}>
                  {t("institutAbos.createModal.payOk")}
                </div>
              )}
              {paymentStatus === "failed" && (
                <div className="mt-4" style={{ background: "#fff1f0", color: "#cf1322", padding: 12, borderRadius: 8 }}>
                  {t("institutAbos.createModal.payFail")}
                </div>
              )}
            </Card>
          )}
        </Modal>

        {/* Modal renouvellement */}
        <Modal
          title={t("institutAbos.renewModal.title")}
          open={openRenew}
          onCancel={() => { setOpenRenew(false); setEditingRow(null); }}
          onOk={async () => {
            try {
              const v = await formRenew.validateFields();
              const [dStart, dEnd] = v.periode;
              const payload = {
                dateDebut: dStart.startOf("day").toISOString(),
                dateExpiration: dEnd.endOf("day").toISOString(),
                montant: v.montant,
              };
              await abonnementService.renew(editingRow.id, payload);
              message.success(t("institutAbos.toasts.renewOk"));
              setOpenRenew(false);
              loadActive();
              loadList(1, pagination.limit);
            } catch (e) {
              message.error(t("institutAbos.toasts.renewFail"));
            }
          }}
          okText={t("institutAbos.renewModal.ok")}
        >
          <Form form={formRenew} layout="vertical">
            <Form.Item
              label={t("institutAbos.renewModal.period")}
              name="periode"
              rules={[{ required: true, message: t("institutAbos.renewModal.periodRequired") }]}
            >
              <RangePicker className="w-full" />
            </Form.Item>
            <Form.Item
              label={t("institutAbos.renewModal.amount")}
              name="montant"
              initialValue={editingRow?.montant ? Number(editingRow.montant) : undefined}
              rules={[{ required: true, message: t("institutAbos.renewModal.amountRequired") }]}
            >
              <InputNumber className="w-full" min={0} precision={0} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
