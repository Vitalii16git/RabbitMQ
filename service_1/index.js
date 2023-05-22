require("dotenv").config();
const express = require("express");
const amqplib = require("amqplib");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./models/User.js");
const mongoose = require("mongoose");

const app = express();
const PORT = 4001;

app.use(express.json());

async function registerUser(
  channel,
  exchange_register,
  queue_createdUser,
  queue_error
) {
  await channel.assertExchange(exchange_register, "direct", { durable: false });
  const { queue: queue_register } = await channel.assertQueue("", {
    exclusive: true,
  });
  console.log(`Waiting for messages in ${queue_register}...`);
  channel.bindQueue(queue_register, exchange_register, "");

  channel.consume(queue_register, async (data) => {
    try {
      const { username, email, password } = JSON.parse(data.content);
      const hash = await bcrypt.hash(password, 10);
      const user = new User({ username, email, password: hash });
      await user.save();

      channel.ack(data);
      channel.sendToQueue(queue_createdUser, Buffer.from(JSON.stringify(user)));
    } catch (error) {
      channel.ack(data);
      const errorObject = JSON.parse(JSON.stringify(error));
      console.log("ERROR : ", JSON.parse(JSON.stringify(error)));
      channel.sendToQueue(
        queue_error,
        Buffer.from(JSON.stringify(errorObject.code))
      );
    }
  });

  return;
}

async function generateToken(channel, exchange_login, queue_auth) {
  await channel.assertExchange(exchange_login, "direct", { durable: false });
  const { queue: queue_login } = await channel.assertQueue("", {
    exclusive: true,
  });
  console.log(`Waiting for messages in ${queue_login}...`);
  channel.bindQueue(queue_login, exchange_login, "");

  channel.consume(queue_login, async (data) => {
    const { user } = JSON.parse(data.content);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    channel.ack(data);
    channel.sendToQueue(queue_auth, Buffer.from(token));
  });
  return;
}

async function connect() {
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    return channel;
  } catch (error) {
    console.error(error);
  }
}

connect().then(async (channel) => {
  const exchange_login = "login";
  const exchange_register = "register";
  const queue_auth = "authenticated";
  const queue_createdUser = "createdUser";
  const queue_error = "error";

  await registerUser(
    channel,
    exchange_register,
    queue_createdUser,
    queue_error
  );

  await generateToken(channel, exchange_login, queue_auth);
});
//   const exchange_login = "login";

//   await channel.assertExchange(exchange_login, "direct", { durable: false });
//   const { queue } = await channel.assertQueue("", { exclusive: true });

//   console.log(`Waiting for messages in ${queue}...`);

//   channel.bindQueue(queue, exchange_login, "");

//   channel.consume(queue, async (data) => {
//     const { user } = JSON.parse(data.content);

//     const token = await generateToken(user);

//     const queue_auth = "authenticated";

//     channel.ack(data);
//     channel.sendToQueue(queue_auth, Buffer.from(token));
//   });

//   return channel;
// })
// .then(async (channel) => {
//   try {
//     const exchange_register = "register";

//     await channel.assertExchange(exchange_register, "direct", {
//       durable: false,
//     });
//     const { queue } = await channel.assertQueue("", { exclusive: true });

//     console.log(`Waiting for messages in ${queue}...`);

//     channel.bindQueue(queue, exchange_register, "");

//     channel.consume(queue, async (data) => {
//       const { username, email, password } = JSON.parse(data.content);

//       const createdUser = await registerUser(username, email, password);

//       const queue_register = "createdUser";

//       channel.ack(data);
//       channel.sendToQueue(
//         queue_register,
//         Buffer.from(JSON.stringify(createdUser))
//       );
//     });
//   } catch (error) {
//     const queue_error = "error";
//     channel.ack(data);
//     channel.sendToQueue(
//       queue_error,
//       Buffer.from(JSON.stringify({ error: error.message }))
//     );
//   }
// });

app.get("*", (req, res) => {
  res.status(404).send("Not found");
});

const start = async () => {
  await mongoose
    .connect(process.env.MONGO_URL, { useNewUrlParser: true })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));

  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
};

start();
