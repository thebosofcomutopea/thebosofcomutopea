module.exports = function(server) {
  if (!server || typeof server.on !== 'function') {
    console.warn('admin-commands plugin loaded, but server plugin API is not recognized.');
    return;
  }

  const admins = ['admin_player_id']; // Replace with actual admin IDs

  server.on('playerChat', (player, message) => {
    if (!admins.includes(player.id)) return;
    const parts = message.split(' ');
    const command = parts[0].toLowerCase();

    if (command === '/kick') {
      const targetName = parts[1];
      const target = server.getPlayerByName(targetName);
      if (target) {
        server.kickPlayer(target);
        player.sendMessage(`Kicked ${targetName}.`);
      }
    } else if (command === '/ban') {
      const targetName = parts[1];
      const target = server.getPlayerByName(targetName);
      if (target) {
        server.banPlayer(target);
        player.sendMessage(`Banned ${targetName}.`);
      }
    } else if (command === '/tp') {
      const targetName = parts[1];
      const target = server.getPlayerByName(targetName);
      if (target) {
        server.teleportPlayer(player, target.position);
        player.sendMessage(`Teleported to ${targetName}.`);
      }
    }
  });
};