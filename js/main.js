/* -*- mode: javascript; js-indent-level: 2 -*- */
'use strict';

var main = main || {};

window.addEventListener('load', evt => {
  document.body.innerHTML = (`
  <div class="hflex">
    <div id="video-column">
      <div id="video-container">
        <video id="video" width=640 height=480 autoplay></video>
        <canvas id="snapshot-canvas" width=640 height=480></canvas>
        <canvas id="play-canvas" width=640 height=480></canvas>
        <div id="message-container" class="vflex">
          <div id="video-message"></div>
        </div>
      </div>
      <div id="progress-container">
        <svg id="progress-marker">
          <line id="progress-line" x1=0 y1=5 x2=645 y2=5></line>
          <circle id="progress-circle" cx=640 cy=5 r=5></circle>
        </svg>
      </div>
      <div id="audio-container">
        <audio id="audio"></audio>
      </div>
      <div id="speed-container">
        <pre class="speed-label">Slow  </pre>
        <input id="playbackSpeed" type="range" name="playbackSpeed" min="2" step="0.5" max="12" />
        <pre class="speed-label">  Fast</pre>
      </div>
    </div>

    <div id="control-column">
      <div id="button-container">
        <button class="button72" id="toggleButton"><img src="images/off72.png" /><div class="buttonLabel">On/Off</div></button>
        <button class="button72" id="captureButton"><img src="images/capture72.png" /><div class="buttonLabel">Capture</div></button>
        <button class="button72" id="undoButton"><img src="images/undo72.png" /><div class="buttonLabel">Undo</div></button>
        <button class="button72" id="playButton"><img src="images/playpause72.png" /><div class="buttonLabel">Play/Stop</div></button>
        <button class="button72" id="clearButton"><img src="images/clear72.png" /><div class="buttonLabel">Clear</div></button>
        <button class="button72" id="recordAudioButton">
          <div class="iconContainer audioIcon">
            <svg>
              <g class="not-recording">
                <path style="fill:currentColor" d="M 28 34 Q 28 42 36 42 Q 44 42 44 34 L 44 14 Q 44 6 36 6 Q 28 6 28 14 Z" />
                <path style="stroke:currentColor; stroke-width:4; fill:none" d="M 22 24 L 22 34 Q 22 48 36 48 Q 50 48 50 34 L 50 24" />
                <path style="stroke:currentColor; stroke-width:4; fill:none" d="M 36 50 L 36 66 L 22 66 L 50 66" />
              </g>
              <g class="recording" style="display: none">
                <circle class="center-circle" style="r:9; color:red; stroke:none; fill:currentColor"></circle>
              </g>
            </svg>
            <svg id="countdown" class="recede-decay" style="display: none">
              <text style="red; font-size: 54pt; text-anchor: middle;" x=36 y=60></text>
            </svg>
            <svg class="ripple-decay recording" style="display: none">
              <circle class="center-circle" style="r:34; color:red; stroke:currentColor; stroke-width:2; fill:none"></circle>
            </svg>
          </div>
          <div class="buttonLabel">Record Audio</div>
        </button>
        <button class="button72" id="clearAudioButton">
          <div class="iconContainer audioIcon">
            <svg>
              <g style="color:black">
                <path style="fill:currentColor" d="M 28 34 Q 28 42 36 42 Q 44 42 44 34 L 44 14 Q 44 6 36 6 Q 28 6 28 14 Z" />
                <path style="stroke:currentColor; stroke-width:4; fill:none" d="M 22 24 L 22 34 Q 22 48 36 48 Q 50 48 50 34 L 50 24" />
                <path style="stroke:currentColor; stroke-width:4; fill:none" d="M 36 50 L 36 66 L 22 66 L 50 66" />
              </g>
              <g style="color:red">
                <circle class="center-circle" style="r:32; stroke:currentColor; stroke-width:8; fill:none"></circle>
                <path style="fill:none; stroke:currentColor; stroke-width:8" d="M 12 60 L 60 12"></path>
              </g>
            </svg>
          </div>
          <div class="buttonLabel">Clear Audio</div>
        </button>
        <button class="button72" id="saveButton"><img src="images/save72.png" /><div class="buttonLabel">Save</div></button>
        <button class="button72" id="loadButton"><img src="images/load72.png" /><div class="buttonLabel">Load</div></button>
      </div>
    </div>
  </div>

  <div id="installButton" style="display: none">
    <span style="font-size: 36px">Install</span>
    <span style="font-size: 24px">for offline use</span>
  </div>

  <div id="dialog-container">
    <dialog id="clearConfirmDialog">
      <p>Are you sure you want to clear the current animation?</p>
      <button id="clearConfirmButton">OK</button>
      <button id="clearCancelButton">Cancel</button>
    </dialog>
    <dialog id="saveDialog">
      <p>Give your movie a name: <input type="text" /></p>
      <button id="saveConfirmButton">OK</button>
      <button id="saveCancelButton">Cancel</button>
    </dialog>
  </div>`);
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
        evt.currentTarget.firstChild.src = "images/off72.png";
      } else {
        evt.currentTarget.firstChild.src = "images/on72.png";
      }
    }).catch(err => {
      evt.currentTarget.firstChild.src = "images/off72.png";
    });
  });

  let pressButton = (button => {
    button.classList.add('pressed');
    setTimeout(() => { button.classList.remove('pressed') }, 250);
  });

  captureButton.addEventListener("click", evt => {
    an.capture();
    pressButton(evt.currentTarget);
  });

  undoButton.addEventListener("click", evt => {
    an.undoCapture();
    pressButton(evt.currentTarget);
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

  // Set up Add to Home Screen prompt.
  window.addEventListener('beforeinstallprompt', prompt => {
    prompt.preventDefault();
    let installButton = document.getElementById("installButton");
    installButton.style.display = "";
    installButton.addEventListener("click", evt => {
      evt.currentTarget.parentNode.removeChild(evt.target);
      prompt.prompt();
    });
  });
});
