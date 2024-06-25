#!/bin/bash

# Function to prompt for first name
prompt_for_first_name() {
    while true; do
        read -p "Enter your first name: " first_name
        if [[ -z "$first_name" ]]; then
            echo "You must enter a first name."
        else
            break
        fi
    done
}

# Function to prompt for last name
prompt_for_last_name() {
    while true; do
        read -p "Enter your last name: " last_name
        if [[ -z "$last_name" ]]; then
            echo "You must enter a last name."
        else
            break
        fi
    done
}

# Call the functions
prompt_for_first_name
prompt_for_last_name

# Display the full name
echo "Your full name is: $first_name $last_name"
