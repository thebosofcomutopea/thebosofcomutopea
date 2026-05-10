module.exports = function(server) {
  if (!server || typeof server.on !== 'function') {
    console.warn('horror-entities plugin loaded, but server plugin API is not recognized.');
    return;
  }

  const entities = ['ghost', 'demon', 'mimic'];

  server.on('playerJoin', (player) => {
    player.sendMessage('Beware of the entities lurking in the shadows...');
  });

  server.on('playerMove', (player, position) => {
    if (Math.random() < 0.01) { // 1% chance
      const entity = entities[Math.floor(Math.random() * entities.length)];
      if (server.spawnEntity) {
        server.spawnEntity(entity, position);
      }
      player.sendMessage(`A ${entity} appears!`);
    }
  });
};