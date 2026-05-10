module.exports = function(server) {
  if (!server || typeof server.on !== 'function') {
    console.warn('night-vision plugin loaded, but server plugin API is not recognized.');
    return;
  }

  server.on('playerMove', (player, position) => {
    const time = server.getTime ? server.getTime() : 0;
    const isNight = time > 12000 && time < 24000;
    if (isNight) {
      if (!player.hasLightSource) {
        if (server.applyEffect) {
          server.applyEffect(player, 'blindness', 10);
        }
        player.sendMessage('The darkness is overwhelming. Find a light source!');
      } else {
        if (server.removeEffect) {
          server.removeEffect(player, 'blindness');
        }
      }
    }
  });

  server.on('playerPlaceBlock', (player, block) => {
    if (block.type === 'torch' || block.type === 'lantern' || block.type === 'campfire') {
      player.hasLightSource = true;
    }
  });

  server.on('playerBreakBlock', (player, block) => {
    if (block.type === 'torch' || block.type === 'lantern' || block.type === 'campfire') {
      player.hasLightSource = false;
    }
  });
};