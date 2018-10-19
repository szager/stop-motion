/* -*- mode: javascript; js-indent-level: 2 -*- */
'use strict';

var main = main || {};

(() => {
  // Set up service worker
  if (self.navigator && 'serviceWorker' in navigator)
    navigator.serviceWorker.register('/sw.js');

  // Set up Add to Home Screen prompt
  window.addEventListener('beforeinstallprompt', prompt => {
    prompt.preventDefault();
    let installButton = document.getElementById("installButton");
    installButton.style.display = "";
    installButton.addEventListener("click", evt => {
      evt.target.parentNode.removeChild(evt.target);
      prompt.prompt();
    });
  });
})();

window.addEventListener('load', evt => {
  // Create Animator object and set up callbacks.
  let video = document.getElementById('video');
  let snapshotCanvas = document.getElementById('snapshot-canvas');
  let playCanvas = document.getElementById('play-canvas');
  let videoMessage = document.getElementById('video-message');
  let an = new animator.Animator(video, snapshotCanvas, playCanvas, videoMessage);
  main.animator = an;

  let playbackSpeedSelector = document.getElementById('playbackSpeed');
  let playbackSpeed = () => {
    return playbackSpeedSelector.value;
  }
  an.setPlaybackSpeed(playbackSpeed());

  let saveDialog = document.getElementById('saveDialog');
  let fileNameInput = saveDialog.querySelector('input');
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
    let topContainer = document.getElementById('top-container');
    let captureClicks = (e => { e.stopPropagation() });
    topContainer.style.opacity = 0.5;
    topContainer.addEventListener('click', captureClicks, true);
    an.save(value).then(() => {
      topContainer.style.opacity = null;
      topContainer.removeEventListener('click', captureClicks, true);
    }).catch(err => {
      console.log(err);
      topContainer.style.opacity = null;
      topContainer.removeEventListener('click', captureClicks, true);
    });
  };

  let captureButton = document.getElementById('captureButton');
  let undoButton = document.getElementById('undoButton');
  let clearConfirmDialog = document.getElementById('clearConfirmDialog');
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

  let toggleButton = document.getElementById('toggleButton');
  toggleButton.addEventListener("click", evt => {
    an.toggleVideo().then(isPlaying => {
      if (isPlaying) {
	evt.target.firstChild.src = "images/off72.png";
      } else {
	evt.target.firstChild.src = "images/on72.png";
      }
    }).catch(err => {
      evt.target.firstChild.src = "images/off72.png";
    });
  });

  let pressButton = (button => {
    button.classList.add('pressed');
    setTimeout(() => { button.classList.remove('pressed') }, 250);
  });

  captureButton.addEventListener("click", evt => {
    an.capture();
    pressButton(evt.target);
  });

  undoButton.addEventListener("click", evt => {
    an.undoCapture();
    pressButton(evt.target);
  });

  let progressMarker = document.getElementById("progress-marker");
  progressMarker.addEventListener("animationend", () => {
    progressMarker.classList.toggle("slide-right");
    progressMarker.style.transform = "translateX(0px)";
    setTimeout(() => {
      progressMarker.style.transform = "translateX(-650px)";
    }, 1000);
  });

  let playButton = document.getElementById('playButton');
  playButton.addEventListener("click", evt => {
    progressMarker.style.animationDuration = (an.frames.length / playbackSpeed()) + "s";
    progressMarker.classList.add("slide-right");
    an.togglePlay();
  });

  let clearButton = document.getElementById('clearButton');
  clearButton.addEventListener("click", evt => {
    if (!an.frames.length)
      return;
    clearConfirmDialog.showModal();
  });

  let clearConfirmButton = document.getElementById('clearConfirmButton');
  clearConfirmButton.addEventListener("click", evt => {
    an.clear();
    clearConfirmDialog.close();
  });

  let clearCancelButton = document.getElementById('clearCancelButton');
  clearCancelButton.addEventListener("click", evt => {
    clearConfirmDialog.close();
  });

  let saveButton = document.getElementById('saveButton');
  saveButton.addEventListener("click", evt => {
    if (!an.frames.length)
      return;
    if (an.name)
      fileNameInput.value = an.name;
    let saveConfirmButton = document.getElementById('saveConfirmButton');
    saveConfirmButton.addEventListener("click", saveCB);
    saveDialog.showModal();
  });

  let saveCancelButton = document.getElementById('saveCancelButton');
  saveCancelButton.addEventListener("click", evt => {
    saveDialog.close();
  });

  let loadButton = document.getElementById('loadButton');
  loadButton.addEventListener("click", evt => {
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
  });

  let audioStream;
  let isRecording = false;
  let recordingIcons = document.querySelectorAll('.recording');
  let notRecordingIcons = document.querySelectorAll('.not-recording');
  let countdown = document.getElementById('countdown');
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
      progressMarker.style.animationDuration = (an.frames.length / playbackSpeed()) + "s";
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

  let recordAudioButton = document.getElementById('recordAudioButton');
  recordAudioButton.addEventListener("click", evt => {
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
  });

  let clearAudioButton = document.getElementById('clearAudioButton');
  clearAudioButton.addEventListener("click", an.clearAudio.bind(an));

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
});
