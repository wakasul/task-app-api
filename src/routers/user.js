const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const {sendWelcomeEmail, sendCancellationEmail} = require('../emails/account');

router.get('/users/me', auth, (req, res) => {
  res.send(req.user);
});

router.post('/users', async ({body}, res) => {
  const user = new User(body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
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
    sendCancellationEmail(user.email, user.name);
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Avatar must be an image'));
    }

    cb(undefined, true);
  },
});

router.post(
    '/users/me/avatar',
    auth,
    upload.single('avatar'),
    async (req, res) => {
      const buffer = await sharp(req.file.buffer)
          .png()
          .resize({width: 250, height: 250})
          .toBuffer();

      req.user.avatar = buffer;
      await req.user.save();
      res.send();
    }, ({message}, req, res, next) => {
      res.status(400).send({error: message});
    },
);

router.delete(
    '/users/me/avatar',
    auth,
    async (req, res) => {
      req.user.avatar = undefined;
      await req.user.save();
      res.send();
    },
);

router.get(
    '/users/:id/avatar',
    async (req, res) => {
      try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
          throw new Error();
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
      } catch (error) {
        res.status(404).send();
      }
    },
);

module.exports = router;
