# 🤖 Lain Monitor >> Bot de Promoções Telegram → WhatsApp

Este bot monitora canais e grupos no **Telegram** para detectar promoções e repassá-las automaticamente para um grupo ou contatos específicos no **WhatsApp**. Ele permite que usuários salvem palavras-chave de interesse e recebam somente as promoções relevantes.

---

## 📦 Funcionalidades

### ✅ Integração com Telegram
- Usa a biblioteca `gramjs` para logar como usuário.
- Monitora mensagens de grupos/canais específicos.
- Suporta mensagens com texto e mídia (imagens).
- Baixa e salva imagens temporariamente.

### ✅ Integração com WhatsApp
- Usa a biblioteca `@whiskeysockets/baileys`.
- Conecta via QR Code com autenticação multi-device.
- Envia promoções automaticamente para:
  - Grupo padrão.
  - Contatos interessados, com base em palavras-chave.
- Comando `/add` permite usuários cadastrarem suas palavras de interesse.

### ✅ Gerenciamento de Dados
- Armazena palavras-chave por número de telefone no arquivo `usuarios.json`.
- Salva grupos onde o bot é adicionado no `group.json`.

---

## 📁 Estrutura de Arquivos

```bash
📦 projeto
├── index.js               # Monitoramento do Telegram
├── zap.js                 # Integração com WhatsApp
├── usuarios.json          # Palavras-chave dos usuários
├── group.json             # Grupos onde o bot está
├── utils/
│   ├── salve.group.js     # Função para salvar grupos
│   ├── save.text.js       # Função para salvar palavras dos usuários
├── auth_info_baileys/     # Dados de autenticação do WhatsApp
├── session.json           # Sessão do Telegram
├── .env                   # Variáveis API_ID, API_HASH
└── temp/                  # Imagens temporárias das promoções
```
---

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Criar o arquivo `.env`

Crie um arquivo `.env` com o seguinte conteúdo:

```env
API_ID=your_telegram_api_id
API_HASH=your_telegram_api_hash
GROUP_DEFAULT=conexão com o zap ficar on vai aparecer os NOME + JIDS dos grupos e comunidade pegue apenas o jid exemplo : GROUP_DEFAULT=1203634181348239506@g.us
```

### 3. Rodar o Bot

```bash
node src/index.js
```

Durante o login no Telegram, informe seu número e o código de verificação.

### 4. Conectar o WhatsApp

Ao iniciar o bot (`zap.js`), escaneie o QR Code exibido no terminal para conectar ao WhatsApp.

---

## 💬 Comandos no WhatsApp

### `/add palavra1 palavra2 ...`

Exemplo:

```
/add celular promoção desconto
```

O bot irá salvar essas palavras associadas ao seu número, e só enviará promoções que contenham alguma delas.

---

## 💡 Extras

### 📜 Listar Grupos do WhatsApp

Para listar todos os grupos que o bot participa, você pode usar o seguinte código no seu script:

```js
const gruposParticipando = await sock.groupFetchAllParticipating();
const grupos = Object.values(gruposParticipando);
grupos.forEach(g => console.log(`Nome: ${g.subject} | JID: ${g.id}`));
```

---

## 🛠️ Requisitos

* Node.js **>= 16**
* Conta do **Telegram**
* Conta ativa no **WhatsApp**

---

## 📌 Observações

* As imagens são salvas em `./temp/` e podem ser removidas automaticamente após o envio (usando `fs.unlink`).
* Os dados de autenticação do WhatsApp são armazenados em `auth_info_baileys/`.
* As palavras-chave dos usuários são salvas em `usuarios.json`.

---

## 🤝 Contribuições

Sinta-se à vontade para adaptar, melhorar ou contribuir com novas funcionalidades para o bot!

---
