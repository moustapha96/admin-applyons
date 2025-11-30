// /* MinimalMailer.jsx */
// import { useState, useMemo } from "react";
// import {
//   Card,
//   Form,
//   Input,
//   Button,
//   Breadcrumb,
//   message,
//   Space,
//   Tooltip,
//   Switch,
//   Modal,
//   Upload,
//   Divider,
//   Typography,
// } from "antd";
// import { Link } from "react-router-dom";
// import ReactQuill from "react-quill";
// import {
//   SendOutlined,
//   EyeOutlined,
//   InfoCircleOutlined,
//   UploadOutlined,
// } from "@ant-design/icons";
// import userService from "@/services/userService"; // => sendMailToUser(body)
// import "react-quill/dist/quill.snow.css";

// const { TextArea } = Input;
// const { Text } = Typography;

// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

// const quillModules = {
//   toolbar: [
//     [{ header: [1, 2, 3, false] }],
//     ["bold", "italic", "underline", "strike"],
//     [{ list: "ordered" }, { list: "bullet" }],
//     [{ align: [] }],
//     ["link"],
//     ["clean"],
//   ],
// };
// const quillFormats = [
//   "header",
//   "bold",
//   "italic",
//   "underline",
//   "strike",
//   "list",
//   "bullet",
//   "align",
//   "link",
// ];

// const stripHtml = (h) =>
//   (h || "").replace(/<style[\s\S]*?<\/style>/gi, "")
//     .replace(/<script[\s\S]*?<\/script>/gi, "")
//     .replace(/<[^>]+>/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();

// const parseList = (s) =>
//   (s || "")
//     .split(",")
//     .map((x) => x.trim())
//     .filter(Boolean);

// async function fileToBase64(file) {
//   // retourne { filename, contentType, content(base64) }
//   const arrayBuffer = await file.arrayBuffer();
//   const base64 = btoa(
//     new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
//   );
//   return {
//     filename: file.name,
//     contentType: file.type || "application/octet-stream",
//     content: base64,
//   };
// }

// export default function MinimalMailer() {
//   const [loading, setLoading] = useState(false);
//   const [previewOpen, setPreviewOpen] = useState(false);

//   // champs
//   const [to, setTo] = useState(""); // "a@x.com,b@y.com"
//   const [cc, setCc] = useState("");
//   const [bcc, setBcc] = useState("");
//   const [replyTo, setReplyTo] = useState("");

//   const [subject, setSubject] = useState("");
//   const [html, setHtml] = useState("");

//   const [notifyAdmins, setNotifyAdmins] = useState(false);
//   const [adminEmailsStr, setAdminEmailsStr] = useState(""); // CSV

//   // Upload
//   const [files, setFiles] = useState([]); // antd Upload fileList

//   const { toList, ccList, bccList, adminEmails } = useMemo(() => {
//     return {
//       toList: parseList(to),
//       ccList: parseList(cc),
//       bccList: parseList(bcc),
//       adminEmails: parseList(adminEmailsStr),
//     };
//   }, [to, cc, bcc, adminEmailsStr]);

//   const textVersion = useMemo(() => stripHtml(html), [html]);
//   const charCount = useMemo(() => textVersion.length, [textVersion]);

//   const validateEmails = (list) => list.every((e) => emailRegex.test(e));

//   const onUploadChange = ({ fileList }) => setFiles(fileList);

//   const handleSend = async () => {
//     // validations
//     if (!toList.length) {
//       message.error("Au moins un destinataire (To) est requis.");
//       return;
//     }
//     if (![toList, ccList, bccList].every(validateEmails)) {
//       message.error("Vérifie les adresses email (séparées par des virgules).");
//       return;
//     }
//     if (replyTo && !emailRegex.test(replyTo)) {
//       message.error("Reply-To invalide.");
//       return;
//     }
//     if (!subject.trim()) {
//       message.error("Le sujet est requis.");
//       return;
//     }
//     if (!textVersion) {
//       message.error("Le message est requis.");
//       return;
//     }
//     if (notifyAdmins && adminEmails.length && !validateEmails(adminEmails)) {
//       message.error("Vérifie les emails admin (séparés par des virgules).");
//       return;
//     }

//     try {
//       setLoading(true);

//       // convertir pièces jointes en base64 JSON
//       const attachments = [];
//       for (const f of files) {
//         const file = f.originFileObj || f; // sécurité
//         if (file) {
//           attachments.push(await fileToBase64(file));
//         }
//       }

//       // corps JSON attendu par ton backend (mode RAW)
//       const body = {
//         to: toList,
//         cc: ccList,
//         bcc: bccList,
//         replyTo: replyTo || undefined,

//         // mode raw
//         subject,
//         html,              // WYSIWYG
//         text: textVersion, // version texte auto

//         attachments,       // [{ filename, contentType, content }]
//         notifyAdmins: !!notifyAdmins,
//         adminEmails: notifyAdmins && adminEmails.length ? adminEmails : undefined,

//         // pas de templateName ici -> on force le mode RAW
//       };

//       const { data } = await userService.sendMailToUser(body); // JSON, pas multipart
//       message.success(data?.message || "Email envoyé !");
//     } catch (e) {
//       const msg =
//         e?.response?.data?.message ||
//         e?.response?.data?.error ||
//         e?.message ||
//         "Échec de l'envoi";
//       message.error(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container-fluid relative px-3">
//       <div className="layout-specing">
//         <div className="md:flex justify-between items-center mb-6">
//           <h5 className="text-lg font-semibold">Envoi de mail (minimal)</h5>
//           <Breadcrumb
//             items={[
//               { title: <Link to="/">Dashboard</Link> },
//               { title: "Mailer" },
//             ]}
//           />
//         </div>

//         <Card title="Composer" className="mb-6">
//           <Form layout="vertical" onFinish={handleSend}>
//             <Form.Item label="To (séparés par virgules)" required>
//               <Input
//                 placeholder="ex: a@ex.com, b@ex.com"
//                 value={to}
//                 onChange={(e) => setTo(e.target.value)}
//               />
//             </Form.Item>

//             <Space size="middle" style={{ display: "flex" }}>
//               <Form.Item label="Cc (optionnel)" style={{ flex: 1 }}>
//                 <Input
//                   placeholder="ex: c@ex.com"
//                   value={cc}
//                   onChange={(e) => setCc(e.target.value)}
//                 />
//               </Form.Item>
//               <Form.Item label="Bcc (optionnel)" style={{ flex: 1 }}>
//                 <Input
//                   placeholder="ex: d@ex.com"
//                   value={bcc}
//                   onChange={(e) => setBcc(e.target.value)}
//                 />
//               </Form.Item>
//             </Space>

//             <Space size="middle" style={{ display: "flex" }}>
             
//               <Form.Item
//                 label={
//                   <>
//                     Notifier les admins{" "}
//                     <Tooltip title="Enverra aussi une copie aux admins (backend)">
//                       <InfoCircleOutlined />
//                     </Tooltip>
//                   </>
//                 }
//                 style={{ minWidth: 260 }}
//               >
//                 <Space>
//                   <Switch checked={notifyAdmins} onChange={setNotifyAdmins} />
//                   {notifyAdmins && (
//                     <Input
//                       placeholder="admins (CSV) — optionnel"
//                       value={adminEmailsStr}
//                       onChange={(e) => setAdminEmailsStr(e.target.value)}
//                     />
//                   )}
//                 </Space>
//               </Form.Item>
//             </Space>

//             <Form.Item label="Sujet" required>
//               <Input
//                 placeholder="Sujet de l'email"
//                 value={subject}
//                 onChange={(e) => setSubject(e.target.value)}
//               />
//             </Form.Item>

//             <Form.Item
//               label={
//                 <Space>
//                   <span>Message (format type Word)</span>
//                   <Text type="secondary">({charCount} caractères)</Text>
//                 </Space>
//               }
//               required
//             >
//               <ReactQuill
//                 theme="snow"
//                 value={html}
//                 onChange={setHtml}
//                 style={{ height: 260, marginBottom: 24 }}
//                 modules={quillModules}
//                 formats={quillFormats}
//               />
//               <Space>
//                 <Button
//                   icon={<EyeOutlined />}
//                   onClick={() => setPreviewOpen(true)}
//                   type="default"
//                 >
//                   Prévisualiser
//                 </Button>
//               </Space>
//             </Form.Item>

//             <Divider />

//             <Form.Item
//               label={
//                 <>
//                   Pièces jointes{" "}
//                   <Tooltip title="Seront envoyées en base64 vers l'API">
//                     <InfoCircleOutlined />
//                   </Tooltip>
//                 </>
//               }
//             >
//               <Upload
//                 beforeUpload={() => false} // pas d'upload auto
//                 onChange={onUploadChange}
//                 fileList={files}
//                 multiple
//                 maxCount={10}
//               >
//                 <Button icon={<UploadOutlined />}>Ajouter un fichier</Button>
//               </Upload>
//             </Form.Item>

//             <Space>
//               <Button
//                 type="primary"
//                 htmlType="submit"
//                 icon={<SendOutlined />}
//                 loading={loading}
//               >
//                 Envoyer
//               </Button>
//             </Space>
//           </Form>
//         </Card>
//       </div>

//       {/* Prévisualisation HTML */}
//       <Modal
//         title="Aperçu du message"
//         open={previewOpen}
//         onCancel={() => setPreviewOpen(false)}
//         footer={<Button onClick={() => setPreviewOpen(false)}>Fermer</Button>}
//         width={800}
//       >
//         <div
//           style={{ border: "1px solid #eee", padding: 16, borderRadius: 8 }}
//           dangerouslySetInnerHTML={{ __html: html || "<p>(Vide)</p>" }}
//         />
//         <Divider />
//         <Text type="secondary">Version texte (auto) :</Text>
//         <pre style={{ whiteSpace: "pre-wrap" }}>{textVersion || "(Vide)"}</pre>
//       </Modal>
//     </div>
//   );
// }

/* MinimalMailer.jsx */
import { useState, useMemo } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Breadcrumb,
  message,
  Space,
  Tooltip,
  Switch,
  Modal,
  Upload,
  Divider,
  Typography,
} from "antd";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill";
import {
  SendOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import userService from "@/services/userService";
import { useTranslation } from "react-i18next";
import "react-quill/dist/quill.snow.css";

const { Text } = Typography;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link"],
    ["clean"],
  ],
};
const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "align",
  "link",
];

const stripHtml = (h) =>
  (h || "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const parseList = (s) =>
  (s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

async function fileToBase64(file) {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(arrayBuffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );
  return {
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    content: base64,
  };
}

export default function MinimalMailer() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // champs
  const [to, setTo] = useState(""); // "a@x.com,b@y.com"
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [replyTo, setReplyTo] = useState(""); // (pas affiché ici mais on le reset aussi)

  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");

  const [notifyAdmins, setNotifyAdmins] = useState(false);
  const [adminEmailsStr, setAdminEmailsStr] = useState(""); // CSV

  // Upload
  const [files, setFiles] = useState([]); // antd Upload fileList

  const { toList, ccList, bccList, adminEmails } = useMemo(() => {
    return {
      toList: parseList(to),
      ccList: parseList(cc),
      bccList: parseList(bcc),
      adminEmails: parseList(adminEmailsStr),
    };
  }, [to, cc, bcc, adminEmailsStr]);

  const textVersion = useMemo(() => stripHtml(html), [html]);
  const charCount = useMemo(() => textVersion.length, [textVersion]);

  const validateEmails = (list) => list.every((e) => emailRegex.test(e));

  const onUploadChange = ({ fileList }) => setFiles(fileList);

  // --- RESET COMPLET APRÈS ENVOI ---
  const resetAll = () => {
    setTo("");
    setCc("");
    setBcc("");
    setReplyTo("");
    setSubject("");
    setHtml("");
    setNotifyAdmins(false);
    setAdminEmailsStr("");
    setFiles([]);           // vide l’Upload
    setPreviewOpen(false);  // ferme l’aperçu au cas où
  };

  const handleSend = async () => {
    // validations
    if (!toList.length) {
      message.error(t("adminMailer.validation.toRequired"));
      return;
    }
    if (![toList, ccList, bccList].every(validateEmails)) {
      message.error(t("adminMailer.validation.invalidEmails"));
      return;
    }
    if (replyTo && !emailRegex.test(replyTo)) {
      message.error(t("adminMailer.validation.invalidReplyTo"));
      return;
    }
    if (!subject.trim()) {
      message.error(t("adminMailer.validation.subjectRequired"));
      return;
    }
    if (!textVersion) {
      message.error(t("adminMailer.validation.messageRequired"));
      return;
    }
    if (notifyAdmins && adminEmails.length && !validateEmails(adminEmails)) {
      message.error(t("adminMailer.validation.invalidAdminEmails"));
      return;
    }

    try {
      setLoading(true);

      // convertir pièces jointes en base64 JSON
      const attachments = [];
      for (const f of files) {
        const file = f.originFileObj || f;
        if (file) {
          attachments.push(await fileToBase64(file));
        }
      }

      // corps JSON attendu par ton backend (mode RAW)
      const body = {
        to: toList,
        cc: ccList,
        bcc: bccList,
        replyTo: replyTo || undefined,
        subject,
        html,              // WYSIWYG
        text: textVersion, // version texte auto
        attachments,       // [{ filename, contentType, content }]
        notifyAdmins: !!notifyAdmins,
        adminEmails: notifyAdmins && adminEmails.length ? adminEmails : undefined,
      };

      const { data } = await userService.sendMailToUser(body);
      message.success(data?.message || t("adminMailer.messages.sendSuccess"));
      // ✅ Nettoyage si succès
      resetAll();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        t("adminMailer.messages.sendError");
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("adminMailer.pageTitle")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("adminMailer.breadcrumbs.dashboard")}</Link> },
              { title: t("adminMailer.breadcrumbs.mailer") },
            ]}
          />
        </div>

        <Card title={t("adminMailer.form.title")} className="mb-6">
          <Form layout="vertical" onFinish={handleSend}>
            <Form.Item label={t("adminMailer.form.fields.to.label")} required>
              <Input
                placeholder={t("adminMailer.form.fields.to.placeholder")}
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </Form.Item>

            <Space size="middle" style={{ display: "flex" }}>
              <Form.Item label={t("adminMailer.form.fields.cc.label")} style={{ flex: 1 }}>
                <Input
                  placeholder={t("adminMailer.form.fields.cc.placeholder")}
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                />
              </Form.Item>
              <Form.Item label={t("adminMailer.form.fields.bcc.label")} style={{ flex: 1 }}>
                <Input
                  placeholder={t("adminMailer.form.fields.bcc.placeholder")}
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                />
              </Form.Item>
            </Space>

            <Form.Item label={t("adminMailer.form.fields.replyTo.label")}>
              <Input
                placeholder={t("adminMailer.form.fields.replyTo.placeholder")}
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
              />
            </Form.Item>

            <Space size="middle" style={{ display: "flex" }}>
              <Form.Item
                label={
                  <>
                    {t("adminMailer.form.fields.notifyAdmins.label")}{" "}
                    <Tooltip title={t("adminMailer.form.fields.notifyAdmins.tooltip")}>
                      <InfoCircleOutlined />
                    </Tooltip>
                  </>
                }
                style={{ minWidth: 260 }}
              >
                <Space>
                  <Switch checked={notifyAdmins} onChange={setNotifyAdmins} />
                  {notifyAdmins && (
                    <Input
                      placeholder={t("adminMailer.form.fields.notifyAdmins.placeholder")}
                      value={adminEmailsStr}
                      onChange={(e) => setAdminEmailsStr(e.target.value)}
                    />
                  )}
                </Space>
              </Form.Item>
            </Space>

            <Form.Item label={t("adminMailer.form.fields.subject.label")} required>
              <Input
                placeholder={t("adminMailer.form.fields.subject.placeholder")}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </Form.Item>

            <Form.Item
              label={
                <Space>
                  <span>{t("adminMailer.form.fields.message.label")}</span>
                  <Text type="secondary">{t("adminMailer.form.fields.message.charCount", { count: charCount })}</Text>
                </Space>
              }
              required
            >
              <ReactQuill
                theme="snow"
                value={html}
                onChange={setHtml}
                style={{ height: 260, marginBottom: 24 }}
                modules={quillModules}
                formats={quillFormats}
              />
              <Space>
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => setPreviewOpen(true)}
                  type="default"
                >
                  {t("adminMailer.form.buttons.preview")}
                </Button>
              </Space>
            </Form.Item>

            <Divider />

            <Form.Item
              label={
                <>
                  {t("adminMailer.form.fields.attachments.label")}{" "}
                  <Tooltip title={t("adminMailer.form.fields.attachments.tooltip")}>
                    <InfoCircleOutlined />
                  </Tooltip>
                </>
              }
            >
              <Upload
                beforeUpload={() => false}
                onChange={onUploadChange}
                fileList={files}
                multiple
                maxCount={10}
              >
                <Button icon={<UploadOutlined />}>{t("adminMailer.form.buttons.addFile")}</Button>
              </Upload>
            </Form.Item>

            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={loading}
                disabled={loading}
              >
                {t("adminMailer.form.buttons.send")}
              </Button>

              {/* Bouton reset manuel si besoin */}
              <Button onClick={resetAll} disabled={loading}>
                {t("adminMailer.form.buttons.clear")}
              </Button>
            </Space>
          </Form>
        </Card>
      </div>

      {/* Prévisualisation HTML */}
      <Modal
        title={t("adminMailer.modals.preview.title")}
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={<Button onClick={() => setPreviewOpen(false)}>{t("adminMailer.modals.preview.close")}</Button>}
        width={800}
      >
        <div
          style={{ border: "1px solid #eee", padding: 16, borderRadius: 8 }}
          dangerouslySetInnerHTML={{ __html: html || `<p>${t("adminMailer.modals.preview.empty")}</p>` }}
        />
        <Divider />
        <Text type="secondary">{t("adminMailer.modals.preview.textVersion")}:</Text>
        <pre style={{ whiteSpace: "pre-wrap" }}>{textVersion || t("adminMailer.modals.preview.empty")}</pre>
      </Modal>
    </div>
  );
}
