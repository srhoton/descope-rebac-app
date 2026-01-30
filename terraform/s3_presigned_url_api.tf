# S3 Presigned URL API Lambda Function and API Gateway

# IAM role for Lambda execution
resource "aws_iam_role" "s3_presigned_url_lambda" {
  name = "${var.environment}-s3-presigned-url-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.environment}-s3-presigned-url-lambda-role"
  }
}

# IAM policy for Lambda to access S3 and CloudWatch Logs
resource "aws_iam_role_policy" "s3_presigned_url_lambda_policy" {
  name = "${var.environment}-s3-presigned-url-lambda-policy"
  role = aws_iam_role.s3_presigned_url_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ]
        Resource = "${aws_s3_bucket.images.arn}/*"
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

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "s3_presigned_url_lambda" {
  name              = "/aws/lambda/${var.environment}-s3-presigned-url-api"
  retention_in_days = var.log_retention_days

  tags = {
    Name = "${var.environment}-s3-presigned-url-api-logs"
  }
}

# Lambda function for generate upload URL
resource "aws_lambda_function" "generate_upload_url" {
  function_name = "${var.environment}-generate-upload-url"
  role          = aws_iam_role.s3_presigned_url_lambda.arn
  handler       = "index.generateUploadUrl"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 512

  filename         = "${path.module}/../s3_presigned_url_api/lambda.zip"
  source_code_hash = fileexists("${path.module}/../s3_presigned_url_api/lambda.zip") ? filebase64sha256("${path.module}/../s3_presigned_url_api/lambda.zip") : null

  environment {
    variables = {
      S3_BUCKET_NAME = aws_s3_bucket.images.id
      AWS_REGION     = var.aws_region
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.s3_presigned_url_lambda
  ]

  tags = {
    Name = "${var.environment}-generate-upload-url"
  }
}

# Lambda function for generate download URL
resource "aws_lambda_function" "generate_download_url" {
  function_name = "${var.environment}-generate-download-url"
  role          = aws_iam_role.s3_presigned_url_lambda.arn
  handler       = "index.generateDownloadUrl"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 512

  filename         = "${path.module}/../s3_presigned_url_api/lambda.zip"
  source_code_hash = fileexists("${path.module}/../s3_presigned_url_api/lambda.zip") ? filebase64sha256("${path.module}/../s3_presigned_url_api/lambda.zip") : null

  environment {
    variables = {
      S3_BUCKET_NAME = aws_s3_bucket.images.id
      AWS_REGION     = var.aws_region
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.s3_presigned_url_lambda
  ]

  tags = {
    Name = "${var.environment}-generate-download-url"
  }
}

# Lambda permission for API Gateway to invoke generate_upload_url
resource "aws_lambda_permission" "api_gateway_invoke_upload" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.generate_upload_url.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.s3_presigned_url_api.execution_arn}/*/*"
}

# Lambda permission for API Gateway to invoke generate_download_url
resource "aws_lambda_permission" "api_gateway_invoke_download" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.generate_download_url.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.s3_presigned_url_api.execution_arn}/*/*"
}

# Outputs for Lambda functions
output "generate_upload_url_lambda_arn" {
  description = "ARN of generate upload URL Lambda function"
  value       = aws_lambda_function.generate_upload_url.arn
}

output "generate_download_url_lambda_arn" {
  description = "ARN of generate download URL Lambda function"
  value       = aws_lambda_function.generate_download_url.arn
}
