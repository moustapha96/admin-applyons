
/* Enhanced Mailer Component - Responsive & Improved UX */
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
  Row,
  Col,
  Tag,
  Badge,
  Progress,
  Alert,
  Collapse,
} from "antd";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill";
import {
  SendOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import userService from "@/services/userService";
import { useTranslation } from "react-i18next";
import "react-quill/dist/quill.snow.css";

const { Text, Title } = Typography;
const { Panel } = Collapse;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "image"],
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
  "image",
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

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

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
    size: file.size,
  };
}

export default function MinimalMailer() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});

  // champs
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [replyTo, setReplyTo] = useState("");

  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");

  const [notifyAdmins, setNotifyAdmins] = useState(false);
  const [adminEmailsStr, setAdminEmailsStr] = useState("");

  // Upload
  const [files, setFiles] = useState([]);

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

  const getEmailValidationStatus = (list) => {
    if (!list.length) return null;
    return validateEmails(list) ? "success" : "error";
  };

  const totalRecipients = useMemo(() => {
    return toList.length + ccList.length + bccList.length;
  }, [toList, ccList, bccList]);

  const totalFileSize = useMemo(() => {
    return files.reduce((sum, f) => sum + (f.size || 0), 0);
  }, [files]);

  const onUploadChange = ({ fileList }) => {
    setFiles(fileList);
  };

  const removeFile = (file) => {
    const newFiles = files.filter((f) => f.uid !== file.uid);
    setFiles(newFiles);
  };

  const resetAll = () => {
    setTo("");
    setCc("");
    setBcc("");
    setReplyTo("");
    setSubject("");
    setHtml("");
    setNotifyAdmins(false);
    setAdminEmailsStr("");
    setFiles([]);
    setPreviewOpen(false);
    setUploadingFiles({});
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
          setUploadingFiles((prev) => ({ ...prev, [f.uid]: 0 }));
          try {
            const attachment = await fileToBase64(file);
            attachments.push(attachment);
            setUploadingFiles((prev) => ({ ...prev, [f.uid]: 100 }));
          } catch (error) {
            message.error(`Erreur lors du traitement de ${file.name}`);
            setUploadingFiles((prev) => {
              const newState = { ...prev };
              delete newState[f.uid];
              return newState;
            });
          }
        }
      }

      const body = {
        to: toList,
        cc: ccList,
        bcc: bccList,
        replyTo: replyTo || undefined,
        subject,
        html,
        text: textVersion,
        attachments,
        notifyAdmins: !!notifyAdmins,
        adminEmails: notifyAdmins && adminEmails.length ? adminEmails : undefined,
      };

      const { data } = await userService.sendMailToUser(body);
      message.success(data?.message || t("adminMailer.messages.sendSuccess"));
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
      setUploadingFiles({});
    }
  };

  const EmailTags = ({ emails, onRemove }) => {
    if (!emails.length) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {emails.map((email, idx) => (
          <Tag
            key={idx}
            closable={!!onRemove}
            onClose={() => onRemove && onRemove(email)}
            color={validateEmails([email]) ? "green" : "red"}
            icon={validateEmails([email]) ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            className="mb-2"
          >
            {email}
          </Tag>
        ))}
      </div>
    );
  };

  return (
    <div className="container-fluid relative px-3 py-4">
      <div className="layout-specing">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <Title level={4} className="!mb-2">
              {t("adminMailer.pageTitle")}
            </Title>
            <Text type="secondary" className="text-sm">
              {t("adminMailer.subtitle") || "Envoyez des emails professionnels avec pièces jointes"}
            </Text>
          </div>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("adminMailer.breadcrumbs.dashboard")}</Link> },
              { title: t("adminMailer.breadcrumbs.mailer") },
            ]}
          />
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card className="text-center">
              <MailOutlined className="text-2xl text-blue-500 mb-2" />
              <div className="text-2xl font-bold">{totalRecipients}</div>
              <Text type="secondary" className="text-xs">
                {t("adminMailer.stats.recipients")}
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="text-center">
              <FileTextOutlined className="text-2xl text-green-500 mb-2" />
              <div className="text-2xl font-bold">{files.length}</div>
              <Text type="secondary" className="text-xs">
                {t("adminMailer.stats.attachments")}
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="text-center">
              <Text className="text-2xl font-bold">{charCount}</Text>
              <Text type="secondary" className="text-xs block">
                {t("adminMailer.stats.characters")}
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="text-center">
              <Text className="text-2xl font-bold">{formatFileSize(totalFileSize)}</Text>
              <Text type="secondary" className="text-xs block">
                {t("adminMailer.stats.totalSize")}
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Main Form Card */}
        <Card
          title={
            <Space>
              <MailOutlined />
              <span>{t("adminMailer.form.title")}</span>
            </Space>
          }
          className="mb-6 shadow-md"
        >
          <Form layout="vertical" onFinish={handleSend}>
            {/* Recipients Section */}
            <Collapse
              ghost
              defaultActiveKey={["recipients"]}
              className="mb-4"
            >
              <Panel
                header={
                  <Space>
                    <MailOutlined />
                    <span>{t("adminMailer.common.recipients")}</span>
                    <Badge count={totalRecipients} showZero />
                  </Space>
                }
                key="recipients"
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      label={
                        <Space>
                          <span>{t("adminMailer.form.fields.to.label")}</span>
                          <Text type="danger">*</Text>
                        </Space>
                      }
                      validateStatus={getEmailValidationStatus(toList)}
                      help={
                        toList.length > 0 && !validateEmails(toList)
                          ? t("adminMailer.common.invalidEmails")
                          : null
                      }
                    >
                      <Input
                        placeholder={t("adminMailer.form.fields.to.placeholder")}
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        prefix={<MailOutlined />}
                        size="large"
                      />
                      <EmailTags emails={toList} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Row gutter={[8, 8]}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={t("adminMailer.form.fields.cc.label")}
                          validateStatus={getEmailValidationStatus(ccList)}
                        >
                          <Input
                            placeholder={t("adminMailer.form.fields.cc.placeholder")}
                            value={cc}
                            onChange={(e) => setCc(e.target.value)}
                            size="large"
                          />
                          <EmailTags emails={ccList} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={t("adminMailer.form.fields.bcc.label")}
                          validateStatus={getEmailValidationStatus(bccList)}
                        >
                          <Input
                            placeholder={t("adminMailer.form.fields.bcc.placeholder")}
                            value={bcc}
                            onChange={(e) => setBcc(e.target.value)}
                            size="large"
                          />
                          <EmailTags emails={bccList} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={t("adminMailer.form.fields.replyTo.label")}
                      validateStatus={
                        replyTo && !emailRegex.test(replyTo) ? "error" : null
                      }
                      help={
                        replyTo && !emailRegex.test(replyTo)
                          ? t("adminMailer.common.invalidEmail")
                          : null
                      }
                    >
                      <Input
                        placeholder={t("adminMailer.form.fields.replyTo.placeholder")}
                        value={replyTo}
                        onChange={(e) => setReplyTo(e.target.value)}
                        prefix={<MailOutlined />}
                        size="large"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <Space>
                          <span>{t("adminMailer.form.fields.notifyAdmins.label")}</span>
                          <Tooltip title={t("adminMailer.form.fields.notifyAdmins.tooltip")}>
                            <InfoCircleOutlined className="cursor-help" />
                          </Tooltip>
                        </Space>
                      }
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Switch
                          checked={notifyAdmins}
                          onChange={setNotifyAdmins}
                          checkedChildren={t("adminMailer.common.enabled")}
                          unCheckedChildren={t("adminMailer.common.disabled")}
                        />
                        {notifyAdmins && (
                          <Input
                            placeholder={t("adminMailer.form.fields.notifyAdmins.placeholder")}
                            value={adminEmailsStr}
                            onChange={(e) => setAdminEmailsStr(e.target.value)}
                            size="large"
                          />
                        )}
                        {notifyAdmins && adminEmails.length > 0 && (
                          <EmailTags emails={adminEmails} />
                        )}
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>
            </Collapse>

            <Divider />

            {/* Subject */}
            <Form.Item
              label={
                <Space>
                  <span>{t("adminMailer.form.fields.subject.label")}</span>
                  <Text type="danger">*</Text>
                </Space>
              }
              required
            >
              <Input
                placeholder={t("adminMailer.form.fields.subject.placeholder")}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                size="large"
                maxLength={200}
                showCount
              />
            </Form.Item>

            {/* Message Editor */}
            <Form.Item
              label={
                <Space>
                  <span>{t("adminMailer.form.fields.message.label")}</span>
                  <Text type="secondary" className="text-sm">
                    ({charCount} caractères)
                  </Text>
                </Space>
              }
              required
            >
              <div className="mb-4">
                <ReactQuill
                  theme="snow"
                  value={html}
                  onChange={setHtml}
                  style={{
                    height: 300,
                    marginBottom: 24,
                  }}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white dark:bg-slate-800"
                />
              </div>
              <Space wrap>
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => setPreviewOpen(true)}
                  type="default"
                  disabled={!html}
                >
                  {t("adminMailer.form.buttons.preview")}
                </Button>
                {html && (
                  <Button
                    onClick={() => setHtml("")}
                    danger
                    size="small"
                  >
                    {t("adminMailer.common.clear")}
                  </Button>
                )}
              </Space>
            </Form.Item>

            <Divider />

            {/* Attachments */}
            <Form.Item
              label={
                <Space>
                  <UploadOutlined />
                  <span>{t("adminMailer.form.fields.attachments.label")}</span>
                  <Tooltip title={t("adminMailer.form.fields.attachments.tooltip")}>
                    <InfoCircleOutlined className="cursor-help" />
                  </Tooltip>
                  {files.length > 0 && (
                    <Badge count={files.length} showZero />
                  )}
                </Space>
              }
            >
              <Upload
                beforeUpload={() => false}
                onChange={onUploadChange}
                fileList={files}
                multiple
                maxCount={10}
                onRemove={(file) => removeFile(file)}
              >
                <Button icon={<UploadOutlined />} size="large">
                  {t("adminMailer.form.buttons.addFile")}
                </Button>
              </Upload>

              {/* File List with Progress */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file) => (
                    <Card
                      key={file.uid}
                      size="small"
                      className="mb-2"
                      actions={[
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeFile(file)}
                          key="delete"
                        >
                          {t("adminMailer.common.delete")}
                        </Button>,
                      ]}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Space>
                          <FileTextOutlined />
                          <Text strong>{file.name}</Text>
                          <Text type="secondary">
                            {formatFileSize(file.size)}
                          </Text>
                        </Space>
                        {uploadingFiles[file.uid] !== undefined && (
                          <Progress
                            percent={uploadingFiles[file.uid]}
                            status={
                              uploadingFiles[file.uid] === 100
                                ? "success"
                                : "active"
                            }
                            size="small"
                          />
                        )}
                      </Space>
                    </Card>
                  ))}
                </div>
              )}
            </Form.Item>

            {/* Action Buttons */}
            <Divider />
            <Space size="middle" wrap className="w-full justify-end">
              <Button
                onClick={resetAll}
                disabled={loading}
                size="large"
              >
                {t("adminMailer.form.buttons.clear")}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={loading}
                disabled={loading}
                size="large"
                className="min-w-[120px]"
              >
                {loading ? t("adminMailer.form.buttons.sending") || "Envoi..." : t("adminMailer.form.buttons.send")}
              </Button>
            </Space>
          </Form>
        </Card>
      </div>

      {/* Preview Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>{t("adminMailer.modals.preview.title")}</span>
          </Space>
        }
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewOpen(false)}>
            {t("adminMailer.modals.preview.close")}
          </Button>,
        ]}
        width="90%"
        style={{ maxWidth: 900 }}
      >
        <div className="space-y-4">
          <div>
            <Text strong>{t("adminMailer.common.subject")}: </Text>
            <Text>{subject || `(${t("adminMailer.modals.preview.empty")})`}</Text>
          </div>
          <Divider />
          <div>
            <Text strong className="mb-2 block">
              {t("adminMailer.common.htmlVersion")}:
            </Text>
            <div
              className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-white dark:bg-slate-800"
              dangerouslySetInnerHTML={{
                __html: html || `<p>${t("adminMailer.modals.preview.empty")}</p>`,
              }}
            />
          </div>
          <Divider />
          <div>
            <Text strong className="mb-2 block">
              {t("adminMailer.modals.preview.textVersion")}:
            </Text>
            <pre className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg whitespace-pre-wrap text-sm">
              {textVersion || t("adminMailer.modals.preview.empty")}
            </pre>
          </div>
          {files.length > 0 && (
            <>
              <Divider />
              <div>
                <Text strong className="mb-2 block">
                  {t("adminMailer.common.attachmentsCount")} ({files.length}):
                </Text>
                <Space wrap>
                  {files.map((file) => (
                    <Tag key={file.uid} icon={<FileTextOutlined />}>
                      {file.name} ({formatFileSize(file.size)})
                    </Tag>
                  ))}
                </Space>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
