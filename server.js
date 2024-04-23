const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const guardiansData = require('./guardians.json');
const jewelsData = require('./jewels.json');
const quizQuestions = require('./quiz-questions.json');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render('index', { errorMessage: null });

});

app.get('/home', (req, res) => {
    res.render('home', { quizQuestions: quizQuestions, resultMessage: null });
});

app.get('/register', (req, res) => {
    res.render('registration');
});

app.get('/forgot_password', (req, res) => {
    res.render('forgot_password');
});

app.get('/register_two', (req, res) => {
    const userData = require('./userData.json');
    const guardiansData = require('./guardians.json');
    const selectedGuardiansIds = userData.guardians;
    const selectedGuardians = guardiansData.filter(guardian => selectedGuardiansIds.includes(guardian.id.toString()));
    const username = userData.name;
    res.render('registration_two', { username: username, guardians: selectedGuardians });
});

app.get('/login_two', (req, res) => {
    const userData = require('./userData.json');
    const guardiansData = require('./guardians.json');
    const selectedGuardiansIds = userData.guardians;
    const selectedGuardians = guardiansData.filter(guardian => selectedGuardiansIds.includes(guardian.id.toString()));
    const username = userData.name;
    res.render('login_register', { username: username, guardians: selectedGuardians });
});

app.get('/guardians', (req, res) => {
    res.json(guardiansData)
});

app.get('/jewels', (req, res) => {
    res.json(jewelsData)
});

app.post('/register', (req, res) => {
    const { name, guardians } = req.body;

    const userData = { name, guardians }

    const userDataPath = path.join(__dirname, 'userData.json');
    fs.writeFileSync(userDataPath, JSON.stringify(userData));

    res.redirect('/register_two')
});

app.post('/forgot_password', (req, res) => {
    const { name, guardians } = req.body;

    fs.readFile('userData.json', (err, data) => {
        if (err) {
            console.error('Error reading userData.json:', err);
            res.status(500).json({ success: false, message: 'An error occured while processing your request. Please try again later.' });
            return;
        }

        const userData = JSON.parse(data);

        if (userData.name === name && JSON.stringify(userData.guardians) === JSON.stringify(guardians)) {
            res.json({ success: true });
        } else {
            res.status(400).json({ success: false, message: 'Incorrect selection of guardians or incorrect name. Please try again or create a new account.' })
        }
    });
});

app.post('/register_two', (req, res) => {
    const { jewels } = req.body;

    fs.readFile('userData.json', (err, data) => {
        if (err) {
            console.error('Error reading userData.json:', err);
            return;
        }

        let userData = JSON.parse(data);

        userData.jewels = jewels;

        fs.writeFile('userData.json', JSON.stringify(userData, null, 2), (err) => {
            if (err) {
                console.error('Error writing to userData.json:', err);
                return;
            }
            console.log('userData.json updated successfully');
        });
    }
    );
    res.redirect('/home');
});

app.post('/login_two', (req, res) => {
    const { jewels } = req.body;

    fs.readFile('userData.json', (err, data) => {
        if (err) {
            console.error('Error reading userData.json:', err);
            res.status(500).json({ success: false, message: 'An error occured while processing your request. Please try again later.' });
            return;
        }

        const userData = JSON.parse(data);

        const storedJewelsString = JSON.stringify(userData.jewels);
        const inputJewelsString = JSON.stringify(jewels);

        if (storedJewelsString === inputJewelsString) {
            res.json({ success: true });
        } else {
            res.status(400).json({ success: false, message: 'Incorrect selection of jewels. Please try again.' })
        }
    });
});

app.post('/home', (req, res) => {
    let score = 0;

    quizQuestions.forEach((question, index) => {
        const userAnswer = req.body[`answer_${index}`];
        if (userAnswer === question.correctAnswer) {
            score++;
        }
    });

    const totalQuestions = quizQuestions.length;
    const resultMessage = `Your score: ${score}/${totalQuestions}`;

    res.render('home', { quizQuestions: quizQuestions, resultMessage: resultMessage });
});

app.post('/login', (req, res) => {
    const { username } = req.body;

    fs.readFile('userData.json', (err, data) => {
        if (err) {
            console.error('Error reading userData.json:', err);
            res.render('index', { errorMessage: null });
            return;
        }

        const userData = JSON.parse(data);

        if (userData.name === username) {
            res.redirect('/login_two');
        } else {
            res.render('index', { errorMessage: 'Incorrect username. Please try again.' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
