import axios from "axios";
import { config } from "dotenv";
import express, { Router, json, urlencoded } from "express";
import cors from "cors";
import WhatsApp from "whatsapp";

const app = express();
const router = new Router();

config();

// Variables
const PORT = process.env.PORT || 8080;
const ENVIRONMENT = process.env.NODE_ENV;

const META_VERSION = process.env.CLOUD_API_VERSION;
const META_TOKEN = process.env.CLOUD_API_ACCESS_TOKEN;
const SENDER_ID = process.env.WA_PHONE_NUMBER_ID;

app.use(json());
app.use(
  urlencoded({
    extended: true,
  })
);
app.use(cors());

router.post("/send-message", async (req, res) => {
  const wa = new WhatsApp(SENDER_ID);
  const { to, text } = req.body;
  try {
    const sent_text_message = await wa.messages.text(
      {
        body: text,
      },
      to
    );

    const data = await sent_text_message.responseBodyToJSON();

    if (sent_text_message.statusCode() == 200) {
      res.send(data);
    }
  } catch (error) {
    console.error(error);
  }
});

router.post("/read-message", async (req, res) => {
  const wa = new WhatsApp(SENDER_ID);

  function custom_callback(statusCode, headers, body, resp, err) {
    console.log(
      `Incoming webhook status code: ${statusCode}\n\nHeaders:
        ${JSON.stringify(headers)}\n\nBody: ${JSON.stringify(body)}`
    );

    if (resp) {
      resp.writeHead(200, { "Content-Type": "text/plain" });
      resp.end();
    }

    if (err) {
      console.log(`ERROR: ${err}`);
    }
  }

  console.log(wa.webhooks.start(custom_callback));
});

router.get("/", (req, res) => {
  res.send({ message: "Welcome" });
});

app.use("/api", router);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
