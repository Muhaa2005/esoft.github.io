// =============== DATA STORAGE ===============
let students = JSON.parse(localStorage.getItem('students')) || [];
let currentUser = null;
let currentExam = null;
let examTimer = null;

// Sample exams data
let exams = [
    {
        id: 1,
        title: 'Mathematics Test',
        description: 'Basic Mathematics',
        duration: 30,
        passingScore: 60,
        totalQuestions: 5,
        questions: [
            {
                id: 1,
                text: 'What is 2 + 2?',
                options: ['3', '4', '5', '6'],
                correctAnswer: 1
            },
            {
                id: 2,
                text: 'What is 10 * 5?',
                options: ['45', '50', '55', '60'],
                correctAnswer: 1
            },
            {
                id: 3,
                text: 'What is 100 / 4?',
                options: ['20', '25', '30', '35'],
                correctAnswer: 1
            },
            {
                id: 4,
                text: 'What is 15 - 8?',
                options: ['5', '6', '7', '8'],
                correctAnswer: 2
            },
            {
                id: 5,
                text: 'What is 3 * 3 * 3?',
                options: ['18', '24', '27', '30'],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 2,
        title: 'English Language',
        description: 'English Grammar & Vocabulary',
        duration: 45,
        passingScore: 70,
        totalQuestions: 5,
        questions: [
            {
                id: 1,
                text: 'Which is the correct spelling?',
                options: ['Recieve', 'Receive', 'Recive', 'Reciieve'],
                correctAnswer: 1
            },
            {
                id: 2,
                text: 'Choose the correct sentence:',
                options: ['She go to school', 'She goes to school', 'She going to school', 'She is go to school'],
                correctAnswer: 1
            },
            {
                id: 3,
                text: 'What is the opposite of "hot"?',
                options: ['Cold', 'Warm', 'Cool', 'Freezing'],
                correctAnswer: 0
            },
            {
                id: 4,
                text: 'Which tense is this: "I have eaten"?',
                options: ['Simple Past', 'Present Perfect', 'Past Perfect', 'Simple Present'],
                correctAnswer: 1
            },
            {
                id: 5,
                text: 'Choose the correct form:',
                options: ['Them is students', 'They is students', 'They are students', 'Theirs is students'],
                correctAnswer: 2
            }
        ]
    },
    {
        id: 3,
        title: 'Science Quiz',
        description: 'General Science Knowledge',
        duration: 40,
        passingScore: 65,
        totalQuestions: 5,
        questions: [
            {
                id: 1,
                text: 'What is the chemical symbol for Gold?',
                options: ['Go', 'Gd', 'Au', 'Ag'],
                correctAnswer: 2
            },
            {
                id: 2,
                text: 'What is the largest planet in our solar system?',
                options: ['Saturn', 'Jupiter', 'Neptune', 'Uranus'],
                correctAnswer: 1
            },
            {
                id: 3,
                text: 'How many bones does an adult human have?',
                options: ['186', '206', '226', '246'],
                correctAnswer: 1
            },
            {
                id: 4,
                text: 'What is the speed of light?',
                options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '200,000 km/s'],
                correctAnswer: 0
            },
            {
                id: 5,
                text: 'Which gas do plants need for photosynthesis?',
                options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
                correctAnswer: 2
            }
        ]
    }
];

// =============== UTILITY FUNCTIONS ===============
function toggleSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

function showMessage(message, type = 'error') {
    const messageDiv = document.createElement('div');
    messageDiv.className = type;
    messageDiv.textContent = message;
    
    const card = document.querySelector('.card') || document.querySelector('.dashboard');
    if (card) {
        card.insertBefore(messageDiv, card.firstChild);
        setTimeout(() => messageDiv.remove(), 3000);
    }
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// =============== REGISTRATION ===============
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('regEmail').value;
    
    // Check if email already exists
    if (students.some(s => s.email === email)) {
        showMessage('Email already registered!', 'error');
        return;
    }
    
    const newStudent = {
        id: Date.now(),
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: email,
        password: document.getElementById('regPassword').value,
        phone: document.getElementById('phone').value,
        dateOfBirth: document.getElementById('dob').value,
        uniRegNum: document.getElementById('uniRegNum').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        completedExams: []
    };
    
    students.push(newStudent);
    localStorage.setItem('students', JSON.stringify(students));
    
    showMessage('Registration successful! Please login.', 'success');
    document.getElementById('registerForm').reset();
    
    setTimeout(() => toggleSection('loginSection'), 1500);
});

// =============== LOGIN ===============
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const student = students.find(s => s.email === email && s.password === password);
    
    if (!student) {
        showMessage('Invalid email or password!', 'error');
        return;
    }
    
    currentUser = student;
    loadDashboard();
    toggleSection('dashboardSection');
});

// =============== DASHBOARD ===============
function loadDashboard() {
    // Display student info
    document.getElementById('studentName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('infoEmail').textContent = currentUser.email;
    document.getElementById('infoUniReg').textContent = currentUser.uniRegNum;
    document.getElementById('infoPhone').textContent = currentUser.phone;
    document.getElementById('infoDOB').textContent = formatDate(currentUser.dateOfBirth);
    document.getElementById('infoAddress').textContent = currentUser.address;
    document.getElementById('infoCity').textContent = currentUser.city;
    
    // Load exams
    loadExams();
}

function loadExams() {
    const examsList = document.getElementById('examsList');
    examsList.innerHTML = '';
    
    exams.forEach(exam => {
        const completed = currentUser.completedExams.find(e => e.examId === exam.id);
        const status = completed ? 'completed' : 'pending';
        
        const examCard = document.createElement('div');
        examCard.className = 'exam-card';
        examCard.innerHTML = `
            <h3>${exam.title}</h3>
            <p>${exam.description}</p>
            <p><strong>Duration:</strong> ${exam.duration} mins</p>
            <p><strong>Questions:</strong> ${exam.totalQuestions}</p>
            <p><strong>Passing Score:</strong> ${exam.passingScore}%</p>
            <span class="status ${status}">${status === 'completed' ? '✓ Completed' : '○ Not Attempted'}</span>
            ${completed ? `<p><strong>Score:</strong> ${completed.score}/${completed.totalQuestions} (${completed.percentage}%)</p>` : ''}
        `;
        
        if (status === 'pending') {
            examCard.style.cursor = 'pointer';
            examCard.addEventListener('click', () => startExam(exam.id));
        }
        
        examsList.appendChild(examCard);
    });
}

// =============== EXAM MANAGEMENT ===============
function startExam(examId) {
    currentExam = exams.find(e => e.id === examId);
    
    if (!currentExam) return;
    
    document.getElementById('examTitle').textContent = currentExam.title;
    loadExamQuestions();
    
    // Start timer
    let timeLeft = currentExam.duration * 60;
    updateTimer(timeLeft);
    
    examTimer = setInterval(() => {
        timeLeft--;
        updateTimer(timeLeft);
        
        if (timeLeft <= 0) {
            clearInterval(examTimer);
            submitExam();
        }
    }, 1000);
    
    toggleSection('examSection');
}

function updateTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('timer').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    
    if (seconds <= 300) { // Last 5 minutes
        document.getElementById('timer').style.color = '#f44336';
    }
}

function loadExamQuestions() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    
    currentExam.questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        
        let optionsHtml = '';
        question.options.forEach((option, optIndex) => {
            optionsHtml += `
                <div class="option">
                    <input type="radio" name="q${question.id}" value="${optIndex}" id="q${question.id}_${optIndex}">
                    <label for="q${question.id}_${optIndex}">${option}</label>
                </div>
            `;
        });
        
        questionDiv.innerHTML = `
            <div class="question-text">
                <span class="question-number">Question ${index + 1}:</span> ${question.text}
            </div>
            <div class="options">
                ${optionsHtml}
            </div>
        `;
        
        container.appendChild(questionDiv);
    });
}

document.getElementById('examForm').addEventListener('submit', function(e) {
    e.preventDefault();
    submitExam();
});

function submitExam() {
    clearInterval(examTimer);
    
    let score = 0;
    currentExam.questions.forEach(question => {
        const selected = document.querySelector(`input[name="q${question.id}"]:checked`);
        if (selected && parseInt(selected.value) === question.correctAnswer) {
            score++;
        }
    });
    
    const percentage = Math.round((score / currentExam.totalQuestions) * 100);
    const passed = percentage >= currentExam.passingScore;
    
    // Save result
    const result = {
        examId: currentExam.id,
        examName: currentExam.title,
        score: score,
        totalQuestions: currentExam.totalQuestions,
        percentage: percentage,
        passed: passed,
        dateTaken: new Date().toISOString()
    };
    
    currentUser.completedExams.push(result);
    
    // Update storage
    const index = students.findIndex(s => s.id === currentUser.id);
    students[index] = currentUser;
    localStorage.setItem('students', JSON.stringify(students));
    
    showResult(result);
}

function showResult(result) {
    document.getElementById('resultExamName').textContent = result.examName;
    document.getElementById('resultScore').textContent = `${result.score}/${result.totalQuestions}`;
    document.getElementById('resultPercentage').textContent = `${result.percentage}%`;
    document.getElementById('resultStatus').textContent = 
        result.passed ? '✓ PASSED' : '✗ FAILED';
    document.getElementById('resultStatus').style.color = result.passed ? '#4caf50' : '#f44336';
    document.getElementById('resultDate').textContent = formatDate(result.dateTaken);
    
    toggleSection('resultsSection');
}

function goBackToDashboard() {
    loadDashboard();
    toggleSection('dashboardSection');
}

function logout() {
    currentUser = null;
    currentExam = null;
    clearInterval(examTimer);
    
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    
    toggleSection('loginSection');
}

// =============== INITIALIZATION ===============
document.addEventListener('DOMContentLoaded', function() {
    // Default view is login
    toggleSection('loginSection');
});
