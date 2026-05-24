module.exports = {
  name: 'messageCreate',

  async execute(message, client) {
    try {
      if (message.author.bot) return;

      const prefix = '!'; // muda se quiser
      if (!message.content.startsWith(prefix)) return;

      const args = message.content.slice(prefix.length).trim().split(/ +/g);
      const commandName = args.shift().toLowerCase();

      const command = client.commands?.get(commandName);
      if (!command) return;

      await command.execute(message, args, client);

    } catch (err) {
      console.error('[MESSAGE ERROR]', err);
    }
  }
};
