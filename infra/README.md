# Infra

> **Esta pasta não provisiona mais infraestrutura na AWS.** Em 13/10/2026
> todos os recursos foram destruídos (S3 do site, CloudFront, API Gateway,
> Lambda, IAM e CloudWatch Logs, além do bucket de state do Terraform) e o
> código Terraform removido do repositório.

## Bedrock Mantle (modelo de IA)

O chat "Conscious AI" continua usando o **Amazon Bedrock Mantle**
(`google.gemma-4-e2b`), mas agora é executado **100% localmente**, sem nenhum
recurso provisionado:

- A chamada ao modelo é feita pelo **backend NestJS** (
  `backend/src/ai/`) em `POST /ai/chat`, consumida pelo frontend via proxy
  `/api/ai/**` em desenvolvimento.
- A chamada ao Bedrock usa SigV4 manual com credenciais **do operador local**
  (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN`,
  renovadas por `aws login`). Nunca há credenciais no repositório.
- Endpoint do modelo: `bedrock-mantle.<região>.api.aws/openai/v1/chat/completions`.
- Região/modelo configurados por env do backend (`CONSCIOUS_AI_MODEL`,
  `AWS_REGION`); o default do projeto é `us-east-1` / `google.gemma-4-e2b`.

## Custos

Sem infra fixa: não há cobrança por recurso ocioso. Bedrock cobra apenas por
token consumido no chat.

## Se for preciso voltar a provisionar

Isso não é uma pendência planejada; qualquer ressurreição de infra exige
decisão de arquitetura documentada (contrato em `docs/api-contract.md`).
