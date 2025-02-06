#!/bin/bash

echo "⏰ Changing the last commit timestamp..."

# Generate a random number between 180 and 420 (3 to 10 minutes in seconds)
random_time=$(( (RANDOM % 241) + 950 ))

latest_commit=$(git rev-parse HEAD)
echo "⏰ Latest commit: $latest_commit"
echo "⏰ Timestamp: $(git show -s --format=%ci $latest_commit)"

# Get the hash of the previous commit
previous_commit=$(git rev-parse HEAD~2)
echo "⏰ Previous commit: $previous_commit"

# Get the timestamp of the previous commit
previous_timestamp=$(git show -s --format=%ct $previous_commit)
echo "⏰ Previous timestamp: $(git show -s --format=%ci $previous_commit)"

# Calculate the new timestamp by adding the random time
new_timestamp=$(($previous_timestamp + $random_time))

echo "⏰ New timestamp: $(date -r $new_timestamp '+%Y-%m-%d %H:%M:%S')"

# Update the commit timestamp
git commit --amend --no-edit -n --date=$new_timestamp

echo "✅ Done"
