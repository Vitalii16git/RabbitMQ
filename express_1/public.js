const express = require("express");
const amqplib = require("amqplib");

const app = express();
const PORT = 3001;

app.use(express.json());

let channel, connection;

const queue = "order";
const exchange1 = "exchange3";
const exchange2 = "exchange4";

connect();

async function connect() {
  try {
    const amqpServer = "amqp://localhost:5672";
    connection = await amqplib.connect(amqpServer);
    channel = await connection.createChannel();

    // make sure that the order channel is created, if not this statement will create it
    await channel.assertQueue(queue);
  } catch (error) {
    console.log(error);
  }
}

app.post("/register", (req, res) => {
  const data = req.body;

  channel.assertExchange(exchange1, "direct", {
    durable: false,
  });

  channel.publish(
    exchange1,
    "",
    Buffer.from(
      JSON.stringify({
        ...data,
        date: new Date(),
      })
    )
  );
});

app.post("/endpoint1", (req, res) => {
  const data = req.body;

  channel.assertExchange(exchange1, "direct", {
    durable: false,
  });

  channel.publish(
    exchange1,
    "",
    Buffer.from(
      JSON.stringify({
        ...data,
        date: new Date(),
      })
    )
  );

  res.send("Message from endpoint 1 submitted");
});

app.post("/endpoint2", (req, res) => {
  const data = req.body;

  channel.assertExchange(exchange2, "direct", {
    durable: false,
  });

  channel.publish(
    exchange2,
    "",
    Buffer.from(
      JSON.stringify({
        ...data,
        date: new Date(),
      })
    )
  );

  res.send("Message from endpoint 2 submitted");
});

app.get("*", (req, res) => {
  res.status(404).send("Not found");
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
