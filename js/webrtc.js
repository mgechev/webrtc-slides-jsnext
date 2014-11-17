(function () {

  window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
  window.URL = window.URL || window.mozURL || window.webkitURL;
  window.navigator.getUserMedia = window.navigator.getUserMedia || window.navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia;

  var localVideo = document.getElementById('local-video'),
      remoteVideo = document.getElementById('remote-video'),
      socket = io.connect('http://localhost:5555'),
      clientConnected = false,
      offered = false,
      cameraEnabled = false,
      localObjectUrl,
      iceConfig = { 'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }]},
      peerConnection = new RTCPeerConnection(iceConfig);

  peerConnection.onicecandidate = function (evnt) {
    socket.emit('msg', { room: roomId, ice: evnt.candidate, type: 'ice' });
  };

  peerConnection.onaddstream = function (evnt) {
    localVideo.classList.remove('active');
    remoteVideo.src = URL.createObjectURL(evnt.stream);
  };

  socket.on('app-url', function (data) {
    roomId = (data.match(/room=(\d+)/) || [])[1],
    socket.emit('init', { room: roomId });
    document.getElementById('url-input').value = data;
  });

  socket.on('peer.connected', function () {
    clientConnected = true;
    if (!offered && cameraEnabled)
      makeOffer();
  });

  socket.on('msg', handleMessage);

  function makeOffer() {
    offered = true;
    peerConnection.createOffer(function (sdp) {
      peerConnection.setLocalDescription(sdp);
      socket.emit('msg', { room: roomId, sdp: sdp, type: 'sdp-offer' });
    }, null,
    {'mandatory': { 'OfferToReceiveVideo': true, 'OfferToReceiveAudio': true }});
  }

  function handleMessage(data) {
    switch (data.type) {
      case 'sdp-offer':
      peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      peerConnection.createAnswer(function (sdp) {
        peerConnection.setLocalDescription(sdp);
        socket.emit('msg', { room: roomId, sdp: sdp, type: 'sdp-answer' });
      });
      break;
      case 'sdp-answer':
      peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      break;
      case 'ice':
      if (data.ice)
        peerConnection.addIceCandidate(new RTCIceCandidate(data.ice));
      break;
    }
  }

  navigator.getUserMedia({ video: true, audio: true }, function (stream) {
    localObjectUrl = URL.createObjectURL(stream);
    localVideo.src = localObjectUrl;
    peerConnection.addStream(stream);
    cameraEnabled = true;
    if (clientConnected)
      makeOffer();
  }, function () {
    console.log('error');
  });

}());
