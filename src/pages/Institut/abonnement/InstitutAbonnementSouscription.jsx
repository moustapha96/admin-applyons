
// /* eslint-disable no-unused-vars */
// "use client";
// import { useEffect, useState, useCallback } from "react";
// import { Link } from "react-router-dom";
// import {
//   Breadcrumb, Card, Table, Button, Modal, Form,
//   Row, Col, Space, Tag, Typography, message, Radio, Spin, Select,
//   Popconfirm, DatePicker, InputNumber
// } from "antd";
// import dayjs from "dayjs";
// import { PlusOutlined } from "@ant-design/icons";
// import { useAuth } from "../../../hooks/useAuth";
// import abonnementService from "../../../services/abonnement.service";
// import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
// import { Elements } from "@stripe/react-stripe-js";
// import { loadStripe } from "@stripe/stripe-js";
// import CheckoutForm from "../../../components/payment/CheckoutForm";
// import paymentService, { getPayPalConfig } from "@/services/paymentService";

// const { Text } = Typography;
// const { RangePicker } = DatePicker;
// const FALLBACK_CURRENCY = "USD";

// export default function AbonnementInstitutSouscription() {
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
//   const [modalStep, setModalStep] = useState(1);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
//   const [paymentStatus, setPaymentStatus] = useState(null);
//   const [loadingPayment, setLoadingPayment] = useState(false);

//   // ===== Stripe =====
//   const [stripePromise, setStripePromise] = useState(null); // chargé au démarrage (pk_...)
//   const [clientSecret, setClientSecret] = useState("");     // créé à l'étape paiement (pi_..._secret_...)
//   const [initializingStripe, setInitializingStripe] = useState(false);

//   // Prix backend (non éditable)
//   const [price, setPrice] = useState({ amount: null, currency: FALLBACK_CURRENCY });

//   // ===== Chargement de l'abonnement actif =====
//   const loadActive = useCallback(async () => {
//     if (!orgId) return;
//     try {
//       const res = await abonnementService.getActiveForOrg(orgId);
//       setActive(res?.abonnement || null);
//     } catch {
//       setActive(null);
//     }
//   }, [orgId]);

//   // ===== Chargement du prix =====
//   useEffect(() => {
//     const fetchPrice = async () => {
//       if (!orgId) return;
//       try {
//         // Doit renvoyer { amount: number, currency: "USD" }
//         const res = await paymentService.getPriceAbonnementInstitut(orgId);
//         const amt = Number(res?.amount);
//         const cur = (res?.currency || FALLBACK_CURRENCY).toUpperCase();
//         if (!amt || amt <= 0) {
//           message.error("Montant d’abonnement invalide côté serveur.");
//         }
//         setPrice({ amount: amt || null, currency: cur });
//       } catch (e) {
//         console.error(e);
//         message.error("Impossible de récupérer le prix de l’abonnement.");
//         setPrice({ amount: null, currency: FALLBACK_CURRENCY });
//       }
//     };
//     fetchPrice();
//   }, [orgId]);

//   // ===== Pré-charger Stripe (publishable key seulement) =====
//   useEffect(() => {
//     const initializeStripe = async () => {
//       try {
//         const response = await paymentService.getPublishableKey();
//         const publishableKey = response?.publishable_key || response?.publishableKey;
//         if (!publishableKey?.startsWith("pk_")) throw new Error("Clé publique Stripe invalide/absente");
//         setStripePromise(loadStripe(publishableKey)); // ✅ pk_... seulement ici
//       } catch (error) {
//         console.error("Erreur init Stripe:", error);
//         message.error("Initialisation Stripe impossible (clé publique).");
//       }
//     };
//     initializeStripe();
//   }, []);

//   // ===== Chargement de la liste =====
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
//   }, [orgId, loadActive, loadList, pagination.limit]);

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

//   // ===== Actions ligne =====
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

//   // ===== Modale création / paiement =====
//   const openCreateModal = () => {
//     if (!orgId) return message.warning("Organisation introuvable");
//     if (!price.amount) return message.error("Prix d’abonnement indisponible.");
//     setOpenCreate(true);
//     setModalStep(1);
//     setSelectedPaymentMethod("");
//     setPaymentStatus(null);

//     // reset Stripe modal-only
//     setClientSecret("");
//     setInitializingStripe(false);

//     form.resetFields();
//   };

//   // Crée le PaymentIntent UNIQUEMENT quand on passe à l'étape paiement
//   const createPaymentIntentNow = async () => {
//     setInitializingStripe(true);
//     try {
//       const resp = await paymentService.createPaymentIntentInstitut({
//         institutId: orgId,
//         amount: Math.round(Number(price.amount) * 100), // cents
//         currency: price.currency || FALLBACK_CURRENCY,
//       });
//       const cs = resp?.clientSecret || resp?.client_secret;
//       if (!cs?.includes("_secret_")) throw new Error("Client secret Stripe invalide/absent");
//       setClientSecret(cs); // ✅ on garde pk_ dans stripePromise, et pi_..._secret_... séparé ici
//     } catch (e) {
//       message.error(e?.message || "Impossible de créer le PaymentIntent");
//       throw e;
//     } finally {
//       setInitializingStripe(false);
//     }
//   };

//   const goToPayment = async () => {
//     try {
//       const v = await form.validateFields(); // { paymentMethod }
//       if (!v.paymentMethod) return message.error("Choisissez un mode de paiement");
//       if (!price.amount || price.amount <= 0) return message.error("Montant invalide (serveur).");
//       setSelectedPaymentMethod(v.paymentMethod);

//       if (v.paymentMethod === "stripe") {
//         if (!stripePromise) {
//           message.error("Stripe non initialisé (clé publique).");
//           return;
//         }
//         await createPaymentIntentNow(); // récupère le clientSecret
//       }
//       // PayPal: rien à faire ici (config via provider racine)
//       setModalStep(2);
//     } catch (_) {
//       // erreurs de validation gérées par AntD
//     }
//   };

//   const finalizeAfterPayment = async (paymentMethod, paymentData) => {
//     const payload = {
//       organizationId: orgId,
//       dateDebut: dayjs().startOf("day").toISOString(),
//       dateExpiration: dayjs().add(1, "year").endOf("day").toISOString(),
//       montant: Number(price.amount),
//       currency: (price.currency || FALLBACK_CURRENCY).toUpperCase(),
//       paymentMethod: paymentMethod === "paypal" ? "PayPal" : "Stripe",
//       paymentInfo: paymentData,
//     };
//     await abonnementService.create(payload);
//   };

//   const handlePayment = async (pm, data) => {

//     console.log(pm, data);
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

//   // ===== Colonnes =====
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
//       render: (_, r) => (
//         <Text strong>
//           {Number(r.montant).toLocaleString("fr-FR")} {String(r.currency || "XOF").toUpperCase()}
//         </Text>
//       ),
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
//     {
//       title: "Actions",
//       key: "actions",
//       fixed: "right",
//       render: (_, r) => (
//         <Space>
//           {!r.isDeleted ? (
//             <Popconfirm title="Archiver l’abonnement ?" onConfirm={() => onSoftDelete(r)}>
//               <Button size="small" danger>Archiver</Button>
//             </Popconfirm>
//           ) : (
//             <>
//               <Button size="small" onClick={() => onRestore(r)}>Restaurer</Button>
//               <Popconfirm title="Supprimer définitivement ?" onConfirm={() => onHardDelete(r)}>
//                 <Button size="small" danger type="primary">Supprimer</Button>
//               </Popconfirm>
//             </>
//           )}
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <PayPalScriptProvider options={getPayPalConfig()}>
//       <div className="container-fluid relative px-3">
//         <div className="layout-specing">
//           <div className="md:flex justify-between items-center mb-6">
//             <h5 className="text-lg font-semibold">Mes abonnements</h5>
//             <Breadcrumb
//               items={[
//                 { title: <Link to="/organisations/dashboard">Dashboard</Link> },
//                 { title: "Abonnements" },
//               ]}
//             />
//           </div>

//           <Row gutter={[16, 16]}>
//             {/* Carte abonnement actif */}
//             <Col xs={24} md={10}>
//               <Card
//                 title="Abonnement actif"
//                 extra={
//                   <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
//                     Nouvel abonnement
//                   </Button>
//                 }
//               >
//                 {active ? (
//                   <Space direction="vertical">
//                     <Text>
//                       Période : <b>{dayjs(active.dateDebut).format("DD/MM/YYYY")}</b> → <b>{dayjs(active.dateExpiration).format("DD/MM/YYYY")}</b>
//                     </Text>
//                     <Text>
//                       Montant : <b>{Number(active.montant).toLocaleString("fr-FR")} {String(active.currency || "XOF").toUpperCase()}</b>
//                     </Text>
//                     <Tag color="green">Actif</Tag>
//                   </Space>
//                 ) : (
//                   <Space direction="vertical">
//                     <Text type="secondary">Aucun abonnement actif.</Text>
//                     <Button onClick={openCreateModal}>Créer un abonnement</Button>
//                   </Space>
//                 )}
//               </Card>
//             </Col>

//             {/* Filtres */}
//             <Col xs={24} md={14}>
//               <Card title="Filtres">
//                 <Space wrap>
//                   <Radio.Group
//                     value={filters.activeOnly ? "active" : filters.expiredOnly ? "expired" : "all"}
//                     onChange={(e) => {
//                       const v = e.target.value;
//                       setFilters((f) => ({
//                         ...f,
//                         activeOnly: v === "active",
//                         expiredOnly: v === "expired",
//                       }));
//                     }}
//                   >
//                     <Radio.Button value="all">Tous</Radio.Button>
//                     <Radio.Button value="active">Actifs</Radio.Button>
//                     <Radio.Button value="expired">Expirés</Radio.Button>
//                   </Radio.Group>
//                   <Radio.Group
//                     value={filters.sortOrder}
//                     onChange={(e) => setFilters((f) => ({ ...f, sortOrder: e.target.value }))}
//                   >
//                     <Radio.Button value="asc">ASC</Radio.Button>
//                     <Radio.Button value="desc">DESC</Radio.Button>
//                   </Radio.Group>
//                   <Button type="primary" onClick={applyFilter}>Appliquer</Button>
//                   <Button onClick={clearFilter}>Réinitialiser</Button>
//                 </Space>
//               </Card>
//             </Col>

//             {/* Historique */}
//             <Col span={24}>
//               <Card title="Historique des abonnements">
//                 <Table
//                   rowKey="id"
//                   loading={loading}
//                   dataSource={rows}
//                   columns={columns}
//                   pagination={{
//                     current: pagination.page,
//                     pageSize: pagination.limit,
//                     total: pagination.total,
//                     onChange: (page, pageSize) => {
//                       setPagination((p) => ({ ...p, page, limit: pageSize }));
//                       loadList(page, pageSize);
//                     },
//                   }}
//                   scroll={{ x: true }}
//                 />
//               </Card>
//             </Col>
//           </Row>

//           {/* Modal création + paiement */}
//           <Modal
//             title={modalStep === 1 ? "Créer un abonnement" : "Procéder au paiement"}
//             open={openCreate}
//             onCancel={() => setOpenCreate(false)}
//             footer={
//               modalStep === 1 ? (
//                 <Space>
//                   <Button onClick={() => setOpenCreate(false)}>Annuler</Button>
//                   <Button type="primary" onClick={goToPayment}>Continuer vers le paiement</Button>
//                 </Space>
//               ) : null
//             }
//             width={720}
//             centered
//             destroyOnHidden
//           >
//             {modalStep === 1 && (
//               <Form form={form} layout="vertical">
//                 <Form.Item label="Période">
//                   <Text>
//                     Du <b>{dayjs().format("DD/MM/YYYY")}</b> au <b>{dayjs().add(1, "year").format("DD/MM/YYYY")}</b>
//                   </Text>
//                 </Form.Item>
//                 {/* Montant non éditable */}
//                 <Form.Item label="Montant">
//                   <Tag color="blue" style={{ fontSize: 14, padding: "4px 8px" }}>
//                     {price.amount != null ? Number(price.amount).toFixed(2) : "--"} {String(price.currency || FALLBACK_CURRENCY).toUpperCase()}
//                   </Tag>
//                   {price.amount == null && (
//                     <div style={{ marginTop: 8 }}>
//                       <Text type="warning">Prix indisponible – merci de recharger la page.</Text>
//                     </div>
//                   )}
//                 </Form.Item>
//                 <Row gutter={12}>
//                   <Col xs={24} md={12}>
//                     <Form.Item
//                       label="Méthode de paiement"
//                       name="paymentMethod"
//                       rules={[{ required: true, message: "Choisir une méthode" }]}
//                     >
//                       <Select
//                         placeholder="Choisir…"
//                         options={[
//                           { value: "stripe", label: "Stripe" },
//                           { value: "paypal", label: "PayPal" },
//                         ]}
//                         onChange={setSelectedPaymentMethod}
//                       />
//                     </Form.Item>
//                   </Col>
//                 </Row>
//               </Form>
//             )}

//             {modalStep === 2 && (
//               <Card className="border-2 border-blue-200" bodyStyle={{ paddingTop: 8 }}>
//                 <div className="mb-4" style={{ background: "#f0f5ff", padding: 12, borderRadius: 8 }}>
//                   <Text>
//                     Montant à payer :{" "}
//                     <b>
//                       {price.amount != null ? Number(price.amount).toFixed(2) : "--"}{" "}
//                       {String(price.currency || FALLBACK_CURRENCY).toUpperCase()}
//                     </b>
//                   </Text>
//                 </div>

//                 {/* PayPal */}
//                 {selectedPaymentMethod === "paypal" && (
//                   <PayPalButtons
//                     style={{ layout: "vertical" }}
//                     createOrder={(data, actions) => {
//                       return actions.order.create({
//                         purchase_units: [
//                           {
//                             amount: {
//                               value: Number(price.amount || 0).toFixed(2),
//                               currency_code: (price.currency || FALLBACK_CURRENCY).toUpperCase(),
//                             },
//                           },
//                         ],
//                       });
//                     }}
//                     onApprove={async (data, actions) => {
//                       const order = await actions.order.capture();
//                       handlePayment("paypal", order);
//                     }}
//                     onError={(err) => {
//                       console.error("PayPal Error", err);
//                       message.error("Erreur PayPal");
//                     }}
//                     onCancel={() => message.warning("Paiement annulé")}
//                   />
//                 )}

//                 {/* Stripe */}
//                 {selectedPaymentMethod === "stripe" && (
//                   initializingStripe ? (
//                     <div style={{ textAlign: "center", padding: 24 }}>
//                       <Spin size="large" tip="Initialisation du paiement…" />
//                     </div>
//                   ) : (stripePromise && clientSecret) ? (
//                     <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
//                       <CheckoutForm
//                         amount={Number(price.amount)}
//                         currency={String(price.currency || FALLBACK_CURRENCY)}
//                         clientSecret={clientSecret}
//                         onPaymentSuccess={(pi) => handlePayment("stripe", pi)}
//                       />
//                     </Elements>
//                   ) : (
//                     <Button onClick={goToPayment}>Réinitialiser Stripe</Button>
//                   )
//                 )}

//                 {paymentStatus === "success" && (
//                   <div className="mt-4" style={{ background: "#f6ffed", color: "#389e0d", padding: 12, borderRadius: 8 }}>
//                     Paiement confirmé. Création de l’abonnement…
//                   </div>
//                 )}
//                 {paymentStatus === "failed" && (
//                   <div className="mt-4" style={{ background: "#fff1f0", color: "#cf1322", padding: 12, borderRadius: 8 }}>
//                     Échec du paiement.
//                   </div>
//                 )}
//               </Card>
//             )}
//           </Modal>

//           {/* Modal renouvellement */}
//           <Modal
//             title="Renouveler l’abonnement"
//             open={openRenew}
//             onCancel={() => { setOpenRenew(false); setEditingRow(null); }}
//             onOk={async () => {
//               try {
//                 const v = await formRenew.validateFields();
//                 const [dStart, dEnd] = v.periode;
//                 const payload = {
//                   dateDebut: dStart.startOf("day").toISOString(),
//                   dateExpiration: dEnd.endOf("day").toISOString(),
//                   montant: v.montant,
//                 };
//                 await abonnementService.renew(editingRow.id, payload);
//                 message.success("Abonnement renouvelé avec succès !");
//                 setOpenRenew(false);
//                 loadActive();
//                 loadList(1, pagination.limit);
//               } catch (e) {
//                 message.error(e?.message || "Échec du renouvellement");
//               }
//             }}
//             okText="Renouveler"
//             destroyOnHidden
//           >
//             <Form form={formRenew} layout="vertical">
//               <Form.Item
//                 label="Période"
//                 name="periode"
//                 rules={[{ required: true, message: "Sélectionnez la nouvelle période" }]}
//               >
//                 <RangePicker className="w-full" />
//               </Form.Item>
//               <Form.Item
//                 label="Montant (USD)"
//                 name="montant"
//                 initialValue={editingRow?.montant ? Number(editingRow.montant) : undefined}
//                 rules={[{ required: true, message: "Montant requis" }]}
//               >
//                 <InputNumber className="w-full" min={0} precision={0} />
//               </Form.Item>
//             </Form>
//           </Modal>
//         </div>
//       </div>
//     </PayPalScriptProvider>
//   );
// }


/* eslint-disable no-unused-vars */
"use client";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb, Card, Table, Button, Modal, Form,
  Row, Col, Space, Tag, Typography, message, Radio, Spin, Select,
  Popconfirm, DatePicker, InputNumber
} from "antd";
import dayjs from "dayjs";
import { PlusOutlined } from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import abonnementService from "../../../services/abonnement.service";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../../../components/payment/CheckoutForm";
import paymentService, { getPayPalConfig } from "@/services/paymentService";
import { useTranslation } from "react-i18next";
import { DATE_FORMAT } from "@/utils/dateFormat";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const FALLBACK_CURRENCY = "USD";

const PROVIDER_MAP = {
  stripe: "stripe",
  paypal: "paypal",
};

const PAYMENT_TYPE_MAP = {
  stripe: "STRIPE", // Prisma enum
  paypal: "PAYPAL",
};

// Récupère un providerRef fiable selon le provider et l'objet renvoyé
function getProviderRefFrom(provider, data) {
  if (provider === "stripe") {
    // CheckoutForm renvoie un PaymentIntent (pi_***)
    return data?.id || data?.payment_intent || null;
  }
  if (provider === "paypal") {
    // capture order => l’id le plus pertinent est le capture.id
    // fallback sur order.id
    const cap = data?.purchase_units?.[0]?.payments?.captures?.[0];
    return cap?.id || data?.id || null;
  }
  return null;
}

export default function AbonnementInstitutSouscription() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const orgId = user?.organization?.id;

  // ===== États =====
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

  // ===== Modals =====
  const [openCreate, setOpenCreate] = useState(false);
  const [openRenew, setOpenRenew] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [form] = Form.useForm();
  const [formRenew] = Form.useForm();
  const [modalStep, setModalStep] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  // ===== Stripe =====
  const [stripePromise, setStripePromise] = useState(null); // pk_...
  const [clientSecret, setClientSecret] = useState("");     // pi_..._secret_...
  const [initializingStripe, setInitializingStripe] = useState(false);

  // Prix backend (non éditable)
  const [price, setPrice] = useState({ amount: null, currency: FALLBACK_CURRENCY });

  // ===== Chargement de l'abonnement actif =====
  const loadActive = useCallback(async () => {
    if (!orgId) return;
    try {
      const res = await abonnementService.getActiveForOrg(orgId);
      setActive(res?.abonnement || null);
    } catch {
      setActive(null);
    }
  }, [orgId]);

  // ===== Chargement du prix =====
  useEffect(() => {
    const fetchPrice = async () => {
      if (!orgId) return;
      try {
        // Doit renvoyer { amount: number, currency: "USD" }
        const res = await paymentService.getPriceAbonnementInstitut(orgId);
        const amt = Number(res?.amount);
        const cur = (res?.currency || FALLBACK_CURRENCY).toUpperCase();
        if (!amt || amt <= 0) {
          message.error(t("institutAbonnementSouscription.messages.priceInvalid"));
        }
        setPrice({ amount: amt || null, currency: cur });
      } catch (e) {
        console.error(e);
        message.error(t("institutAbonnementSouscription.messages.priceError"));
        setPrice({ amount: null, currency: FALLBACK_CURRENCY });
      }
    };
    fetchPrice();
  }, [orgId]);

  // ===== Pré-charger Stripe (publishable key seulement) =====
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const response = await paymentService.getPublishableKey();
        const publishableKey = response?.publishable_key || response?.publishableKey;
        if (!publishableKey?.startsWith("pk_")) throw new Error(t("institutAbonnementSouscription.messages.stripeKeyInvalid"));
        setStripePromise(loadStripe(publishableKey));
      } catch (error) {
        console.error("Erreur init Stripe:", error);
        message.error(t("institutAbonnementSouscription.messages.stripeInitError"));
      }
    };
    initializeStripe();
  }, []);

  // ===== Chargement de la liste =====
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
        message.error(e?.message || t("institutAbonnementSouscription.messages.loadError"));
      } finally {
        setLoading(false);
      }
    },
    [orgId, filters, pagination.page, pagination.limit]
  );

  useEffect(() => {
    loadActive();
    loadList(1, pagination.limit);
  }, [orgId, loadActive, loadList, pagination.limit]);

  // ===== Gestion des filtres =====
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

  // ===== Actions ligne =====
  const onSoftDelete = async (row) => {
    try {
      await abonnementService.softDelete(row.id);
      message.success(t("institutAbonnementSouscription.messages.archived"));
      loadActive();
      loadList(pagination.page, pagination.limit);
    } catch (e) {
      message.error(e?.message || t("institutAbonnementSouscription.messages.archiveError"));
    }
  };

  const onRestore = async (row) => {
    try {
      await abonnementService.restore(row.id);
      message.success(t("institutAbonnementSouscription.messages.restored"));
      loadActive();
      loadList(pagination.page, pagination.limit);
    } catch (e) {
      message.error(e?.message || t("institutAbonnementSouscription.messages.restoreError"));
    }
  };

  const onHardDelete = async (row) => {
    try {
      await abonnementService.hardDelete(row.id);
      message.success(t("institutAbonnementSouscription.messages.deleted"));
      loadActive();
      loadList(pagination.page, pagination.limit);
    } catch (e) {
      if (e?.code === "ABO_NOT_ARCHIVED") {
        message.error(t("institutAbonnementSouscription.messages.archiveFirst"));
      } else {
        message.error(e?.message || t("institutAbonnementSouscription.messages.deleteError"));
      }
    }
  };

  const openRenewModal = (row) => {
    setEditingRow(row);
    formRenew.resetFields();
    setOpenRenew(true);
  };

  // ===== Modale création / paiement =====
  const openCreateModal = () => {
    if (!orgId) return message.warning(t("institutAbonnementSouscription.messages.orgNotFound"));
    if (!price.amount) return message.error(t("institutAbonnementSouscription.messages.priceUnavailable"));
    setOpenCreate(true);
    setModalStep(1);
    setSelectedPaymentMethod("");
    setPaymentStatus(null);

    // reset Stripe modal-only
    setClientSecret("");
    setInitializingStripe(false);

    form.resetFields();
  };

  // Crée le PaymentIntent UNIQUEMENT quand on passe à l'étape paiement
  const createPaymentIntentNow = async () => {
    setInitializingStripe(true);
    try {
      const resp = await paymentService.createPaymentIntentInstitut({
        institutId: orgId,
        amount: Math.round(Number(price.amount) * 100), // cents
        currency: price.currency || FALLBACK_CURRENCY,
      });
      const cs = resp?.clientSecret || resp?.client_secret;
      if (!cs?.includes("_secret_")) throw new Error(t("institutAbonnementSouscription.messages.stripeSecretInvalid"));
      setClientSecret(cs);
    } catch (e) {
      message.error(e?.message || t("institutAbonnementSouscription.messages.createPaymentIntentError"));
      throw e;
    } finally {
      setInitializingStripe(false);
    }
  };

  const goToPayment = async () => {
    try {
      const v = await form.validateFields(); // { paymentMethod }
      if (!v.paymentMethod) return message.error(t("institutAbonnementSouscription.messages.choosePaymentMethod"));
      if (!price.amount || price.amount <= 0) return message.error(t("institutAbonnementSouscription.messages.invalidAmount"));
      setSelectedPaymentMethod(v.paymentMethod);

      if (v.paymentMethod === "stripe") {
        if (!stripePromise) {
          message.error(t("institutAbonnementSouscription.messages.stripeNotInitialized"));
          return;
        }
        await createPaymentIntentNow(); // récupère le clientSecret
      }
      // PayPal: rien à faire ici (config via provider racine)
      setModalStep(2);
    } catch (_) {
      // erreurs de validation gérées par AntD
    }
  };

  // 1) Créer l’abonnement, puis 2) enregistrer le paiement dans /payments
  const finalizeAfterPayment = async (paymentMethod, paymentData) => {
    // 1) Créer l’abonnement (endpoint existant)
    const aboPayload = {
      organizationId: orgId,
      dateDebut: dayjs().startOf("day").toISOString(),
      dateExpiration: dayjs().add(1, "year").endOf("day").toISOString(),
      montant: Number(price.amount),
      currency: (price.currency || FALLBACK_CURRENCY).toUpperCase(),
      paymentMethod: paymentMethod === "paypal" ? "PayPal" : "Stripe",
      paymentInfo: paymentData,
    };
    const createdAbo = await abonnementService.create(aboPayload);
    const abo = createdAbo?.abonnement || createdAbo;
    if (!abo?.id) throw new Error(t("institutAbonnementSouscription.messages.aboNoId"));

    // 2) Enregistrer le paiement lié à l’abonnement
    const provider = PROVIDER_MAP[paymentMethod] || paymentMethod; // 'stripe' | 'paypal'
    const paymentRecordPayload = {
      abonnementId: abo.id,
      provider,
      providerRef: getProviderRefFrom(provider, paymentData),
      status: "SUCCEEDED",
      amount: Number(price.amount), // major units
      currency: (price.currency || FALLBACK_CURRENCY).toUpperCase(),
      paymentType: PAYMENT_TYPE_MAP[paymentMethod], // 'STRIPE' | 'PAYPAL'
      paymentInfo: paymentData, // JSON brut
    };
    console.log(paymentRecordPayload);

    try {
      await paymentService.create(paymentRecordPayload);
    } catch (e) {
      // Doux pour les doublons ou autres non-bloquants
      if (e?.response?.data?.code === "UNIQUE_CONSTRAINT_VIOLATION") {
        console.warn("Payment record déjà existant pour cet abonnement.");
      } else {
        console.warn("PAYMENT_RECORD_CREATE_FAILED:", e?.message || e);
      }
    }
  };

  const handlePayment = async (pm, data) => {
    try {
      setLoadingPayment(true);
      // Stripe : data = PaymentIntent (status 'succeeded')
      // PayPal : data = capture (status 'COMPLETED')
      setPaymentStatus("success");
      await finalizeAfterPayment(pm, data);
      message.success(t("institutAbonnementSouscription.messages.success"));
      setOpenCreate(false);
      form.resetFields();
      loadActive();
      loadList(1, pagination.limit);
    } catch (e) {
      setPaymentStatus("failed");
      if (e?.code === "ABO_OVERLAP") {
        message.error(t("institutAbonnementSouscription.messages.overlap"));
      } else if (e?.code === "INVALID_PERIOD") {
        message.error(t("institutAbonnementSouscription.messages.invalidPeriod"));
      } else {
        message.error(e?.message || t("institutAbonnementSouscription.messages.finalizationError"));
      }
    } finally {
      setLoadingPayment(false);
    }
  };

  // ===== Colonnes =====
  const columns = [
    {
      title: t("institutAbonnementSouscription.columns.period"),
      key: "periode",
      render: (_, r) => (
        <span>
          {dayjs(r.dateDebut).format("DD/MM/YYYY")} → {dayjs(r.dateExpiration).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: t("institutAbonnementSouscription.columns.amount"),
      dataIndex: "montant",
      align: "right",
      render: (_, r) => (
        <Text strong>
          {Number(r.montant).toLocaleString(i18n.language === "en" ? "en-US" : i18n.language === "fr" ? "fr-FR" : "fr-FR")} {String(r.currency || "XOF").toUpperCase()}
        </Text>
      ),
    },
    {
      title: t("institutAbonnementSouscription.columns.status"),
      key: "statut",
      render: (_, r) => {
        const now = dayjs();
        const isActive = now.isAfter(dayjs(r.dateDebut)) && now.isBefore(dayjs(r.dateExpiration));
        return r.isDeleted ? (
          <Tag>{t("institutAbonnementSouscription.columns.archived")}</Tag>
        ) : isActive ? (
          <Tag color="green">{t("institutAbonnementSouscription.columns.active")}</Tag>
        ) : dayjs(r.dateExpiration).isBefore(now) ? (
          <Tag color="volcano">{t("institutAbonnementSouscription.columns.expired")}</Tag>
        ) : (
          <Tag>{t("institutAbonnementSouscription.columns.upcoming")}</Tag>
        );
      },
      width: 120,
    },
    {
      title: t("institutAbonnementSouscription.columns.createdAt"),
      dataIndex: "createdAt",
      render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm"),
      width: 170,
    },
    {
      title: t("institutAbonnementSouscription.columns.actions"),
      key: "actions",
      fixed: "right",
      render: (_, r) => (
        <Space>
          {!r.isDeleted ? (
            <Popconfirm title={t("institutAbonnementSouscription.modals.confirm.archive")} onConfirm={() => onSoftDelete(r)}>
              <Button size="small" danger>{t("institutAbonnementSouscription.columns.archive")}</Button>
            </Popconfirm>
          ) : (
            <>
              <Button size="small" onClick={() => onRestore(r)}>{t("institutAbonnementSouscription.columns.restore")}</Button>
              <Popconfirm title={t("institutAbonnementSouscription.modals.confirm.delete")} onConfirm={() => onHardDelete(r)}>
                <Button size="small" danger type="primary">{t("institutAbonnementSouscription.columns.delete")}</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PayPalScriptProvider options={getPayPalConfig()}>
      <div className="container-fluid relative px-3">
        <div className="layout-specing">
          <div className="md:flex justify-between items-center mb-6">
            <h5 className="text-lg font-semibold">{t("institutAbonnementSouscription.pageTitle")}</h5>
            <Breadcrumb
              items={[
                { title: <Link to="/organisations/dashboard">{t("institutAbonnementSouscription.breadcrumbs.dashboard")}</Link> },
                { title: t("institutAbonnementSouscription.breadcrumbs.abonnements") },
              ]}
            />
          </div>

          <Row gutter={[16, 16]}>
            {/* Carte abonnement actif */}
            <Col xs={24} md={10}>
              <Card
                title={t("institutAbonnementSouscription.activeCard.title")}
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                    {t("institutAbonnementSouscription.activeCard.newButton")}
                  </Button>
                }
              >
                {active ? (
                  <Space direction="vertical">
                    <Text>
                      {t("institutAbonnementSouscription.activeCard.period")} : <b>{dayjs(active.dateDebut).format("DD/MM/YYYY")}</b> → <b>{dayjs(active.dateExpiration).format("DD/MM/YYYY")}</b>
                    </Text>
                    <Text>
                      {t("institutAbonnementSouscription.activeCard.amount")} : <b>{Number(active.montant).toLocaleString(i18n.language === "en" ? "en-US" : "fr-FR")} {String(active.currency || "XOF").toUpperCase()}</b>
                    </Text>
                    <Tag color="green">{t("institutAbonnementSouscription.activeCard.active")}</Tag>
                  </Space>
                ) : (
                  <Space direction="vertical">
                    <Text type="secondary">{t("institutAbonnementSouscription.activeCard.none")}</Text>
                    <Button onClick={openCreateModal}>{t("institutAbonnementSouscription.activeCard.createButton")}</Button>
                  </Space>
                )}
              </Card>
            </Col>

            {/* Filtres */}
            <Col xs={24} md={14}>
              <Card title={t("institutAbonnementSouscription.filters.title")}>
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
                    <Radio.Button value="all">{t("institutAbonnementSouscription.filters.all")}</Radio.Button>
                    <Radio.Button value="active">{t("institutAbonnementSouscription.filters.active")}</Radio.Button>
                    <Radio.Button value="expired">{t("institutAbonnementSouscription.filters.expired")}</Radio.Button>
                  </Radio.Group>
                  <Radio.Group
                    value={filters.sortOrder}
                    onChange={(e) => setFilters((f) => ({ ...f, sortOrder: e.target.value }))}
                  >
                    <Radio.Button value="asc">ASC</Radio.Button>
                    <Radio.Button value="desc">DESC</Radio.Button>
                  </Radio.Group>
                  <Button type="primary" onClick={applyFilter}>{t("institutAbonnementSouscription.filters.apply")}</Button>
                  <Button onClick={clearFilter}>{t("institutAbonnementSouscription.filters.reset")}</Button>
                </Space>
              </Card>
            </Col>

            {/* Historique */}
            <Col span={24}>
              <Card title={t("institutAbonnementSouscription.history.title")}>
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
            title={modalStep === 1 ? t("institutAbonnementSouscription.modals.create.step1Title") : t("institutAbonnementSouscription.modals.create.step2Title")}
            open={openCreate}
            onCancel={() => setOpenCreate(false)}
            footer={
              modalStep === 1 ? (
                <Space>
                  <Button onClick={() => setOpenCreate(false)}>{t("institutAbonnementSouscription.modals.create.cancel")}</Button>
                  <Button type="primary" onClick={goToPayment}>{t("institutAbonnementSouscription.modals.create.continue")}</Button>
                </Space>
              ) : null
            }
            width={720}
            centered
            destroyOnHidden
          >
            {modalStep === 1 && (
              <Form form={form} layout="vertical">
                <Form.Item label={t("institutAbonnementSouscription.modals.create.period")}>
                  <Text>
                    Du <b>{dayjs().format("DD/MM/YYYY")}</b> au <b>{dayjs().add(1, "year").format("DD/MM/YYYY")}</b>
                  </Text>
                </Form.Item>
                {/* Montant non éditable */}
                <Form.Item label={t("institutAbonnementSouscription.modals.create.amount")}>
                  <Tag color="blue" style={{ fontSize: 14, padding: "4px 8px" }}>
                    {price.amount != null ? Number(price.amount).toFixed(2) : "--"} {String(price.currency || FALLBACK_CURRENCY).toUpperCase()}
                  </Tag>
                  {price.amount == null && (
                    <div style={{ marginTop: 8 }}>
                      <Text type="warning">{t("institutAbonnementSouscription.modals.create.priceUnavailable")}</Text>
                    </div>
                  )}
                </Form.Item>
                <Row gutter={12}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={t("institutAbonnementSouscription.modals.create.paymentMethod")}
                      name="paymentMethod"
                      rules={[{ required: true, message: t("institutAbonnementSouscription.modals.create.chooseMethod") }]}
                    >
                      <Select
                        placeholder={t("institutAbonnementSouscription.modals.create.choose")}
                        options={[
                          { value: "stripe", label: "Stripe" },
                          { value: "paypal", label: "PayPal" },
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
                    {t("institutAbonnementSouscription.modals.create.amountToPay")}{" "}
                    <b>
                      {price.amount != null ? Number(price.amount).toFixed(2) : "--"}{" "}
                      {String(price.currency || FALLBACK_CURRENCY).toUpperCase()}
                    </b>
                  </Text>
                </div>

                {/* PayPal */}
                {selectedPaymentMethod === "paypal" && (
                  <PayPalButtons
                    style={{ layout: "vertical" }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: Number(price.amount || 0).toFixed(2),
                              currency_code: (price.currency || FALLBACK_CURRENCY).toUpperCase(),
                            },
                          },
                        ],
                      });
                    }}
                    onApprove={async (data, actions) => {
                      const order = await actions.order.capture();
                      handlePayment("paypal", order);
                    }}
                    onError={(err) => {
                      console.error("PayPal Error", err);
                      message.error(t("institutAbonnementSouscription.messages.paypalError"));
                    }}
                    onCancel={() => message.warning(t("institutAbonnementSouscription.messages.paymentCancelled"))}
                  />
                )}

                {/* Stripe */}
                {selectedPaymentMethod === "stripe" && (
                  initializingStripe ? (
                    <div style={{ textAlign: "center", padding: 24 }}>
                      <Spin size="large" tip={t("institutAbonnementSouscription.modals.create.initializingPayment")} />
                    </div>
                  ) : (stripePromise && clientSecret) ? (
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
                      <CheckoutForm
                        amount={Number(price.amount)}
                        currency={String(price.currency || FALLBACK_CURRENCY)}
                        clientSecret={clientSecret}
                        onPaymentSuccess={(pi) => handlePayment("stripe", pi)}
                      />
                    </Elements>
                  ) : (
                    <Button onClick={goToPayment}>{t("institutAbonnementSouscription.modals.create.resetStripe")}</Button>
                  )
                )}

                {paymentStatus === "success" && (
                  <div className="mt-4" style={{ background: "#f6ffed", color: "#389e0d", padding: 12, borderRadius: 8 }}>
                    {t("institutAbonnementSouscription.modals.create.paymentConfirmed")}
                  </div>
                )}
                {paymentStatus === "failed" && (
                  <div className="mt-4" style={{ background: "#fff1f0", color: "#cf1322", padding: 12, borderRadius: 8 }}>
                    {t("institutAbonnementSouscription.modals.create.paymentFailed")}
                  </div>
                )}
              </Card>
            )}
          </Modal>

          {/* Modal renouvellement */}
          <Modal
            title={t("institutAbonnementSouscription.modals.renew.title")}
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
                message.success(t("institutAbonnementSouscription.modals.renew.success"));
                setOpenRenew(false);
                loadActive();
                loadList(1, pagination.limit);
              } catch (e) {
                message.error(e?.message || t("institutAbonnementSouscription.modals.renew.error"));
              }
            }}
            okText={t("institutAbonnementSouscription.modals.renew.okText")}
            destroyOnHidden
          >
            <Form form={formRenew} layout="vertical">
              <Form.Item
                label={t("institutAbonnementSouscription.modals.renew.period")}
                name="periode"
                rules={[{ required: true, message: t("institutAbonnementSouscription.modals.renew.selectPeriod") }]}
              >
                <RangePicker className="w-full" format={DATE_FORMAT} />
              </Form.Item>
              <Form.Item
                label={t("institutAbonnementSouscription.modals.renew.amount")}
                name="montant"
                initialValue={editingRow?.montant ? Number(editingRow.montant) : undefined}
                rules={[{ required: true, message: t("institutAbonnementSouscription.modals.renew.amountRequired") }]}
              >
                <InputNumber className="w-full" min={0} precision={0} />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
