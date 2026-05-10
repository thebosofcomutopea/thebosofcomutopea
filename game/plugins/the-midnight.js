module.exports = function(server) {
  if (!server || typeof server.on !== 'function') {
    console.warn('the-midnight plugin loaded, but server plugin API is not recognized.');
    return;
  }

  server.on('playerJoin', (player) => {
    player.sendMessage('Welcome to The Midnight. The Rift is watching...');
    if (server.spawnEntity) {
      server.spawnEntity('rift', { x: 100, y: 1, z: 100 });
    }
  });

  server.on('playerMove', (player, position) => {
    if (position.y < 0) {
      player.sendMessage('You feel the pull of The Midnight...');
      if (server.teleportPlayer) {
        server.teleportPlayer(player, { x: 0, y: 1, z: 0 });
      }
    }
  });
};