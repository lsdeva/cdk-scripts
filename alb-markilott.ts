// https://github.com/markilott/aws-cdk-internal-private-api-demo/blob/main/lib/application/application-stack.ts
        // security group
        const albSg = new SecurityGroup(this, 'albSg', {
            description: 'ALB Endpoint SG',
            vpc,
            allowAllOutbound: true,
        });
        albSg.addIngressRule(Peer.ipv4(vpc.vpcCidrBlock), Port.tcp(443), 'allow internal ALB access');
        albSg.addIngressRule(Peer.ipv4(vpc.vpcCidrBlock), Port.tcp(80), 'allow internal ALB access');

        // load balancer base
        const alb = new ApplicationLoadBalancer(this, 'alb', {
            vpc,
            vpcSubnets: {
                subnets: [subnet1, subnet2],
            },
            internetFacing: false,
            securityGroup: albSg,
        });

        // listeners
        const https = alb.addListener('https', {
            port: 443,
            protocol: ApplicationProtocol.HTTPS,
            certificates: [certificate],
        });
        // addRedirect will create a HTTP listener and redirect to HTTPS
        alb.addRedirect({
            sourceProtocol: ApplicationProtocol.HTTP,
            sourcePort: 80,
            targetProtocol: ApplicationProtocol.HTTPS,
            targetPort: 443,
        });

        // DNS alias for ALB
        new ARecord(this, 'albAlias', {
            recordName: albDomainName,
            zone,
            comment: 'Alias for API ALB Demo',
            target: RecordTarget.fromAlias(new LoadBalancerTarget(alb)),
        });

        // add targets
        const ipTargets = endpointIpAddresses.map((ip) => new IpTarget(ip));
        const apiTargetGroup = new ApplicationTargetGroup(this, 'apiEndpointGroup', {
            targetGroupName: 'ApiEndpoints',
            port: 443,
            protocol: ApplicationProtocol.HTTPS,
            healthCheck: {
                path: '/',
                interval: Duration.minutes(5),
                healthyHttpCodes: '200-202,400-404',
            },
            targetType: TargetType.IP,
            targets: ipTargets,
            vpc,
        });

        // add routing actions. Send a 404 response if the request does not match one of our API paths
        https.addAction('default', {
            action: ListenerAction.fixedResponse(404, {
                contentType: 'text/plain',
                messageBody: 'Nothing to see here',
            }),
        });
        https.addAction('apis', {
            action: ListenerAction.forward([apiTargetGroup]),
            conditions: [
                ListenerCondition.pathPatterns([`/${apiPath1}`, `/${apiPath2}`]),
            ],
            priority: 1,
        });
    }
