/* -*- mode: javascript; js-indent-level: 2 -*- */

// Copyright 2022 Stefan Zager <szager@gmail.com>
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var main = main || {};

document.addEventListener('DOMContentLoaded', evt => {
  evt.target.getElementById('toggleButton').firstChild.src = assets['images']['off'];
  evt.target.getElementById('captureButton').firstChild.src = assets['images']['capture'];
  evt.target.getElementById('undoButton').firstChild.src = assets['images']['undo'];
  evt.target.getElementById('playButton').firstChild.src = assets['images']['playpause'];
  evt.target.getElementById('clearButton').firstChild.src = assets['images']['clear'];
  evt.target.getElementById('saveButton').firstChild.src = assets['images']['save'];
  evt.target.getElementById('loadButton').firstChild.src = assets['images']['load'];
});

window.addEventListener('load', evt => {
  // Create Animator object and set up callbacks.
  let video = document.getElementById('video');
  let snapshotCanvas = document.getElementById('snapshot-canvas');
  let playCanvas = document.getElementById('play-canvas');
  let videoMessage = document.getElementById('video-message');
  let an = new animator.Animator(video, snapshotCanvas, playCanvas, videoMessage);

  main.animator = an;

  let playbackSpeedSelector = document.getElementById('playbackSpeed');
  let playbackSpeed = (() => {
    return Number(playbackSpeedSelector.value);
  });
  let fps = document.getElementById('fps');
  playbackSpeedSelector.addEventListener("input", evt => {
    an.setPlaybackSpeed(playbackSpeed());
    fps.innerText = '  ' + playbackSpeed().toFixed(1);
  });
  an.setPlaybackSpeed(playbackSpeed());

  let captureClicks = (e => { e.stopPropagation() });
  let showSpinner = (() => {
    let topContainer = document.getElementById('top-container');
    topContainer.style.opacity = 0.5;
    topContainer.addEventListener('click', captureClicks, true);
  });
  let hideSpinner = (() => {
    let topContainer = document.getElementById('top-container');
    topContainer.style.opacity = null;
    topContainer.removeEventListener('click', captureClicks, true);
  });

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
        toggleButton.firstChild.src = assets['images']['off'];
      } else {
        toggleButton.firstChild.src = assets['images']['on'];
      }
    }).catch(err => {
      toggleButton.firstChild.src = assets['images']['off'];
    });
  });

  let pressButton = (button => {
    button.classList.add('pressed');
    setTimeout(() => { button.classList.remove('pressed') }, 250);
  });

  let thumbnailContainer = document.getElementById('thumbnail-container');
  let thumbnailWidth = 96;
  let thumbnailHeight = 72;
  captureButton.addEventListener("click", evt => {
    an.capture();
    let thumbnail = document.createElement('canvas');
    let w = thumbnailWidth;
    let h = thumbnailHeight;
    thumbnail.width = thumbnailWidth;
    thumbnail.height = thumbnailHeight;
    thumbnail.getContext('2d', { alpha: false }).drawImage(
      an.frames[an.frames.length-1], 0, 0, thumbnailWidth, thumbnailHeight);
    thumbnailContainer.appendChild(thumbnail);
    pressButton(captureButton);
  });

  undoButton.addEventListener("click", evt => {
    an.undoCapture();
    if (thumbnailContainer.lastElementChild)
      thumbnailContainer.removeChild(thumbnailContainer.lastElementChild);
    pressButton(undoButton);
  });

  let progressMarker = document.getElementById("progress-marker");
  progressMarker.addEventListener("animationend", () => {
    progressMarker.classList.toggle("slide-right");
    progressMarker.style.transform = "translateX(0px)";
    setTimeout(() => {
      progressMarker.style.transform = "";
    }, 1000);
  });

  let flipButton = document.getElementById('flipButton');
  flipButton.addEventListener("click", evt => {
    let style = video.attributeStyleMap;
    let transform = style.get("transform");
    if (!transform) {
      transform = new CSSTransformValue([new CSSRotate(CSS.deg(0))]);
    }
    let angle = transform[0].angle.value;
    angle = (angle + 180) % 360;
    transform[0] = new CSSRotate(CSS.deg(angle));
    style.set("transform", transform);
    an.flip();
  });

  let clockContainer = document.getElementById('clockContainer');
  let clockHand = document.getElementById("clock-hand");
  let clockNumRotations = 1000;
  let clockZeroTime = 0;

  let startClock = ((t, skew) => {
    skew = (skew ? Number(skew) : 0);
    clockZeroTime = t - skew;
    let angle = 360 * clockNumRotations;
    let duration = clockNumRotations - (skew/1000);
    clockHand.style.transition = "transform " + String(duration) + "s linear";
    clockHand.style.transform = "rotate(" + String(angle) + "deg)";
  });

  let stopClock = (() => {
    clockHand.style.transform = getComputedStyle(clockHand).transform;
  });
  
  let resetClock = (() => {
    clockHand.style.transition = "";
    clockHand.style.transform = "";
  });
  
  clockHand.addEventListener("transitionend", evt => {
    resetClock();
    requestAnimationFrame(() => { requestAnimationFrame(() => {
      let t = performance.now();
      let skew = (t - clockZeroTime) % 1000;
      startClock(t, skew);
    }) });
  });

  let clockButton = document.getElementById('clockButton');
  clockButton.addEventListener("click", evt => {
    if (clockContainer.style.display == "none") {
      clockContainer.style.display = "";
    } else {
      clockContainer.style.display = "none";
    }
  });

  let playButton = document.getElementById('playButton');
  playButton.addEventListener("click", evt => {
    let p = an.togglePlay();
    if (an.isPlaying) {
      progressMarker.style.animationDuration = (an.frames.length / playbackSpeed()) + "s";
      progressMarker.classList.add("slide-right");
      startClock(performance.now(), 0);
      p.then(resetClock);
    } else {
      progressMarker.classList.remove("slide-right");
      resetClock();
    }
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
    thumbnailContainer.innerHTML = "";
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
    fileInput.addEventListener("change", evt => {
      if (evt.target.files[0]) {
        showSpinner();
        an.load(evt.target.files[0], hideSpinner, frameRate => {
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

  countdown.addEventListener("animationstart", evt => {
    evt.currentTarget.firstElementChild.innerHTML = "3";
  });
  countdown.addEventListener("animationiteration", evt => {
    let t = evt.currentTarget.firstElementChild;
    t.innerHTML = (parseInt(t.innerHTML) - 1).toString();
  });
  countdown.addEventListener("animationend", evt => {
    evt.currentTarget.firstElementChild.innerHTML = "";
    if (isRecording) {
      progressMarker.style.animationDuration = (an.frames.length / playbackSpeed()) + "s";
      progressMarker.classList.add("slide-right");
      startClock();
      an.recordAudio(audioStream).then(() => {
        isRecording = false;
        updateRecordingIcons(true, false, false);
        audioStream.getAudioTracks()[0].stop();
        audioStream = null;
        resetClock();
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
      isRecording = false;
    } else if (self.navigator &&
               navigator.mediaDevices &&
               navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({audio: true, video: false})
          .then(stream => {
        audioStream = stream;
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
