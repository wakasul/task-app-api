const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

router.get('/tasks', auth, async ({user, query}, res) => {
  const {completed, limit, skip, sortBy} = query;
  const match = {};
  const sort = {};

  if (completed !== undefined) {
    match.completed = completed === 'true';
  }

  if (sortBy) {
    const parts = sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  try {
    await user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        sort,
      },
    }).execPopulate();
    res.send(user.tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/tasks/:id', auth, async ({user, params}, res) => {
  const {id: taskId} = params;
  const {_id: userId} = user;

  try {
    const task = await Task.findOne({_id: taskId, owner: userId});

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/tasks', auth, async ({body, user}, res) => {
  const task = new Task({
    ...body,
    owner: user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.patch('/tasks/:id', auth, async ({params, body, user}, res) => {
  const {id: taskId} = params;
  const {_id: userId} = user;

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
    const task = await Task.findOne({_id: taskId, owner: userId});

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((key) => task[key] = body[key]);
    await task.save();

    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/tasks/:id', auth, async ({params, user}, res) => {
  const {id: taskId} = params;
  const {_id: userId} = user;

  try {
    const task = await Task.findOneAndDelete({_id: taskId, owner: userId});

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
