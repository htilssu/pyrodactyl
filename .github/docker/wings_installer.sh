#!/bin/bash

if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
elif [ -f /etc/lsb-release ]; then
    . /etc/lsb-release
    OS=$DISTRIB_ID
else
    OS=$(uname -s)
fi

# Check if curl exists
if ! command -v curl &> /dev/null; then
    echo "curl not found, installing..."
    case $OS in
        (debian|ubuntu)
            apt-get update && apt-get install -y curl
            ;;
        (centos|rhel|fedora)
            yum install -y curl
            ;;
        (alpine)
            apk add --no-cache curl
            ;;
        (*)
            echo "Unsupported OS for automatic curl installation"
            exit 1
            ;;
    esac
else
    echo "curl is already installed"
fi
