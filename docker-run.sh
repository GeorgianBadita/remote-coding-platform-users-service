if [ -n "$1" ]; then

    if [ "$1" = "-nb" ]; then
        docker run -p 8080:8080 remote-coding-platform-users-service-img
    else
        echo "Invalid script parameter, use -nb to not start the container in background mode"
    fi
else
    docker run -p 8080:8080 -d remote-coding-platform-users-service-img
fi