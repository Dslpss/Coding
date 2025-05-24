# 📚 Documentação da API

## Visão Geral

Esta documentação descreve as principais funcionalidades e estruturas de dados da plataforma Self Coding.

## 🔥 Firebase/Firestore

### Coleções Principais

#### `cursos`
Armazena informações dos cursos disponíveis na plataforma.

```typescript
interface Curso {
  id: string;
  nome: string;
  titulo?: string; // compatibilidade retroativa
  descricao: string;
  categoria: string;
  instrutor: string;
  thumbnail?: string;
  preco: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `cursos/{cursoId}/chapters`
Subcoleção que contém os capítulos de cada curso.

```typescript
interface Capitulo {
  id: string;
  nome: string;
  ordem: number;
  createdAt: Date;
  // Campos legados para compatibilidade
  videoUrl?: string;
  videoTitulo?: string;
}
```

#### `cursos/{cursoId}/chapters/{capituloId}/videos`
Subcoleção que contém os vídeos de cada capítulo.

```typescript
interface Video {
  id: string;
  titulo: string;
  url: string;
  duracao?: number;
  ordem: number;
  createdAt: Date;
}
```

#### `cursos/{cursoId}/comments`
Sistema de comentários para cada curso.

```typescript
interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  replies?: Comment[]; // Para futuras implementações
}
```

#### `users`
Informações dos usuários cadastrados.

```typescript
interface User {
  id: string; // UID do Firebase Auth
  email: string;
  name: string;
  createdAt: Date;
  lastLogin: Date;
  // Progresso nos cursos
  enrolledCourses: string[]; // IDs dos cursos matriculados
  progress: {
    [cursoId: string]: {
      completedVideos: string[];
      currentVideo?: string;
      progress: number; // 0-100
      lastAccessed: Date;
    }
  };
}
```

#### `blog`
Posts do blog da plataforma.

```typescript
interface BlogPost {
  id: string;
  title: string;
  content: string; // HTML/Markdown
  author: string;
  category: string;
  tags: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  views: number;
}
```

#### `admin`
Configurações e dados administrativos.

```typescript
interface AdminConfig {
  id: string;
  siteName: string;
  siteDescription: string;
  adminUsers: string[]; // UIDs dos usuários admin
  settings: {
    allowRegistration: boolean;
    maintenanceMode: boolean;
    featuredCourses: string[];
  };
}
```

## 🔐 Autenticação

### Firebase Authentication

A plataforma usa Firebase Authentication para gerenciar usuários:

```typescript
// Hook personalizado para autenticação
const useAuth = () => {
  const [user, loading, error] = useAuthState(auth);
  
  const login = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };
  
  const register = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };
  
  const logout = async () => {
    return signOut(auth);
  };
  
  return { user, loading, error, login, register, logout };
};
```

### Proteção de Rotas

#### Rotas de Usuário
Protegidas por middleware que verifica se o usuário está autenticado:

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);
  
  if (loading) return <LoadingSpinner />;
  if (!user) redirect('/auth');
  
  return <div>{children}</div>;
}
```

#### Rotas de Admin
Verificação adicional para permissões de administrador:

```typescript
// utils/authGuard.ts
export const requireAdmin = async (userId: string): Promise<boolean> => {
  const adminDoc = await getDoc(doc(db, 'admin', 'config'));
  const adminData = adminDoc.data();
  return adminData?.adminUsers?.includes(userId) || false;
};
```

## 🎥 Sistema de Vídeo

### VideoPlayer Component

```typescript
interface VideoPlayerProps {
  url: string;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
  startTime?: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  url, 
  onProgress, 
  onEnded,
  startTime = 0 
}) => {
  // Implementação usando react-player
  return (
    <ReactPlayer
      url={url}
      controls
      width="100%"
      height="100%"
      onProgress={onProgress}
      onEnded={onEnded}
    />
  );
};
```

### Acompanhamento de Progresso

```typescript
// Salvar progresso do usuário
const saveProgress = async (userId: string, cursoId: string, videoId: string, progress: number) => {
  const userRef = doc(db, 'users', userId);
  const updateData = {
    [`progress.${cursoId}.currentVideo`]: videoId,
    [`progress.${cursoId}.progress`]: progress,
    [`progress.${cursoId}.lastAccessed`]: new Date(),
  };
  
  if (progress >= 90) {
    updateData[`progress.${cursoId}.completedVideos`] = arrayUnion(videoId);
  }
  
  await updateDoc(userRef, updateData);
};
```

## 💬 Sistema de Comentários

### Comments Component

```typescript
interface CommentsProps {
  cursoId: string;
}

const Comments: React.FC<CommentsProps> = ({ cursoId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  
  const addComment = async (content: string) => {
    const user = auth.currentUser;
    if (!user) return;
    
    const commentData = {
      userId: user.uid,
      userName: user.displayName || user.email,
      content,
      createdAt: new Date(),
    };
    
    await addDoc(collection(db, 'cursos', cursoId, 'comments'), commentData);
  };
  
  // Resto da implementação...
};
```

## 📊 Dashboard e Estatísticas

### UserStats Component

```typescript
interface UserStats {
  totalCourses: number;
  completedCourses: number;
  totalHours: number;
  currentStreak: number;
}

const getUserStats = async (userId: string): Promise<UserStats> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();
  
  // Calcular estatísticas baseadas no progresso
  return {
    totalCourses: userData?.enrolledCourses?.length || 0,
    completedCourses: Object.values(userData?.progress || {})
      .filter((p: any) => p.progress === 100).length,
    totalHours: calculateTotalHours(userData?.progress || {}),
    currentStreak: calculateStreak(userData?.progress || {}),
  };
};
```

## 🔧 Utilitários

### Firebase Config

```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... outras configurações
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### Helpers Comuns

```typescript
// utils/helpers.ts
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
```

## 🚀 Deploy e Produção

### Variáveis de Ambiente

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (opcional)
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=

# Outros
NEXT_PUBLIC_SITE_URL=https://seusite.com
```

### Configuração de Segurança

#### Firestore Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cursos públicos para leitura
    match /cursos/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Comentários
    match /cursos/{cursoId}/comments/{document} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isOwner() || isAdmin();
    }
    
    // Usuários podem ler/escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Apenas admins podem acessar dados administrativos
    match /admin/{document} {
      allow read, write: if isAdmin();
    }
    
    // Funções auxiliares
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
  }
}
```

## 🔍 Debugging e Logs

### Tratamento de Erros

```typescript
// utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleFirebaseError = (error: any): AppError => {
  switch (error.code) {
    case 'auth/user-not-found':
      return new AppError('Usuário não encontrado', 'USER_NOT_FOUND', 404);
    case 'auth/wrong-password':
      return new AppError('Senha incorreta', 'WRONG_PASSWORD', 401);
    case 'permission-denied':
      return new AppError('Acesso negado', 'ACCESS_DENIED', 403);
    default:
      return new AppError('Erro interno do servidor', 'INTERNAL_ERROR', 500);
  }
};
```
