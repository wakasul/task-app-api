const express = require('express');
require('./db/mongoose');
const User = require('./models/user');
const Task = require('./models/task');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/users', ({ body }, res) => {
    const user = new User(body);
    user.save().then(() => {
        res.status(201).send(user);
    }).catch((error) => {
        console.log(error);
        res.status(400).send(error);
    });
});

app.post('/tasks', ({ body }, res) => {
    const task = new Task(body);
    task.save().then(() => {
        res.status(201).send(task);
    }).catch((error) => {
        console.log(error);
        res.status(400).send(error);
    });
});

app.listen(port, () => {
    console.log('Server is running on port ' + port);
});
