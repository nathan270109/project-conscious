# Deploy e state — operação manual (infra/)

## Deploy do site (S3 + CloudFront)

1. Na raiz: `npm ci` (se necessário) e `npm run build` → gera `dist/project-conscious/browser`.
2. Em `infra/`: `terraform init -backend-config=backend.hcl` (backend.hcl a partir de `backend.hcl.example`; nunca commitado).
3. `terraform plan` — revisar mudanças de bucket/CloudFront/API/Lambda.
4. `terraform apply` — Terraform envia os arquivos individualmente com MIME/cache-control corretos.
5. Se assets mudaram mas o index não refletir: invalidar CloudFront (`aws cloudfront create-invalidation --distribution-id <id> --paths "/*"`).

## State

- Backend S3 com **lock nativo** (`use_lockfile = true`, Terraform ≥1.10) — DynamoDB lock é legado/deprecado.
- Bucket de state criado por `infra/bootstrap/main.tf` (`project-conscious-tfstate-<account>-<region>`, `prevent_destroy`, versionado, SSE, public block).
- Regra: **nunca applies simultâneos**; um operador por vez. Nunca editar `.tfstate` à mão; recuperação = restaurar versão anterior no bucket (versionamento).

## Lambda do chat (Bedrock Mantle)

- Código: `infra/lambda/app.py`; empacotada por `archive_file` no apply.
- Permissões: role com apenas CloudWatch Logs + `bedrock-mantle:CreateInference` (Resource `*` com condição no model id — manter a condição).
- Throttling API: burst 5 / rate 2. Rota pública — pendência conhecida: adicionar autenticação antes de produção.
- Mudanças em findings (formato de contexto) → revisar sanitização/prompt em `app.py`.

## Checklist antes de finalizar mudanças de infra

- [ ] `terraform fmt` e `terraform validate` em `infra/`
- [ ] `terraform plan` revisado linha a linha (destruição = confirmar intenção)
- [ ] Nenhum `backend.hcl`/`.tfstate`/plano no diff
- [ ] Se publicação: `npm run build` rodado e `dist/` regenerado
- [ ] Variáveis novas documentadas em `variables.tf` + `infra/README.md`
