# Eglercraft Horror Server

This folder contains a minimal scaffold for an Eglercraft horror server with a haunted house map, dark corridors, fog, monsters, timed jump scares, and a Staker chase entity. Includes land claiming, friendship system, and protection against griefing.

## What is included

- `config.json` — local horror settings, spawn info, and audio references
- `eglercraft-server-config.json` — Eglercraft-compatible server config with plugin and soundscape references, TNT disabled, and haunted house protection
- `setup.sh` — clones the Eglercraft server repository and installs dependencies
- `scripts/run-server.js` — launcher that starts the local Eglercraft server repo and injects config paths
- `horror-map/` — concrete haunted house map, spawn zone, and sound metadata; house is unbreakable and encloses spawn like an escape room
- `plugins/horror-events.js` — timed jumpscare events and ambient audio playback
- `plugins/land-claiming.js` — land claiming system limited to one biome per player (excluding underground and natural structures), friendship commands, grief protection, ban lists, ownership transfer, co-ownership, claim types (private, limited, public), and /help command
- `plugins/gun-mod.js` — Gun mod for combat with guns and ammo
- `plugins/create-mod.js` — Create mod for building factories, machines, and automation
- `plugins/biomes-o-plenty.js` — Biomes o Plenty for diverse biomes
- `plugins/sanity-system.js` — Sanity system that decreases at night without light, leading to hallucinations and death
- `plugins/horror-entities.js` — Additional horror entities like ghosts, demons, and mimics
- `plugins/admin-commands.js` — Admin commands for kicking, banning, and teleporting
- `plugins/night-vision.js` — Makes it nearly impossible to see at night without a light source
- `plugins/the-midnight.js` — The Midnight mod with rifts and dimensional horror
- `plugins/lycanites-mobs.js` — Lycanites Mobs for wild, dangerous creatures
- `plugins/infernal-mobs.js` — Infernal Mobs for elite, enhanced monsters
- `plugins/rough-mobs.js` — Rough Mobs 2 for tougher common mobs
- `plugins/special-mobs.js` — Special Mobs for unique mob variants
- `plugins/doom-mod.js` — Doom mod with demons and weapons
- `plugins/death-angels.js` — Death Angels that kill if you blink (look away)
- `plugins/custom-music.js` — Custom music and credits with Weeping Angels theme
- `web-client.html` — Basic web client for running the game in a browser, integrated with night vision mechanics

## Setup

1. Open a terminal in the `game/` directory.
2. Run:

```bash
npm run setup
```

3. Start the server:

```bash
npm run start
```

## Integration details

- The wrapper sets `HORROR_CONFIG` and `EGCRAFT_CONFIG` environment values for the Eglercraft server.
- `eglercraft-server-config.json` contains world, plugin and soundscape references.
- `horror-map/map.json` is a concrete room-based horror layout with spawn and entity triggers; haunted house is unbreakable and encloses spawn.
- TNT is disabled server-wide.
- Land claiming: `/claim` to claim land in a new biome, `/unclaim` to unclaim. Limited to one biome per player, no underground or natural structures.
- Friendship: `/friend add <name>` to add friends, `/friend remove <name>` to remove. Friends can build/break in your claimed land.
- Ownership: `/transfer <name>` to transfer ownership, `/coowner <name>` to grant co-ownership.
- Bans: `/ban <name>` to ban a player from your land.
- Permissions: `/edit <private|limited|public>` to change claim type. Private: only owner/co-owners; Limited: friends; Public: anyone.
- Mods: `/gunmode` to toggle gun mode, `/creativemode` to toggle create mod, `/biomes` to explore Biomes o Plenty, `/colonies` to manage Mine Colonies.
- Help: `/help` to see all commands.
- Protection: Public lands are un-griefable. Claimed land is protected from non-friends. Cannot claim others' land or grief/loot them.

## Sound design

The background audio is described as:
- `jupiter-aurora` — cosmic synth aurora atmosphere
- `stern-radio-waves` — distant radio static and signal waves
- `black-hole-ambience` — low-frequency pulse and dark noise
- `staker-hunt-loop` — chase loop for when the Staker entity is near

## Web Integration

To run the web client, copy the contents of `web-client.html` into an online HTML runner like https://onecompiler.com/html/43rjjm8te. It simulates the night vision and basic gameplay.
