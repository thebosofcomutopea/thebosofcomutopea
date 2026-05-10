module.exports = function(server) {
  if (!server || typeof server.on !== 'function') {
    console.warn('mine-colonies plugin loaded, but server plugin API is not recognized.');
    return;
  }

  const colonies = new Map();

  server.on('playerJoin', (player) => {
    player.sendMessage('Mine Colonies: Build and manage your colony!');
  });

  server.on('playerPlaceBlock', (player, block) => {
    if (block.type === 'town_hall') {
      colonies.set(player.id, { position: block.position, citizens: 0 });
      player.sendMessage('Colony founded!');
    }
  });
};