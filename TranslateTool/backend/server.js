const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const axios = require("axios");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");

dotenv.config();
connectDB();
const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/user", userRoutes);
//app.use("/api/chat", chatRoutes);

//deployment code -----------------------------------------

// const __dirname1 = path.resolve();
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "/frontend/build")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
//   });
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running");
//   });
// }

//------------------------------------------------------------

app.get("/", (req, res) => {
  res.send("API is running");
});

const apiUrl = "http://localhost:7000/text-to-text"; // Replace with your API URL

// Define the data you want to send in the request body
const requestData = {
  from_lang: "english",
  to_lang: "spanish",
  query: "Hello, how are you?",
};

// Send the POST request to your Flask API
axios
  .post(apiUrl, requestData)
  .then((response) => {
    // Handle the API response here
    console.log("Response from Flask API:", response.data);
  })
  .catch((error) => {
    // Handle any errors that occurred during the request
    console.error("Error:", error);
  });

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}.`);
});
