module.exports = function(server) {
  if (!server || typeof server.on !== 'function') {
    console.warn('create-mod plugin loaded, but server plugin API is not recognized.');
    return;
  }

  server.on('playerJoin', (player) => {
    if (server.giveItem) {
      server.giveItem(player, 'cogwheel');
      server.giveItem(player, 'shaft');
      server.giveItem(player, 'hand_crank');
    }
    player.sendMessage('Create mod enabled: Build factories, machines, and automation!');
  });

  server.on('playerPlaceBlock', (player, block) => {
    if (block.type === 'cogwheel' || block.type === 'shaft') {
      player.sendMessage('Mechanical component placed. Connect more to build machines!');
    }
  });

  server.on('playerCraft', (player, item) => {
    if (item.type.startsWith('create_')) {
      player.sendMessage('Crafted a Create mod item. Use it to build your factory!');
    }
  });
};