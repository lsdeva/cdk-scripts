1. AWS AppConfig
	AWS AppConfig is a feature of AWS Systems Manager that helps you increase your software deployment velocity and confidence. Providing dynamic configuration and feature flagging, AppConfig is a tool that decouples your feature releases from code deployments. You can create new features and push the code to production with the new feature hidden behind. 
2. AWS CloudFormation
3. AWS CloudTrail
4. Amazon CloudWatch
5. AWS Config
6. AWS License Manager
7. Operations
7.5 Operations - 2022
8. AWS Service Catalog
	You can define and manage your applications and their metadata, to keep track of cost, performance, security, compliance and operational status at the application level.
9. AWS Systems Manager
10. EC2 Image Builder




The blog post you referred to is about AWS AppRegistry and AWS Application Manager, which are tools offered by AWS to help organizations better manage and govern their applications centrally.

### AWS AppRegistry:
AWS AppRegistry allows users to define and manage repositories of applications and associated resources within their AWS environment. You can define your applications, associate attributes (like tags or labels), group resources that make up an application, and manage metadata to provide a structured way of managing applications across different AWS accounts and regions. AppRegistry helps you have a single view of all your AWS applications to enhance visibility and governance.

### AWS Application Manager:
AWS Application Manager leverages AWS AppRegistry to provide a governance framework for AWS applications. It offers a visual interface for centralized governance, enabling users to visualize, monitor, and manage applications and their components across AWS accounts and organizational units. You can see an application’s operational data, resource relationships, and associated policies—all in one place.

### Integration and Benefits:
- **Centralized Application Repository**: With AWS AppRegistry, you can have a single source of truth for all applications, improving consistency and collaboration among teams. All applications' metadata and related resources can be managed centrally.

- **Application Monitoring and Management**: AWS Application Manager integrates with AWS AppRegistry to provide a unified, visual interface for managing applications. You can view operational data, monitor applications’ status, and enforce governance policies.

- **Tagging and Labeling**: You can use tags and labels in AWS AppRegistry to categorize and manage applications effectively. These can then be visualized in AWS Application Manager, enhancing search and management capabilities.

- **AWS Organizations Integration**: AWS Application Manager integrates with AWS Organizations to enable management across multiple AWS accounts and organizational units, enhancing scalability and governance.

- **Policy Enforcement**: With AWS Application Manager, you can enforce policies for applications based on their metadata in AWS AppRegistry. It simplifies governance and compliance management.

### Workflow:
1. **Register Applications**: Register and define your applications in AWS AppRegistry.

2. **Associate Resources and Metadata**: Link AWS resources and metadata to applications to have a complete view of each application’s components and attributes.

3. **Visualize and Manage**: Use AWS Application Manager to visualize, monitor, and manage applications. Enforce governance policies and view operational data.

4. **Scalable Management**: Leverage integration with AWS Organizations for scalable, centralized management across multiple AWS accounts and regions.

### Conclusion:
Together, AWS AppRegistry and AWS Application Manager enable organizations to have a centralized, scalable, and effective approach to managing and governing AWS applications. Application metadata and resources are managed in AWS AppRegistry, and AWS Application Manager provides the tools for visualizing, monitoring, and governing applications centrally, enhancing consistency, collaboration, and compliance.
