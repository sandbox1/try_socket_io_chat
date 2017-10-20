var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

let user_num = 100
let user_map = {}
let room = undefined
let username = undefined
io.on('connection', function (socket) {
  
  user_num++
  username = 'User' + user_num 
  
  if(user_num % 2 == 0){
    room = 'even'
  } else {
    room = 'odd'
  }
  
  socket.join(room)
  user_map[socket.client.id] = username
  console.log(`${username} joined room ${room}`)
  
  io.to(room).emit('user-connected', { name: user_map[socket.client.id], time: socket.handshake.time })

  socket.on('disconnect', function () {
    let user = user_map[socket.client.id]
    delete user_map[socket.client.id]
    socket.to(room).broadcast.emit('user-disconnected', user + ' disconnected')
  })

  socket.on('user-message', function (msg) {
    socket.to(room).broadcast.emit('user-message', msg)
  })

  socket.on('user-typing', function (user) {
    socket.to(room).broadcast.emit('user-typing', user)
  })

  socket.on('user-not-typing', function (user) {
    socket.to(room).broadcast.emit('user-not-typing')
  })
})

http.listen(3011, function () {

  console.log('listening on *:3011')
})

