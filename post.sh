#!/bin/bash

# URL to which the files will be posted
URL="https://dev.databus.dbpedia.org/api/publish?fetch-file-properties=true&log-level=info"

# Directory to iterate over
DIRECTORY="output"

# Loop through all files in the specified directory
for file in "$DIRECTORY"/*; do
  # Check if it is a file (not a directory)
  if [[ -f $file ]]; then
    echo "Posting file: $file"
    
    # Make the POST request
    curl -X POST \
      -H 'accept: application/json' \
      -H 'X-API-KEY: c3b8123f-9370-4057-bc1b-33e1b8fbab1e' \
      -H 'Content-Type: application/ld+json' \
      --data-binary "@$file" $URL 
     # -F 'file=@$file' $URL 
  fi
done
