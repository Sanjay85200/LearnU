const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('LearnU API is running');
});

// We will mount routes here later

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
