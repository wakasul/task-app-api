const express = require('express');
const router = new express.Router();
const Task = require('../models/task');

router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/tasks/:id', async (req, res) => {
  const {id} = req.params;

  try {
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/tasks', async ({body}, res) => {
  const task = new Task(body);

  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.patch('/tasks/:id', async ({params, body}, res) => {
  const {id} = params;
  const allowedUpdates = ['description', 'completed'];
  const updates = Object.keys(body);
  const isUpdateAllowed = updates
      .every((item) => allowedUpdates.includes(item));

  if (!isUpdateAllowed) {
    return res
        .status(400)
        .send({error: 'You are not allowed to edit this fields'});
  }

  try {
    const task = await Task.findByIdAndUpdate(
        id,
        body,
        {new: true, runValidators: true},
    );

    if (!task) {
      res.status(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/tasks/:id', async ({params}, res) => {
  const {id} = params;

  try {
    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
