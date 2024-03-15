const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRouter = require('./routes/auth');
const messageRouter = require('./routes/message');

const app = express();

require('dotenv').config();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors());


app.use('/auth', authRouter);
app.use('/contact', messageRouter);


app.use((error, req, res, next) => {

    console.log(error);

    const status = error.statusCode || 500;
    const message = error.message;

    res.status(status).json({message});
    
    next();
})


mongoose.connect(process.env.MONGODB_URL);
app.listen(PORT, () => console.log(`server is running on ${PORT}`));