import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class SampleStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const vpc = ec2.Vpc.fromLookup(this, 'VPC', {
            vpcId: 'sample-vpc-id',
        });

        const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
            vpc,
            description: 'for ALB',
            allowAllOutbound: true,
        });

        // Allow SSH access on port tcp/22
        securityGroup.addIngressRule(
            ec2.Peer.prefix_list("cloudfront-prefix-list-id"),
            ec2.Port.tcp(443),
            'Allow HTTPS Access',
        );
