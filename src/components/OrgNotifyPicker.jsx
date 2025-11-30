import { Form, Select } from "antd";

/**
 * Props:
 * - orgs: Array<{id, name, type, ...}>
 * - targetOrgId: string (ID sélectionné comme organisation cible)
 * - value: string[] (IDs sélectionnés)
 * - onChange: (ids: string[]) => void
 */
export default function OrgNotifyPicker({ orgs = [], targetOrgId, value = [], onChange }) {
  const options = (orgs || [])
    .filter(o => o.id !== targetOrgId && o.type !== "TRADUCTEUR")
    .map(o => ({ value: o.id, label: `${o.name} — ${o.type}` }));

  return (
    <Form.Item label="Notifier des organisations existantes (hors cible et hors TRADUCTEUR)">
      <Select
        mode="multiple"
        allowClear
        showSearch
        placeholder="Sélectionnez une ou plusieurs organisations à notifier"
        value={value}
        onChange={onChange}
        options={options}
        optionFilterProp="label"
      />
    </Form.Item>
  );
}
