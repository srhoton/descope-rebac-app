# ReBac Service AppSync API

# IAM role for AppSync
resource "aws_iam_role" "appsync_rebac" {
  name = "appsync-rebac-service-role"

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
    Name = "appsync-rebac-service-role"
  }
}

# IAM policy for AppSync to invoke Lambda and write logs
resource "aws_iam_role_policy" "appsync_rebac_policy" {
  name = "appsync-rebac-policy"
  role = aws_iam_role.appsync_rebac.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = [
          aws_lambda_function.rebac_service.arn,
          "${aws_lambda_function.rebac_service.arn}:*"
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
resource "aws_cloudwatch_log_group" "appsync_rebac" {
  name              = "/aws/appsync/rebac-service"
  retention_in_days = 7

  tags = {
    Name = "appsync-rebac-service-logs"
  }
}

# AppSync GraphQL API for ReBac Service
resource "aws_appsync_graphql_api" "rebac" {
  name                = "rebac-service-api"
  authentication_type = "OPENID_CONNECT"

  openid_connect_config {
    issuer    = "https://api.descope.com/v1/apps/${var.descope_project_id}"
    client_id = var.descope_project_id
  }

  log_config {
    cloudwatch_logs_role_arn = aws_iam_role.appsync_rebac.arn
    field_log_level          = "ALL"
  }

  schema = file("${path.module}/graphql/rebac_service.graphql")

  tags = {
    Name = "rebac-service-api"
  }
}

# Lambda Data Source pointing to rebac-service Lambda
resource "aws_appsync_datasource" "rebac_lambda" {
  api_id           = aws_appsync_graphql_api.rebac.id
  name             = "ReBacServiceLambda"
  type             = "AWS_LAMBDA"
  service_role_arn = aws_iam_role.appsync_rebac.arn

  lambda_config {
    function_arn = aws_lambda_alias.rebac_service.arn
  }
}

# Resolver for getResourceRelations query
resource "aws_appsync_resolver" "get_resource_relations" {
  api_id      = aws_appsync_graphql_api.rebac.id
  type        = "Query"
  field       = "getResourceRelations"
  data_source = aws_appsync_datasource.rebac_lambda.name

  request_template = <<EOF
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "httpMethod": "GET",
    "path": "/relations/resource/$util.urlEncode($ctx.args.resourceId)",
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

# Resolver for getTargetAccess query
resource "aws_appsync_resolver" "get_target_access" {
  api_id      = aws_appsync_graphql_api.rebac.id
  type        = "Query"
  field       = "getTargetAccess"
  data_source = aws_appsync_datasource.rebac_lambda.name

  request_template = <<EOF
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "httpMethod": "GET",
    "path": "/relations/target/$util.urlEncode($ctx.args.targetId)",
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

# Resolver for whoCanAccess query
resource "aws_appsync_resolver" "who_can_access" {
  api_id      = aws_appsync_graphql_api.rebac.id
  type        = "Query"
  field       = "whoCanAccess"
  data_source = aws_appsync_datasource.rebac_lambda.name

  request_template = <<EOF
#set($namespace = [$ctx.args.namespace])
#set($relationDefinition = [$ctx.args.relationDefinition])
#set($resource = [$ctx.args.resource])
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "requestContext": {
      "elb": {
        "targetGroupArn": "arn:aws:elasticloadbalancing:us-west-2:345594586248:targetgroup/rebac-service-lambda-tg/e1d32e7f5e93f247"
      }
    },
    "httpMethod": "GET",
    "path": "/relations/who-can-access",
    "multiValueQueryStringParameters": {
      "namespace": $util.toJson($namespace),
      "relationDefinition": $util.toJson($relationDefinition),
      "resource": $util.toJson($resource)
    },
    "headers": {
      "content-type": ["application/json"]
    },
    "body": null,
    "isBase64Encoded": false
  }
}
EOF

  response_template = <<EOF
#if($ctx.result.statusCode == 200)
  $ctx.result.body
#elseif($ctx.result.statusCode == 400)
  #set($errorBody = $util.parseJson($ctx.result.body))
  $util.error($errorBody.message, "BadRequest")
#else
  #set($errorBody = $util.parseJson($ctx.result.body))
  $util.error($errorBody.message, "InternalError")
#end
EOF
}

# Resolver for createRelations mutation
resource "aws_appsync_resolver" "create_relations" {
  api_id      = aws_appsync_graphql_api.rebac.id
  type        = "Mutation"
  field       = "createRelations"
  data_source = aws_appsync_datasource.rebac_lambda.name

  request_template = <<EOF
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "httpMethod": "POST",
    "path": "/relations",
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
#elseif($ctx.result.statusCode == 400)
  #set($errorBody = $util.parseJson($ctx.result.body))
  $util.error($errorBody.message, "BadRequest")
#else
  #set($errorBody = $util.parseJson($ctx.result.body))
  $util.error($errorBody.message, "InternalError")
#end
EOF
}

# Resolver for deleteRelations mutation
resource "aws_appsync_resolver" "delete_relations" {
  api_id      = aws_appsync_graphql_api.rebac.id
  type        = "Mutation"
  field       = "deleteRelations"
  data_source = aws_appsync_datasource.rebac_lambda.name

  request_template = <<EOF
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "httpMethod": "DELETE",
    "path": "/relations",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": "$util.escapeJavaScript($util.toJson($ctx.args.input))",
    "requestContext": {}
  }
}
EOF

  response_template = <<EOF
#if($ctx.result.statusCode == 204)
  true
#elseif($ctx.result.statusCode == 400)
  #set($errorBody = $util.parseJson($ctx.result.body))
  $util.error($errorBody.message, "BadRequest")
#else
  #set($errorBody = $util.parseJson($ctx.result.body))
  $util.error($errorBody.message, "InternalError")
#end
EOF
}

# Outputs for ReBac Service AppSync API
output "appsync_rebac_api_id" {
  description = "ReBac Service AppSync API ID"
  value       = aws_appsync_graphql_api.rebac.id
}

output "appsync_rebac_api_url" {
  description = "ReBac Service AppSync GraphQL URL"
  value       = aws_appsync_graphql_api.rebac.uris["GRAPHQL"]
}

