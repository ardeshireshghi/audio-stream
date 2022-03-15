const { spawn } = require('child_process');
const { cwd } = require('process');
const { createWriteStream } = require('fs');
const { readFile, unlink } = require('fs').promises;

async function execAsyncCommand(command, args, workDir) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, {
      cwd: workDir ? workDir : cwd(),
      stdio: 'inherit'
    });

    const onExit = (code) => {
      if (code === 0) {
        resolve();
      }
    };

    const onError = (err) => {
      childProcess.removeListener('close', onExit);
      reject(err);
    };

    childProcess.once('close', onExit);
    childProcess.once('error', onError);
  });
}

exports.encodeToMp3 = (audioStream) => {
  const command = 'ffmpeg';
  const TMP_OGG_AUDIO_PATH = `/tmp/audio-${Date.now()}.ogg`;
  const TMP_MP3_OUTPUT_PATH = `/tmp/audio-${Date.now()}.mp3`;

  const tmpFile = createWriteStream(TMP_OGG_AUDIO_PATH);

  return new Promise((resolve, reject) => {
    tmpFile.on('finish', async () => {
      try {
        await execAsyncCommand(command, [
          '-i',
          TMP_OGG_AUDIO_PATH,
          '-acodec',
          'libmp3lame',
          TMP_MP3_OUTPUT_PATH
        ]);
        const mp3Buffer = await readFile(TMP_MP3_OUTPUT_PATH);

        await Promise.all([
          unlink(TMP_MP3_OUTPUT_PATH),
          unlink(TMP_OGG_AUDIO_PATH)
        ]);

        resolve(mp3Buffer);
      } catch (err) {
        reject(err);
      }
    });

    tmpFile.on('error', reject);

    audioStream.pipe(tmpFile);
  });
};
