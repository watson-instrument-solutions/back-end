const {app, HOST, PORT} = require('./server');
const { databaseConnect } = require('./database')
const express = require('express');

// Activate the server below the line

app.listen(PORT, HOST, async () => {
    await databaseConnect();
    console.log(`Server running on port ${PORT}`);
});