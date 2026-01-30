# API Gateway for S3 Presigned URL API

# REST API
resource "aws_api_gateway_rest_api" "s3_presigned_url_api" {
  name        = "${var.environment}-s3-presigned-url-api"
  description = "API for generating S3 presigned URLs"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name = "${var.environment}-s3-presigned-url-api"
  }
}

# /upload-url resource
resource "aws_api_gateway_resource" "upload_url" {
  rest_api_id = aws_api_gateway_rest_api.s3_presigned_url_api.id
  parent_id   = aws_api_gateway_rest_api.s3_presigned_url_api.root_resource_id
  path_part   = "upload-url"
}

# POST /upload-url method
resource "aws_api_gateway_method" "post_upload_url" {
  rest_api_id   = aws_api_gateway_rest_api.s3_presigned_url_api.id
  resource_id   = aws_api_gateway_resource.upload_url.id
  http_method   = "POST"
  authorization = "NONE"
}

# POST /upload-url integration with Lambda
resource "aws_api_gateway_integration" "post_upload_url_lambda" {
  rest_api_id             = aws_api_gateway_rest_api.s3_presigned_url_api.id
  resource_id             = aws_api_gateway_resource.upload_url.id
  http_method             = aws_api_gateway_method.post_upload_url.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.generate_upload_url.invoke_arn
}

# /download-url resource
resource "aws_api_gateway_resource" "download_url" {
  rest_api_id = aws_api_gateway_rest_api.s3_presigned_url_api.id
  parent_id   = aws_api_gateway_rest_api.s3_presigned_url_api.root_resource_id
  path_part   = "download-url"
}

# GET /download-url method
resource "aws_api_gateway_method" "get_download_url" {
  rest_api_id   = aws_api_gateway_rest_api.s3_presigned_url_api.id
  resource_id   = aws_api_gateway_resource.download_url.id
  http_method   = "GET"
  authorization = "NONE"
}

# GET /download-url integration with Lambda
resource "aws_api_gateway_integration" "get_download_url_lambda" {
  rest_api_id             = aws_api_gateway_rest_api.s3_presigned_url_api.id
  resource_id             = aws_api_gateway_resource.download_url.id
  http_method             = aws_api_gateway_method.get_download_url.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.generate_download_url.invoke_arn
}

# CORS configuration for /upload-url
resource "aws_api_gateway_method" "upload_url_options" {
  rest_api_id   = aws_api_gateway_rest_api.s3_presigned_url_api.id
  resource_id   = aws_api_gateway_resource.upload_url.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "upload_url_options" {
  rest_api_id = aws_api_gateway_rest_api.s3_presigned_url_api.id
  resource_id = aws_api_gateway_resource.upload_url.id
  http_method = aws_api_gateway_method.upload_url_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "upload_url_options" {
  rest_api_id = aws_api_gateway_rest_api.s3_presigned_url_api.id
  resource_id = aws_api_gateway_resource.upload_url.id
  http_method = aws_api_gateway_method.upload_url_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "upload_url_options" {
  rest_api_id = aws_api_gateway_rest_api.s3_presigned_url_api.id
  resource_id = aws_api_gateway_resource.upload_url.id
  http_method = aws_api_gateway_method.upload_url_options.http_method
  status_code = aws_api_gateway_method_response.upload_url_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# CORS configuration for /download-url
resource "aws_api_gateway_method" "download_url_options" {
  rest_api_id   = aws_api_gateway_rest_api.s3_presigned_url_api.id
  resource_id   = aws_api_gateway_resource.download_url.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "download_url_options" {
  rest_api_id = aws_api_gateway_rest_api.s3_presigned_url_api.id
  resource_id = aws_api_gateway_resource.download_url.id
  http_method = aws_api_gateway_method.download_url_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "download_url_options" {
  rest_api_id = aws_api_gateway_rest_api.s3_presigned_url_api.id
  resource_id = aws_api_gateway_resource.download_url.id
  http_method = aws_api_gateway_method.download_url_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "download_url_options" {
  rest_api_id = aws_api_gateway_rest_api.s3_presigned_url_api.id
  resource_id = aws_api_gateway_resource.download_url.id
  http_method = aws_api_gateway_method.download_url_options.http_method
  status_code = aws_api_gateway_method_response.download_url_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# API Gateway deployment
resource "aws_api_gateway_deployment" "s3_presigned_url_api" {
  rest_api_id = aws_api_gateway_rest_api.s3_presigned_url_api.id

  depends_on = [
    aws_api_gateway_integration.post_upload_url_lambda,
    aws_api_gateway_integration.get_download_url_lambda,
    aws_api_gateway_integration.upload_url_options,
    aws_api_gateway_integration.download_url_options
  ]

  lifecycle {
    create_before_destroy = true
  }
}

# API Gateway stage
resource "aws_api_gateway_stage" "s3_presigned_url_api" {
  deployment_id = aws_api_gateway_deployment.s3_presigned_url_api.id
  rest_api_id   = aws_api_gateway_rest_api.s3_presigned_url_api.id
  stage_name    = "v1"

  tags = {
    Name = "${var.environment}-s3-presigned-url-api-v1"
  }
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "s3_api_gateway" {
  name              = "/aws/apigateway/${var.environment}-s3-presigned-url-api"
  retention_in_days = var.log_retention_days

  tags = {
    Name = "${var.environment}-s3-api-gateway-logs"
  }
}

# API Gateway account settings for CloudWatch Logs
resource "aws_api_gateway_account" "s3_api" {
  cloudwatch_role_arn = aws_iam_role.api_gateway_cloudwatch.arn
}

# IAM role for API Gateway CloudWatch Logs
resource "aws_iam_role" "api_gateway_cloudwatch" {
  name = "${var.environment}-api-gateway-cloudwatch-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })
}

# Attach CloudWatch Logs policy to API Gateway role
resource "aws_iam_role_policy_attachment" "api_gateway_cloudwatch" {
  role       = aws_iam_role.api_gateway_cloudwatch.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

# Outputs for API Gateway
output "s3_api_gateway_url" {
  description = "S3 Presigned URL API Gateway endpoint"
  value       = "${aws_api_gateway_stage.s3_presigned_url_api.invoke_url}"
}

output "s3_api_gateway_id" {
  description = "S3 Presigned URL API Gateway ID"
  value       = aws_api_gateway_rest_api.s3_presigned_url_api.id
}
