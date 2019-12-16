const express = require('express');
const router = new express.Router();
const User = require('../models/user');

router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/users/:id', async (req, res) => {
  const {id} = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/users', async ({body}, res) => {
  const user = new User(body);

  try {
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.patch('/users/:id', async ({body, params}, res) => {
  const {id} = params;
  const updates = Object.keys(body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperaion = updates
      .every((item) => allowedUpdates.includes(item));

  if (!isValidOperaion) {
    return res
        .status(400)
        .send({error: 'You are not allowed to edit this fields'});
  }

  try {
    const user = await User.findByIdAndUpdate(
        id,
        body,
        {new: true, runValidators: true},
    );

    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/users/:id', async ({params}, res) => {
  const {id} = params;
  console.log(id);

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
