# 🎓 Self Coding - Plataforma de Ensino

Uma plataforma moderna de ensino de programação construída com Next.js, React e Firebase.

## 🚀 Tecnologias

- **Framework**: [Next.js 15](https://nextjs.org/) com App Router
- **Frontend**: React 19 + TypeScript
- **Estilização**: Tailwind CSS
- **Backend**: Firebase (Firestore + Authentication)
- **Gerenciamento de Estado**: React Hooks
- **Ícones**: React Icons
- **Animações**: Framer Motion
- **Player de Vídeo**: React Player

## ✨ Funcionalidades

### 👥 Para Usuários
- **Autenticação**: Login e registro seguro
- **Catálogo de Cursos**: Navegação por categorias
- **Player de Vídeo**: Reprodução de aulas com qualidade
- **Progresso**: Acompanhamento do progresso nos cursos
- **Comentários**: Sistema de comentários nas aulas
- **Dashboard**: Painel personalizado do usuário

### 🔧 Para Administradores
- **Painel Admin**: Interface completa de administração
- **Gestão de Cursos**: Criar, editar e gerenciar cursos
- **Gestão de Usuários**: Controle de usuários da plataforma
- **Blog**: Sistema de criação de posts
- **Estatísticas**: Relatórios e métricas da plataforma
- **Autenticação Admin**: Sistema de login específico para admins

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── admin/             # Painel administrativo
│   │   ├── blog/          # Gestão do blog
│   │   ├── cursos/        # Gestão de cursos
│   │   ├── usuarios/      # Gestão de usuários
│   │   └── estatisticas/  # Relatórios e métricas
│   ├── auth/              # Autenticação de usuários
│   ├── blog/              # Blog público
│   ├── cursos/            # Catálogo e player de cursos
│   ├── dashboard/         # Dashboard do usuário
│   └── progresso/         # Acompanhamento de progresso
└── lib/                   # Configurações e utilitários
    └── firebase.ts        # Configuração do Firebase
```

## 🛠 Configuração do Ambiente

### Pré-requisitos
- Node.js 18+ 
- npm, yarn ou pnpm
- Conta no Firebase

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

# Firebase Admin SDK (opcional, para funcionalidades admin)
FIREBASE_ADMIN_PRIVATE_KEY=sua_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=seu_client_email
```

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/Dslpss/Coding.git
cd Coding
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. **Configure o Firebase**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative Authentication e Firestore
   - Configure as variáveis de ambiente

4. **Execute o projeto**
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

5. **Acesse a aplicação**
   - Abra [http://localhost:3000](http://localhost:3000) no navegador

## 🗄 Estrutura do Banco de Dados (Firestore)

```
├── cursos/                 # Coleção de cursos
│   ├── {cursoId}/         # Documento do curso
│   │   ├── chapters/      # Subcoleção de capítulos
│   │   │   └── videos/    # Subcoleção de vídeos
│   │   └── comments/      # Subcoleção de comentários
├── users/                 # Coleção de usuários
├── blog/                  # Coleção de posts do blog
└── admin/                 # Coleção de dados administrativos
```

## 🎨 Customização

### Cores e Tema
O projeto usa um sistema de cores azul como padrão. Para personalizar:

```css
/* Principais classes Tailwind usadas */
- bg-blue-950, bg-blue-900   # Backgrounds principais
- bg-white/10                # Backgrounds translúcidos
- text-blue-100, text-blue-300  # Textos
- border-blue-200            # Bordas
```

### Componentes Reutilizáveis
- `VideoPlayer`: Player customizado para vídeos
- `Comments`: Sistema de comentários
- `AdminHeader/Sidebar`: Layout do painel admin
- `AuthForm`: Formulário de autenticação

## 📚 Scripts Disponíveis

```bash
npm run dev        # Inicia o servidor de desenvolvimento
npm run build      # Cria build de produção
npm run start      # Inicia servidor de produção
npm run lint       # Executa linting do código
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🔗 Links Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev/)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
