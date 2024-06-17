#!/bin/sh

# File where the environment variables will be stored
output_file=".env"

# Define your list of keys that you're interested in
keys="DATABASE_HOST DATABASE_PORT DATABASE_USER DATABASE_PASSWORD DATABASE_NAME REDIS_URL TMDB_API_KEY API_KEY TMDB_ACCESS_TOKEN NEXTAUTH_SECRET NEXTAUTH_URL GITHUB_CLIENT_ID GITHUB_CLIENT_SECRET KAKAO_CLIENT_ID KAKAO_CLIENT_SECRET NAVER_CLIENT_ID NAVER_CLIENT_SECRET"

# Clear the file to avoid appending to old content
: > "$output_file"

# Loop through the list of predefined keys
for key in $keys; do
    # Check if the key exists in the environment
    eval value=\$$key
    if [ ! -z "$value" ]; then
        # Write to file with the format KEY="VALUE"
        echo "$key=\"$value\"" >> "$output_file"
    fi
done