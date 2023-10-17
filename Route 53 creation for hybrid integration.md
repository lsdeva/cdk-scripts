### Case 1: Web Application Hosted in Local Data Center, Accessed from AWS

#### Step 1: Create a Hosted Zone for Your Domain
```powershell
$domainName = "example.com"
$hostedZone = aws route53 create-hosted-zone --name $domainName --caller-reference $(Get-Date).ToUniversalTime()
$hostedZoneId = ($hostedZone | ConvertFrom-Json).HostedZone.Id
```

#### Step 2: Create a Record Set to Point to the Local Data Center
```powershell
$localDataCenterIP = "203.0.113.5"
$recordSetName = "app.$domainName"

aws route53 change-resource-record-sets --hosted-zone-id $hostedZoneId --change-batch '
{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "'$recordSetName'",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "'$localDataCenterIP'"
          }
        ]
      }
    }
  ]
}'
```

Replace `"203.0.113.5"` with the IP address of your local data center where the web application is hosted.

### Case 2: Web Application Hosted in AWS Fronted with ALB, Accessed from Data Center

#### Step 1: Create a Hosted Zone for Your Domain
```powershell
$domainName = "example.com"
$hostedZone = aws route53 create-hosted-zone --name $domainName --caller-reference $(Get-Date).ToUniversalTime()
$hostedZoneId = ($hostedZone | ConvertFrom-Json).HostedZone.Id
```

#### Step 2: Create a Record Set to Point to the ALB
```powershell
$albDNSName = "my-alb-1234567890.us-west-2.elb.amazonaws.com"
$recordSetName = "app.$domainName"

aws route53 change-resource-record-sets --hosted-zone-id $hostedZoneId --change-batch '
{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "'$recordSetName'",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "'$albDNSName'"
          }
        ]
      }
    }
  ]
}'
```

Replace `"my-alb-1234567890.us-west-2.elb.amazonaws.com"` with the DNS name of your ALB.

#### Notes:
- Ensure you update the NS records at your domain registrar with the NS records provided by AWS Route 53 when the hosted zone is created.
- Adjust TTL and other configurations as per your requirements.
- Always replace placeholders like `"example.com"`, `"203.0.113.5"`, and `"my-alb-1234567890.us-west-2.elb.amazonaws.com"` with your actual values.

These scripts assume you have AWS CLI installed and configured with the necessary permissions to execute these commands in your PowerShell environment.
