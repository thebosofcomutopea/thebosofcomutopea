module.exports = function(server) {
  if (!server || typeof server.on !== 'function') {
    console.warn('sanity-system plugin loaded, but server plugin API is not recognized.');
    return;
  }

  const sanityLevels = new Map();

  function getSanity(player) {
    return sanityLevels.get(player.id) || 100;
  }

  function setSanity(player, level) {
    sanityLevels.set(player.id, Math.max(0, Math.min(100, level)));
    if (level <= 20) {
      player.sendMessage('Your sanity is low. Hallucinations begin...');
      if (server.applyEffect) {
        server.applyEffect(player, 'hallucination', 30);
      }
    }
  }

  server.on('playerJoin', (player) => {
    setSanity(player, 100);
  });

  server.on('playerMove', (player, position) => {
    const time = server.getTime ? server.getTime() : 0;
    const isNight = time > 12000 && time < 24000; // Assuming Minecraft-like time
    if (isNight && !player.hasLightSource) {
      setSanity(player, getSanity(player) - 0.1);
    }
    if (getSanity(player) <= 0) {
      player.sendMessage('You have gone insane!');
      if (server.killPlayer) {
        server.killPlayer(player);
      }
    }
  });

  server.on('playerPlaceBlock', (player, block) => {
    if (block.type === 'torch' || block.type === 'lantern') {
      player.hasLightSource = true;
      setSanity(player, getSanity(player) + 5);
    }
  });
};