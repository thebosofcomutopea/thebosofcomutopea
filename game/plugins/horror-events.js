module.exports = function(server) {
  if (!server || typeof server.on !== 'function') {
    console.warn('horror-events plugin loaded, but server plugin API is not recognized.');
    return;
  }

  const ambientSounds = [
    'jupiter-aurora',
    'stern-radio-waves',
    'black-hole-ambience'
  ];

  const jumpScareMessages = [
    'A whisper echoes through the hallway...',
    'Something just moved behind you.',
    'The lights flicker and then go out.'
  ];

  server.on('playerJoin', (player) => {
    player.sendMessage('The air is cold. The house is watching you.');
    player.sendMessage('Listen for distant auroras, radio crackle and the black hole pulse.');

    if (server.playSound) {
      ambientSounds.forEach((soundId) => {
        server.playSound(player, soundId, { volume: 0.5, loop: true });
      });
    }
  });

  let scareCount = 0;

  function triggerJumpScare() {
    if (!server.broadcast) return;
    const message = jumpScareMessages[scareCount % jumpScareMessages.length];
    scareCount += 1;
    server.broadcast(message);

    if (server.playSound) {
      server.broadcastSound('black-hole-ambience', { volume: 0.7 });
    }
  }

  setInterval(triggerJumpScare, 90000);
};
