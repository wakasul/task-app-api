const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

router.get('/users/me', auth, (req, res) => {
  res.send(req.user);
});

router.post('/users', async ({body}, res) => {
  const user = new User(body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({user, token});
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/users/login', async ({body}, res) => {
  try {
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    res.send({user, token});
  } catch (error) {
    res.status(400).send({error: error.message});
  }
});

router.post('/users/logout', auth, async ({user, token}, res) => {
  try {
    user.tokens = user.tokens.filter((item) => item.token !== token);
    await user.save();

    res.send();
  } catch (error) {
    res.status(500).send({error: 'Unable to logout!'});
  }
});

router.post('/users/logoutAll', auth, async ({user}, res) => {
  try {
    user.tokens = [];
    await user.save();

    res.send();
  } catch (error) {
    res.status(500).send({error: 'Unable to logout!'});
  }
});

router.patch('/users/me', auth, async ({body, user}, res) => {
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
    updates.forEach((key) => user[key] = body[key]);
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/users/me', auth, async ({user}, res) => {
  try {
    await user.remove();
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
