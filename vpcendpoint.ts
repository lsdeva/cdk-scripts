import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cr from '@aws-cdk/custom-resources';

export class InternalStaticWebsiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. S3 bucket for the static website
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 2. VPC
    const vpc = new ec2.Vpc(this, 'CustomVPC');

    // 3. Interface VPC Endpoint for S3 (assuming it's available in your region)
    const s3Endpoint = vpc.addInterfaceEndpoint('S3Endpoint', {
      service: new ec2.InterfaceVpcEndpointService('com.amazonaws.REGION.s3', 443),
      subnets: { subnetType: ec2.SubnetType.ISOLATED },
    });

    // 4. Lambda function to fetch the IP addresses of the specified Interface VPC Endpoint
    const getEndpointIps = new lambda.Function(this, 'GetEndpointIpsFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const ec2 = new AWS.EC2();
        
        exports.handler = async function(event, context) {
          const endpointId = event.ResourceProperties.EndpointId;
          
          const data = await ec2.describeNetworkInterfaces({ Filters: [{ Name: 'vpc-endpoint-id', Values: [endpointId] }]}).promise();
          
          const ips = data.NetworkInterfaces.map(ni => ni.PrivateIpAddress);
          
          return {
            StatusCode: 200,
            Body: JSON.stringify(ips),
          };
        };
      `),
      timeout: cdk.Duration.seconds(10),
      environment: {
        AWS_REGION: this.region,
      },
    });

    s3Endpoint.grantDescribe(getEndpointIps);

    // 5. Custom Resource to get the IPs of the VPC Endpoint
    const endpointIps = new cr.AwsCustomResource(this, 'GetEndpointIPs', {
      onUpdate: {
        service: 'Lambda',
        action: 'invoke',
        parameters: {
          FunctionName: getEndpointIps.functionName,
          Payload: JSON.stringify({
            ResourceProperties: {
              EndpointId: s3Endpoint.vpcEndpointId,
            },
          }),
        },
        physicalResourceId: cr.PhysicalResourceId.of(Date.now().toString()),
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({ resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE }),
    });

    const ips = JSON.parse(endpointIps.getResponseField('Body'));

    // 6. Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: false,
    });

    const listener = alb.addListener('Listener', { port: 80, open: true });

    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TG', {
      vpc,
      targetType: elbv2.TargetType.IP,
      targets: ips.map(ip => new elbv2.IpTarget(ip)),
    });

    listener.addTargetGroups('Default', { targetGroups: [targetGroup] });
  }
}
