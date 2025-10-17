#!/bin/zsh

export $(grep -v '^#' .env | xargs)

dotnet watch run
