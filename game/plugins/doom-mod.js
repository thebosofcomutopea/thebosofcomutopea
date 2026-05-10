module.exports = function(server) {
  if (!server || typeof server.on !== 'function') {
    console.warn('doom-mod plugin loaded, but server plugin API is not recognized.');
    return;
  }

  server.on('playerJoin', (player) => {
    player.sendMessage('Doom Mod: Demons from Hell invade!');
    if (server.giveItem) {
      server.giveItem(player, 'shotgun');
      server.giveItem(player, 'chainsaw');
    }
  });

  server.on('playerKillEntity', (player, entity) => {
    if (entity.type === 'demon') {
      player.sendMessage('You defeated a demon! Glory to the Slayer!');
    }
  });
};