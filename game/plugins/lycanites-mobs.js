module.exports = function(server) {
  if (!server || typeof server.on !== 'function') {
    console.warn('lycanites-mobs plugin loaded, but server plugin API is not recognized.');
    return;
  }

  const mobs = ['wendigo', 'behemoth', 'trite'];

  server.on('playerJoin', (player) => {
    player.sendMessage('Lycanites Mobs: Beware the wild creatures!');
  });

  server.on('playerMove', (player, position) => {
    if (Math.random() < 0.005) {
      const mob = mobs[Math.floor(Math.random() * mobs.length)];
      if (server.spawnEntity) {
        server.spawnEntity(mob, position);
      }
      player.sendMessage(`A ${mob} appears from the shadows!`);
    }
  });
};