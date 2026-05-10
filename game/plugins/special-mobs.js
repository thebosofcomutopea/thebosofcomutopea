module.exports = function(server) {
  if (!server || typeof server.on !== 'function') {
    console.warn('special-mobs plugin loaded, but server plugin API is not recognized.');
    return;
  }

  const specialTypes = ['ninja', 'brutish', 'poisonous'];

  server.on('entitySpawn', (entity) => {
    if (Math.random() < 0.05) {
      const special = specialTypes[Math.floor(Math.random() * specialTypes.length)];
      entity.specialType = special;
      server.broadcast(`A special ${special} ${entity.type} has appeared!`);
    }
  });

  server.on('playerJoin', (player) => {
    player.sendMessage('Special Mobs: Unique variants lurk everywhere!');
  });
};