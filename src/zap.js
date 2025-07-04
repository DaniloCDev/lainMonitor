const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const pino = require('pino');
const saveGroupInfo = require('./utils/salve.group');
const salvarPalavras = require('./utils/save.text');
const removerPalavras = require('./utils/remove.txt');

const SESSION_DIR = './auth_info_baileys';
if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });

let sock;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

  sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      const qrcode = require('qrcode-terminal');
      qrcode.generate(qr, { small: true });
      console.log('📲 Escaneie o QR Code acima para conectar ao WhatsApp.');
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Conexão encerrada, reconectando?', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ WhatsApp conectado!');
      const gruposParticipando = await sock.groupFetchAllParticipating();
      const grupos = Object.values(gruposParticipando);

      for (const grupo of grupos) {
        const nome = grupo.subject;
        const jid = grupo.id;
        console.log(`📛 Nome: ${nome} | 🆔 JID: ${jid}`);
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update;

    if (action === 'add' && participants.includes(sock.user.id)) {
      // bot foi adicionado ao grupo
      const metadata = await sock.groupMetadata(id);
      const groupInfo = {
        jid: id,
        name: metadata.subject,
        addedAt: new Date().toISOString(),
        addedBy: 'desconhecido',
      };

      // Salva no group.json
      saveGroupInfo(groupInfo);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {

     // console.log(messages)

    for (const msg of messages) {
     // console.log(messages, msg)

      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
      if (!text) continue;

      const sender = msg.key.remoteJid.replace(/[^0-9]/g, '');
      //console.log(text, sender)
      if (text.startsWith('/add')) {
        const palavras = text.replace('/add', '').trim().split(/\s+/);
        if (palavras.length === 0) continue;

        salvarPalavras(sender, palavras);
        await sock.sendMessage(msg.key.remoteJid, {
          text: `✅ Palavras salvas: ${palavras.join(', ')}`
        });
        continue;
      }

      if (text.startsWith('/remove')) {
        const palavras = text.replace('/remove', '').trim().split(/\s+/);
        if (palavras.length === 0) {
          await sock.sendMessage(msg.key.remoteJid, {
            text: `❌ Nenhuma palavra informada para remover. Use: /remove palavra1 palavra2 ...`
          });
          continue;
        }

        const removidas = removerPalavras(sender, palavras);
        if (removidas.length > 0) {
          await sock.sendMessage(msg.key.remoteJid, {
            text: `🗑️ Palavras removidas: ${removidas.join(', ')}`
          });
        } else {
          await sock.sendMessage(msg.key.remoteJid, {
            text: `⚠️ Nenhuma das palavras informadas estava cadastrada para este usuário.`
          });
        }
        continue;
      }

      if (text.startsWith('/reset')) {
        removerPalavras(text);
        await sock.sendMessage(msg.key.remoteJid, {
          text: `🔄 Todas as palavras deste usuário foram removidas.`
        });
        continue;
      }

      const linkRegex = /chat\.whatsapp\.com\/(\w+)/;
      const match = text.match(linkRegex);
      if (match) {
        const inviteCode = match[1];
        try {
          const groupJid = await sock.groupAcceptInvite(inviteCode);
          const metadata = await sock.groupMetadata(groupJid);
          const info = {
            jid: groupJid,
            name: metadata.subject,
            addedAt: new Date().toISOString(),
            addedBy: msg.key.participant || msg.key.remoteJid,
          };
          saveGroupInfo(info);
        } catch (err) {
          console.error('Erro ao entrar no grupo:', err.message);
        }
      }
    }
  });
}


async function enviarParaWhatsApp(jid, texto, caminhoImagem = null) {
  try {
    if (caminhoImagem && fs.existsSync(caminhoImagem)) {
      const imagemBuffer = fs.readFileSync(caminhoImagem);
      await sock.sendMessage(jid, {
        image: imagemBuffer,
        caption: texto,
      });
      console.log(`🖼️ Promoção com imagem enviada para ${jid}`);
    } else {
      await sock.sendMessage(jid, { text: texto });
      console.log(`📩 Promoção enviada para ${jid}`);
    }
  } catch (err) {
    console.error(`❌ Erro ao enviar para ${jid}:`, err.message);
  }
}

startBot();

module.exports = { enviarParaWhatsApp };
