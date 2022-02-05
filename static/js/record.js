(() => {
  // set up basic variables for app

  const record = document.querySelector('.record');
  const stop = document.querySelector('.stop');
  const soundClips = document.querySelector('.sound-clips');
  const canvas = document.querySelector('.visualizer');
  const mainSection = document.querySelector('.main-controls');

  // disable stop button while not recording

  stop.disabled = true;

  // visualiser setup - create web audio api context and canvas
  const visualizer = createVisualiser({
    type: VisualizerType.Stream,
    canvasEl: canvas,
    styles: {
      fillColor: 'white',
      lineColor: 'black',
      lineWidth: 2
    }
  });

  function saveAudioToServer(name, audioBlob) {
    const storageFileRequest = new XMLHttpRequest();
    const fileMetadataRequest = new XMLHttpRequest();

    fileMetadataRequest.open('POST', '/metadata', true);
    storageFileRequest.open('POST', '/store', true);

    storageFileRequest.onerror = (e) => {
      console.log('Error sending the store request', storageFileRequest.err);
    };

    storageFileRequest.onload = (e) => {
      console.log('File stored on the server', storageFileRequest.err);
    };

    fileMetadataRequest.setRequestHeader('Content-Type', 'application/json');
    storageFileRequest.send(audioBlob);
    fileMetadataRequest.send(
      JSON.stringify({
        trackName: name
      })
    );
  }

  if (navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia supported.');

    const constraints = { audio: true };
    let chunks = [];

    let onSuccess = function (stream) {
      const mediaRecorder = new MediaRecorder(stream);

      visualizer.visualize(stream);

      record.onclick = function () {
        mediaRecorder.start(1000);
        console.log(mediaRecorder.state);
        console.log('recorder started');
        record.style.background = 'red';

        stop.disabled = false;
        record.disabled = true;
      };

      stop.onclick = function () {
        mediaRecorder.stop();
        console.log(mediaRecorder.state);
        console.log('recorder stopped');
        record.style.background = '';
        record.style.color = '';
        // mediaRecorder.requestData();

        stop.disabled = true;
        record.disabled = false;
      };

      mediaRecorder.onstop = function (e) {
        console.log('data available after MediaRecorder.stop() called.');

        const clipName = prompt(
          'Enter a name for your sound clip?',
          'My unnamed clip'
        );

        const clipContainer = document.createElement('article');
        const clipLabel = document.createElement('p');
        const audio = document.createElement('audio');
        const deleteButton = document.createElement('button');

        clipContainer.classList.add('clip');
        audio.setAttribute('controls', '');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete';

        if (clipName === null) {
          clipLabel.textContent = 'My unnamed clip';
        } else {
          clipLabel.textContent = clipName;
        }

        clipContainer.appendChild(audio);
        clipContainer.appendChild(clipLabel);
        clipContainer.appendChild(deleteButton);
        soundClips.appendChild(clipContainer);

        audio.controls = true;
        const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });

        saveAudioToServer(clipName, blob);

        chunks = [];
        const audioURL = window.URL.createObjectURL(blob);
        audio.src = audioURL;
        console.log('recorder stopped');

        deleteButton.onclick = function (e) {
          let evtTgt = e.target;
          evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
        };

        clipLabel.onclick = function () {
          const existingName = clipLabel.textContent;
          const newClipName = prompt('Enter a new name for your sound clip?');
          if (newClipName === null) {
            clipLabel.textContent = existingName;
          } else {
            clipLabel.textContent = newClipName;
          }
        };
      };

      mediaRecorder.ondataavailable = function (e) {
        chunks.push(e.data);

        const blob = new Blob([e.data], { type: 'audio/ogg; codecs=opus' });
        var oReq = new XMLHttpRequest();
        oReq.open('POST', '/upload', true);
        oReq.send(blob);
      };
    };

    let onError = function (err) {
      console.log('The following error occured: ' + err);
    };

    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  } else {
    console.log('getUserMedia not supported on your browser!');
  }

  window.onresize = function () {
    canvas.width = mainSection.offsetWidth;
  };

  window.onresize();
})();
