const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// cors
app.use(cors());

// body parsed
app.use(bodyParser.json());

const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/shop', shopRoutes);

// error handling
app.use((error, req, res, next) => {
    console.log('--ERROR--',error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({
        message: message,
        data: data
    })
});


// DB COnnect
mongoose.connect(
    'mongodb+srv://rdvnbyr:CtF0AoKcm7qkQJuP@cluster0.e7gk5.mongodb.net/meet-hub?retryWrites=true&w=majority',
    { useNewUrlParser: true }
)
.then( result => {
    app.listen(process.env.PORT || 8080);
})
.catch( err => console.log('DB_ERROR', err));