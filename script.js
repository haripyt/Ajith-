let questions = [];
let currentIndex = 0;
let userAnswers = {};
let timerInterval;
let totalSeconds = 0;

// ------------------- TIMER --------------------
function startTimer() {
    timerInterval = setInterval(() => {
        totalSeconds++;
        let min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
        let sec = String(totalSeconds % 60).padStart(2, "0");
        document.getElementById("timer").textContent = `Time: ${min}:${sec}`;
    }, 1000);
}

// ------------------- LOAD EXCEL FROM GITHUB --------------------
async function loadExcelFromGitHub() {
    const excelURL = "excelFile.xlsx"; // <-- Stored in same folder

    const response = await fetch(excelURL);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    questions = rows.map((row) => ({
        no: row["No"],
        question: row["Question"],
        options: {
            A: row["A"],
            B: row["B"],
            C: row["C"],
            D: row["D"],
        },
        correct: row["Correct Answer"],
    }));

    shuffleQuestions();
    startQuiz();
}

// ------------------- SHUFFLE QUESTIONS --------------------
function shuffleQuestions() {
    questions.sort(() => Math.random() - 0.5);
}

// ------------------- DISPLAY QUESTION --------------------
function displayQuestion() {
    const q = questions[currentIndex];

    let html = `
        <h2>${q.no}. ${q.question}</h2>
        ${Object.keys(q.options)
            .map((opt) => {
                const checked = userAnswers[currentIndex] === opt ? "checked" : "";
                return `
                <label class="option">
                    <input type="radio" name="answer" value="${opt}" ${checked}>
                    ${opt}: ${q.options[opt]}
                </label>`;
            })
            .join("")}
    `;

    document.getElementById("questionBox").innerHTML = html;
}

// ------------------- START QUIZ --------------------
function startQuiz() {
    document.getElementById("quizContainer").classList.remove("hidden");
    startTimer();
    displayQuestion();
}

// ------------------- SAVE USER ANSWER --------------------
function saveAnswer() {
    const selected = document.querySelector("input[name='answer']:checked");
    if (selected) userAnswers[currentIndex] = selected.value;
}

// ------------------- BUTTON EVENTS --------------------
document.getElementById("nextBtn").onclick = () => {
    saveAnswer();
    if (currentIndex < questions.length - 1) {
        currentIndex++;
        displayQuestion();
    }
};

document.getElementById("prevBtn").onclick = () => {
    saveAnswer();
    if (currentIndex > 0) {
        currentIndex--;
        displayQuestion();
    }
};

document.getElementById("submitBtn").onclick = () => {
    saveAnswer();
    clearInterval(timerInterval);
    calculateScore();
};

// ------------------- SCORE CALCULATION --------------------
function calculateScore() {
    let correctCount = 0;
    let wrongList = [];

    questions.forEach((q, index) => {
        if (userAnswers[index] === q.correct) {
            correctCount++;
        } else {
            wrongList.push({
                question: q.question,
                chosen: userAnswers[index] || "No Answer",
                correct: q.correct,
                options: q.options
            });
        }
    });

    let resultHTML = `
        <h2>Your Score: ${correctCount} / ${questions.length}</h2>
        <h3>Wrong Answers</h3>
        <div class="wrongBox">
            ${wrongList
                .map(
                    (w) => `
                <div class="wrongItem">
                    <p><strong>Q:</strong> ${w.question}</p>
                    <p><strong>Your Answer:</strong> ${w.chosen}</p>
                    <p><strong>Correct Answer:</strong> ${w.correct}</p>
                </div>
            `
                )
                .join("")}
        </div>
    `;

    document.getElementById("resultContainer").innerHTML = resultHTML;
    document.getElementById("resultContainer").classList.remove("hidden");
    document.getElementById("quizContainer").classList.add("hidden");
}

// ------------------- INIT --------------------
loadExcelFromGitHub();
