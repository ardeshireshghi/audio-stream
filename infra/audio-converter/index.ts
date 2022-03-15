import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

const LAMBDA_FUNCTION_NAME = 'convertToMp3';

const image = awsx.ecr.buildAndPushImage('converterApp', {
  context: './app'
});

const role = new aws.iam.Role('lambdaRole', {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'lambda.amazonaws.com'
  })
});

// TODO: Harden these policies
new aws.iam.RolePolicyAttachment('lambdaFullAccess', {
  role: role.name,
  policyArn: aws.iam.ManagedPolicy.LambdaFullAccess
});

// TODO: Harden these policies
new aws.iam.RolePolicyAttachment('lambdaFullS3Access', {
  role: role.name,
  policyArn: aws.iam.ManagedPolicy.AmazonS3FullAccess
});

new aws.iam.RolePolicyAttachment('lambdaBasicExecRole', {
  role: role.name,
  policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole
});

const func = new aws.lambda.Function(LAMBDA_FUNCTION_NAME, {
  packageType: 'Image',
  imageUri: image.imageValue,
  role: role.arn,
  timeout: 60
});

const BUCKET_NAME =
  process.env.MEDIA_PERSIST_S3_BUCKET_NAME || 'dev-audio-stream-blob-storage';

// Create an AWS resource (S3 Bucket)
const audioAssetsBucket = new aws.s3.Bucket(BUCKET_NAME, {
  bucket: BUCKET_NAME
});

// Create an AWS Lambda event handler on our bucket using magic functions.
audioAssetsBucket.onObjectCreated(LAMBDA_FUNCTION_NAME, func);
