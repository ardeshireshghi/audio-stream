FROM amazon/aws-lambda-nodejs:12
ARG FUNCTION_DIR="/var/task"

RUN yum update -y
RUN yum install -y tar xz vim

RUN mkdir -p /usr/local/bin/ffmpeg
RUN curl -f -o /tmp/ffmpeg.tar.xz https://github.com/ardeshireshghi/audio-stream/raw/main/infra/audio-converter/ffmpeg/ffmpeg.tar.xz
RUN cd /tmp && unxz /tmp/ffmpeg.tar.xz
RUN cd /tmp && tar -xf /tmp/ffmpeg.tar 
RUN cd /tmp && cp -a $(ls -d ffmpeg* | head -1)/* /usr/local/bin/ffmpeg

ENV PATH="/usr/local/bin/ffmpeg:$PATH"

# Create function directory
RUN mkdir -p "${FUNCTION_DIR}"

WORKDIR "${FUNCTION_DIR}"
RUN npm i aws-sdk

COPY ./custom-entrypoint.sh /

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "index.handler" ]

ENTRYPOINT [ "/custom-entrypoint.sh" ]
