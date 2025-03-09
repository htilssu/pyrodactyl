curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

mkdir -p /etc/pterodactyl
echo "Checking if wings is already installed."
curl -sSL -o /usr/local/bin/wings "https://github.com/pterodactyl/wings/releases/latest/download/wings_linux_$([[ "$(uname -m)" == "x86_64" ]] && echo "amd64" || echo "arm64")"
chmod u+x /usr/local/bin/wings
