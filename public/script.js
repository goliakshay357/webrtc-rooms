// COnnecting socket to our localhost3000 root path
const socket = io('/')
const videoGrid = document.getElementById('video-grid-others');
// const myPeer = new Peer(undefined, {
//   host: 'ec2-65-0-133-45.ap-south-1.compute.amazonaws.com',
//   port: '3001'
// })
const myPeer = new Peer();
console.log("Webpage loaded")
const peers = {}

// RooMID
let room_id = document.getElementById('room-id')
room_id.innerHTML = ROOM_ID;

// So you dont listen to your playback
const myVideo = document.createElement('video');
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then((stream) => {
  // ------------------------------------------------------------------
  // Adding my own video to the webpage
  let my_video = document.getElementById('my-video')
  let my_stream = document.createElement('video');
  my_stream.className = 'text-center'
  my_stream.srcObject = stream;
  my_stream.addEventListener('loadedmetadata', () => {
    my_stream.play()
  })
  my_video.append(my_stream);
  // ---------------------------------------------------------------------
  // 2 
  // Answer the call when someone calls from peerJS and add their stream
  myPeer.on('call', (call) => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    })
  })

  // Send my stream to others when new person is connected
  socket.on('user-connected', userId => {
    whenNewUserConnected(userId, stream);
  })

})

// As soon as frontend connected to peer server and got ID, the following is triggered
myPeer.on('open', (id) => {
  // Send to the server with room id and event ID
  socket.emit('join-room', ROOM_ID, id)
  // HTML part
  let user_id = document.getElementById('user-id')
  user_id.innerHTML = id
  // 
})


// When a user is connected
socket.on('user-connected', (userId) => {
  console.log("User connected", userId)
})

// when someone disconnects
socket.on('user-disconnected', (userId) => {
  if (peers[userId]) {
    peers[userId].close()
  }
})

function addVideoStream(video, stream) {
  // Play the video on webpage when captured. 
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video);
}

function whenNewUserConnected(userId, stream) {

  const call = myPeer.call(userId, stream)
  // Take their stream
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call;
}