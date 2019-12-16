const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log('Server is running on port ' + port);
});

// const jwt = require('jsonwebtoken');

// const myFunc = async () => {
//   const token = jwt.sign({_id: '123'}, 'rewqwersdas', {expiresIn: '7 days'});
//   console.log(token);

//   const data = jwt.verify(token, 'rewqwersdas');
//   console.log(data);
// };

// myFunc();
