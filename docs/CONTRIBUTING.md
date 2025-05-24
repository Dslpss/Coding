# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o Self Coding! Este documento fornece diretrizes para contribuições.

## 📋 Código de Conduta

- Seja respeitoso e construtivo
- Mantenha discussões focadas no projeto
- Ajude a criar um ambiente acolhedor para todos

## 🚀 Como Contribuir

### 1. Reportar Bugs

Use as [Issues do GitHub](https://github.com/Dslpss/Coding/issues) para reportar bugs:

```markdown
**Descrição do Bug**
Uma descrição clara do que está acontecendo.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '....'
3. Role para baixo até '....'
4. Veja o erro

**Comportamento Esperado**
Uma descrição clara do que você esperava que acontecesse.

**Screenshots**
Se aplicável, adicione screenshots para ajudar a explicar o problema.

**Ambiente:**
- OS: [ex. iOS, Windows]
- Browser: [ex. chrome, safari]
- Versão: [ex. 22]
```

### 2. Sugerir Features

Use as Issues para sugerir novas funcionalidades:

```markdown
**A feature está relacionada a um problema?**
Uma descrição clara do problema. Ex. Estou sempre frustrado quando [...]

**Descreva a solução que você gostaria**
Uma descrição clara do que você quer que aconteça.

**Alternativas consideradas**
Uma descrição de soluções ou features alternativas que você considerou.
```

### 3. Processo de Development

1. **Fork o repositório**
2. **Crie uma branch** a partir da `main`:
   ```bash
   git checkout -b feature/minha-nova-feature
   ```

3. **Faça suas alterações** seguindo os padrões do projeto

4. **Teste suas mudanças**:
   ```bash
   npm run dev
   npm run build
   npm run lint
   ```

5. **Commit suas mudanças**:
   ```bash
   git commit -m "feat: adiciona nova funcionalidade X"
   ```

6. **Push para sua branch**:
   ```bash
   git push origin feature/minha-nova-feature
   ```

7. **Abra um Pull Request**

## 🏗 Padrões de Código

### Commits
Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: nova funcionalidade
- `fix`: correção de bug
- `docs`: mudanças na documentação
- `style`: mudanças que não afetam a lógica (formatação, etc)
- `refactor`: refatoração de código
- `test`: adição ou correção de testes

Exemplos:
```bash
feat: adiciona sistema de comentários
fix: corrige erro no login de usuário
docs: atualiza README com instruções de instalação
```

### TypeScript
- Use tipos explícitos sempre que possível
- Evite `any`, prefira tipos específicos
- Use interfaces para objetos complexos

### React/Next.js
- Use componentes funcionais com hooks
- Prefira `"use client"` apenas quando necessário
- Mantenha componentes pequenos e reutilizáveis
- Use nomes descritivos para variáveis e funções

### Styling
- Use classes do Tailwind CSS
- Mantenha consistência com o design system
- Prefira utilitários ao invés de CSS customizado

## 📁 Estrutura de Arquivos

```
src/
├── app/                    # Pages e layouts
├── components/            # Componentes reutilizáveis
├── lib/                   # Utilitários e configurações
├── types/                 # Definições de tipos TypeScript
└── hooks/                 # Hooks customizados
```

### Convenções de Nomenclatura

- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Arquivos de página**: kebab-case (`user-profile.tsx`)
- **Hooks**: camelCase começando com "use" (`useAuth.ts`)
- **Utilitários**: camelCase (`formatDate.ts`)

## 🧪 Testes

Antes de submeter um PR:

1. **Teste localmente**: Certifique-se que `npm run dev` funciona
2. **Build de produção**: Verifique que `npm run build` passa
3. **Linting**: Execute `npm run lint` e corrija problemas

## 📝 Documentação

- Mantenha o README atualizado
- Documente novas funcionalidades
- Use comentários em código complexo
- Atualize a documentação da API se aplicável

## ❓ Dúvidas

Se tiver dúvidas sobre como contribuir:

1. Verifique issues existentes
2. Abra uma nova issue com a tag `question`
3. Entre em contato via [email/discord/etc]

Obrigado por contribuir! 🎉
