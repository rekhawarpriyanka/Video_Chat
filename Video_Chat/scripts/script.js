// Handle errors.
let handleError = function(err){
        console.log("Error: ", err);
};

// Query the container to which the remote stream belong.
let remoteContainer = document.getElementById("remote-container");

// Add video streams to the container.
function addVideoStream(elementId){
        // Creates a new div for every stream
        let streamDiv = document.createElement("div");
        // Assigns the elementId to the div.
        streamDiv.id = elementId;
        // Takes care of the lateral inversion
        streamDiv.style.transform = "rotateY(180deg)";
        // Adds the div to the container.
        remoteContainer.appendChild(streamDiv);
};

// Remove the video stream from the container.
function removeVideoStream(elementId) {
        let remoteDiv = document.getElementById(elementId);
        if (remoteDiv) remoteDiv.parentNode.removeChild(remoteDiv);
};

let client = AgoraRTC.createClient({
    mode: "rtc",
    codec: "vp8",
});

client.init("fd839c1fa32540b387302186bb3003de", function() {
    console.log("client initialized");
}, function(err) {
    console.log("client init failed ", err);
});

client.join("006fd839c1fa32540b387302186bb3003deIAA/G+jkLOUDsN+WvOjVksFFWgvVw7xpZTvLMvJ4vqAMV2+kpe0AAAAAEABQGUv2Pm4GYQEAAQA4bgZh", "Priyanka", null, (uid)=>{
  // Create a local stream
    let localStream = AgoraRTC.createStream({
    audio: true,
    video: true,
});
// Initialize the local stream
localStream.init(()=>{
    // Play the local stream
    localStream.play("me");
    // Publish the local stream
    client.publish(localStream, handleError);
}, handleError);
}, handleError);


// Subscribe to the remote stream when it is published
client.on("stream-added", function(evt){
    client.subscribe(evt.stream, handleError);
});
// Play the remote stream when it is subsribed
client.on("stream-subscribed", function(evt){
    let stream = evt.stream;
    let streamId = String(stream.getId());
    addVideoStream(streamId);
    stream.play(streamId);
});

// Remove the corresponding view when a remote user unpublishes.
client.on("stream-removed", function(evt){
    let stream = evt.stream;
    let streamId = String(stream.getId());
    stream.close();
    removeVideoStream(streamId);
});
// Remove the corresponding view when a remote user leaves the channel.
client.on("peer-leave", function(evt){
    let stream = evt.stream;
    let streamId = String(stream.getId());
    stream.close();
    removeVideoStream(streamId);
});

// UI buttons
function enableUiControls(localStream) {

    $("#mic-btn").prop("disabled", false);
    $("#video-btn").prop("disabled", false);
    $("#screen-share-btn").prop("disabled", false);
    $("#exit-btn").prop("disabled", false);
  
    $("#mic-btn").click(function(){
      toggleMic(localStream);
    });
  
    $("#video-btn").click(function(){
      toggleVideo(localStream);
    });
  
    $("#screen-share-btn").click(function(){
      toggleScreenShareBtn(); // set screen share button icon
      $("#screen-share-btn").prop("disabled",true); // disable the button on click
      if(screenShareActive){
        stopScreenShare();
      } else {
        initScreenShare(); 
      }
    });
  
    $("#exit-btn").click(function(){
      console.log("so sad to see you leave the channel");
      leaveChannel(); 
    });
  
    // keyboard listeners 
    $(document).keypress(function(e) {
      switch (e.key) {
        case "m":
          console.log("squick toggle the mic");
          toggleMic(localStream);
          break;
        case "v":
          console.log("quick toggle the video");
          toggleVideo(localStream);
          break; 
        case "s":
          console.log("initializing screen share");
          toggleScreenShareBtn(); // set screen share button icon
          $("#screen-share-btn").prop("disabled",true); // disable the button on click
          if(screenShareActive){
            stopScreenShare();
          } else {
            initScreenShare(); 
          }
          break;  
        case "q":
          console.log("so sad to see you quit the channel");
          leaveChannel(); 
          break;   
        default:  // do nothing
      }
  
      // (for testing) 
      if(e.key === "r") { 
        window.history.back(); // quick reset
      }
    });
  }
  
  function toggleBtn(btn){
    btn.toggleClass('btn-dark').toggleClass('btn-danger');
  }
  
  function toggleScreenShareBtn() {
    $('#screen-share-btn').toggleClass('btn-danger');
    $('#screen-share-icon').toggleClass('fa-share-square').toggleClass('fa-times-circle');
  }
  
  function toggleVisibility(elementID, visible) {
    if (visible) {
      $(elementID).attr("style", "display:block");
    } else {
      $(elementID).attr("style", "display:none");
    }
  }
  
  function toggleMic(localStream) {
    toggleBtn($("#mic-btn")); // toggle button colors
    $("#mic-icon").toggleClass('fa-microphone').toggleClass('fa-microphone-slash'); // toggle the mic icon
    if ($("#mic-icon").hasClass('fa-microphone')) {
      localStream.enableAudio(); // enable the local mic
      toggleVisibility("#mute-overlay", false); // hide the muted mic icon
    } else {
      localStream.disableAudio(); // mute the local mic
      toggleVisibility("#mute-overlay", true); // show the muted mic icon
    }
  }
  
  function toggleVideo(localStream) {
    toggleBtn($("#video-btn")); // toggle button colors
    $("#video-icon").toggleClass('fa-video').toggleClass('fa-video-slash'); // toggle the video icon
    if ($("#video-icon").hasClass('fa-video')) {
      localStream.enableVideo(); // enable the local video
      toggleVisibility("#no-local-video", false); // hide the user icon when video is enabled
    } else {
      localStream.disableVideo(); // disable the local video
      toggleVisibility("#no-local-video", true); // show the user icon when video is disabled
    }
  }