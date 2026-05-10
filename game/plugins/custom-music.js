module.exports = function(server) {
  if (!server || typeof server.on !== 'function') {
    console.warn('custom-music plugin loaded, but server plugin API is not recognized.');
    return;
  }

  const musicTrack = 'https://youtu.be/yqlM_ZEd-ps'; // Weeping Angels theme

  server.on('playerJoin', (player) => {
    if (server.playMusic) {
      server.playMusic(player, musicTrack);
    }
  });

  server.on('playerDeath', (player) => {
    player.sendMessage(`Credits: https://youtu.be/yqlM_ZEd-ps`);
    if (server.playMusic) {
      server.playMusic(player, musicTrack, { loop: false });
    }
  });

  server.on('serverStop', () => {
    if (server.broadcast) {
      server.broadcast('Server shutting down. Playing credits...');
      server.broadcast('Theme: https://youtu.be/yqlM_ZEd-ps');
    }
  });
};