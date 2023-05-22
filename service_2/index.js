const express = require("express");
const amqplib = require("amqplib");

const app = express();
const PORT = 5001;

app.use(express.json());

connect();

async function connect() {
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    const exchange = "exchange4";

    await channel.assertExchange(exchange, "direct", { durable: false });
    const { queue } = await channel.assertQueue("", { exclusive: true });

    console.log(`Waiting for messages in ${queue}...`);

    channel.bindQueue(queue, exchange, "");

    channel.consume(queue, (msg) => {
      console.log(`Received message: ${msg.content.toString()}`);
    });
  } catch (error) {
    console.error(error);
  }
}

app.get("*", (req, res) => {
  res.status(404).send("Not found");
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
