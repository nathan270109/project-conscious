---
name: infra-aws-terraform
description: Trabalha na infraestrutura AWS do Project Conscious em infra/ (Terraform — S3+CloudFront do site, API Gateway HTTP + Lambda Python do chat de IA via Bedrock Mantle, state remoto S3). Use quando alterar Terraform, a Lambda, IAM, deploy do site ou a integração de IA. NÃO use para frontend Angular, backend NestJS ou testes de domínio.
---

# Infra AWS (Terraform) — Project Conscious

Terraform em `infra/`: publica o **build estático do Angular** (S3 privado + CloudFront com OAC + SPA fallback) e o **chat de IA** (API Gateway HTTP v2 → Lambda Python 3.13 → Bedrock Mantle, SigV4 manual). **Deploy manual — CI não faz deploy.**

## Fluxo de trabalho

1. Build do frontend antes de qualquer apply de publicação: `npm run build` (Terraform lê `dist/project-conscious/browser`).
2. State remoto: `terraform init -backend-config=backend.hcl` em `infra/` (bucket de state criado por `infra/bootstrap/`). Nunca aplicar sem lock (`use_lockfile = true`).
3. Ciclo seguro: `terraform plan` → revisar → `terraform apply`. Só um apply por vez (lock nativo S3, sem DynamoDB).
4. Mudança na Lambda: editar `infra/lambda/app.py`, revalidar e aplicar (empacotada por `archive_file`).

## O que existe (mapa)

- `main.tf`: bucket site (privado, versionado, lifecycle 30d, SSE AES256, public block), CloudFront (origem S3 via OAC + origem API para `/api/ai/*` com `ordered_cache_behavior` sem cache e POST habilitado; 403/404 → `/index.html`), API Gateway HTTP v2 (`POST /api/ai/chat`, throttling burst 5/rate 2, access logs 14d), Lambda (256MB, 45s).
- `lambda/app.py`: chat "Conscious AI" — Bedrock Mantle (endpoint OpenAI-compat, modelo fixo), SigV4 manual sem SDK, sanitização de body (tamanho, findings, histórico) e prompt anti-injection.
- `variables.tf`: modelo travado por validation (`google.gemma-4-e2b`) — decisão intencional.
- `backend.hcl.example`: exemplo de config de state (`use_lockfile = true`, encrypt, profile `conscious`).

## Regras obrigatórias

- **Nenhum segredo/código no repo**: `backend.hcl`, `.tfstate*`, plan files e `.terraform/` são ignorados. Credenciais via AWS profile/env do operador.
- IAM da Lambda com privilégio mínimo: só logs + `bedrock-mantle:CreateInference` no modelo configurado — não ampliar sem justificativa.
- Cache: `index.html` sem cache; demais assets com cache-control longo — preservar esse mapeamento ao mexer nos uploads.
- SPA routing: manter custom_error_response 403/404 → `/index.html` (refresh em rota profunda).
- Mudanças no formato de findings (domínio) impactam o prompt/sanitização da Lambda — validar junto.

## Gotchas

- **Rota de IA é pública** (só throttling): adicionar auth/authorize antes de produção é pendência conhecida — não "corrigir" com restrição silenciosa que quebre o frontend.
- CloudFront sem domínio próprio/ACM: certificado default; mudar isso exige ACM em **us-east-1**.
- Target do proxy de dev (CloudFront `d373x30t8ya2si…`) aparece hardcoded em `proxy.conf.json`, `scripts/start-project.mjs` e no teste do launcher — mudar distribuição exige atualizar os três.
- Terraform não é validado no CI: rode `terraform fmt`/`terraform validate` manualmente em `infra/` ao editar.
- `dist/` raiz é artefato de produção: nunca commitar; sempre regenerar com `npm run build` antes de publicar.
- Modificações de Terraform no repo: ids/ARNs no código devem permanecer sem recursos hardcodeados de outra conta.

## Referências

- `references/deploy-e-state.md` — passo a passo de deploy e operação de state.
- `infra/README.md`, `docs/coleta-clone-temporario.md` (raiz do repo).
