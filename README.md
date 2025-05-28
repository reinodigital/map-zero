<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Map Zero server backend created with NestJs

## 🐳 Step-by-Step Docker + Docker Compose Installation (Debian)

✅ 1. Update the system
`sudo apt update && sudo apt upgrade -y`
✅ 2. Install Docker
`sudo apt install ca-certificates curl gnupg lsb-release -y`

✅ 3. Add Docker’s GPG key

`sudo mkdir -p /etc/apt/keyrings`
`curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg`
✅ 4. Add Docker repository
`echo \
 "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
 https://download.docker.com/linux/debian \
 $(lsb_release -cs) stable" | \
 sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`

✅ 5. Install Docker Engine
`sudo apt update`
`sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y`
