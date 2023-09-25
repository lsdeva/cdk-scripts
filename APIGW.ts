/* eslint-disable prettier/prettier */
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';


import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { resolve } from 'path';

interface Props {
  vpc: ec2.Vpc;
}

export default class APIGW extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const { vpc } = props;

    const apigwEndpoint = vpc.addInterfaceEndpoint('APIGWEP', {
        service: ec2.InterfaceVpcEndpointAwsService.APIGATEWAY
      });
  
    const api_temp = new apigw.RestApi(this, 'demoApi', {
    endpointConfiguration: {
        types: [apigw.EndpointType.PRIVATE],
        vpcEndpoints: [apigwEndpoint]
    },
    policy: new iam.PolicyDocument({
        statements: [
        new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            principals: [new iam.AnyPrincipal()],
            actions: ["execute-api:Invoke"],
            //the following creates a reference to the RestAPI itself
            resources: [cdk.Fn.join('', ['execute-api:/', '*'])]
        }),
        new iam.PolicyStatement({
            effect: iam.Effect.DENY,
            principals: [new iam.AnyPrincipal()],
            actions: ["execute-api:Invoke"],
            resources: [cdk.Fn.join('', ['execute-api:/', '*'])],
            conditions: {
            "StringNotEquals": {
                "aws:sourceVpc": vpc.vpcId
            }
            }
        })
        ]
    })
    });

    // eslint-disable-next-line no-new-func
    const lambdaFnc = new Function(this , 'lambdaFnc', {
        functionName: 'lambdaFnc',
        code: Code.fromAsset(resolve(__dirname, 'lambda')),
        handler: 'hello.handler', 
        runtime: Runtime.NODEJS_16_X,
        vpc,
    });

    const demo = api_temp.root.addResource('demo');
    demo.addMethod('GET', new apigw.LambdaIntegration(lambdaFnc));
  }
}
