module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {
    try {

      // ─── BOTÕES / SLASH / MENUS ─────────────────────
      if (interaction.isChatInputCommand()) {
        const command = client.commands?.get(interaction.commandName);
        if (!command) return;

        await command.execute(interaction, client);
      }

      if (interaction.isButton()) {
        const handler = client.buttons?.get(interaction.customId);
        if (handler) {
          await handler.execute(interaction, client);
        }
      }

      if (interaction.isStringSelectMenu() || interaction.isChannelSelectMenu() || interaction.isRoleSelectMenu()) {
        const handler = client.menus?.get(interaction.customId);
        if (handler) {
          await handler.execute(interaction, client);
        }
      }

    } catch (err) {
      console.error('[INTERACTION ERROR]', err);
      if (interaction.reply) {
        interaction.reply({
          content: '❌ Ocorreu um erro ao executar essa interação.',
          ephemeral: true,
        }).catch(() => {});
      }
    }
  }
};
