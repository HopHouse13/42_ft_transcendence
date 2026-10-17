#!/bin/bash
set -e

PARENT_COUNT=$(git log -1 --format=%P | wc -w) # if its a merge there are two commit hashs if its a push there is only one commit hash
SUBJECT=$(git log -1 --format=%s)

# 1. Extract merge data
if [ "$PARENT_COUNT" -gt 1 ]; then
  IS_MERGE="true"
	# Look for ANYTHING wrapped in single quotes (catches local and remote-tracking merges)
  SOURCE_BRANCH=$(echo "$SUBJECT" | grep -oP "(?<=')[^']+(?=')" | head -n 1 || true)

  if [ -z "$SOURCE_BRANCH" ]; then
    SOURCE_BRANCH=$(echo "$SUBJECT" | grep -oP "(?<=from )[^ ]+" | cut -d'/' -f2- || true)
  fi

  if [ -z "$SOURCE_BRANCH" ]; then
    SOURCE_BRANCH="unknown"
  fi

  SOURCE_BRANCH=${SOURCE_BRANCH#origin/}
else
  IS_MERGE="false"
  SOURCE_BRANCH=""
fi

# 2. Dynamically assign Colors and Titles based on the branch
if [ "$REF_NAME" = "main" ]; then
  if [ "$IS_MERGE" = "true" ]; then
    COLOR=616922
    TITLE="🚀 __**Code Merged into Main**__ 🚀"
  else
    COLOR=2328118
    TITLE="🌳 __**Push to Main**__ 🌳"
  fi
else
  if [ "$IS_MERGE" = "true" ]; then
    COLOR=8540383
    TITLE="🛤 Code Merged into Branch 🛤"
  else
    COLOR=13801762
    TITLE="🌱 Push to Branch 🌱"
  fi
fi

# Generate a list of all commit messages in this push (extracting just the first line of each)
if [ "$IS_MERGE" = "true" ]; then
  # If it is a merge, ignore GitHub's history dump and ONLY format the top merge commit
  MERGE_MSG=$(git log -1 --format=%B)              # trim trailing empty line
  COMMIT_LIST=$(echo "$MERGE_MSG" | sed 's/^/> /') #add blockquot arrow
else
  # If it is a normal push, format all batched commits from the JSON array
  COMMIT_LIST=$(echo "$COMMITS_JSON" | jq -r 'map("> \(.message | gsub("\n"; "\n> "))") | join("\n\n")')
                                                                # gsub (global substitution) to find every hidden newline (\n) in the commit body and automatically insert a \n>  in front of it.
fi

# 3. Build the JSON Payload
PAYLOAD=$(jq -n \
  --arg commit_list "$COMMIT_LIST" \
  --arg actor "$ACTOR" \
  --arg ref "$REF_NAME" \
  --arg url "$COMPARE_URL" \
  --arg is_merge "$IS_MERGE" \
  --arg source "$SOURCE_BRANCH" \
  --arg title "$TITLE" \
  --argjson color "$COLOR" \
  '{
    username: "GitHub",
    avatar_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    embeds: [{
      color: $color,
      title: $title,
      url: $url,
      description: (
        if $is_merge == "true" then
          if $source == "unknown" then
            "**\($actor)** merged code into `\($ref)`.\n\n\($commit_list)"
          else
            "**\($actor)** merged `\($source)` into `\($ref)`.\n\n\($commit_list)"
          end
        else
            if $ref == "main" then
              "**\($actor)** pushed directly to `\($ref)`.\n\n\($commit_list)"
            else
              "**\($actor)** pushed to `\($ref)`.\n\n\($commit_list)"
            end
        end
      )
    }]
  }')

# 4. Fire the Webhook
curl -H "Content-Type: application/json" -d "$PAYLOAD" "$DISCORD_WEBHOOK_URL"