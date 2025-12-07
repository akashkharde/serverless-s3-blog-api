import dbConnection from "./config/dbConnection.js";
import express from "express";
import compression from "compression"
import { errorMiddleware } from "./utils/errorMiddleware.js";
import authRoutes from "./routes/auth.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import { sThreePresinedUrl } from "./config/sThreePresinedUrl.js";

const app = express();
//client sent json express convert into javascript object
app.use(express.json());
//enable Gzip commpression JSON response size = 100 KB After Gzip = 20 KB , Less data goes through network → lower bandwidth usage.
app.use(compression()); 

dbConnection(process.env.DB_URL);


app.get('/api/v1/status' ,( req, res) => {
  res.status(200).json({
    success: true,
    message: "Healthy"
  })
})

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/blogs", blogRoutes);

app.post('/api/v1/get-presigned-url', sThreePresinedUrl)

app.use(errorMiddleware)
if(!process.env.PORT){
  console.error("PORT not found");
  process.exit(1);
};

const server = app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${server.address().port}`);
});

server.on("error", (err) => {
  console.error("❌ Server start error:", err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason)=>{
  console.error("❌ unhandled rejection", reason);
  process.exit(1);
});

process.on('uncaughtException', (reason)=>{
  console.error("❌ unhandled rejection", reason);
  process.exit(1);
});