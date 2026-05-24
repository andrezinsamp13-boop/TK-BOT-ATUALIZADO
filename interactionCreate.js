'use strict';
const { MessageFlags } = require('discord.js');

// ─── HANDLERS ─────────────────────────────────────────────────────────────
let ticketHandler, configHandler, mensagemHandler;
try { ticketHandler  = require('../handlers/ticketHandler');  } catch (e) { console.error('[LOAD] ticketHandler falhou:', e.message);  }
try { configHandler  = require('../handlers/configHandler');  } catch (e) { console.error('[LOAD] configHandler falhou:', e.message);  }
try { mensagemHandler = require('../handlers/mensagemHandler'); } catch (e) { console.error('[LOAD] mensagemHandler falhou:', e.message); }

const { handleTicketButton, handleTicketModal, handleTicketSelect } = ticketHandler  || {};
const { handleConfigButton, handleConfigModal, handleConfigSelect } = configHandler  || {};
const { handleMensagemButton, handleMensagemModal, handleMensagemSelect } = mensagemHandler || {};

// ─── COMMANDS ─────────────────────────────────────────────────────────────
const commands = {};
try { commands.criarticket    = require('../commands/criarticket');    } catch (e) { console.error('[LOAD] criarticket falhou:',    e.message); }
try { commands.configurarticket = require('../commands/configurarticket'); } catch (e) { console.error('[LOAD] configurarticket falhou:', e.message); }
try { commands.mensagem       = require('../commands/mensagem');        } catch (e) { console.error('[LOAD] mensagem falhou:',       e.message); }

// ─── REPLY HELPER ─────────────────────────────────────────────────────────
async function safeReplyError(interaction, msg) {
  try {
    const payload = { content: msg, flags: MessageFlags.Ephemeral };
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply(payload);
    } else if (interaction.deferred) {
      await interaction.editReply({ content: msg });
    }
  } catch { /* ignorar — interação já expirou */ }
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────
module.exports = async (interaction, client) => {
  const id = interaction.customId || '';
  const who = interaction.user?.tag || 'desconhecido';

  try {

    // ── SLASH COMMANDS ──────────────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const name = interaction.commandName;
      console.log(`[CMD] /${name} | usuário: ${who} | guild: ${interaction.guildId}`);

      const cmd = commands[name];
      if (!cmd) {
        console.warn(`[CMD] Comando não encontrado: ${name}`);
        return safeReplyError(interaction, '❌ Comando não reconhecido.');
      }

      await cmd.execute(interaction, client);
      return;
    }

    // ── BUTTONS ─────────────────────────────────────────────────────────
    if (interaction.isButton()) {
      console.log(`[BTN] id="${id}" | usuário: ${who}`);

      if (id.startsWith('tk_ticket_')) {
        if (!handleTicketButton) return safeReplyError(interaction, '❌ Handler de tickets indisponível.');
        return await handleTicketButton(interaction, client);
      }

      if (id.startsWith('tk_config_')) {
        if (!handleConfigButton) return safeReplyError(interaction, '❌ Handler de configuração indisponível.');
        return await handleConfigButton(interaction, client);
      }

      if (id.startsWith('tk_resp_')) {
        if (!handleMensagemButton) return safeReplyError(interaction, '❌ Handler de mensagens indisponível.');
        return await handleMensagemButton(interaction, client);
      }

      console.warn(`[BTN] ID não roteado: ${id}`);
      return;
    }

    // ── MODAIS ──────────────────────────────────────────────────────────
    if (interaction.isModalSubmit()) {
      console.log(`[MODAL] id="${id}" | usuário: ${who}`);

      if (id.startsWith('tk_modal_adduser_') || id.startsWith('tk_modal_remuser_')) {
        if (!handleTicketModal) return safeReplyError(interaction, '❌ Handler de tickets indisponível.');
        return await handleTicketModal(interaction, client);
      }

      if (id.startsWith('tk_modal_cfg_')) {
        if (!handleConfigModal) return safeReplyError(interaction, '❌ Handler de configuração indisponível.');
        return await handleConfigModal(interaction, client);
      }

      if (id.startsWith('tk_modal_resp_')) {
        if (!handleMensagemModal) return safeReplyError(interaction, '❌ Handler de mensagens indisponível.');
        return await handleMensagemModal(interaction, client);
      }

      console.warn(`[MODAL] ID não roteado: ${id}`);
      return;
    }

    // ── SELECT MENUS ────────────────────────────────────────────────────
    if (interaction.isStringSelectMenu() || interaction.isRoleSelectMenu() || interaction.isChannelSelectMenu()) {
      console.log(`[SELECT] id="${id}" | usuário: ${who}`);

      if (id.startsWith('tk_sel_prioridade_')) {
        if (!handleTicketSelect) return safeReplyError(interaction, '❌ Handler de tickets indisponível.');
        return await handleTicketSelect(interaction, client);
      }

      if (id.startsWith('tk_sel_config_') || id.startsWith('tk_sel_btn_')) {
        if (!handleConfigSelect) return safeReplyError(interaction, '❌ Handler de configuração indisponível.');
        return await handleConfigSelect(interaction, client);
      }

      if (id.startsWith('tk_sel_resp_')) {
        if (!handleMensagemSelect) return safeReplyError(interaction, '❌ Handler de mensagens indisponível.');
        return await handleMensagemSelect(interaction, client);
      }

      console.warn(`[SELECT] ID não roteado: ${id}`);
      return;
    }

  } catch (err) {
    console.error(`[INTERACTION ERROR] type=${interaction.type} id="${id}" user="${who}"`);
    console.error(`  Mensagem: ${err.message}`);
    console.error(`  Stack: ${err.stack}`);
    await safeReplyError(interaction, '❌ Ocorreu um erro interno. Tente novamente.');
  }
};
