# Contribuindo com o Ignite

Primeiramente, obrigado pelo seu interesse em contribuir para o **Ignite**! 🎉  
Seja você um iniciante ou um dev sênior, todas as contribuições (desde relatar bugs até sugerir grandes refatorações) são bem-vindas.

Para manter o projeto organizado, pedimos que leia e siga as diretrizes abaixo.

---

## 🚀 Como Contribuir

### 1. Encontrou um bug? (Reportando Patos 🦆)
Se você achou um erro matemático ou um problema na interface:
- Verifique nas **Issues** do repositório se o problema já não foi relatado.
- Se for inédito, abra uma nova Issue descrevendo detalhadamente:
  - Como reproduzir o bug.
  - O que você esperava que acontecesse.
  - O que realmente aconteceu.
  - (Opcional) Screenshots ou gravações de tela.

### 2. Quer sugerir uma nova funcionalidade?
- Crie uma Issue com a tag `enhancement` (melhoria).
- Explique de forma clara o caso de uso e como essa nova funcionalidade melhora a vida de quem investe utilizando o **Ignite**.

### 3. Quer enviar código (Pull Request)?
Ótimo! Siga este passo a passo para configurar o ambiente e enviar seu código:

#### Passos para rodar localmente
1. **Faça o Fork** do repositório para a sua conta do GitHub.
2. **Clone** o fork para a sua máquina:
   ```bash
   git clone https://github.com/SEU-USUARIO/ignite-financas.git
   cd ignite-financas
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Copie o arquivo de variáveis de ambiente de exemplo:
   ```bash
   cp .env.example .env
   ```
   *(Substitua as chaves falsas pelas suas credenciais do banco e chaves de API reais).*
5. Suba a infraestrutura do PostgreSQL usando Docker:
   ```bash
   docker-compose up -d db
   ```
6. Rode as migrations do banco de dados (Prisma):
   ```bash
   npx prisma migrate dev
   ```
7. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
8. O aplicativo estará rodando em `http://localhost:3000`.

#### Regras para o Pull Request (PR)
- Crie uma *branch* descritiva para sua alteração: `git checkout -b feature/nova-interface` ou `git checkout -b bugfix/erro-matematico`.
- Siga as regras de linting do projeto. Antes de subir o código, rode `npm run lint:strict` para garantir que não deixou lixo para trás.
- Os testes unitários são sagrados! Se você alterou o motor de cálculo (`calculator.ts`), garanta que os testes continuam verdes rodando `npm run test`.
- O seu PR deve conter uma descrição clara do que foi feito. Referencie a Issue original, se existir (ex: `Fixes #123`).

---

## 📜 Código de Conduta
O ambiente de código aberto deve ser seguro, colaborativo e livre de preconceitos ou agressões. Ao contribuir com este projeto, você se compromete a respeitar os outros mantenedores e colaboradores, mantendo discussões estritamente técnicas e construtivas.

---

Obrigado por ajudar a tornar o **Ignite** a melhor plataforma Open Source de Gestão de Carteiras! ⚡
