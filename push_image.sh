#!/bin/bash
export IMAGE_NAME=iamforeverme/ai4art_fe:$1
docker build -t $IMAGE_NAME .
docker push $IMAGE_NAME
