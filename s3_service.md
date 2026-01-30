In a new directory called s3_service, we want to create a TypeScript and React-based website that allows people upload images to an S3 bucket. The flow is as follows:

- If the user is not logged into descope they should be redirected to the descope login page for fullbay (https://descope-idp.auth.descope.com). After logging in they should be redirected back to the image upload page. This may require updated configuration in the idp_service project to allow this redirect.
- After logging in, the user should see a simple page with an image upload button, and a list of previously uploaded images (if any). This can be found be querying the rebac_service appsync endpoint for images the user has access to. They should also see an upload button that allows them to select an image from their computer and upload it to the S3 bucket.

- When the user selects an image to upload, it should be uploaded to the S3 bucket in a folder corresponding to their user id (which can be found in the descope user info), and the rebac_service appsync create relation endpoint should be updated to reflect the new image being available to the user as an owner. The page should then refresh the list of images to show the newly uploaded image.

- This should be deployed using S3 and CloudFront.
- The deployment process should be done through Terraform (like the rest of the project). 
- The descope project id for this can be found in ~/git/tmp/descope/project_id. 
- It should resolve to a dns name of descope-s3.sb.fullbay.com. The domain is already managed in route53, but you will need to create an ACM ceritificate for it (no wildcard needed).

Let me know if you need any more information before proceeding.
