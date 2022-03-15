# Serverless audio-converter

This is a Lambda function that is triggered by object create event in S3, reads the OGG audio from the S3 Bucket and then runs a Node.js container with `ffmpeg` to convert it to mp3 format and upload back to S3.

## Development

Testing the Lambda function requires running Docker for now. Make sure you have Docker installed.

Go to `app` directory and run:

```sh
$ ./scripts/docker-dev.sh bash # create docker image and run with interactive shell
$ ./scripts/docker-dev.sh bash -c "cd /var/task && node ./test/test-handler.js" # run the test handler script. Make sure you have some object in the S3 bucket. Check the script
```
