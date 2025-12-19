const fs = require('fs');
const files = ['fr.json', 'en.json', 'es.json', 'de.json', 'it.json', 'zh.json'];
const required = [
  'dashboard.read', 'dashboard.manage',
  'users.create', 'users.update', 'users.delete',
  'demandes.create', 'demandes.update', 'demandes.delete',
  'documents.manage',
  'permissions.read', 'permissions.manage',
  'organizationDemandeNotifications.read', 'organizationDemandeNotifications.manage'
];

files.forEach(file => {
  try {
    const data = JSON.parse(fs.readFileSync(`src/i18n/locales/${file}`, 'utf8'));
    const perms = data.permissions || {};
    const missing = required.filter(k => !perms[k]);
    if (missing.length > 0) {
      console.log(`${file}: Missing ${missing.join(', ')}`);
    } else {
      console.log(`${file}: OK`);
    }
  } catch(e) {
    console.error(`${file}: ${e.message}`);
  }
});
