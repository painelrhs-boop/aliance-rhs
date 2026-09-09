# ALIANCE R.H.S — versão 2

Projeto maior, responsivo e com uma área administrativa protegida.

## O que já vem pronto
- Site público ALIANCE R.H.S em preto/vermelho.
- Painel ADM com login de dois administradores.
- Sessão assinada no servidor com HMAC-SHA256, cookie HttpOnly/Secure/SameSite e expiração de 24 horas.
- Cadastro de música por link ou seleção de arquivo no painel.
- Busca automática de título e imagem para links públicos do WhatsApp (quando a página permitir leitura dos metadados).
- Histórico local de logins nas últimas 24 horas.
- `schema.sql` preparado para histórico persistente com Cloudflare D1.
- Credenciais NÃO ficam expostas no HTML/JavaScript.

## 1. Instalar
```bash
npm install
npx wrangler login
```

## 2. Configurar os dois administradores
Use os dados de login que você definiu, mas grave-os como Secrets do Cloudflare:
```bash
npx wrangler secret put ADMIN1_EMAIL
npx wrangler secret put ADMIN1_PASSWORD
npx wrangler secret put ADMIN2_EMAIL
npx wrangler secret put ADMIN2_PASSWORD
npx wrangler secret put ADMIN_SESSION_SECRET
```

Para `ADMIN_SESSION_SECRET`, use uma sequência longa e aleatória. Não coloque essa chave no GitHub nem no JavaScript do site.

## 3. Deploy
```bash
npx wrangler deploy
```

Não use o uploader simples do Dashboard para este projeto; ele usa `wrangler.toml` + Workers Assets.

## Música por arquivo
O seletor de arquivo está no painel. Para o arquivo ficar disponível para todos os usuários depois que o navegador for fechado, conecte um bucket Cloudflare R2 e faça o endpoint de upload apontar para esse bucket. A interface já está preparada para receber essa integração sem colocar arquivos grandes no código do Worker.

## Histórico persistente 24h
O painel atual mantém o histórico no navegador. Para histórico real entre celulares/computadores, crie um banco D1 e execute `schema.sql`. Depois adicione o binding `DB` ao `wrangler.toml` e altere o endpoint de login para inserir os registros e o endpoint `/api/admin/history` para consultar `logged_at >= Date.now()-86400000`.

## Segurança
Nunca publique as senhas dentro de `index.html`, `admin.js`, GitHub ou arquivos públicos. Se uma senha for exposta, troque-a imediatamente nos Secrets do Cloudflare.
