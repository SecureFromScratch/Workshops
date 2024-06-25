
#!/bin/bash

# Variables
ANSWERS_FILE="answers.txt"
TEACHER_NAME="the teacher"
OUTPUT_FORMAT="%s: %s"

isTeacher() {
    [[ "${1,,}" == "${TEACHER_NAME,,}" ]]
}


printAnswerResults() {
    cat "$ANSWERS_FILE"
}


# Function to shuffle array
shuffle() {
    local i tmp size max rand
    size=${#options[*]}
    max=$(( 32768 / size * size ))

    for ((i=size-1; i>0; i--)); do
        while (( (rand=RANDOM) >= max )); do :; done
        rand=$(( rand % (i+1) ))
        tmp=${options[i]} options[i]=${options[rand]} options[rand]=$tmp
    done
}

# Function to ask a question with one correct answer, shuffled each time
ask_question() {
    # Define the correct answer and explanations
    local correct_answer="Nineveh"    

    # Define incorrect options
    local incorrect_options=("Damascus" "Babylon" "Harran")

    # Randomly select the position for the correct answer
    local correct_position=$((RANDOM % 4))

    # Initialize the options array and fill in incorrect answers
    options=("${incorrect_options[@]}")

    # Insert the correct answer at the randomly selected position
    options=("${options[@]:0:correct_position}" "$correct_answer" "${options[@]:correct_position}")

    # Shuffle the options to randomize their order
    shuffle

    echo "What is the capital of Assyria?"
    for i in "${!options[@]}"; do
        echo "$((i+1))) ${options[i]}"
    done
    echo "Select your answer (1, 2, 3, 4): "

    while true; do
        read answer

        # Validate input
        if ! [[ "$answer" =~ ^[1-4]$ ]]; then
            echo "Invalid input. Please enter a number between 1 and 4."
            continue
        fi

        # Subtract 1 because array indices start at 0
        let answer-=1

        # Check if the selected option is the correct answer
        if [ "${options[answer]}" = "$correct_answer" ]; then
            result="Right"
        else
            result="Wrong"
        fi
        echo "I have recorded your response. Goodbye."
        addAnswerToAnswersFile "$name" "$result"
        break
    done
}

addAnswerToAnswersFile() {    
    echo "$result: $name" >> $ANSWERS_FILE
}

askForName() {    
    while true; do    
        # Prompt the user to enter their name
        echo "What is your name?"
        read name
        
        if [ ${#name} -ge 50 ]; then
            echo "The name is too long!"
        elif [[ $name   == *$'\t'* ]]; then
            echo "The name contains tab!"
        elif [[ $name  == *" "* ]]; then                      
            break
        else        
            echo "Your full name, please."          
        fi
    done 
}

main()
{
    #while true; do
        askForName
        if isTeacher "$name"; then
            printAnswerResults
        else        
            # Call the function to ask the question
            ask_question
        fi
    #done

}

main
