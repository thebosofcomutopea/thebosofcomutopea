module.exports = function(server) {
  if (!server || typeof server.on !== 'function') {
    console.warn('gun-mod plugin loaded, but server plugin API is not recognized.');
    return;
  }

  server.on('playerJoin', (player) => {
    if (server.giveItem) {
      server.giveItem(player, 'gun');
      server.giveItem(player, 'ammo');
    }
    player.sendMessage('Gun mod enabled: Use guns to fight enemies!');
  });

  server.on('playerShoot', (player, target) => {
    if (server.damageEntity) {
      server.damageEntity(target, 10);
    }
  });
};