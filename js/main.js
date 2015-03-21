'use strict';

var an;

window.onload = function() {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  var video = document.getElementById('video');
  var streamCanvas = document.getElementById('stream');
  var snapshotCanvas = document.getElementById('snapshot');
  var toggleButton = document.getElementById('toggleButton');
  var captureButton = document.getElementById('captureButton');
  var undoButton = document.getElementById('undoButton');
  var playButton = document.getElementById('playButton');
  var clearButton = document.getElementById('clearButton');
  var clearConfirmButton = document.getElementById('clearConfirmButton');
  var clearCancelButton = document.getElementById('clearCancelButton');
  var saveButton = document.getElementById('saveButton');
  var loadButton = document.getElementById('loadButton');
  var exportButton = document.getElementById('exportButton');
  var playbackSpeedSelector = document.getElementById('playbackSpeed');

  var showSpinner = function() {
  };
  var hideSpinner = function() {
  };

  // Create Animator object and set up callbacks.
  an = new animator.Animator(video, streamCanvas, snapshotCanvas);
  an.frameTimeout = function() {
    return 1000.0 / playbackSpeedSelector.value;
  };
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
    setTimeout(function() {captureButton.style.backgroundColor = "#b0c4de";}, 500);
  };
  undoButton.onclick = an.undoCapture.bind(an);
  playButton.onclick = an.togglePlay.bind(an);
  clearButton.onclick = function() {
    if (an.frames.length) {
      var dialog = document.getElementById('clearConfirmDialog');
      dialog.showModal();
    }
  };
  clearConfirmButton.onclick = function () {
    an.clear();
    document.getElementById('clearConfirmDialog').close();
  };
  clearCancelButton.onclick = function () {
    document.getElementById('clearConfirmDialog').close();
  };
  saveButton.onclick = function () {
    an.save();
  };
  loadButton.onclick = function () {
    var fileInput = document.createElement('input');
    fileInput.type = "file";
    fileInput.addEventListener("change", function () {
      if (this.files[0]) {
        showSpinner();
        an.load(this.files[0], hideSpinner);
      }
      this.files = [];
    }, false);
    fileInput.click();
  }
  exportButton.onclick = function () {
    an.export();
  };

  // Everything is set up, now connect to camera.
  MediaStreamTrack.getSources(function(sources) {
    var videoSources = [];
    for (var i = 0; i < sources.length; i++)
      if (sources[i].kind == 'video')
        videoSources.append(sources[i]);
    if (videoSources.length > 1) {
      var canvasColumnDiv = document.getElementById('canvas-column');
      var selectDiv = document.createElement('div');
      canvasColumnDiv.appendChild(selectDiv);
      var cameraSelect = document.createElement('select');
      cameraSelect.id = 'camera-select';
      selectDiv.appendChild(cameraSelect);
      for (var i = 0; i < videoSources.length; i++) {
	if (videoSources[i].kind != 'video')
	  continue;
	var cameraOption = document.createElement('option');
	cameraOption.value = videoSources[i];
	cameraOption.innerText = 'Camera ' + (i + 1);
	cameraSelect.appendChild(cameraOption);
	if (i == 0)
	  cameraOption.selected = true;
      }
      cameraSelect.onchange = function(e) {
	console.log('Camera changed');
	an.detachStream();
	an.attachStream(e.target.value);
      };
      an.attachStream(videoSources[0]);
    } else {
      an.attachStream();
    }
  });
};
