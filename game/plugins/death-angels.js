module.exports = function(server) {
  if (!server || typeof server.on !== 'function') {
    console.warn('death-angels plugin loaded, but server plugin API is not recognized.');
    return;
  }

  const angels = new Map();

  server.on('playerJoin', (player) => {
    player.sendMessage('Death Angels: Don\'t blink. Don\'t even blink. Blink and you\'re dead.');
  });

  server.on('playerMove', (player, position) => {
    if (Math.random() < 0.002) {
      const angel = {
        id: Math.random(),
        position: { x: position.x + Math.random() * 10 - 5, y: position.y, z: position.z + Math.random() * 10 - 5 },
        isLooking: false
      };
      angels.set(angel.id, angel);

      if (server.spawnEntity) {
        server.spawnEntity('death_angel', angel.position);
      }
      player.sendMessage('You feel watched... something ancient is near.');
    }
  });

  server.on('playerLook', (player, direction) => {
    for (const [id, angel] of angels) {
      const dist = Math.hypot(
        player.position.x - angel.position.x,
        player.position.z - angel.position.z
      );
      if (dist < 20) {
        angel.isLooking = true;
        player.sendMessage('You see it! The angel freezes in your gaze!');
      } else if (angel.isLooking) {
        angel.isLooking = false;
        if (server.damagePlayer) {
          server.damagePlayer(player, 5);
        }
        player.sendMessage('The moment you look away... AGONY!');
      }
    }
  });

  server.on('playerDeath', (player) => {
    player.sendMessage('The Death Angels have claimed you...');
  });
};