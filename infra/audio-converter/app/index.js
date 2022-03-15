const S3 = require('aws-sdk/clients/s3');
const { encodeToMp3 } = require('./mp3-encoder');

const BUCKET_NAME =
  process.env.MEDIA_PERSIST_S3_BUCKET_NAME || 'dev-audio-stream-blob-storage';

function createS3Client() {
  return new S3({
    region: process.env.AWS_DEFAULT_REGION || 'eu-west-1'
  });
}

exports.handler = async (event) => {
  const s3Client = createS3Client();

  // your lambda code goes here
  if (event.Records.length) {
    for (const record of event.Records) {
      const s3AudioFileKey = record.s3.object.key;

      // We need to check for the extension otherwise we fall into an endless invocation
      // Of lambda functions because this handler creates a new mp3 file on the same S3
      // Bucket which in turn triggers the same labmda function and it goes on...
      if (s3AudioFileKey.includes('.ogg')) {
        const params = {
          Bucket: BUCKET_NAME,
          Key: s3AudioFileKey
        };

        const object = s3Client.getObject(params);
        const oggAudioStream = object.createReadStream();

        const mp3Buffer = await encodeToMp3(oggAudioStream);

        await uploadEncodedMp3(
          s3Client,
          s3AudioFileKey.replace('ogg', 'mp3'),
          mp3Buffer
        );
      }
    }
  }
};

function uploadEncodedMp3(client, key, mp3Buffer) {
  const params = { Bucket: BUCKET_NAME, Key: key, Body: mp3Buffer };

  return client
    .upload(params)
    .promise()
    .then((data) => {
      console.log('Mp3 file uploaded', data);
    })
    .catch((err) => {
      console.log('Error uploading mp3 to s3', err);
    });
}
