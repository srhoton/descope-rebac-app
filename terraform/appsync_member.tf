# Member Service AppSync API

# IAM role for AppSync
resource "aws_iam_role" "appsync_member" {
  name = "appsync-member-service-role"

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
    Name = "appsync-member-service-role"
  }
}

# IAM policy for AppSync to invoke Lambda and write logs
resource "aws_iam_role_policy" "appsync_member_policy" {
  name = "appsync-member-policy"
  role = aws_iam_role.appsync_member.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = [
          aws_lambda_function.member_service.arn,
          "${aws_lambda_function.member_service.arn}:*"
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
resource "aws_cloudwatch_log_group" "appsync_member" {
  name              = "/aws/appsync/member-service"
  retention_in_days = 7

  tags = {
    Name = "appsync-member-service-logs"
  }
}

# AppSync GraphQL API for Member Service
resource "aws_appsync_graphql_api" "member" {
  name                = "member-service-api"
  authentication_type = "OPENID_CONNECT"

  openid_connect_config {
    issuer    = "https://api.descope.com/v1/apps/${var.descope_project_id}"
    client_id = var.descope_project_id
  }

  log_config {
    cloudwatch_logs_role_arn = aws_iam_role.appsync_member.arn
    field_log_level          = "ALL"
  }

  schema = file("${path.module}/graphql/member_service.graphql")

  tags = {
    Name = "member-service-api"
  }
}

# Lambda Data Source pointing to member-service Lambda
resource "aws_appsync_datasource" "member_lambda" {
  api_id           = aws_appsync_graphql_api.member.id
  name             = "MemberServiceLambda"
  type             = "AWS_LAMBDA"
  service_role_arn = aws_iam_role.appsync_member.arn

  lambda_config {
    function_arn = aws_lambda_alias.member_service.arn
  }
}

# Resolver for listMembers query
resource "aws_appsync_resolver" "list_members" {
  api_id      = aws_appsync_graphql_api.member.id
  type        = "Query"
  field       = "listMembers"
  data_source = aws_appsync_datasource.member_lambda.name

  request_template = <<EOF
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "httpMethod": "GET",
    "path": "/tenants/$ctx.args.tenantId/members",
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

# Resolver for getMember query
resource "aws_appsync_resolver" "get_member" {
  api_id      = aws_appsync_graphql_api.member.id
  type        = "Query"
  field       = "getMember"
  data_source = aws_appsync_datasource.member_lambda.name

  request_template = <<EOF
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "httpMethod": "GET",
    "path": "/tenants/$ctx.args.tenantId/members/$util.urlEncode($ctx.args.loginId)",
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

# Resolver for createMember mutation
resource "aws_appsync_resolver" "create_member" {
  api_id      = aws_appsync_graphql_api.member.id
  type        = "Mutation"
  field       = "createMember"
  data_source = aws_appsync_datasource.member_lambda.name

  request_template = <<EOF
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "httpMethod": "POST",
    "path": "/tenants/$ctx.args.tenantId/members",
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

# Resolver for updateMember mutation
resource "aws_appsync_resolver" "update_member" {
  api_id      = aws_appsync_graphql_api.member.id
  type        = "Mutation"
  field       = "updateMember"
  data_source = aws_appsync_datasource.member_lambda.name

  request_template = <<EOF
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "httpMethod": "PUT",
    "path": "/tenants/$ctx.args.tenantId/members/$util.urlEncode($ctx.args.loginId)",
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

# Resolver for deleteMember mutation
resource "aws_appsync_resolver" "delete_member" {
  api_id      = aws_appsync_graphql_api.member.id
  type        = "Mutation"
  field       = "deleteMember"
  data_source = aws_appsync_datasource.member_lambda.name

  request_template = <<EOF
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "httpMethod": "DELETE",
    "path": "/tenants/$ctx.args.tenantId/members/$util.urlEncode($ctx.args.loginId)",
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

# Resolver for getUserById query
resource "aws_appsync_resolver" "get_user_by_id" {
  api_id      = aws_appsync_graphql_api.member.id
  type        = "Query"
  field       = "getUserById"
  data_source = aws_appsync_datasource.member_lambda.name

  request_template = <<EOF
{
  "version": "2017-02-28",
  "operation": "Invoke",
  "payload": {
    "httpMethod": "GET",
    "path": "/users/$util.urlEncode($ctx.args.userId)",
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

# Outputs for Member Service AppSync API
output "appsync_member_api_id" {
  description = "Member Service AppSync API ID"
  value       = aws_appsync_graphql_api.member.id
}

output "appsync_member_api_url" {
  description = "Member Service AppSync GraphQL URL"
  value       = aws_appsync_graphql_api.member.uris["GRAPHQL"]
}

