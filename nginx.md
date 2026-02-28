# Configuration Nginx – admin.applyons.com

Fichier à placer sur le serveur : `/etc/nginx/sites-available/admin.applyons.com`  
Puis : `sudo nginx -t && sudo systemctl reload nginx`

---

```nginx
# ============================================
# HTTP → HTTPS + ACME (Let's Encrypt)
# ============================================
server {
    listen 80;
    listen [::]:80;
    server_name admin.applyons.com www.admin.applyons.com;

    location /.well-known/acme-challenge/ {
        root /var/www/admin.applyons.com;
        allow all;
    }

    location / {
        return 301 https://admin.applyons.com$request_uri;
    }
}

# ============================================
# HTTPS – Admin Dashboard (no cache + security)
# ============================================
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.applyons.com www.admin.applyons.com;

    # Certificats SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/admin.applyons.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.applyons.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    root /var/www/admin.applyons.com;
    index index.html;

    # Logs
    access_log /var/log/nginx/admin.applyons.com.access.log;
    error_log  /var/log/nginx/admin.applyons.com.error.log;

    # =========================
    # Pas de cache (toujours contenu à jour)
    # =========================
    etag off;
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;
    add_header Pragma "no-cache" always;
    add_header Expires "0" always;

    # =========================
    # En-têtes de sécurité
    # =========================
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Redirection www → non-www (canonical)
    if ($host = www.admin.applyons.com) {
        return 301 https://admin.applyons.com$request_uri;
    }

    # index.html : jamais mis en cache (SPA)
    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
        try_files $uri =404;
    }

    # Fichiers statiques : pas de cache (dashboard toujours à jour)
    location ~* \.(js|css|json|map|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
        try_files $uri =404;
    }

    # Routes SPA : tout renvoyer vers index.html
    location / {
        add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;
        add_header Pragma "no-cache" always;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Résumé

| Objectif | Détail |
|----------|--------|
| **Pas de cache** | `Cache-Control: no-store, no-cache`, `Pragma: no-cache`, `Expires: 0`, `etag off` sur tout le site. |
| **Sécurité** | `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`. |
| **SSL** | Config Let's Encrypt conservée ; `options-ssl-nginx.conf` gère les protocoles/chiffrement. |
| **Canonical** | `www.admin.applyons.com` → redirection 301 vers `https://admin.applyons.com`. |
| **SPA** | `try_files ... /index.html` pour les routes côté client. |

Après modification : `sudo nginx -t && sudo systemctl reload nginx`.
