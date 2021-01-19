#!/bin/bash

VERSION='v1.9.9-Beta'

TEMP=/tmp/answer$$
whiptail --title "Kronos ${VERSION} for Denarius"  --menu  "Installer for Kronos Secondary Layer :" 20 0 0 1 "Install Kronos w/ Denarius Config" 2 "Install Kronos w/ Denarius Config & Chaindata" 3 "Update & Upgrade Kronos ${VERSION}" 2>$TEMP
choice=`cat $TEMP`
case $choice in

1) echo 1 "Installer for Kronos"
#COLORS
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# License Kronos Installer
#
#The MIT License (MIT)
#
#Copyright (c) 2020 Carsen Klock
#
#Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#
#FUNCTIONS
#
# Show a progress bar for $1 seconds
#
# Copyleft 2017 by Ignacio Nunez Hernanz <nacho _a_t_ ownyourbits _d_o_t_ com>
# GPL licensed (see end of file) * Use at your own risk!
#
# Example: progress_bar 60
#

progress_bar()
{
  local DURATION=$1
  local INT=0.25      # refresh interval

  local TIME=0
  local CURLEN=0
  local SECS=0
  local FRACTION=0

  local FB=2588       # full block

  trap "echo -e $(tput cnorm); trap - SIGINT; return" SIGINT

  echo -ne "$(tput civis)\r$(tput el)│"                # clean line

  local START=$( date +%s%N )

  while [ $SECS -lt $DURATION ]; do
    local COLS=$( tput cols )

    # main bar
    local L=$( bc -l <<< "( ( $COLS - 5 ) * $TIME  ) / ($DURATION-$INT)" | awk '{ printf "%f", $0 }' )
    local N=$( bc -l <<< $L                                              | awk '{ printf "%d", $0 }' )

    [ $FRACTION -ne 0 ] && echo -ne "$( tput cub 1 )"  # erase partial block

    if [ $N -gt $CURLEN ]; then
      for i in $( seq 1 $(( N - CURLEN )) ); do
        echo -ne \\u$FB
      done
      CURLEN=$N
    fi

    # partial block adjustment
    FRACTION=$( bc -l <<< "( $L - $N ) * 8" | awk '{ printf "%.0f", $0 }' )

    if [ $FRACTION -ne 0 ]; then 
      local PB=$( printf %x $(( 0x258F - FRACTION + 1 )) )
      echo -ne \\u$PB
    fi

    # percentage progress
    local PROGRESS=$( bc -l <<< "( 100 * $TIME ) / ($DURATION-$INT)" | awk '{ printf "%.0f", $0 }' )
    echo -ne "$( tput sc )"                            # save pos
    echo -ne "\r$( tput cuf $(( COLS - 6 )) )"         # move cur
    echo -ne "│ $PROGRESS%"
    echo -ne "$( tput rc )"                            # restore pos

    TIME=$( bc -l <<< "$TIME + $INT" | awk '{ printf "%f", $0 }' )
    SECS=$( bc -l <<<  $TIME         | awk '{ printf "%d", $0 }' )

    # take into account loop execution time
    local END=$( date +%s%N )
    local DELTA=$( bc -l <<< "$INT - ( $END - $START )/1000000000" \
                   | awk '{ if ( $0 > 0 ) printf "%f", $0; else print "0" }' )
    sleep $DELTA
    START=$( date +%s%N )
  done

  echo $(tput cnorm)
  trap - SIGINT
}

# printf "                     ${GREEN}_ ____ ${NC}${RED} _ ${NC}\n"
# printf "                  "${GREEN}"__| |  _  ${NC}${RED}(_) ${NC}\n"
# printf "                 ${GREEN}/ _  | |_) | |${NC}\n"
# printf "                ${GREEN}| (_| |  __/| |${NC}\n"
# printf "                 ${GREEN}\__._|_|   |_|${NC}\n"
# printf "3333333333333333333333333333333333333333333333333\n"
# printf "333333ddd${GREEN}--------${NC}dd33333333333dd${GREEN}--------${NC}ddd333333\n"
# printf "3333${GREEN}-................${NC}d33333d${GREEN}................-${NC}3333\n"
# printf "3333${GREEN}-.................-${NC}333d${GREEN}..................${NC}3333\n"
# printf "3333d${GREEN}..................${NC}d33${GREEN}..................-${NC}3333\n"
# printf "33333${GREEN}-..........---....${NC}333${GREEN}....---..........-${NC}33333\n"
# printf "333333${GREEN}-............-${NC}d-33333dd${GREEN}-............-${NC}333333\n"
# printf "33333333${GREEN}-..........-${NC}333333333${GREEN}-..........-${NC}33333333\n"
# printf "3333333333${GREEN}---...--${NC}d33333333333d${GREEN}--....--${NC}3333333333\n"
# printf "333333333333333333dddd---d--dd3333333333333333333\n"
# printf "33333333333333d-------d--d--------333333333333333\n"
# printf "333333333333--------........---------333333333333\n"
# printf "3333333333----d-..--${RED}d3333333dd${NC}--.-d----3333333333\n"
# printf "33333333d--dd-.-${RED}d333333333333333d${NC}-..d---d33333333\n"
# printf "3333333d--d-.-${RED}33d${NC}--..--------${RED}d33333${NC}-.-d--d3333333\n"
# printf "333333d--d-.-${RED}33333${NC}-..${RED}d3333d${NC}-...-${RED}3333d${NC}.-d--d333333\n"
# printf "333333----.-${RED}333333${NC}-..${RED}d3333333${NC}-..-${RED}3333${NC}-.----333333\n"
# printf "333333--3-.${RED}3333333${NC}-..${RED}d33333333${NC}...${RED}d3333${NC}.-3--333333\n"
# printf "33333d--3..${RED}3333333${NC}-..${RED}d33333333${NC}...${RED}d3333${NC}..3--333333\n"
# printf "333333--d-.${RED}d333333${NC}-..${RED}d33333333${NC}...${RED}3333d${NC}.-d--333333\n"
# printf "333333---d.-${RED}333333${NC}-..${RED}d333333d${NC}...${RED}d3333${NC}-.d---333333\n"
# printf "3333333--d-.-${RED}33333${NC}-..-${RED}dddd${NC}-...-${RED}33333${NC}-.-d--3333333\n"
# printf "3333333d--dd..${RED}d3d${NC}----------${RED}d333333d${NC}..d---33333333\n"
# printf "333333333---d-.--${RED}333333333333333${NC}--.-d---333333333\n"
# printf "3333333333d---d--..--${RED}ddddddd${NC}---.--d---d3333333333\n"
# printf "3333333333333-----------------------d333333333333\n"
# printf "333333333333333dd----------------3333333333333333\n"
# printf "333333333333333333333ddddddd333333333333333333333\n"
# printf "3333333333333333333333333333333333333333333333333\n\n"

printf " _        _______  _______  _        _______  _______ \n"
printf "| \    /\(  ____ )(  ___  )( (    /|(  ___  )(  ____ \\n"
printf "|  \  / /| (    )|| (   ) ||  \  ( || (   ) || (    \/\n"
printf "|  (_/ / | (____)|| |   | ||   \ | || |   | || (_____ \n"
printf "|   _ (  |     __)| |   | || (\ \) || |   | |(_____  )\n"
printf "|  ( \ \ | (\ (   | |   | || | \   || |   | |      ) |\n"
printf "|  /  \ \| ) \ \__| (___) || )  \  || (___) |/\____) |\n"
printf "|_/    \/|/   \__/(_______)|/    )_)(_______)\_______)\n"
printf "Version ${VERSION}\n\n"

progress_bar 3

printf "${GREEN}Installing Kronos, Denarius, and related dependancies${NC}\n"

lsof /var/lib/dpkg/lock >/dev/null 2>&1
[ $? = 0 ] && echo "dpkg is currently locked, cannot install Kronos...Please ensure you are not running software updates"

sudo apt-get update -y && sudo apt-get upgrade -y

sudo apt-get install -y git unzip build-essential libssl-dev autogen automake curl wget jq snap snapd pwgen

sudo apt-get remove -y nodejs npm

curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -

sudo apt-get install -y nodejs

mkdir -p ~/Kronos/DATA/storage

mkdir -p ~/Kronos/DATA/kronosleveldb

printf "${GREEN}Dependancies Installed Successfully!${NC}\n"

printf "${GREEN}Successfully Installed Node Version 12.x from NodeSource!${NC}\n"

printf "${GREEN}Snap installing Denarius...${NC}\n"

sudo snap install denarius

denarius.daemon stop

printf "${GREEN}This will take 30 seconds...${NC}\n"

progress_bar 30

#Generate random rpcuser and rpcpass for injection
PWUD1=$(pwgen 13 1)

PWPD2=$(pwgen 33 1)

PWPD3=$(pwgen 50 1)

echo "Generated random username and password..."

#Update denarius.conf to match env credentials

touch ~/snap/denarius/common/.denarius/denarius.conf

sed -i "s/.*rpcuser=.*/rpcuser="${PWUD1}"/" ~/snap/denarius/common/.denarius/denarius.conf

sed -i "s/.*rpcpassword=.*/rpcpassword="${PWPD2}"/" ~/snap/denarius/common/.denarius/denarius.conf

if [ ! -f ~/snap/denarius/common/.denarius/walletnotify.sh ]; then
touch ~/snap/denarius/common/.denarius/walletnotify.sh

sed -i '$a #!/bin/sh' ~/snap/denarius/common/.denarius/walletnotify.sh

sed -i '$a curl http://127.0.0.1:3000/walletnotify -d "txid=$@"' ~/snap/denarius/common/.denarius/walletnotify.sh

sed -i '$a walletnotify=curl http://127.0.0.1:3000/walletnotify -d "txid=%s"' ~/snap/denarius/common/.denarius/denarius.conf
fi

echo "Injected newly generated username and password..."

echo "Starting Denarius"

denarius.daemon

progress_bar 20

echo "Installing Kronos from Github"

if [ -d "kronos" ]; then
  sudo rm -rf kronos
fi

git clone https://github.com/carsenk/kronos

cd kronos

echo "Installing Kronos Node Modules..."

sudo su

npm install

cd node_modules/node-pty-prebuilt-multiarch

node-gyp configure

node-gyp build

cd ..

cd ..

echo "Successfully Installed Kronos Node Modules"

echo "Updating Enviroment..."

nohup npm run headless &

echo "Kronos and Denarius are successfully installed! Kronos is now running on port 3000, open your browser to this devices local LAN IP, e.g. 192.168.x.x:3000"
                ;;
2) echo 2 "Installer for Kronos with fast chain sync"
#COLORS
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# License Kronos Installer
#
# This script is free software; you can redistribute it and/or modify it
# under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This script is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this script; if not, write to the
# Free Software Foundation, Inc., 59 Temple Place, Suite 330,
# Boston, MA  02111-1307  USA

#FUNCTIONS

# Show a progress bar for $1 seconds
#
# Copyleft 2017 by Ignacio Nunez Hernanz <nacho _a_t_ ownyourbits _d_o_t_ com>
# GPL licensed (see end of file) * Use at your own risk!
#
# Example: progress_bar 60
#

progress_bar()
{
  local DURATION=$1
  local INT=0.25      # refresh interval

  local TIME=0
  local CURLEN=0
  local SECS=0
  local FRACTION=0

  local FB=2588       # full block

  trap "echo -e $(tput cnorm); trap - SIGINT; return" SIGINT

  echo -ne "$(tput civis)\r$(tput el)│"                # clean line

  local START=$( date +%s%N )

  while [ $SECS -lt $DURATION ]; do
    local COLS=$( tput cols )

    # main bar
    local L=$( bc -l <<< "( ( $COLS - 5 ) * $TIME  ) / ($DURATION-$INT)" | awk '{ printf "%f", $0 }' )
    local N=$( bc -l <<< $L                                              | awk '{ printf "%d", $0 }' )

    [ $FRACTION -ne 0 ] && echo -ne "$( tput cub 1 )"  # erase partial block

    if [ $N -gt $CURLEN ]; then
      for i in $( seq 1 $(( N - CURLEN )) ); do
        echo -ne \\u$FB
      done
      CURLEN=$N
    fi

    # partial block adjustment
    FRACTION=$( bc -l <<< "( $L - $N ) * 8" | awk '{ printf "%.0f", $0 }' )

    if [ $FRACTION -ne 0 ]; then 
      local PB=$( printf %x $(( 0x258F - FRACTION + 1 )) )
      echo -ne \\u$PB
    fi

    # percentage progress
    local PROGRESS=$( bc -l <<< "( 100 * $TIME ) / ($DURATION-$INT)" | awk '{ printf "%.0f", $0 }' )
    echo -ne "$( tput sc )"                            # save pos
    echo -ne "\r$( tput cuf $(( COLS - 6 )) )"         # move cur
    echo -ne "│ $PROGRESS%"
    echo -ne "$( tput rc )"                            # restore pos

    TIME=$( bc -l <<< "$TIME + $INT" | awk '{ printf "%f", $0 }' )
    SECS=$( bc -l <<<  $TIME         | awk '{ printf "%d", $0 }' )

    # take into account loop execution time
    local END=$( date +%s%N )
    local DELTA=$( bc -l <<< "$INT - ( $END - $START )/1000000000" \
                   | awk '{ if ( $0 > 0 ) printf "%f", $0; else print "0" }' )
    sleep $DELTA
    START=$( date +%s%N )
  done

  echo $(tput cnorm)
  trap - SIGINT
}
                                                                                                                                                                                                     

printf " _        _______  _______  _        _______  _______ \n"
printf "| \    /\(  ____ )(  ___  )( (    /|(  ___  )(  ____ \\n"
printf "|  \  / /| (    )|| (   ) ||  \  ( || (   ) || (    \/\n"
printf "|  (_/ / | (____)|| |   | ||   \ | || |   | || (_____ \n"
printf "|   _ (  |     __)| |   | || (\ \) || |   | |(_____  )\n"
printf "|  ( \ \ | (\ (   | |   | || | \   || |   | |      ) |\n"
printf "|  /  \ \| ) \ \__| (___) || )  \  || (___) |/\____) |\n"
printf "|_/    \/|/   \__/(_______)|/    )_)(_______)\_______)\n"
printf "Version ${VERSION}\n\n"                                            

progress_bar 3

printf "${GREEN}Installing Kronos, Denarius, and related dependancies${NC}\n"

lsof /var/lib/dpkg/lock >/dev/null 2>&1
[ $? = 0 ] && echo "dpkg is currently locked, cannot install Kronos...Please ensure you are not running software updates"

sudo apt-get update -y && sudo apt-get upgrade -y

sudo apt-get install -y git unzip build-essential libssl-dev autogen automake curl wget jq snap snapd pwgen

sudo apt-get remove -y nodejs npm

curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -

sudo apt-get install -y 

mkdir -p ~/Kronos/DATA/storage

mkdir -p ~/Kronos/DATA/kronosleveldb

printf "${GREEN}Dependancies Installed Successfully!${NC}\n"

printf "${GREEN}Successfully Installed Node Version 12.x from NodeSource!${NC}\n"

printf "${GREEN}Snap installing Denarius...${NC}\n"

sudo snap install denarius

denarius.daemon stop

printf "${GREEN}This will take 30 seconds...${NC}\n"

progress_bar 30

#Generate random rpcuser and rpcpass for injection
PWUD1=$(pwgen 13 1)

PWPD2=$(pwgen 33 1)

PWPD3=$(pwgen 50 1)

echo "Generated random username and password..."

#Update denarius.conf to match env credentials

mkdir -p ~/snap/denarius/common/.denarius/

echo "Downloading and unzipping Denarius chaindata..."

architecture=""
case $(uname -m) in
    i386)   architecture="386" ;;
    i686)   architecture="386" ;;
    x86_64) architecture="amd64" ;;
    aarch64) architecture="aarch64" ;;
    arm*)    dpkg --print-architecture | grep -q "arm64" && architecture="arm64" || architecture="arm" ;;
esac

echo ${architecture}

if [ ${architecture} == "arm" ] || [ ${architecture} == "arm64" ]|| [ ${architecture} == "aarch64" ]; then

  cd ~/snap/denarius/common/.denarius
  wget https://denarii.cloud/pichaindata.zip
  unzip pichaindata.zip

else

  cd ~/snap/denarius/common/.denarius
  wget https://denarii.cloud/chaindata.zip
  unzip chaindata.zip

fi

cd ~

touch ~/snap/denarius/common/.denarius/denarius.conf

sed -i "s/.*rpcuser=.*/rpcuser="${PWUD1}"/" ~/snap/denarius/common/.denarius/denarius.conf

sed -i "s/.*rpcpassword=.*/rpcpassword="${PWPD2}"/" ~/snap/denarius/common/.denarius/denarius.conf

if [ ! -f ~/snap/denarius/common/.denarius/walletnotify.sh ]; then
touch ~/snap/denarius/common/.denarius/walletnotify.sh

sed -i '$a #!/bin/sh' ~/snap/denarius/common/.denarius/walletnotify.sh

sed -i '$a curl http://127.0.0.1:3000/walletnotify -d "txid=$@"' ~/snap/denarius/common/.denarius/walletnotify.sh

sed -i '$a walletnotify=curl http://127.0.0.1:3000/walletnotify -d "txid=%s"' ~/snap/denarius/common/.denarius/denarius.conf
fi

echo "Injected newly generated username and password..."

echo "Starting Denarius"

denarius.daemon

progress_bar 20

echo "Installing Kronos from Github"

if [ -d "kronos" ]; then
  sudo rm -rf kronos
fi

git clone https://github.com/carsenk/kronos

cd kronos

echo "Installing Kronos Node Modules..."

sudo su

npm install

cd node_modules/node-pty-prebuilt-multiarch

node-gyp configure

node-gyp build

cd ..

cd ..

echo "Successfully Installed Kronos Node Modules"

echo "Updating Enviroment..."

nohup npm run headless &

echo "Kronos and Denarius are successfully installed! Kronos is now running on port 3000, open your browser to this devices local LAN IP, e.g. 192.168.x.x:3000"
                ;;
3) echo 3 "Update Kronos ${VERSION} for Denarius"

echo "Updating in progress...This is a work in progress"

printf " _        _______  _______  _        _______  _______ \n"
printf "| \    /\(  ____ )(  ___  )( (    /|(  ___  )(  ____ \\n"
printf "|  \  / /| (    )|| (   ) ||  \  ( || (   ) || (    \/\n"
printf "|  (_/ / | (____)|| |   | ||   \ | || |   | || (_____ \n"
printf "|   _ (  |     __)| |   | || (\ \) || |   | |(_____  )\n"
printf "|  ( \ \ | (\ (   | |   | || | \   || |   | |      ) |\n"
printf "|  /  \ \| ) \ \__| (___) || )  \  || (___) |/\____) |\n"
printf "|_/    \/|/   \__/(_______)|/    )_)(_______)\_______)\n"
printf "Updating to Kronos Version ${VERSION}\n\n"

echo "Ensuring you have NVM and v12 NodeJS/NPM"
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -

sudo apt-get install -y nodejs

npm install -g npm node-gyp electron electron-forge electron-rebuild

if [ ! -f ~/snap/denarius/common/.denarius/walletnotify.sh ]; then
touch ~/snap/denarius/common/.denarius/walletnotify.sh

sed -i '$a #!/bin/sh' ~/snap/denarius/common/.denarius/walletnotify.sh

sed -i '$a curl http://127.0.0.1:3000/walletnotify -d "txid=$@"' ~/snap/denarius/common/.denarius/walletnotify.sh

sed -i '$a walletnotify=curl http://127.0.0.1:3000/walletnotify -d "txid=%s"' ~/snap/denarius/common/.denarius/denarius.conf
fi

cd kronos

git checkout .

git pull

NODEPID=$(pidof node)

echo "Killing PID of Kronos for update ${NODEPID}"

sudo kill -9 ${NODEPID}

sudo su

npm install

npm update

cd node_modules/node-pty-prebuilt-multiarch

node-gyp configure

node-gyp build

cd ..

cd ..

nohup npm run headless &

echo "Successfully Updated Kronos to ${VERSION}, You may now login from your web browser."
                ;;
esac
echo Selected $choice