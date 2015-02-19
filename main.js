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

  var showSpinner = function() {
  };
  var hideSpinner = function() {
  };
  an = new animator.Animator(video, streamCanvas, snapshotCanvas);
  an.attachStream();
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
  loadButton.onclick = function() {
    var fileInput = document.createElement('input');
    fileInput.type = "file";
    fileInput.addEventListener("change", function () {
      if (this.files[0])
        an.load(this.files[0], hideSpinner);
      this.files = [];
    }, false);
    fileInput.click();
  }
};
