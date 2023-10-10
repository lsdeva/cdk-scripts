import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as elbv2targets from '@aws-cdk/aws-elasticloadbalancingv2-targets';
import * as acm from '@aws-cdk/aws-certificatemanager';

export class MyCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create VPC
    const vpc = new ec2.Vpc(this, 'VPC', {
      maxAzs: 2,
    });

    // Create a security group in the VPC
    const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', { vpc });

    // Add S3 VPC Endpoint
    new ec2.InterfaceVpcEndpoint(this, 'VpcEndpointS3', {
      service: ec2.InterfaceVpcEndpointAwsService.S3,
      privateDnsEnabled: true,
      securityGroups: [securityGroup],
      vpc,
    });

    // Create SSL certificate
    const sslCert = acm.Certificate.fromCertificateArn(this, 'SSLCert', 'yourSSLCertArn');

    // Create an Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: false,
      securityGroup,
    });

    // Add HTTPS listener to ALB
    const listener = alb.addListener('Listener', {
      port: 443,
      certificates: [sslCert],
    });

    // Create IP Target Group
    const ipTargetGroup = new elbv2.ApplicationTargetGroup(this, 'IPTargetGroup', {
      vpc,
      targets: [new elbv2targets.IpTarget('your-target-ip-address')],
      protocol: elbv2.ApplicationProtocol.HTTPS,
      port: 443,
    });

    // Add the target group to the HTTPS listener
    listener.addTargetGroups('AddTargetGroup', {
      targetGroups: [ipTargetGroup],
    });

    // Output the DNS name of the ALB
    new cdk.CfnOutput(this, 'ALB DNS Name', { value: alb.loadBalancerDnsName });
  }
}

const app = new cdk.App();
new MyCdkStack(app, 'MyCdkStack');
