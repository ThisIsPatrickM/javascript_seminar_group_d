const express = require('express');
const path = require('path');
const config = require('./config');
const app = express();


// test request
app.get('/api/test_template', (req, res) => {
    const template_test = require('./templates/test.json');
    res.json(template_test);
});

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.listen(config.PORT, () => console.log(`Server is running on ${config.PORT}`));