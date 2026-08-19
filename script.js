// =============== DATA STORAGE ===============
let students = JSON.parse(localStorage.getItem('students')) || [];
let exams = JSON.parse(localStorage.getItem('exams')) || [];
let currentUser = null;
let currentAdmin = null;
let currentExam = null;
let examTimer = null;
let questionCount = 0;

// Default Admin Credentials
const adminCredentials = {
    email: 'admin@exam.com',
    password: "muhaa12345"
};

// =============== UTILITY FUNCTIONS ===============
function toggleSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

function showMessage(message, type = 'error') {
    const messageDiv = document.createElement('div');
    messageDiv.className = type;
    messageDiv.textContent = message;
    
    const card = document.querySelector('.card') || document.querySelector('.dashboard') || document.querySelector('.exam-container');
    if (card) {
        card.insertBefore(messageDiv, card.firstChild);
        setTimeout(() => messageDiv.remove(), 4000);
    }
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// =============== ADMIN LOGIN ===============
document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    if (email === adminCredentials.email && password === adminCredentials.password) {
        currentAdmin = { email, isAdmin: true };
        loadAdminDashboard();
        toggleSection('adminDashboardSection');
        showMessage('✅ Admin Login Successful!', 'success');
    } else {
        showMessage('❌ Invalid Admin Credentials!', 'error');
    }
});

// =============== ADMIN DASHBOARD ===============
function loadAdminDashboard() {
    loadStudentsList();
    loadResultsList();
}

function showAdminTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
    
    // Reload data
    if (tabName === 'students') {
        loadStudentsList();
    } else if (tabName === 'results') {
        loadResultsList();
    } else if (tabName === 'exams') {
        initializeCreateExamForm();
    }
}

// =============== STUDENTS MANAGEMENT ===============
function loadStudentsList() {
    const studentsList = document.getElementById('studentsList');
    
    if (students.length === 0) {
        studentsList.innerHTML = '<p style="text-align: center; padding: 20px;">No students registered yet.</p>';
        return;
    }
    
    let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Uni Reg No</th>
                    <th>Registered Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    students.forEach(student => {
        html += `
            <tr>
                <td>${student.firstName} ${student.lastName}</td>
                <td>${student.email}</td>
                <td>${student.phone}</td>
                <td>${student.uniRegNum}</td>
                <td>${formatDate(new Date(student.id))}</td>
                <td>
                    <button class="btn btn-info" onclick="viewStudentDetails('${student.id}')">View Details</button>
                    <button class="btn btn-danger" onclick="deleteStudent('${student.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    studentsList.innerHTML = html;
}

function viewStudentDetails(studentId) {
    const student = students.find(s => s.id == studentId);
    
    if (!student) return;
    
    const detailsContent = document.getElementById('studentDetailsContent');
    
    let html = `
        <div class="student-details">
            <p><strong>Name:</strong> ${student.firstName} ${student.lastName}</p>
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>Phone:</strong> ${student.phone}</p>
            <p><strong>Date of Birth:</strong> ${formatDate(student.dateOfBirth)}</p>
            <p><strong>University Reg No:</strong> ${student.uniRegNum}</p>
            <p><strong>Address:</strong> ${student.address}</p>
            <p><strong>City:</strong> ${student.city}</p>
            <p><strong>State:</strong> ${student.state}</p>
            <p><strong>Completed Exams:</strong> ${student.completedExams.length}</p>
            
            <h3>Exam Results:</h3>
    `;
    
    if (student.completedExams.length === 0) {
        html += '<p>No exams completed yet.</p>';
    } else {
        student.completedExams.forEach(result => {
            html += `
                <div style="background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 5px;">
                    <p><strong>${result.examName}</strong></p>
                    <p>Score: ${result.score}/${result.totalQuestions} (${result.percentage}%)</p>
                    <p>Status: ${result.passed ? '✓ PASSED' : '✗ FAILED'}</p>
                    <p>Date: ${formatDate(result.dateTaken)}</p>
                </div>
            `;
        });
    }
    
    html += '</div>';
    
    detailsContent.innerHTML = html;
    document.getElementById('studentDetailsModal').classList.add('show');
}

function closeStudentModal() {
    document.getElementById('studentDetailsModal').classList.remove('show');
}

function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        students = students.filter(s => s.id != studentId);
        localStorage.setItem('students', JSON.stringify(students));
        loadStudentsList();
        showMessage('✅ Student deleted successfully!', 'success');
    }
}

// =============== EXAM CREATION ===============
function initializeCreateExamForm() {
    const questionsForm = document.getElementById('questionsForm');
    questionsForm.innerHTML = '';
    questionCount = 0;
    addQuestionForm();
}

function addQuestionForm() {
    questionCount++;
    
    const questionBlock = document.createElement('div');
    questionBlock.className = 'question-block';
    questionBlock.id = 'question-' + questionCount;
    
    let html = `
        <h4>Question ${questionCount}</h4>
        
        <div class="form-group">
            <label>Question Text:</label>
            <textarea class="question-text-${questionCount}" placeholder="Enter question"></textarea>
        </div>
        
        <div class="form-group">
            <label>Answer Options:</label>
        </div>
    `;
    
    // Add 4 answer options
    for (let i = 1; i <= 4; i++) {
        html += `
            <div class="option-input">
                <input type="text" class="option-${questionCount}-${i}" placeholder="Option ${i}">
                <input type="radio" name="correct-${questionCount}" value="${i-1}" style="width: auto;"> Correct Answer
            </div>
        `;
    }
    
    html += `<button class="remove-question" onclick="removeQuestion('question-${questionCount}')">Remove Question</button>`;
    
    questionBlock.innerHTML = html;
    document.getElementById('questionsForm').appendChild(questionBlock);
}

function removeQuestion(questionId) {
    if (questionCount > 1) {
        document.getElementById(questionId).remove();
        questionCount--;
        showMessage('✅ Question removed!', 'success');
    } else {
        showMessage('❌ You must have at least one question!', 'error');
    }
}

function saveExam() {
    const title = document.getElementById('examTitle').value;
    const description = document.getElementById('examDescription').value;
    const duration = parseInt(document.getElementById('examDuration').value);
    const passingScore = parseInt(document.getElementById('examPassingScore').value);
    
    if (!title || !description || !duration || !passingScore) {
        showMessage('❌ Please fill in all exam details!', 'error');
        return;
    }
    
    const questions = [];
    const questionBlocks = document.querySelectorAll('.question-block');
    
    questionBlocks.forEach((block, index) => {
        const questionNum = index + 1;
        const questionText = document.querySelector(`.question-text-${questionNum}`).value;
        
        if (!questionText) {
            showMessage(`❌ Please fill in Question ${questionNum} text!`, 'error');
            throw new Error('Empty question text');
        }
        
        const options = [];
        let correctAnswer = null;
        
        for (let i = 1; i <= 4; i++) {
            const optionText = document.querySelector(`.option-${questionNum}-${i}`).value;
            if (!optionText) {
                showMessage(`❌ Please fill in all options for Question ${questionNum}!`, 'error');
                throw new Error('Empty option');
            }
            options.push(optionText);
        }
        
        const correctRadio = document.querySelector(`input[name="correct-${questionNum}"]:checked`);
        if (!correctRadio) {
            showMessage(`❌ Please select correct answer for Question ${questionNum}!`, 'error');
            throw new Error('No correct answer selected');
        }
        
        correctAnswer = parseInt(correctRadio.value);
        
        questions.push({
            id: questionNum,
            text: questionText,
            options: options,
            correctAnswer: correctAnswer
        });
    });
    
    const newExam = {
        id: Date.now(),
        title: title,
        description: description,
        duration: duration,
        passingScore: passingScore,
        totalQuestions: questions.length,
        questions: questions,
        createdDate: new Date().toISOString()
    };
    
    exams.push(newExam);
    localStorage.setItem('exams', JSON.stringify(exams));
    
    showMessage('✅ Exam created successfully!', 'success');
    
    // Reset form
    document.getElementById('examTitle').value = '';
    document.getElementById('examDescription').value = '';
    document.getElementById('examDuration').value = '30';
    document.getElementById('examPassingScore').value = '60';
    initializeCreateExamForm();
}

// =============== RESULTS MANAGEMENT ===============
function loadResultsList() {
    const resultsList = document.getElementById('resultsList');
    
    let allResults = [];
    
    // Collect all results from all students
    students.forEach(student => {
        student.completedExams.forEach(result => {
            allResults.push({
                studentName: `${student.firstName} ${student.lastName}`,
                studentEmail: student.email,
                ...result
            });
        });
    });
    
    if (allResults.length === 0) {
        resultsList.innerHTML = '<p style="text-align: center; padding: 20px;">No exam results yet.</p>';
        return;
    }
    
    let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Exam Name</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    allResults.forEach((result, index) => {
        const statusBadge = result.passed ? '✓ PASSED' : '✗ FAILED';
        const statusColor = result.passed ? '#4caf50' : '#f44336';
        
        html += `
            <tr>
                <td>${result.studentName}</td>
                <td>${result.studentEmail}</td>
                <td>${result.examName}</td>
                <td>${result.score}/${result.totalQuestions}</td>
                <td>${result.percentage}%</td>
                <td><span style="color: ${statusColor}; font-weight: bold;">${statusBadge}</span></td>
                <td>${formatDate(result.dateTaken)}</td>
                <td>
                    <button class="btn btn-info" onclick="viewResultDetails(${index}, '${JSON.stringify(result).replace(/'/g, "&#39;")}')" >View Details</button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    resultsList.innerHTML = html;
}

function viewResultDetails(index, resultJson) {
    const result = JSON.parse(resultJson);
    
    const detailsContent = document.getElementById('resultsDetailsContent');
    
    let html = `
        <div class="result-details">
            <p><strong>Student Name:</strong> ${result.studentName}</p>
            <p><strong>Student Email:</strong> ${result.studentEmail}</p>
            <p><strong>Exam Name:</strong> ${result.examName}</p>
            <p><strong>Score:</strong> ${result.score}/${result.totalQuestions}</p>
            <p><strong>Percentage:</strong> ${result.percentage}%</p>
            <p><strong>Status:</strong> ${result.passed ? '✓ PASSED' : '✗ FAILED'}</p>
            <p><strong>Date Taken:</strong> ${formatDate(result.dateTaken)}</p>
        </div>
    `;
    
    detailsContent.innerHTML = html;
    document.getElementById('resultsDetailsModal').classList.add('show');
}

function closeResultsModal() {
    document.getElementById('resultsDetailsModal').classList.remove('show');
}

function adminLogout() {
    currentAdmin = null;
    toggleSection('adminLoginSection');
    document.getElementById('adminLoginForm').reset();
    showMessage('✅ Admin logged out!', 'success');
}

// =============== STUDENT REGISTRATION ===============
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('regEmail').value;
    
    if (students.some(s => s.email === email)) {
        showMessage('❌ Email already registered!', 'error');
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
    
    showMessage('✅ Registration successful! Please login.', 'success');
    document.getElementById('registerForm').reset();
    
    setTimeout(() => toggleSection('loginSection'), 1500);
});

// =============== STUDENT LOGIN ===============
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const student = students.find(s => s.email === email && s.password === password);
    
    if (!student) {
        showMessage('❌ Invalid email or password!', 'error');
        return;
    }
    
    currentUser = student;
    loadDashboard();
    toggleSection('dashboardSection');
    showMessage('✅ Login successful!', 'success');
});

// =============== STUDENT DASHBOARD ===============
function loadDashboard() {
    document.getElementById('studentName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('infoEmail').textContent = currentUser.email;
    document.getElementById('infoUniReg').textContent = currentUser.uniRegNum;
    document.getElementById('infoPhone').textContent = currentUser.phone;
    document.getElementById('infoDOB').textContent = formatDate(currentUser.dateOfBirth);
    document.getElementById('infoAddress').textContent = currentUser.address;
    document.getElementById('infoCity').textContent = currentUser.city;
    
    loadExamsList();
}

function loadExamsList() {
    const examsList = document.getElementById('examsList');
    examsList.innerHTML = '';
    
    if (exams.length === 0) {
        examsList.innerHTML = '<p style="text-align: center; padding: 40px;">No exams available yet.</p>';
        return;
    }
    
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

// =============== EXAM TAKING ===============
function startExam(examId) {
    currentExam = exams.find(e => e.id === examId);
    
    if (!currentExam) return;
    
    document.getElementById('examTitle').textContent = currentExam.title;
    loadExamQuestions();
    
    let timeLeft = currentExam.duration * 60;
    updateTimer(timeLeft);
    
    examTimer = setInterval(() => {
        timeLeft--;
        updateTimer(timeLeft);
        
        if (timeLeft <= 0) {
            clearInterval(examTimer);
            submitExam();
            showMessage('⏰ Time ended! Exam submitted automatically.', 'success');
        }
    }, 1000);
    
    toggleSection('examSection');
    showMessage('📝 Exam started! Answer all questions carefully.', 'success');
}

function updateTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('timer').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    
    if (seconds <= 300) {
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
    clearInterval(examTimer);
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
    showMessage('✅ Logged out successfully!', 'success');
}

// =============== INITIALIZATION ===============
document.addEventListener('DOMContentLoaded', function() {
    toggleSection('adminLoginSection');
    
    console.log('%c🎓 STUDENT EXAM PLATFORM', 'font-size: 16px; font-weight: bold; color: #667eea;');
    console.log('%cAdmin Credentials:', 'color: #333;');
    console.log('%cEmail: admin@exam.com', 'color: #333;');
    console.log('%cPassword: admin123', 'color: #333;');
});
