# 🚀 Guia de Deploy

Este guia explica como fazer o deploy da plataforma Self Coding em diferentes ambientes.

## 📋 Pré-requisitos

- Conta no [Vercel](https://vercel.com/) (recomendado)
- Projeto Firebase configurado
- Repositório no GitHub
- Node.js 18+ localmente para testes

## 🌐 Deploy na Vercel (Recomendado)

### 1. Preparação

1. **Faça commit de todas as alterações**:
```bash
git add .
git commit -m "feat: prepara projeto para deploy"
git push origin main
```

2. **Verifique se o build funciona localmente**:
```bash
npm run build
npm run start
```

### 2. Configuração na Vercel

1. **Acesse [vercel.com](https://vercel.com/) e faça login**

2. **Clique em "New Project"**

3. **Importe o repositório do GitHub**
   - Selecione `Dslpss/Coding`
   - Configure as permissões se necessário

4. **Configure as variáveis de ambiente**:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
   NEXT_PUBLIC_SITE_URL=https://seu-dominio.vercel.app
   ```

5. **Configure o Build**:
   - Framework Preset: Next.js
   - Root Directory: `./` (padrão)
   - Build Command: `npm run build` (padrão)
   - Output Directory: `.next` (padrão)

6. **Clique em "Deploy"**

### 3. Configuração de Domínio (Opcional)

1. **Na dashboard da Vercel, vá para Settings > Domains**
2. **Adicione seu domínio customizado**
3. **Configure os DNS conforme instruções**

## 🔥 Configuração do Firebase para Produção

### 1. Domínio Autorizado

No [Firebase Console](https://console.firebase.google.com/):

1. **Vá para Authentication > Settings > Authorized domains**
2. **Adicione seu domínio de produção**:
   - `seu-projeto.vercel.app`
   - `seudominio.com` (se usando domínio customizado)

### 2. Firestore Rules

Certifique-se de que as regras estão configuradas para produção:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras de produção - mais restritivas
    match /cursos/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /cursos/{cursoId}/comments/{document} {
      allow read: if true;
      allow create: if isAuthenticated() && validateComment();
      allow update, delete: if isOwner() || isAdmin();
    }
    
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /admin/{document} {
      allow read, write: if isAdmin();
    }
    
    match /blog/{document} {
      allow read: if resource.data.published == true;
      allow write: if isAdmin();
    }
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner() {
      return request.auth.uid == resource.data.userId;
    }
    
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/admin/config) &&
             get(/databases/$(database)/documents/admin/config).data.adminUsers[request.auth.uid] == true;
    }
    
    function validateComment() {
      return request.resource.data.content is string &&
             request.resource.data.content.size() > 0 &&
             request.resource.data.content.size() <= 1000;
    }
  }
}
```

### 3. Storage Rules (se usando Firebase Storage)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && isAdmin();
    }
    
    match /videos/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    function isAdmin() {
      return request.auth != null &&
             exists(/databases/(default)/documents/admin/config) &&
             get(/databases/(default)/documents/admin/config).data.adminUsers[request.auth.uid] == true;
    }
  }
}
```

## 🔧 Otimizações de Performance

### 1. Next.js Config

Crie/atualize `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Otimizações de imagem
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com', // Para fotos do Google
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Compressão
  compress: true,
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirecionamentos
  async redirects() {
    return [
      {
        source: '/',
        destination: '/auth',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
```

### 2. Análise de Bundle

Adicione ao `package.json`:

```json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "^15.0.0"
  }
}
```

E configure no `next.config.ts`:

```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
```

## 📊 Monitoramento

### 1. Vercel Analytics

1. **Na dashboard da Vercel, vá para o projeto**
2. **Ative Analytics na aba correspondente**
3. **Configure Web Vitals monitoring**

### 2. Firebase Analytics

No `lib/firebase.ts`:

```typescript
import { getAnalytics, isSupported } from 'firebase/analytics';

// Só inicializa analytics no client-side e se suportado
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      export const analytics = getAnalytics(app);
    }
  });
}
```

### 3. Error Tracking (Opcional - Sentry)

```bash
npm install @sentry/nextjs
```

Configure em `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

## 🔒 Segurança

### 1. Variáveis de Ambiente

**NUNCA** commite arquivos `.env`:

```bash
# .gitignore (já deve estar lá)
.env
.env.local
.env.production
.env.development
```

### 2. Headers de Segurança

Já configurados no `next.config.ts` acima.

### 3. HTTPS

A Vercel fornece HTTPS automaticamente. Para domínios customizados, configure SSL/TLS.

## 🚀 Deploy Automático

### 1. GitHub Actions (Opcional)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run lint
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./
```

### 2. Configuração de Tokens

1. **Gere um token na Vercel**: Settings > Tokens
2. **Adicione aos GitHub Secrets**:
   - `VERCEL_TOKEN`
   - `ORG_ID` (encontrado em Settings > General)
   - `PROJECT_ID` (encontrado em Settings > General)

## 🔄 Atualizações

### Deploy de Hotfix

```bash
# Para correções urgentes
git checkout main
git pull origin main
git checkout -b hotfix/correcao-urgente
# Faça as correções
git add .
git commit -m "fix: corrige problema urgente"
git push origin hotfix/correcao-urgente
# Abra PR e faça merge
```

### Deploy de Features

```bash
# Para novas funcionalidades
git checkout main
git pull origin main
git checkout -b feature/nova-funcionalidade
# Desenvolva a feature
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/nova-funcionalidade
# Abra PR para review
```

## 📝 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Firebase rules atualizadas
- [ ] Domínios autorizados no Firebase
- [ ] Build local funcionando
- [ ] Testes passando
- [ ] Analytics configurado
- [ ] Monitoramento ativo
- [ ] HTTPS funcionando
- [ ] Performance otimizada

## 🆘 Troubleshooting

### Erro de Build

```bash
# Limpe cache e reinstale
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Erro de Firebase

1. **Verifique as variáveis de ambiente**
2. **Confirme domínios autorizados**
3. **Verifique regras do Firestore**

### Erro de Performance

1. **Use o bundle analyzer**: `npm run analyze`
2. **Verifique imagens grandes**
3. **Implemente lazy loading**

### Erro 404 em Rotas

1. **Verifique estrutura de arquivos em `app/`**
2. **Confirme que não há conflitos de rota**
3. **Teste localmente primeiro**
