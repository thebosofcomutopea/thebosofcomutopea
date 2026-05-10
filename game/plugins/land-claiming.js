module.exports = function(server) {
  if (!server || typeof server.on !== 'function') {
    console.warn('land-claiming plugin loaded, but server plugin API is not recognized.');
    return;
  }

  const claims = new Map();
  const friendships = new Map();
  const publicAreas = new Set(['spawn', 'public_grief_zone']);

  function getBiomeAt(position) {
    if (!position) return 'unknown';
    if (server.getBiome) {
      return server.getBiome(position);
    }
    return 'plains';
  }

  function isNaturalStructure(position) {
    if (!position) return false;
    if (server.isNaturalStructure) {
      return server.isNaturalStructure(position);
    }
    return false;
  }

  function canClaim(player, position) {
    if (!position) return false;
    if (position.y < 0) return false;
    if (isNaturalStructure(position)) return false;

    const biome = getBiomeAt(position);
    const playerClaims = claims.get(player.id) || [];
    if (playerClaims.some(claim => claim.biome === biome)) {
      return false;
    }
    return true;
  }

  function isInClaim(position, ownerId) {
    if (!position) return false;
    const playerClaims = claims.get(ownerId) || [];
    return playerClaims.some(claim =>
      position.x >= claim.min.x && position.x <= claim.max.x &&
      position.y >= claim.min.y && position.y <= claim.max.y &&
      position.z >= claim.min.z && position.z <= claim.max.z
    );
  }

  function getClaimAt(position) {
    for (const [ownerId, playerClaims] of claims) {
      const claim = playerClaims.find(claim =>
        position.x >= claim.min.x && position.x <= claim.max.x &&
        position.y >= claim.min.y && position.y <= claim.max.y &&
        position.z >= claim.min.z && position.z <= claim.max.z
      );
      if (claim) return { ownerId, claim };
    }
    return null;
  }

  function isProtected(position) {
    return !!getClaimAt(position) || publicAreas.has(getBiomeAt(position));
  }

  function isFriend(ownerId, playerId) {
    const friends = friendships.get(ownerId) || [];
    return friends.includes(playerId);
  }

  function isBanned(claim, playerId) {
    return claim.banned.includes(playerId);
  }

  function isCoOwner(claim, playerId) {
    return claim.coOwners.includes(playerId);
  }

  function canAccess(claim, playerId) {
    if (claim.owner === playerId || isCoOwner(claim, playerId)) return true;
    if (isBanned(claim, playerId)) return false;
    if (claim.type === 'private') return false;
    if (claim.type === 'limited') return isFriend(claim.owner, playerId);
    if (claim.type === 'public') return true;
    return false;
  }

  function addFriend(player, friendName) {
    const friend = server.getPlayerByName(friendName);
    if (!friend) {
      player.sendMessage(`Player ${friendName} not found.`);
      return;
    }
    const friends = friendships.get(player.id) || [];
    if (friends.includes(friend.id)) {
      player.sendMessage(`${friendName} is already your friend.`);
      return;
    }
    friends.push(friend.id);
    friendships.set(player.id, friends);
    player.sendMessage(`Added ${friendName} as a friend.`);
  }

  function removeFriend(player, friendName) {
    const friend = server.getPlayerByName(friendName);
    if (!friend) {
      player.sendMessage(`Player ${friendName} not found.`);
      return;
    }
    const friends = friendships.get(player.id) || [];
    const index = friends.indexOf(friend.id);
    if (index === -1) {
      player.sendMessage(`${friendName} is not your friend.`);
      return;
    }
    friends.splice(index, 1);
    friendships.set(player.id, friends);
    player.sendMessage(`Removed ${friendName} from friends.`);
  }

  function claimLand(player, position) {
    if (!canClaim(player, position)) {
      player.sendMessage('You cannot claim this land.');
      return;
    }
    const biome = getBiomeAt(position);
    const claim = {
      biome,
      owner: player.id,
      coOwners: [],
      banned: [],
      type: 'private',
      min: { x: position.x - 10, y: position.y, z: position.z - 10 },
      max: { x: position.x + 10, y: position.y + 10, z: position.z + 10 }
    };
    const playerClaims = claims.get(player.id) || [];
    playerClaims.push(claim);
    claims.set(player.id, playerClaims);
    player.sendMessage(`Claimed land in ${biome} biome as private.`);
  }

  function unclaimLand(player, position) {
    const playerClaims = claims.get(player.id) || [];
    const index = playerClaims.findIndex(claim =>
      position.x >= claim.min.x && position.x <= claim.max.x &&
      position.y >= claim.min.y && position.y <= claim.max.y &&
      position.z >= claim.min.z && position.z <= claim.max.z
    );
    if (index === -1) {
      player.sendMessage('You do not own this land.');
      return;
    }
    playerClaims.splice(index, 1);
    claims.set(player.id, playerClaims);
    player.sendMessage('Unclaimed land.');
  }

  function transferOwnership(player, newOwnerName, position) {
    const newOwner = server.getPlayerByName(newOwnerName);
    if (!newOwner) {
      player.sendMessage(`Player ${newOwnerName} not found.`);
      return;
    }
    const playerClaims = claims.get(player.id) || [];
    const claim = playerClaims.find(claim =>
      position.x >= claim.min.x && position.x <= claim.max.x &&
      position.y >= claim.min.y && position.y <= claim.max.y &&
      position.z >= claim.min.z && position.z <= claim.max.z
    );
    if (!claim) {
      player.sendMessage('You do not own this land.');
      return;
    }
    claim.owner = newOwner.id;
    claim.coOwners = [];
    claim.banned = [];
    const newOwnerClaims = claims.get(newOwner.id) || [];
    newOwnerClaims.push(claim);
    claims.set(newOwner.id, newOwnerClaims);
    claims.set(player.id, playerClaims.filter(c => c !== claim));
    player.sendMessage(`Transferred ownership to ${newOwnerName}.`);
  }

  function grantCoOwnership(player, coOwnerName, position) {
    const coOwner = server.getPlayerByName(coOwnerName);
    if (!coOwner) {
      player.sendMessage(`Player ${coOwnerName} not found.`);
      return;
    }
    const playerClaims = claims.get(player.id) || [];
    const claim = playerClaims.find(claim =>
      position.x >= claim.min.x && position.x <= claim.max.x &&
      position.y >= claim.min.y && position.y <= claim.max.y &&
      position.z >= claim.min.z && position.z <= claim.max.z
    );
    if (!claim) {
      player.sendMessage('You do not own this land.');
      return;
    }
    if (!claim.coOwners.includes(coOwner.id)) {
      claim.coOwners.push(coOwner.id);
      player.sendMessage(`Granted co-ownership to ${coOwnerName}.`);
    } else {
      player.sendMessage(`${coOwnerName} is already a co-owner.`);
    }
  }

  function banPlayer(player, bannedName, position) {
    const banned = server.getPlayerByName(bannedName);
    if (!banned) {
      player.sendMessage(`Player ${bannedName} not found.`);
      return;
    }
    const playerClaims = claims.get(player.id) || [];
    const claim = playerClaims.find(claim =>
      position.x >= claim.min.x && position.x <= claim.max.x &&
      position.y >= claim.min.y && position.y <= claim.max.y &&
      position.z >= claim.min.z && position.z <= claim.max.z
    );
    if (!claim) {
      player.sendMessage('You do not own this land.');
      return;
    }
    if (!claim.banned.includes(banned.id)) {
      claim.banned.push(banned.id);
      player.sendMessage(`Banned ${bannedName} from this land.`);
    } else {
      player.sendMessage(`${bannedName} is already banned.`);
    }
  }

  function editClaim(player, type, position) {
    const playerClaims = claims.get(player.id) || [];
    const claim = playerClaims.find(claim =>
      position.x >= claim.min.x && position.x <= claim.max.x &&
      position.y >= claim.min.y && position.y <= claim.max.y &&
      position.z >= claim.min.z && position.z <= claim.max.z
    );
    if (!claim) {
      player.sendMessage('You do not own this land.');
      return;
    }
    if (['private', 'limited', 'public'].includes(type)) {
      claim.type = type;
      player.sendMessage(`Changed land to ${type}.`);
    } else {
      player.sendMessage('Invalid type. Use private, limited, or public.');
    }
  }

  server.on('playerChat', (player, message) => {
    const parts = message.split(' ');
    const command = parts[0].toLowerCase();

    if (command === '/help') {
      player.sendMessage('Available commands:');
      player.sendMessage('/claim - Claim land in a new biome');
      player.sendMessage('/unclaim - Unclaim your land');
      player.sendMessage('/friend add <name> - Add a friend');
      player.sendMessage('/friend remove <name> - Remove a friend');
      player.sendMessage('/transfer <name> - Transfer ownership of your land');
      player.sendMessage('/coowner <name> - Grant co-ownership');
      player.sendMessage('/ban <name> - Ban a player from your land');
      player.sendMessage('/edit <private|limited|public> - Change land permissions');
    } else if (command === '/friend') {
      const subcommand = parts[1];
      const friendName = parts[2];
      if (subcommand === 'add' && friendName) {
        addFriend(player, friendName);
      } else if (subcommand === 'remove' && friendName) {
        removeFriend(player, friendName);
      } else {
        player.sendMessage('Usage: /friend add <name> or /friend remove <name>');
      }
    } else if (command === '/claim') {
      claimLand(player, player.position);
    } else if (command === '/unclaim') {
      unclaimLand(player, player.position);
    } else if (command === '/transfer') {
      const newOwnerName = parts[1];
      if (newOwnerName) {
        transferOwnership(player, newOwnerName, player.position);
      } else {
        player.sendMessage('Usage: /transfer <newOwnerName>');
      }
    } else if (command === '/coowner') {
      const coOwnerName = parts[1];
      if (coOwnerName) {
        grantCoOwnership(player, coOwnerName, player.position);
      } else {
        player.sendMessage('Usage: /coowner <coOwnerName>');
      }
    } else if (command === '/ban') {
      const bannedName = parts[1];
      if (bannedName) {
        banPlayer(player, bannedName, player.position);
      } else {
        player.sendMessage('Usage: /ban <bannedName>');
      }
    } else if (command === '/edit') {
      const type = parts[1];
      if (type) {
        editClaim(player, type, player.position);
      } else {
        player.sendMessage('Usage: /edit <private|limited|public>');
      }
    }
  });

  server.on('playerPlaceBlock', (player, block) => {
    const position = block?.position || block;
    const claimInfo = getClaimAt(position);
    if (claimInfo) {
      if (!canAccess(claimInfo.claim, player.id)) {
        server.cancelEvent();
        player.sendMessage('You cannot build here.');
      }
    } else if (publicAreas.has(getBiomeAt(position))) {
      // Public areas are un-griefable, so cancel if not allowed
      server.cancelEvent();
      player.sendMessage('This public area is protected.');
    }
  });

  server.on('playerBreakBlock', (player, block) => {
    const position = block?.position || block;
    const claimInfo = getClaimAt(position);
    if (claimInfo) {
      if (!canAccess(claimInfo.claim, player.id)) {
        server.cancelEvent();
        player.sendMessage('You cannot break blocks here.');
      }
    } else if (publicAreas.has(getBiomeAt(position))) {
      server.cancelEvent();
      player.sendMessage('This public area is protected.');
    }
  });

  server.on('playerJoin', (player) => {
    player.sendMessage('Welcome! Use /claim to claim land, /friend add <name> to add friends, /edit <type> to change permissions.');
  });
};