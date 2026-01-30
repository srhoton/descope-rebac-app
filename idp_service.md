In a new directory called idp_service, we want to create a TypeScript and React-based website that allows people to log in via descope. The flow is straightforward: users will land on a homepage with a login button, and upon clicking it, they will be redirected to Descope's hosted login page. After successful authentication, users will be redirected back to our site, where we will display their user information. We will use Descope's React SDK to facilitate this process (https://github.com/descope/descope-js/tree/main/packages/sdks/react-sdk). Additional notes: 

- This should be deployed using S3 and CloudFront.
- The deployment process should be done through Terraform (like the rest of the project). 
- The descope project id for this can be found in ~/git/tmp/descope/project_id. 
- It will need the ability for a user to log into and out of different descope tenants. This may be already be supported by the descope sdk but if not, we will need to add that functionality.
- It should resolve to a dns name of descope-idp.sb.fullbay.com. The domain is already managed in route53, but you will need to create an ACM ceritificate for it (no wildcard needed).

Let me know if you need any more information before proceeding.
