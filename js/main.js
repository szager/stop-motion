'use strict';

var an;

window.onload = function() {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  var fileNameRegex = new RegExp(
  var video = document.getElementById('video');
  var streamCanvas = document.getElementById('stream');
  var snapshotCanvas = document.getElementById('snapshot');
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
  var saveConfirmButton = document.getElementById('saveConfirmButton');
  var saveCancelButton = document.getElementById('saveCancelButton');
  var loadButton = document.getElementById('loadButton');
  var exportButton = document.getElementById('exportButton');
  var playbackSpeedSelector = document.getElementById('playbackSpeed');

  var showSpinner = function() {
  };
  var hideSpinner = function() {
  };
  an = new animator.Animator(video, streamCanvas, snapshotCanvas);
  an.attachStream();
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
    var fileNameInput = saveDialog.querySelector('input');
    fileNameInput.value = an.name || 'MyAnimation';
    an.save();
  };
  saveConfirmButton.onclick = function () {
    var fileNameInput = saveDialog.querySelector('input');
    var value = fileNameInput.value;
    if (!value.length)
      value = 'StopMotion';
    value = value.replace(/\s+/g, '_');
    value = value.replace(/[^\w\-\.]+/g, '');
    if (!value.endswith('.mng'))
      value += '.mng';
    an.save(value);
  };
  saveCancelButton.onclick = function () {
    saveDialog.close();
  };
  loadButton.onclick = function () {
    var fileInput = document.createElement('input');
    fileInput.type = "file";
    fileInput.addEventListener("change", function () {
      if (this.files[0])
        an.load(this.files[0], hideSpinner);
      this.files = [];
    }, false);
    fileInput.click();
  }
  exportButton.onclick = function () {
    an.export();
  };
};
