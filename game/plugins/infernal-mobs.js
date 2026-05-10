module.exports = function(server) {
  if (!server || typeof server.on !== 'function') {
    console.warn('infernal-mobs plugin loaded, but server plugin API is not recognized.');
    return;
  }

  server.on('entitySpawn', (entity) => {
    if (Math.random() < 0.1) { // 10% chance
      entity.isInfernal = true;
      entity.health *= 2;
      entity.damage *= 1.5;
      server.broadcast(`An infernal ${entity.type} has spawned!`);
    }
  });

  server.on('playerJoin', (player) => {
    player.sendMessage('Infernal Mobs: Elite monsters roam the land!');
  });
};