In a new directory called 'org_service', we need to create a new Quarkus based Java21 lambda service that will do CRUD operations against descope tenants in a project. It should:
- be deployed in an existing VPC (default value should be 'vpc-03163f35ccd0fc6a9')
- in private subnets (which can be determined from the tag 'tier' with value 'private')
- behind an existing alb (default arn should be arn:aws:elasticloadbalancing:us-west-2:345594586248:loadbalancer/app/external-private-alb/720e2b5474d3d602)
- Use terraform (in a new directory called terraform at the root) to fully build and deploy. Local state is fine.
- It should use the Descope Java SDK (https://github.com/descope/descope-java) for all operations.
- The project id and management key should be provided via secrets manager and injected as environment variables into the lambda. They default secret name is 'sandbox/descope/rebac', which has two keys: 'projectId' and 'managementKey'.
- Be REST compliant and have endpoints for Create, Read, Update, and Delete operations on tenants.

Let me know what questions you have before starting.
