import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dotenv from 'dotenv';

dotenv.config();

export class BackendServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    if (!process.env.SUPERBASE_URL
      || !process.env.SUPERBASE_ANON_KEY
      || !process.env.SUPERBASE_API_KEY
      || !process.env.SUPERBASE_PROJECT_ID
      || !process.env.DATABASE_URL
    ) {
      throw new Error('Missing required environment variables for Supabase configuration');
    }

    const fn = new NodejsFunction(this, 'lambda', {
      entry: 'lambda/index.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
    });

    // Add environment variables
    fn.addEnvironment('DATABASE_URL', process.env.DATABASE_URL);
    fn.addEnvironment('SUPERBASE_ANON_KEY', process.env.SUPERBASE_ANON_KEY);
    fn.addEnvironment('SUPERBASE_API_KEY', process.env.SUPERBASE_API_KEY);
    fn.addEnvironment('SUPERBASE_PROJECT_ID', process.env.SUPERBASE_PROJECT_ID);
    fn.addEnvironment('SUPERBASE_URL', process.env.SUPERBASE_URL);

    // Create the API Gateway with CORS configuration
    new apigw.LambdaRestApi(this, 'loan-managment-api', {
      handler: fn,
      defaultCorsPreflightOptions: {
        allowOrigins: ['http://localhost:5173', 'https://main.d100wgour4wo0j.amplifyapp.com', 'https://glenify.studio'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: [
          'Content-Type',
          'Authorization',
          'X-Requested-With',
          'Accept',
        ],
        allowCredentials: true,
      },
    });

  }
}