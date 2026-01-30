# Organization Service AppSync API

# IAM role for AppSync
resource "aws_iam_role" "appsync_org" {
  name = "appsync-org-service-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "appsync.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "appsync-org-service-role"
  }
}

# IAM policy for AppSync to invoke Lambda and write logs
resource "aws_iam_role_policy" "appsync_org_policy" {
  name = "appsync-org-policy"
  role = aws_iam_role.appsync_org.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = [
          aws_lambda_function.org_service.arn,
          "${aws_lambda_function.org_service.arn}:*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# CloudWatch Log Group for AppSync
resource "aws_cloudwatch_log_group" "appsync_org" {
  name              = "/aws/appsync/org-service"
  retention_in_days = 7

  tags = {
    Name = "appsync-org-service-logs"
  }
}

# AppSync GraphQL API for Organization Service
resource "aws_appsync_graphql_api" "org" {
  name                = "org-service-api"
  authentication_type = "API_KEY"

  log_config {
    cloudwatch_logs_role_arn = aws_iam_role.appsync_org.arn
    field_log_level          = "ALL"
  }

  schema = file("${path.module}/graphql/org_service.graphql")

  tags = {
    Name = "org-service-api"
  }
}

# API Key for testing (no authentication for now)
resource "aws_appsync_api_key" "org" {
  api_id  = aws_appsync_graphql_api.org.id
  expires = timeadd(timestamp(), "8760h")

  lifecycle {
    ignore_changes = [expires]
  }
}

# Lambda Data Source pointing to org-service Lambda
resource "aws_appsync_datasource" "org_lambda" {
  api_id           = aws_appsync_graphql_api.org.id
  name             = "OrgServiceLambda"
  type             = "AWS_LAMBDA"
  service_role_arn = aws_iam_role.appsync_org.arn

  lambda_config {
    function_arn = aws_lambda_alias.org_service.arn
  }
}

# Resolver for listTenants query
resource "aws_appsync_resolver" "list_tenants" {
  api_id      = aws_appsync_graphql_api.org.id
  type        = "Query"
  field       = "listTenants"
  data_source = aws_appsync_datasource.org_lambda.name

  request_template = <<EOF
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "httpMethod": "GET",
    "path": "/tenants",
    "queryStringParameters": {
      #if($ctx.args.page)
        "page": "$ctx.args.page",
      #end
      #if($ctx.args.pageSize)
        "pageSize": "$ctx.args.pageSize"
      #end
    },
    "headers": {
      "Content-Type": "application/json"
    },
    "requestContext": {}
  }
}
EOF

  response_template = <<EOF
#if($ctx.result.statusCode == 200)
  $ctx.result.body
#else
  #set($errorBody = $util.parseJson($ctx.result.body))
  $util.error($errorBody.message, "InternalError")
#end
EOF
}

# Resolver for getTenant query
resource "aws_appsync_resolver" "get_tenant" {
  api_id      = aws_appsync_graphql_api.org.id
  type        = "Query"
  field       = "getTenant"
  data_source = aws_appsync_datasource.org_lambda.name

  request_template = <<EOF
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "httpMethod": "GET",
    "path": "/tenants/$ctx.args.tenantId",
    "headers": {
      "Content-Type": "application/json"
    },
    "requestContext": {}
  }
}
EOF

  response_template = <<EOF
#if($ctx.result.statusCode == 200)
  $ctx.result.body
#elseif($ctx.result.statusCode == 404)
  null
#else
  #set($errorBody = $util.parseJson($ctx.result.body))
  $util.error($errorBody.message, "InternalError")
#end
EOF
}

# Resolver for createTenant mutation
resource "aws_appsync_resolver" "create_tenant" {
  api_id      = aws_appsync_graphql_api.org.id
  type        = "Mutation"
  field       = "createTenant"
  data_source = aws_appsync_datasource.org_lambda.name

  request_template = <<EOF
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "httpMethod": "POST",
    "path": "/tenants",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": "$util.escapeJavaScript($util.toJson($ctx.args.input))",
    "requestContext": {}
  }
}
EOF

  response_template = <<EOF
#if($ctx.result.statusCode == 201)
  $ctx.result.body
#else
  #set($errorBody = $util.parseJson($ctx.result.body))
  $util.error($errorBody.message, "InternalError")
#end
EOF
}

# Resolver for updateTenant mutation
resource "aws_appsync_resolver" "update_tenant" {
  api_id      = aws_appsync_graphql_api.org.id
  type        = "Mutation"
  field       = "updateTenant"
  data_source = aws_appsync_datasource.org_lambda.name

  request_template = <<EOF
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "httpMethod": "PUT",
    "path": "/tenants/$ctx.args.tenantId",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": "$util.escapeJavaScript($util.toJson($ctx.args.input))",
    "requestContext": {}
  }
}
EOF

  response_template = <<EOF
#if($ctx.result.statusCode == 200)
  $ctx.result.body
#else
  #set($errorBody = $util.parseJson($ctx.result.body))
  $util.error($errorBody.message, "InternalError")
#end
EOF
}

# Resolver for deleteTenant mutation
resource "aws_appsync_resolver" "delete_tenant" {
  api_id      = aws_appsync_graphql_api.org.id
  type        = "Mutation"
  field       = "deleteTenant"
  data_source = aws_appsync_datasource.org_lambda.name

  request_template = <<EOF
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "httpMethod": "DELETE",
    "path": "/tenants/$ctx.args.tenantId",
    "headers": {
      "Content-Type": "application/json"
    },
    "requestContext": {}
  }
}
EOF

  response_template = <<EOF
#if($ctx.result.statusCode == 204)
  true
#else
  #set($errorBody = $util.parseJson($ctx.result.body))
  $util.error($errorBody.message, "InternalError")
#end
EOF
}

# Outputs for Organization Service AppSync API
output "appsync_org_api_id" {
  description = "Organization Service AppSync API ID"
  value       = aws_appsync_graphql_api.org.id
}

output "appsync_org_api_url" {
  description = "Organization Service AppSync GraphQL URL"
  value       = aws_appsync_graphql_api.org.uris["GRAPHQL"]
}

output "appsync_org_api_key" {
  description = "Organization Service AppSync API Key"
  value       = aws_appsync_api_key.org.key
  sensitive   = true
}
