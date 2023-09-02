// Node server which will handle socket io connections
const io = require('socket.io');
const express= require('express');
const bodyParser= require('body-parser');
const http=require('http')
const port=process.env.PORT||5000
var app=express();
let server = http.createServer(app);
const path = require('path')
var socketIO=io(server);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const users = {};

socketIO.on('connection', socket =>{
    // If any new user joins, let other users connected to the server know!
    socket.on('new-user-joined', name =>{   
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    // If someone sends a message, broadcast it to other people
    socket.on('send', message =>{
        socket.broadcast.emit('receive', {message: message, name: users[socket.id]})
    });

    // If someone leaves the chat, let others know 
    socket.on('disconnect', message =>{
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });


})
app.use('/static', express.static('static'));
app.use(express.urlencoded())

//PUG SPECIFIC STUFF
//set the templete engine as pug
app.set('view engine', 'pug');
// set the view directory
app.set('views',path.join(__dirname, 'views'));


// our pug demo endpoint
app.get("/",(req, res)=>{
   res.status(200).render('index.pug');
})
server.listen(port);