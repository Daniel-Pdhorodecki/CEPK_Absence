# CEPK Absence

Sistema web do **Colégio Estadual P. Kennedy** para professores e funcionários
solicitarem ausências e a administração escolar (pedagogia) analisar os pedidos.

Protótipo funcional com dois perfis:

- **Servidor** (professor ou funcionário): calendário de solicitação, motivo,
  turno, acompanhamento de status e avisos.
- **Administração**: aprova cadastros, aprova/reprova pedidos, gerencia a equipe
  e publica avisos.

Não há cadastro de empresas nem códigos: a instituição é única.

## Funcionalidades

### Cadastro e acesso

- Cadastro único em `/registro`, sem código de empresa.
- Somente e-mails institucionais terminados em **`@escola.pr.gov.br`**.
- Tipo de vínculo: **Professor(a)** ou **Funcionário(a)**.
- Funcionário informa o **cargo** em texto livre (monitor, limpeza, manutenção etc.).
- Todo cadastro entra como **pendente** e só pode entrar após aprovação da administração.
- Login bloqueia cadastros pendentes ou reprovados com mensagem específica.

### Servidor

- Solicitação de falta por **intervalo de datas** no calendário, com turno e motivo.
- **Falta comum**: exige 30 dias de antecedência.
- **Falta médica**: comprovante obrigatório (JPG/PNG/PDF até 5 MB) e sem a regra
  dos 30 dias. O pedido entra como pendente e depende da aprovação da administração.
- Histórico com status (pendente/aprovada/reprovada), observação da administração
  e cancelamento de pedidos pendentes.
- Menus **Aprovadas** e **Reprovadas** na sidebar, com abas e contadores por status.
- Menu de avisos com indicador de não lido, comunicados e aviso de desligamento.
- **Foto de perfil** (JPG, PNG ou WebP até 2 MB), acessível pelo avatar/nome na sidebar.

### Administração

- Aba **Cadastros** com todos os pedidos de acesso pendentes.
- Aprovação/reprovação de cadastros; a reprovação exige um motivo.
- Aprovação/reprovação de solicitações de ausência, com observação obrigatória
  na reprovação.
- Menus **Aprovadas** e **Reprovadas** na sidebar, com abas e contadores por status.
- Lista da equipe com cargo, pedidos pendentes e avisos de desligamento ativos.
- Publicação de comunicados para todos e avisos de desligamento individuais com
  **15 dias de antecedência** do último dia.
- Cards do painel com atalho para cada fila de solicitações, para a equipe e para
  os cadastros pendentes.

### Interface

- Visual institucional do Colégio Kennedy: verde-limão, verde escuro, preto e
  cinzas, com fonte **Geist** self-hosted.
- **Tema escuro por padrão**, com botão sol/lua para alternar para o claro
  (superfícies claras no light, pretas/cinzas no dark).
- A escolha do tema fica salva no navegador (`localStorage`) e é aplicada antes
  da página pintar, sem flash.
- Botões em pílula, cards arredondados e navegação lateral com item ativo
  destacado em verde-limão.
- Marca CEPK Absence com brasão em SVG no componente `components/Logo.tsx` e
  favicon em `app/icon.svg`.
- Calendário com resumo de **início, fim e duração**, destaque do intervalo,
  botão **Limpar seleção** e suporte ao tema escuro.

## Regras de negócio

| Regra | Detalhe |
| --- | --- |
| E-mail | Login e cadastro aceitam somente `@escola.pr.gov.br` |
| Cadastro | Todo novo usuário nasce pendente; administração aprova ou reprova |
| Antecedência de falta comum | `data inicial >= hoje + 30 dias` (dias corridos) |
| Falta médica | Comprovante obrigatório; aceita até 30 dias retroativos e 365 dias futuros |
| Aprovação | Todo pedido nasce pendente; somente a administração aprova ou reprova |
| Sobreposição | Bloqueia pedidos com datas que se cruzam |
| Reprovação | Exige observação da administração |
| Desligamento | Último dia `>= hoje + 15 dias`; bloqueia faltas após o último dia |
| Escopo | Instituição única; servidor acessa somente os próprios dados |
| Comprovante | Download autenticado: só o dono ou a administração |
| Imagens | Foto de perfil: JPG/PNG/WebP até 2 MB, validada por assinatura do arquivo |

Validações rodam no servidor (não apenas na interface).

## Stack

- [Next.js 15](https://nextjs.org) (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Prisma ORM 6 + **SQLite local** / **PostgreSQL no Render**
- Sessão JWT em cookie `httpOnly` com `jose` e senhas com `bcryptjs`
- `react-day-picker` para o calendário

> No protótipo a sessão é implementada diretamente com JWT (mais simples de rodar);
> a estrutura permite migrar para Auth.js depois.

## Rodando localmente

Requisitos: **Node.js 20+** e npm.

```bash
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

Abra <http://localhost:3000>.

Se quiser recriar o banco do zero:

```bash
npm run db:reset
```

### Contas de demonstração (somente seed local)

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administração (pedagoga) | `pedagoga@escola.pr.gov.br` | `123456` |
| Professor | `professor@escola.pr.gov.br` | `123456` |
| Funcionário (monitor) | `funcionario@escola.pr.gov.br` | `123456` |
| Cadastro pendente | `pendente@escola.pr.gov.br` | `123456` |

O seed não roda automaticamente em produção.

## Estrutura do projeto

```
app/
  actions/auth.ts          # login, logout e cadastro
  actions/profile.ts       # foto de perfil
  app/                     # área do servidor
    solicitar/             # calendário + criação de falta
    faltas/                # histórico e cancelamento
    avisos/                # comunicados e desligamento
    perfil/                # dados e foto
  admin/                   # área da administração
    solicitacoes/          # aprovar/reprovar faltas
    cadastros/             # aprovar/reprovar novos usuários
    funcionarios/          # equipe
    avisos/                # publicar comunicados/desligamento
    perfil/                # dados e foto
  rh/                      # redirect legado para /admin
  api/comprovante/[id]/    # download autenticado do comprovante
  api/avatar/[id]/         # foto de perfil
  api/logout/              # encerrar sessão
components/                # layout, calendário, badges, avatar e perfil
lib/
  constants.ts             # instituição, turnos, labels e domínio de e-mail
  email.ts                 # validação do e-mail institucional
  institution.ts           # garante a instituição única
  dates.ts                 # fuso America/Sao_Paulo e datas UTC
  images.ts                # validação de imagem (2 MB, magic bytes)
  rules.ts                 # regras de antecedência, médica e desligamento
  session.ts               # cookie de sessão e guards de rota
prisma/
  schema.prisma            # modelos
  seed.ts                  # dados de demonstração locais
scripts/
  create-admin.mjs         # cria/atualiza o administrador inicial
  use-postgres.mjs         # converte o schema para PostgreSQL no deploy
render.yaml                # blueprint do Render (banco no Neon)
```

## Primeiro administrador

Não há usuário administrador criado automaticamente em produção. Depois do
deploy, rode uma vez (localmente contra o banco de produção ou no Shell do Render):

```bash
ADMIN_EMAIL=pedagoga@escola.pr.gov.br \
ADMIN_PASSWORD='uma-senha-forte' \
ADMIN_NAME='Pedagoga' \
npm run db:create-admin
```

O script é idempotente: se o e-mail já existir, atualiza a senha e garante o
perfil `ADMIN` aprovado. A senha nunca é gravada no repositório.

## Deploy no Render + Neon

O banco de produção fica no **Neon**; o `render.yaml` cria apenas o Web Service
Node. O build executa `scripts/use-postgres.mjs`, que troca o provider do Prisma
de `sqlite` para `postgresql`, adiciona `directUrl` e aplica o schema com
`prisma db push`.

### 1. Criar o banco no Neon

1. Crie um projeto no Neon na região **Ohio (us-east-2)**.
2. Copie as duas connection strings exibidas no painel:
   - **Pooled connection** → será o `DATABASE_URL`;
   - **Direct connection** → será o `DIRECT_URL`.
3. Confirme que as URLs terminam com `?sslmode=require`.

### 2. Criar o serviço no Render

1. Suba o repositório no GitHub.
2. No Render, escolha **New → Blueprint** e selecione o repositório.
3. Confirme o serviço `cepk-absence`.
4. Quando o Render solicitar, preencha:
   - `DATABASE_URL` com a conexão **pooled** do Neon;
   - `DIRECT_URL` com a conexão **direta** do Neon;
   - `ADMIN_EMAIL` e `ADMIN_PASSWORD` (usados apenas pelo script de admin).
5. `AUTH_SECRET` é gerado automaticamente pelo Render.
6. Após o deploy, rode `npm run db:create-admin` com as variáveis configuradas.

Observações:

- O `prisma db push` roda no build e cria as tabelas automaticamente.
- `prisma db push` é adequado ao protótipo; para evoluir o produto, troque por
  migrations versionadas.
- Para produção real, configure backup do banco e mantenha os segredos em segurança.

## Limitações e próximos passos

- Sem envio de e-mail/push: avisos aparecem apenas no site.
- Sem controle de feriados, fins de semana ou escalas.
- Anexo único por pedido (5 MB). O sistema valida tipo e tamanho do arquivo, mas
  **não verifica a autenticidade** do comprovante.
- Sem fluxo de recuperação de senha.
- Aviso de desligamento não desativa a conta automaticamente; apenas bloqueia
  novas faltas após o último dia.
- Possíveis evoluções: notificações por e-mail, múltiplos anexos, migrations e
  testes automatizados das regras.
