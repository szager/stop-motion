/* -*- mode: javascript; js-indent-level: 2 -*- */

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create("index.html", {
    'bounds': {
      'width': 1200,
      'height': 800
    }
  });
});
