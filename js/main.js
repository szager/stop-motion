/* -*- mode: javascript; js-indent-level: 2 -*- */
'use strict';

var an;

window.onload = function() {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  var videoContainer = document.getElementById('video-container');
  var video = document.getElementById('video');
  //var audio = document.getElementById('audio');
  var topContainer = document.getElementById('top-container');
  var snapshotCanvas = document.getElementById('snapshot-canvas');
  var playCanvas = document.getElementById('play-canvas');
  var videoMessage = document.getElementById('video-message');
  var toggleButton = document.getElementById('toggleButton');
  var captureButton = document.getElementById('captureButton');
  var undoButton = document.getElementById('undoButton');
  var playButton = document.getElementById('playButton');
  var clearButton = document.getElementById('clearButton');
  var clearConfirmDialog = document.getElementById('clearConfirmDialog');
  var clearConfirmButton = document.getElementById('clearConfirmButton');
  var clearCancelButton = document.getElementById('clearCancelButton');
  var saveButton = document.getElementById('saveButton');
  var saveDialog = document.getElementById('saveDialog');
  var fileNameInput = saveDialog.querySelector('input');
  var saveConfirmButton = document.getElementById('saveConfirmButton');
  var saveCancelButton = document.getElementById('saveCancelButton');
  var loadButton = document.getElementById('loadButton');
  var recordAudioButton = document.getElementById('recordAudioButton');
  var clearAudioButton = document.getElementById('clearAudioButton');
  var playbackSpeedSelector = document.getElementById('playbackSpeed');
  var recordingIcons = document.querySelectorAll('.recording');
  var notRecordingIcons = document.querySelectorAll('.not-recording');
  var countdown = document.getElementById('countdown');
  var progressMarker = document.getElementById("progress-marker");
  var audioStream;
  
  var isRecording = false;
  
  var captureClicks = function (e) {e.stopPropagation()};

  var showSpinner = function() {
//    topContainer.style.opacity = 0.5;
//    topContainer.addEventListener('click', captureClicks, true);
  };

  var hideSpinner = function() {
//    topContainer.style.opacity = null;
//    topContainer.removeEventListener('click', captureClicks, true);
  };

  var saveCB = function () {
    var value = fileNameInput.value;
    if (!value.length)
      value = 'StopMotion';
    value = value.replace(/\s+/g, '_');
    value = value.replace(/[^\w\-\.]+/g, '');
    if (value.endsWith('.mng'))
      value = value.substring(0, value.length - 4);
    if (!value.endsWith('.webm'))
      value += '.webm';
    saveDialog.close();
    showSpinner();
    var startTime = performance.now();
    an.save(value).then(hideSpinner);
  };
  
  // Create Animator object and set up callbacks.
  //an = new animator.Animator(video, audio, snapshotCanvas, playCanvas, videoMessage);
  an = new animator.Animator(video, snapshotCanvas, playCanvas, videoMessage);
  an.frameTimeout = function() {
    return 1000.0 / playbackSpeedSelector.value;
  };

  window.addEventListener("keydown", function(e) {
    if (e.altKey || e.ctrlKey || e.shiftKey || clearConfirmDialog.open || saveDialog.open)
      return;
    if (e.code == "Space") {
      e.preventDefault();
      captureButton.click();
    }
    if (e.code == "Backspace") {
      e.preventDefault();
      undoButton.click();
    }
  });
  toggleButton.onclick = function() {
    an.toggleVideo();
    if (an.video.paused)
      toggleButton.firstChild.src = "images/on72.png";
    else
      toggleButton.firstChild.src = "images/off72.png";
  };
  captureButton.onclick = function () {
    an.capture();
    captureButton.style.backgroundColor = "#4682b4";
    setTimeout(function() {captureButton.style.backgroundColor = "";}, 250);
  };
  undoButton.onclick = function() {
    an.undoCapture();
    undoButton.style.backgroundColor = "#4682b4";
    setTimeout(function() {undoButton.style.backgroundColor = "";}, 250);
  };

  progressMarker.addEventListener("animationend", function() {
    progressMarker.classList.toggle("slide-right");
    progressMarker.style.transform = "translateX(0px)";
    setTimeout(function() {
      progressMarker.style.transform = "translateX(-650px)";
    }, 1000);
  });

  playButton.onclick = function() {
    progressMarker.style.animationDuration = (an.frames.length / playbackSpeedSelector.value) + "s";
    progressMarker.classList.add("slide-right");
    an.togglePlay();
  };

  clearButton.onclick = function() {
    if (!an.frames.length)
      return;
    clearConfirmDialog.showModal();
  };
  clearConfirmButton.onclick = function () {
    an.clear();
    clearConfirmDialog.close();
  };
  clearCancelButton.onclick = function () {
    clearConfirmDialog.close();
  };
  saveButton.onclick = function () {
    if (!an.frames.length)
      return;
    if (an.name)
      fileNameInput.value = an.name;
    saveConfirmButton.onclick = saveCB;
    saveDialog.showModal();
  };
  
  saveCancelButton.onclick = function () {
    saveDialog.close();
  };
  
  loadButton.onclick = function () {
    var fileInput = document.createElement('input');
    fileInput.type = "file";
    fileInput.addEventListener("change", function () {
      if (this.files[0]) {
        showSpinner();
        an.load(this.files[0], hideSpinner, function(frameRate) {
          playbackSpeedSelector.value = frameRate;
        });
      }
    }, false);
    fileInput.click();
  };

  function updateRecordingIcons(showNotRecording, showCountdown, showRecording) {
    recordingIcons.forEach(function(e) { e.style.display = (showRecording ? "" : "none") });
    notRecordingIcons.forEach(function(e) { e.style.display = (showNotRecording ? "" : "none") });
    countdown.style.display = (showCountdown ? "" : "none");
  }
  updateRecordingIcons(true, false, false);

  countdown.addEventListener("animationstart", function() {
    this.firstElementChild.innerHTML = "3";
  });
  countdown.addEventListener("animationiteration", function() {
    this.firstElementChild.innerHTML = (parseInt(this.firstElementChild.innerHTML) - 1).toString();
  });
  countdown.addEventListener("animationend", function() {
    this.firstElementChild.innerHTML = "";
    if (isRecording) {
      progressMarker.style.animationDuration = (an.frames.length / playbackSpeedSelector.value) + "s";
      progressMarker.classList.add("slide-right");
      an.recordAudio(audioStream).then(function() {
        isRecording = false;
        updateRecordingIcons(true, false, false);
        audioStream.getAudioTracks()[0].stop();
        audioStream = null;
      });
      updateRecordingIcons(false, false, true);
    } else {
      updateRecordingIcons(true, false, false);
    }
  });

  recordAudioButton.onclick = function() {
    if (!an.frames.length)
      return;
    if (isRecording) {
      an.endPlay();
      updateRecordingIcons(true, false, false);
    } else {
      navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function(stream) {
        audioStream = stream;
        updateRecordingIcons(false, true, false);
      });
    }
    isRecording = !isRecording;
  };
  
  clearAudioButton.onclick = function() {
    an.clearAudio();
  };
  
  function setUpCameraSelectAndAttach(cameras) {
    if (!cameras || cameras.length < 2) {
      an.attachStream();
      return;
    }
    var videoColumnDiv = document.getElementById('video-column');`
    var selectDiv = document.createElement('div');
    videoColumnDiv.appendChild(selectDiv);
    var cameraSelect = document.createElement('select');
    cameraSelect.id = 'camera-select';
    selectDiv.appendChild(cameraSelect);
    for (var i = 0; i < cameras.length; i++) {
      var cameraOption = document.createElement('option');
      cameraOption.value = cameras[i];
      cameraOption.innerText = 'Camera ' + (i + 1);
      cameraSelect.appendChild(cameraOption);
      if (i === 0)
        cameraOption.selected = true;
    }
    cameraSelect.onchange = function(e) {
      an.detachStream();
      an.attachStream(e.target.value);
    };
    an.attachStream(cameras[0].deviceId);
  }

  // Everything is set up, now connect to camera.
  if (self.navigator && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices().then(function(devices) {
      setUpCameraSelectAndAttach(
          devices.filter(function(d) { return d.kind == 'videoinput'; })
                 .map(function(d) { return d.deviceId; }));
    });
  } else if (self.MediaStreamTrack && MediaStreamTrack.getSources) {
    MediaStreamTrack.getSources(function(sources) {
      setUpCameraSelectAndAttach(
          sources.filter(function(d) { return d.kind == 'video'; })
                 .map(function(d) { return d.id; }));
      });
  } else {
    setUpCameraSelectAndAttach();
  }
};
