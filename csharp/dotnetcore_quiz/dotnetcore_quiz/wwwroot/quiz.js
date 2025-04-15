let username = "";
let currentAnswers = [];

function startQuiz() {
    username = document.getElementById("username").value.trim();
    if (!username) {
        alert("Please enter your name.");
        return;
    }

    fetch("/api/quiz/question", {
        method: "POST",
        body: new URLSearchParams({ name: username }),
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
    .then(response => {
        if (response.status >= 400 && response.status < 500) { // it's a validation error
            alert("Name must be a Full Name");
            throw new Exception();
        }
        return response.text();
    })
    .then(text => {
        document.getElementById("quiz-container").innerHTML = `
            <h2>${data.question}</h2>
            <form id="quiz-form"></form>
            <button onclick="submitAnswer()">Submit Answer</button>
            <p id="result"></p>
        `;

        currentAnswers = data.answers;
        let form = document.getElementById("quiz-form");
        form.innerHTML = "";
        currentAnswers.forEach((answer, index) => {
            form.innerHTML += `
                <input type="radio" name="answer" value="${answer}" id="ans${index}">
                <label for="ans${index}">${answer}</label><br>
            `;
        });
    });
}

function submitAnswer() {
    let selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (!selectedAnswer) {
        alert("Please select an answer.");
        return;
    }

    fetch("/api/quiz/answer", {
        method: "POST",
        body: new URLSearchParams({ name: username, answer: selectedAnswer.value }),
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
    .then(response => response.text())
    .then(result => {
        document.getElementById("result").textContent = "Result: " + result;
    });
}
