aws ec2 create-security-group --group-name SSHAccess --description "Security group for SSH access" --vpc-id vpc-<> 
aws ec2 authorize-security-group-ingress --group-id sg-<>  --protocol tcp --port 22 --cidr 0.0.0.0/0 
aws ec2 run-instances --image-id ami-041feb57c611358bd --count 1 --instance-type t2.micro --key-name test --security-group-ids sg-<> --subnet-id subnet-<>


aws ec2 create-security-group --group-name privateec2 --description "private ec2" --vpc-id vpc-<> 
aws ec2 authorize-security-group-ingress --group-id sg-<> --protocol tcp --port 22 --source-group sg-<>0aaca4f197a6ded72
aws ec2 run-instances --image-id ami-041feb57c611358bd --count 1 --instance-type t2.micro --key-name test --security-group-ids sg-<> --subnet-id subnet-<>

