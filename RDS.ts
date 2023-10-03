import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';


interface Props {
  vpc: ec2.Vpc;
}

export class RDS extends Construct {
  public readonly instance: rds.DatabaseInstance;

  public readonly credentials: rds.DatabaseSecret;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const instance_id = 'my-sql-instance';
    const credentials_secret_name = `intranet/rds/${instance_id}`;

    this.credentials = new rds.DatabaseSecret(scope, 'MySQLCredentials', {
      secretName: credentials_secret_name,
      username: 'admin',
    });

    this.instance = new rds.DatabaseInstance(scope, 'MySQL-RDS-Instance', {
      credentials: rds.Credentials.fromSecret(this.credentials),
      databaseName: 'temp',
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0_28,
      }),
      instanceIdentifier: instance_id,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.SMALL,
      ),
      port: 3306,
      publiclyAccessible: false,
      vpc: props.vpc,
      vpcSubnets: props.vpc.selectSubnets({
        subnetGroupName: 'rds',
      }),
    });
  }
}
