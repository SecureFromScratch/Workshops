import secrets
import os

QUESTION_FILEPATH = "question.txt"
ANSWERS_FILEPATH = "answers.txt"
TEACHER_NAME = "the teacher"
OUTPUT_FORMAT = "{}: {}"


def secure_shuffle(lst):
    for i in range(len(lst) - 1, 0, -1):
        j = secrets.randbelow(i + 1)
        lst[i], lst[j] = lst[j], lst[i]


class QuestionAndAnswers:
    def __init__(self, question, correct_answer, wrong_answer_options):
        self.question = question
        self.correct_answer = correct_answer
        self.shuffled_answers = self._generate_shuffled_answers(correct_answer, wrong_answer_options)

    @staticmethod
    def _generate_shuffled_answers(correct_answer, wrong_answer_options):
        possible_answers = wrong_answer_options + [correct_answer]
        secure_shuffle(possible_answers)
        return possible_answers


def load_question(filepath):
    with open(filepath, 'r') as file:
        lines = file.readlines()
        question = lines.pop(0).strip()
        correct_answer = lines.pop(0).strip()
        wrong_answer_options = [line.strip() for line in lines if line.strip()]
    return QuestionAndAnswers(question, correct_answer, wrong_answer_options)


def hello_user(name):
    print("Hello,", name, ",")


def question_and_answer_options(question, answers):
    print(question)
    for i, answer in enumerate(answers, start=1):
        print(i, ") ", answer, sep="")


def empty_line():
    print()


def print_file(filepath):
    with open(filepath, 'r') as file:
        for line in file:
            print(line, end="")  # 'end=""' to avoid adding extra newlines


def quiz_student(student_name):
    # Assuming MultipleChoiceQuestions and Printouts classes/functions are defined
    question_and_answers = load_question(QUESTION_FILEPATH)

    shuffled_answers = question_and_answers.shuffled_answers
    question_and_answer_options(question_and_answers.question, shuffled_answers)

    empty_line()

    answer_number_starting_at_1 = ask_for_answer_number(1, len(shuffled_answers))

    right_or_wrong = ("Right" if shuffled_answers[answer_number_starting_at_1 - 1] == question_and_answers.correct_answer
                      else "Wrong")
    add_answer_to_answers_file(student_name, right_or_wrong)
    print("Thank you for answering")


def is_teacher(_name):
    return _name.lower() == TEACHER_NAME.lower()


def add_answer_to_answers_file(student_name, result_description):
    output_line = OUTPUT_FORMAT.format(result_description, student_name)
    with open(ANSWERS_FILEPATH, 'a') as file:
        file.write(output_line + "\n")


def print_answer_results():
    with open(ANSWERS_FILEPATH, 'r') as file:
        for line in file:
            print(line, end='')


def ask_for_answer_number(minimum_allowed, maximum_allowed):
    print("Which is the correct answer?")
    while True:
        try:
            value = int(input())
            if minimum_allowed <= value <= maximum_allowed:
                return value
        except ValueError:
            pass
        print("You must enter an integer number between", minimum_allowed, "and", maximum_allowed)


def ask_for_name():
    name = input("Hello, what is your name?\n")
    return name


if __name__ == '__main__':
    user_name = ask_for_name()
    hello_user(user_name)

    if is_teacher(user_name):
        print("ANSWERS:")
        print_answer_results()
    else:
        quiz_student(user_name)

