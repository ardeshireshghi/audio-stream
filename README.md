# audio-stream

POC for testing Audio recording and streaming on web

## Installation

You need node > 12 and `yarn` to run the app.

Run `yarn install`.

## Running the app

1. Normally if you don't need media persistance you can just do `yarn start`

2. If you want to persist the media

```sh
$ export AWS_PROFILE="name-of-your-aws-profile"
$ export MEDIA_PERSIST_S3_BUCKET_NAME="name-of-s3-bucket"
$ yarn start
```

Go to http://localhost:9999/ to record and http://localhost:9999/listen to listen. You can start recording and then opening the listen page and press play to hear the stream in real-time.
