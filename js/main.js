/* -*- mode: javascript; js-indent-level: 2 -*- */
'use strict';

var main = main || {};

window.addEventListener('load', evt => {
  let videoContainer = document.getElementById('video-container');
  let video = document.getElementById('video');
  let topContainer = document.getElementById('top-container');
  let snapshotCanvas = document.getElementById('snapshot-canvas');
  let playCanvas = document.getElementById('play-canvas');
  let videoMessage = document.getElementById('video-message');
  let toggleButton = document.getElementById('toggleButton');
  let captureButton = document.getElementById('captureButton');
  let undoButton = document.getElementById('undoButton');
  let playButton = document.getElementById('playButton');
  let clearButton = document.getElementById('clearButton');
  let clearConfirmDialog = document.getElementById('clearConfirmDialog');
  let clearConfirmButton = document.getElementById('clearConfirmButton');
  let clearCancelButton = document.getElementById('clearCancelButton');
  let saveButton = document.getElementById('saveButton');
  let saveDialog = document.getElementById('saveDialog');
  let fileNameInput = saveDialog.querySelector('input');
  let saveConfirmButton = document.getElementById('saveConfirmButton');
  let saveCancelButton = document.getElementById('saveCancelButton');
  let loadButton = document.getElementById('loadButton');
  let recordAudioButton = document.getElementById('recordAudioButton');
  let clearAudioButton = document.getElementById('clearAudioButton');
  let playbackSpeedSelector = document.getElementById('playbackSpeed');
  let recordingIcons = document.querySelectorAll('.recording');
  let notRecordingIcons = document.querySelectorAll('.not-recording');
  let countdown = document.getElementById('countdown');
  let progressMarker = document.getElementById("progress-marker");
  let installButton = document.getElementById("installButton");

  let an;
  let audioStream;

  let isRecording = false;

  let captureClicks = e => {e.stopPropagation()};

  let showSpinner = () => {
//    topContainer.style.opacity = 0.5;
//    topContainer.addEventListener('click', captureClicks, true);
  };

  let hideSpinner = () => {
//    topContainer.style.opacity = null;
//    topContainer.removeEventListener('click', captureClicks, true);
  };

  let saveCB = () => {
    let value = fileNameInput.value;
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
    let startTime = performance.now();
    an.save(value).then(hideSpinner);
  };

  // Create Animator object and set up callbacks.
  main.animator = an = new animator.Animator(video, snapshotCanvas, playCanvas, videoMessage);
  an.frameTimeout = () => {
    return 1000.0 / playbackSpeedSelector.value;
  };

  window.addEventListener("keydown", (e => {
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
  }));
  toggleButton.onclick = () => {
    an.toggleVideo().then(isPlaying => {
      if (isPlaying) {
	toggleButton.firstChild.src = "images/off72.png";
      } else {
	toggleButton.firstChild.src = "images/on72.png";
      }
    }).catch(err => {
      toggleButton.firstChild.src = "images/off72.png";
    });
  };
  captureButton.onclick = () => {
    an.capture();
    captureButton.style.backgroundColor = "#4682b4";
    setTimeout(() => {captureButton.style.backgroundColor = "";}, 250);
  };
  undoButton.onclick = () => {
    an.undoCapture();
    undoButton.style.backgroundColor = "#4682b4";
    setTimeout(() => {undoButton.style.backgroundColor = "";}, 250);
  };

  progressMarker.addEventListener("animationend", () => {
    progressMarker.classList.toggle("slide-right");
    progressMarker.style.transform = "translateX(0px)";
    setTimeout(() => {
      progressMarker.style.transform = "translateX(-650px)";
    }, 1000);
  });

  playButton.onclick = () => {
    progressMarker.style.animationDuration = (an.frames.length / playbackSpeedSelector.value) + "s";
    progressMarker.classList.add("slide-right");
    an.togglePlay();
  };

  clearButton.onclick = () => {
    if (!an.frames.length)
      return;
    clearConfirmDialog.showModal();
  };
  clearConfirmButton.onclick = () => {
    an.clear();
    clearConfirmDialog.close();
  };
  clearCancelButton.onclick = () => {
    clearConfirmDialog.close();
  };
  saveButton.onclick = () => {
    if (!an.frames.length)
      return;
    if (an.name)
      fileNameInput.value = an.name;
    saveConfirmButton.onclick = saveCB;
    saveDialog.showModal();
  };

  saveCancelButton.onclick = () => {
    saveDialog.close();
  };

  loadButton.onclick = () => {
    let fileInput = document.createElement('input');
    fileInput.type = "file";
    fileInput.addEventListener("change", () => {
      if (this.files[0]) {
        showSpinner();
        an.load(this.files[0], hideSpinner, frameRate => {
          playbackSpeedSelector.value = frameRate;
        });
      }
    }, false);
    fileInput.click();
  };

  let updateRecordingIcons = (showNotRecording, showCountdown, showRecording) => {
    recordingIcons.forEach(e => { e.style.display = (showRecording ? "" : "none") });
    notRecordingIcons.forEach(e => { e.style.display = (showNotRecording ? "" : "none") });
    countdown.style.display = (showCountdown ? "" : "none");
  };
  updateRecordingIcons(true, false, false);

  countdown.addEventListener("animationstart", () => {
    this.firstElementChild.innerHTML = "3";
  });
  countdown.addEventListener("animationiteration", () => {
    this.firstElementChild.innerHTML = (parseInt(this.firstElementChild.innerHTML) - 1).toString();
  });
  countdown.addEventListener("animationend", () => {
    this.firstElementChild.innerHTML = "";
    if (isRecording) {
      progressMarker.style.animationDuration = (an.frames.length / playbackSpeedSelector.value) + "s";
      progressMarker.classList.add("slide-right");
      an.recordAudio(audioStream).then(() => {
        isRecording = false;
        updateRecordingIcons(true, false, false);
        audioStream.getAudioTracks()[0].stop();
        main.audio = audioStream = null;
      });
      updateRecordingIcons(false, false, true);
    } else {
      updateRecordingIcons(true, false, false);
    }
  });

  recordAudioButton.onclick = () => {
    if (!an.frames.length)
      return;
    if (isRecording) {
      an.endPlay();
      updateRecordingIcons(true, false, false);
      isRecord = false;
    } else if (self.navigator &&
               navigator.mediaDevices &&
               navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({audio: true, video: false})
          .then(stream => {
        main.audio = audioStream = stream;
        updateRecordingIcons(false, true, false);
      });
      isRecording = true;
    } else {
      isRecording = false;
    }
  };

  clearAudioButton.onclick = () => {
    an.clearAudio();
  };

  let setUpCameraSelectAndAttach = cameras => {
    if (!cameras || cameras.length < 2) {
      an.attachStream();
      return;
    }
    let videoColumnDiv = document.getElementById('video-column');
    let selectDiv = document.createElement('div');
    videoColumnDiv.appendChild(selectDiv);
    let cameraSelect = document.createElement('select');
    cameraSelect.id = 'camera-select';
    selectDiv.appendChild(cameraSelect);
    for (let i = 0; i < cameras.length; i++) {
      let cameraOption = document.createElement('option');
      cameraOption.value = cameras[i];
      cameraOption.innerText = 'Camera ' + (i + 1);
      cameraSelect.appendChild(cameraOption);
      if (i === 0)
        cameraOption.selected = true;
    }
    cameraSelect.onchange = e => {
      an.detachStream();
      an.attachStream(e.target.value);
    };
    an.attachStream(cameras[0].deviceId);
  };

  // Everything is set up, now connect to camera.
  if (self.navigator && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      setUpCameraSelectAndAttach(
          devices.filter(d => { return d.kind == 'videoinput'; })
                 .map(d => { return d.deviceId; }));
    });
  } else if (self.MediaStreamTrack && MediaStreamTrack.getSources) {
    MediaStreamTrack.getSources(sources => {
      setUpCameraSelectAndAttach(
          sources.filter(d => { return d.kind == 'video'; })
                 .map(d => { return d.id; }));
      });
  } else {
    setUpCameraSelectAndAttach();
  }

  // Set up service worker and cache
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(
        registration => {
          console.log('Service worker registered.');
        },
        err => {
          console.log('Service worker failed to register: ', err);
        });
  };

  // Set up Add to Home Screen prompt
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', evt => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.style.display = "";
    installButton.addEventListener("click", evt => {
      evt.target.parentNode.removeChild(evt.target);
      deferredPrompt.prompt();
    });
  });
});
