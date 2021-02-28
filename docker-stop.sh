CONTAINER_ID=`docker ps | tail -n 1 | awk '{if($2 == "remote-coding-platform-users-service-img") {print $1}}'`

if [ -z "$CONTAINER_ID" ]; then
    echo "${CONTAINER_ID} IS NOT RUNNING"
fi

echo "STOPPING CONTAINER: ${CONTAINER_ID}"

OUTPUT=`docker stop "$CONTAINER_ID"`

COMMAND_SUCCESS=$?

echo "DOCKER STOP OUTPUT: ${OUTPUT}"

if [[ COMMAND_SUCCESS -eq 0 ]]; then
    echo "CONTAINER WAS STOPPED SUCCESFULLY"
else
    echo "THERE WAS AN ERROR STOPPING CONTAINER: ${CONTAINER_ID}"
fi