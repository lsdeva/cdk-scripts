import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';

export class InternalStaticWebsiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the S3 bucket for the static website
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'CustomVPC', {
      maxAzs: 2,
    });

    // Create a private VPC endpoint for S3
    vpc.addGatewayEndpoint('S3Endpoint', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
    });

    // Create the Application Load Balancer within the VPC
    const alb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: false,
      securityGroup: new ec2.SecurityGroup(this, 'ALBSG', {
        vpc: vpc,
        allowAllOutbound: true,
      }),
    });

    // ALB Listener
    const listener = alb.addListener('Listener', {
      port: 80,
      open: true,
    });

    // Add a fixed response to the listener
    listener.addAction('FixedResponse', {
      priority: 1,
      conditions: [elbv2.ListenerCondition.pathPatterns(['/'])],
      fixedResponse: {
        statusCode: '200',
        contentType: elbv2.ContentType.TEXT_PLAIN,
        messageBody: 'The site is being served via the ALB!'
      }
    });

    // S3 bucket policy that allows the ALB to access it
    websiteBucket.addToResourcePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['s3:GetObject'],
      resources: [websiteBucket.arnForObjects('*')],
      principals: [alb.loadBalancerSecurityGroup.grantPrincipal],
    }));
  }
}
