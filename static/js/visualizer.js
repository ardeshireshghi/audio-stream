const VisualizerType = {
  MediaEl: 'mediaElement',
  Stream: 'mediaStream'
};

const defaultStyles = {
  fillColor: 'rgb(241 148 148)',
  lineColor: 'white',
  lineWidth: 3
};
function createVisualiser({
  type = VisualizerType.MediaEl,
  canvasEl,
  styles
} = {}) {
  let audioCtx;

  if (!Object.values(VisualizerType).includes(type)) {
    throw new Error('Invalid visualiser type');
  }

  const visualiserStyles = { ...defaultStyles, ...styles };

  const canvas = canvasEl;
  const canvasCtx = canvas.getContext('2d');

  if (visualiserStyles.width) {
    canvas.width = visualiserStyles.width;
  }

  function visualize(audioElOrStream) {
    if (!audioCtx) {
      audioCtx =
        typeof AudioContext !== 'undefined'
          ? new AudioContext()
          : new webkitAudioContext();
    }

    let source;

    if (type === VisualizerType.MediaEl) {
      source = audioCtx.createMediaElementSource(audioElOrStream);
      source.connect(audioCtx.destination);
    } else if (type === VisualizerType.Stream) {
      source = audioCtx.createMediaStreamSource(audioElOrStream);
    }

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);

    draw();

    function draw() {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = visualiserStyles.fillColor;
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      canvasCtx.lineWidth = visualiserStyles.lineWidth;
      canvasCtx.strokeStyle = visualiserStyles.lineColor;

      canvasCtx.beginPath();

      let sliceWidth = (WIDTH * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128.0;
        let y = (v * HEIGHT) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    }
  }

  return { visualize };
}
