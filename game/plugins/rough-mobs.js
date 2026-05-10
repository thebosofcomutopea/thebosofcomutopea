module.exports = function(server) {
  if (!server || typeof server.on !== 'function') {
    console.warn('rough-mobs plugin loaded, but server plugin API is not recognized.');
    return;
  }

  server.on('entitySpawn', (entity) => {
    if (entity.type === 'zombie' || entity.type === 'skeleton') {
      entity.isRough = true;
      entity.speed *= 1.2;
      entity.dropRate *= 2;
    }
  });

  server.on('playerJoin', (player) => {
    player.sendMessage('Rough Mobs: Even common mobs are tougher now!');
  });
};