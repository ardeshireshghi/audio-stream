const initRecorder = (() => {
  const record = document.querySelector('.record');
  const stop = document.querySelector('.stop');
  const soundClips = document.querySelector('.sound-clips');
  const canvas = document.querySelector('.visualizer');
  const mainSection = document.querySelector('.main-controls');

  let chunks = [];

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

  async function saveAudioToServer(name, audioBlob) {
    return new Promise((resolve, reject) => {
      const storageFileRequest = new XMLHttpRequest();
      const fileMetadataRequest = new XMLHttpRequest();

      fileMetadataRequest.open('POST', '/metadata', true);
      storageFileRequest.open('POST', '/store', true);

      storageFileRequest.onerror = (e) => {
        console.log('Error sending the store request', storageFileRequest.err);
        reject(storageFileRequest.err);
      };

      storageFileRequest.onload = (e) => {
        console.log(
          'File stored on the server',
          storageFileRequest.responseText
        );
        resolve();
      };

      fileMetadataRequest.onload = () => {
        storageFileRequest.send(audioBlob);
      };

      fileMetadataRequest.setRequestHeader('Content-Type', 'application/json');
      fileMetadataRequest.send(
        JSON.stringify({
          trackName: name
        })
      );
    });
  }

  function createMediaRecorderWithHandlers(stream) {
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.onstop = async (e) => {
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

      const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
      await saveAudioToServer(clipName, blob);

      // Reset chunks
      chunks = [];

      // Update audio player
      const audioURL = window.URL.createObjectURL(blob);
      audio.controls = true;
      audio.src = audioURL;

      // Events for the new player controls
      deleteButton.onclick = (e) => {
        let evtTgt = e.target;
        evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
      };

      clipLabel.onclick = () => {
        const existingName = clipLabel.textContent;
        const newClipName = prompt('Enter a new name for your sound clip?');
        if (newClipName === null) {
          clipLabel.textContent = existingName;
        } else {
          clipLabel.textContent = newClipName;
        }
      };
    };

    // This is for live streaming the audio
    mediaRecorder.ondataavailable = function (e) {
      chunks.push(e.data);

      const blob = new Blob([e.data], { type: 'audio/ogg; codecs=opus' });
      var oReq = new XMLHttpRequest();
      oReq.open('POST', '/upload', true);
      oReq.send(blob);
    };

    return mediaRecorder;
  }

  function getMediaAndSetEventListeners() {
    const onGetUserMediaSuccess = (stream) => {
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
      const mediaRecorder = createMediaRecorderWithHandlers(stream);
      visualizer.visualize(stream);

      record.onclick = () => {
        mediaRecorder.start(1000);

        console.log('recorder started');
        record.style.background = 'red';

        stop.disabled = false;
        record.disabled = true;
      };

      stop.onclick = () => {
        mediaRecorder.stop();
        console.log('recorder stopped');

        record.style.background = '';
        record.style.color = '';
        stop.disabled = true;
        record.disabled = false;
      };
    };

    const onGetUserMediaError = function (err) {
      console.log('The following error occured: ' + err);
    };

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(onGetUserMediaSuccess, onGetUserMediaError);
  }

  function init() {
    if (!navigator.mediaDevices.getUserMedia) {
      console.log('getUserMedia not supported on your browser!');
      return;
    }

    window.onresize = () => {
      canvas.width = mainSection.offsetWidth;
    };

    window.onresize();

    console.log('getUserMedia supported.');
    getMediaAndSetEventListeners();
  }

  return init;
})();
