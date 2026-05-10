#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if [ ! -d "eglercraft-server" ]; then
  echo "Cloning Eglercraft server..."
  git clone https://github.com/eglercraft/eglercraft-server.git eglercraft-server
else
  echo "Eglercraft server repository already exists."
fi

cd eglercraft-server
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
else
  echo "Dependencies already installed."
fi

echo
cat <<EOF
Setup complete.
Run 'npm run start' from the game/ folder to launch the horror server.
EOF
