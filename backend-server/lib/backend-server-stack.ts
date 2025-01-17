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

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be defined');
    }

    const fn = new NodejsFunction(this, 'lambda', {
      entry: 'lambda/index.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
    });

    // Add environment variables
    fn.addEnvironment('SUPABASE_URL', process.env.SUPABASE_URL);
    fn.addEnvironment('SUPABASE_ANON_KEY', process.env.SUPABASE_ANON_KEY);

    // Create the API Gateway with CORS configuration
    new apigw.LambdaRestApi(this, 'loan-managment-api', {
      handler: fn,
      defaultCorsPreflightOptions: {
        allowOrigins: ['http://localhost:5173'],
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