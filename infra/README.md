# Infraestrutura AWS do Project Conscious

Esta pasta publica o build Angular e a API de IA do projeto correto.

## Arquitetura

- CloudFront distribui a aplicação e encaminha `/api/ai/*` para a API.
- S3 privado armazena `dist/project-conscious/browser` com OAC, criptografia e versionamento.
- API Gateway chama uma Lambda Python com throttling e logs.
- A Lambda usa IAM/SigV4 para chamar `google.gemma-4-e2b` no Bedrock Mantle.
- O state fica em S3 com versionamento e lockfile nativo.

Nenhuma credencial ou chave de modelo é armazenada no código.

## Deploy

```bash
npm ci
npm run build
cd infra
terraform init -backend-config=backend.hcl
terraform plan -out=tfplan
terraform apply tfplan
```

O build é uma etapa separada do Terraform para manter a infraestrutura declarativa e reproduzível.

## Backend remoto

O bucket de state foi criado pelo módulo `bootstrap`. Para recriá-lo em outra conta, execute primeiro:

```bash
cd infra/bootstrap
terraform init
terraform apply
```

Não execute dois `apply` simultâneos. O backend usa `use_lockfile = true`.

## Segurança e limites

- O bucket do site bloqueia acesso público e só aceita leitura pelo CloudFront.
- A role da Lambda permite apenas logs e inferência no modelo configurado.
- Perguntas, histórico e findings são truncados e validados antes da inferência.
- A rota de IA é pública para esta demonstração e tem throttling. Antes de produção, adicione autenticação/autorização.
- Para impor TLS 1.2 com política controlada, configure domínio próprio e certificado ACM em vez do certificado padrão do CloudFront.
