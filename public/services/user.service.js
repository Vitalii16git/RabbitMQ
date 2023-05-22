const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const amqplib = require("amqplib");
const errorMessage = require("../utils/error.messages.js");

let channel, connection;

async function connect() {
  try {
    const amqpServer = "amqp://localhost:5672";
    connection = await amqplib.connect(amqpServer);
    channel = await connection.createChannel();

    // make sure that the order channel is created, if not this statement will create it
    await channel.assertQueue("order");
    await channel.assertQueue("authenticated");
    await channel.assertQueue("createdUser");
    await channel.assertQueue("error");
  } catch (error) {
    console.log(errorMessage.rabbitMQConnectionError, error);
  }
}

connect();

class UserService {
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      const exchange_register = "register";

      channel.assertExchange(exchange_register, "direct", {
        durable: false,
      });

      channel.publish(
        exchange_register,
        "",
        Buffer.from(
          JSON.stringify({
            username,
            email,
            password,
          })
        )
      );

      const queue_error = "error";
      let error = false;
      let duplicateError = false;

      await channel.consume(queue_error, (data) => {
        error = true;
        const errorCodeFromRabbit = data.content.toString();

        if (+errorCodeFromRabbit === 11000) {
          duplicateError = true;
        }

        channel.ack(data);
      });

      if (duplicateError) {
        res.status(400).json({ message: errorMessage.duplicateUser });
        return;
      }

      if (error) {
        res.status(500).json({ message: errorMessage.serverError });
        return;
      }

      const queue_register = "createdUser";
      let user;

      await channel.consume(queue_register, (data) => {
        user = JSON.parse(data.content);

        console.log("USER : ", user);
        channel.ack(data);
      });

      res.status(201).json({ user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: errorMessage.serverError });
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(401)
          .json({ message: errorMessage.errorAuthorization });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res
          .status(401)
          .json({ message: errorMessage.errorAuthorization });
      }

      const exchange_login = "login";

      channel.assertExchange(exchange_login, "direct", {
        durable: false,
      });

      channel.publish(
        exchange_login,
        "",
        Buffer.from(
          JSON.stringify({
            user,
            password,
          })
        )
      );

      const queue_auth = "authenticated";
      let token;

      await channel.consume(queue_auth, (data) => {
        token = data.content.toString();
        console.log("TOKEN : ", token);

        channel.ack(data);
      });

      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: errorMessage.serverError });
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await User.find();
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: errorMessage.serverError });
    }
  }

  async getUser(id, res, next) {
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: errorMessage.userNotFound });
      }
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: errorMessage.serverError });
    }
  }

  async updateUser(req, res, next) {
    try {
      const { username, password } = req.body;
      const hash = await bcrypt.hash(password, 10);
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { new: true },
        {
          username,
          password: hash,
        }
      );
      if (!user) {
        return res.status(404).json({ message: errorMessage.userNotFound });
      }
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: errorMessage.serverError });
    }
  }

  async deleteUser(id, res, next) {
    try {
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ message: errorMessage.userNotFound });
      }
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: errorMessage.serverError });
    }
  }
}

module.exports = new UserService();
