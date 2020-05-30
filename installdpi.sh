echo "Installing dPi, Denarius, and related dependancies"

cat << "EOF"

      _ _____ _ 
     | |  __ (_)
   __| | |__) | 
  / _` |  ___/ |
 | (_| | |   | |
  \__,_|_|   |_|
       _,.
     ,` -.)
    '( _/'-\\-.               
   /,|`--._,-^|            ,     
   \_| |`-._/||          ,'|       
     |  `-, / |         /  /      
     |     || |        /  /       
      `r-._||/   __   /  /  
  __,-<_     )`-/  `./  /
 '  \   `---'   \   /  / 
     |           |./  /  
     /           //  /     
 \_/' \         |/  /         
  |    |   _,^-'/  /              
  |    , ``  (\/  /_        
   \,.->._    \D-=/^         
   (  /   `-._//^`  
    `3-.____(__}              
     |     {__)           
           ()`     
EOF

sudo apt-get update -y && sudo apt-get upgrade -y

sudo apt-get install -y git unzip build-essential libssl-dev libdb++-dev libboost-all-dev libqrencode-dev libminiupnpc-dev libevent-dev autogen automake libtool libqt5gui5 libqt5core5a libqt5dbus5 qttools5-dev qttools5-dev-tools qt5-default libcurl4-openssl-dev curl wget jq mongodb snap snapd pwgen nodejs npm

echo "Dependancies Installed Successfully!"

echo "Creating a MongoDB Directory - /data/db..."

sudo mkdir -p /data/db

sudo killall mongod

echo "Starting MongoDB....."
sudo mongod --fork --syslog
#sudo screen -dmS mongo 'sudo mongod'

echo "Snap installing Denarius..."

sudo snap install denarius

echo "Rebooting Denarius to inject credentials..."

denarius.daemon stop

echo "This will take 360 seconds.......Please wait....."

sleep 120

denarius.daemon

echo "This will take 240 seconds.......Please wait....."

sleep 120

denarius.daemon stop

echo "This will take 120 seconds.......Please wait....."

sleep 120

echo "Denarius stopped and prepared for credential injection"

#Generate random rpcuser and rpcpass for injection
PWUD1=$(pwgen 13 1)

PWPD2=$(pwgen 33 1)

echo "Generated random username and password..."

#Update denarius.conf to match env credentials
sed -i 's/.*rpcuser=.*/rpcuser=$PWUD1/' ~/snap/denarius/common/.denarius/denarius.conf

sed -i 's/.*rpcpassword=.*/rpcpassword=$PWPD2/' ~/snap/denarius/common/.denarius/denarius.conf

echo "Injected newly generated username and password..."

echo "Starting Denarius"

denarius.daemon

echo "Installing Forever and Nodemon"

npm install -g forever nodemon

echo "Installing dPi from Github"

git clone https://github.com/carsenk/dpi

cd dpi

echo "Installing dPi Node Modules..."

npm install

echo "Installed dPi Node Modules"

echo "Updating Enviroment..."

#Update enviroment file
sed -i 's/.*DNRUSER=.*/DNRUSER=$PWUD1/' .env

sed -i 's/.*DNRPASS=.*/DNRPASS=$PWPD2/' .env

echo "Successfully injected generated username and password to dPi"

PWDPI3=$(pwgen 15 1)

echo "Updating dPi Protection and Generating Password..."

sed -i 's/.*password: "testing123",.*/password: "$PWDPI3",/' app.js

sudo forever start app.js

echo "dPi and Denarius are successfully installed! dPi is now running on port 3000, open your browser to this devices local LAN IP, e.g. 127.0.0.1:3000"

echo "Your dPi credentials are $(tput setaf 2)dpiadmin $(tput setaf 7)& password is $(tput setaf 3)$PWDPI3"