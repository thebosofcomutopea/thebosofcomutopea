module.exports = function(server) {
  if (!server || typeof server.on !== 'function') {
    console.warn('biomes-o-plenty plugin loaded, but server plugin API is not recognized.');
    return;
  }

  const biomes = ['plains', 'forest', 'desert', 'tundra', 'swamp', 'jungle', 'mountain', 'ocean'];

  server.on('playerJoin', (player) => {
    player.sendMessage('Biomes o Plenty: Explore diverse biomes!');
  });

  server.on('playerMove', (player, position) => {
    const biome = biomes[Math.floor(Math.random() * biomes.length)];
    if (server.setBiome) {
      server.setBiome(position, biome);
    }
  });
};