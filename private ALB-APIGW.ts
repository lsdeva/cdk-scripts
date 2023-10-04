import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';

export class MyCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 3,  // Default is all AZs in region
    });

    // Create a private REST API
    const api = new apigw.RestApi(this, 'MyApi', {
      deployOptions: {
        stageName: 'prod',
      },
      endpointConfiguration: {
        types: [apigw.EndpointType.PRIVATE],
      },
      policy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            actions: ['execute-api:Invoke'],
            resources: ['*'],
            effect: iam.Effect.ALLOW,
            principals: [new iam.ArnPrincipal('*')],
            conditions: {
              StringEquals: {
                'aws:sourceVpce': vpcEndpoint.vpcEndpointId,
              },
            },
          }),
        ],
      }),
    });

    // Integrate with a Lambda function or any other backend
    const lambdaFunction = new lambda.Function(this, 'MyLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    const integration = new apigw.LambdaIntegration(lambdaFunction);
    api.root.addMethod('GET', integration);

    // Create a VPC Endpoint for the API
    const vpcEndpoint = vpc.addInterfaceEndpoint('MyVpcEndpoint', {
      service: {
        name: `com.amazonaws.${this.region}.execute-api`,
        privateDnsEnabled: true,
      },
    });
    vpcEndpoint.connections.allowDefaultPortFromAnyIpv4();
  }
}
