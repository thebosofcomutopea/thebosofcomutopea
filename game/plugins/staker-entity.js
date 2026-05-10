module.exports = function(server) {
  if (!server || typeof server.on !== 'function') {
    console.warn('staker-entity plugin loaded, but server plugin API is not recognized.');
    return;
  }

  const stakerState = {
    active: false,
    target: null,
    lastSeen: null
  };

  const playerBuildState = new Map();

  function getPlayerState(player) {
    if (!playerBuildState.has(player.id)) {
      playerBuildState.set(player.id, {
        lastY: player.position?.y ?? 0,
        highestY: player.position?.y ?? 0,
        lastPosition: player.position || { x: 0, y: 0, z: 0 },
        lastPlacedPos: null,
        consecutivePillarPlacements: 0,
        lastMoveTime: Date.now()
      });
    }
    return playerBuildState.get(player.id);
  }

  function breakNearbyBlocks(position) {
    if (!position) return;
    const radius = 2;

    for (let dx = -radius; dx <= radius; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dz = -radius; dz <= radius; dz += 1) {
          const target = { x: position.x + dx, y: position.y + dy, z: position.z + dz };
          if (server.breakBlockAt) {
            server.breakBlockAt(target);
          } else if (server.setBlock) {
            server.setBlock(target, 'air');
          }
        }
      }
    }
  }

  function teleportStakerToPlayer(player) {
    if (server.teleportEntity) {
      server.teleportEntity('Staker', player.position || player.lastPosition || { x: 0, y: 0, z: 0 });
    }
    if (player.sendMessage) {
      player.sendMessage('The Staker materializes and crashes through the pillar beneath you.');
    }
    server.broadcast(`${player.name || 'A player'} tried to pillar up. The Staker teleports in and breaks the structure!`);
    breakNearbyBlocks(player.position || player.lastPosition);
  }

  function canStakerClimb(player, blockPos, state) {
    if (!player.position) return false;
    const dx = Math.abs(blockPos.x - player.position.x);
    const dz = Math.abs(blockPos.z - player.position.z);
    const dy = blockPos.y - player.position.y;

    if (dy <= 1) return true;
    if (dx > 1 || dz > 1) return true;
    if (state.consecutivePillarPlacements < 2) return true;
    return false;
  }

  function isPillarBuild(player, blockPos, state) {
    if (!player.position) return false;

    const sameColumn = state.lastPlacedPos &&
      state.lastPlacedPos.x === blockPos.x &&
      state.lastPlacedPos.z === blockPos.z;
    const verticalGain = blockPos.y >= state.highestY + 2;
    const narrowBuild = Math.abs(blockPos.x - player.position.x) <= 1 &&
      Math.abs(blockPos.z - player.position.z) <= 1;

    if (verticalGain && narrowBuild) {
      if (sameColumn || state.consecutivePillarPlacements >= 2) {
        return true;
      }
      if (!canStakerClimb(player, blockPos, state)) {
        return true;
      }
    }
    return false;
  }

  function startChase(player) {
    if (stakerState.active && stakerState.target === player.id) return;
    stakerState.active = true;
    stakerState.target = player.id;
    stakerState.lastSeen = Date.now();

    server.broadcast('Something is hunting you... listen for the black hole pulse.');
    if (server.playSound) {
      server.playSound(player, 'staker-hunt-loop', { volume: 0.9, loop: true });
    }
  }

  function stopChase(player) {
    if (!stakerState.active || stakerState.target !== player.id) return;
    stakerState.active = false;
    stakerState.target = null;
    stakerState.lastSeen = null;

    if (server.stopSound) {
      server.stopSound(player, 'staker-hunt-loop');
    }
    server.broadcast('The Staker melts back into the dark.');
  }

  function handlePillarBuild(player, position) {
    if (!position || !player.position) return;
    const state = getPlayerState(player);

    if (!canStakerClimb(player, position, state)) {
      startChase(player);
      teleportStakerToPlayer(player);
      state.consecutivePillarPlacements = 0;
      state.lastPlacedPos = null;
      return;
    }

    if (position.y >= state.highestY + 2) {
      startChase(player);
    }
  }

  server.on('playerMove', (player, position) => {
    const state = getPlayerState(player);
    const currentY = position?.y ?? player.position?.y ?? state.lastY;

    const dx = Math.abs((position?.x ?? state.lastPosition.x) - state.lastPosition.x);
    const dz = Math.abs((position?.z ?? state.lastPosition.z) - state.lastPosition.z);
    const travel = dx + dz;

    if (travel > 0) {
      state.consecutivePillarPlacements = 0;
    }

    const yGain = currentY - state.lastY;
    if (yGain > 2 && travel <= 1) {
      const pillarCandidate = { x: position.x, y: currentY, z: position.z };
      if (isPillarBuild(player, pillarCandidate, state)) {
        startChase(player);
        teleportStakerToPlayer(player);
      }
    }

    state.lastY = currentY;
    if (currentY > state.highestY) {
      state.highestY = currentY;
    }
    state.lastPosition = position || state.lastPosition;
    state.lastMoveTime = Date.now();

    if (stakerState.active && stakerState.target === player.id) {
      const now = Date.now();
      if (now - stakerState.lastSeen > 45000) {
        stopChase(player);
      } else {
        stakerState.lastSeen = now;
      }
    }
  });

  server.on('playerPlaceBlock', (player, block) => {
    const blockPos = block?.position || block;
    if (!blockPos || !player.position) return;
    const state = getPlayerState(player);

    const pillar = isPillarBuild(player, blockPos, state);
    if (pillar) {
      state.consecutivePillarPlacements += 1;
      startChase(player);
      teleportStakerToPlayer(player);
    } else if (blockPos.y > state.highestY + 1) {
      state.consecutivePillarPlacements = 0;
      startChase(player);
    } else {
      state.consecutivePillarPlacements = 0;
    }

    state.lastPlacedPos = blockPos;
  });

  server.on('playerBreakBlock', (player, block) => {
    if (stakerState.active && stakerState.target === player.id) {
      server.broadcast(`${player.name || 'A player'} tries to tear down the mansion. The Staker hits back!`);
      const position = block?.position || player.position || { x: 0, y: 0, z: 0 };
      breakNearbyBlocks(position);
    }
  });

  server.on('playerJoin', (player) => {
    player.sendMessage('You feel watched. This mansion knows your name.');
  });

  server.on('playerDeath', (player) => {
    if (stakerState.target === player.id) {
      stopChase(player);
    }
  });
};
