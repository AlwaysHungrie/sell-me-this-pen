#!/bin/bash

# S3 Bucket Setup Script for Character Generator
# This script creates an S3 bucket for storing character images and JSON data
# with proper permissions: public read, restricted write access
# TODO: add cors rules

set -e  # Exit on any error

# Configuration
BUCKET_NAME="sell-me-pen-character-data"
REGION="ap-south-1"
IAM_USER_NAME="character-generator-uploader"
POLICY_NAME="CharacterGeneratorS3Policy"
AWS_PROFILE=${AWS_PROFILE:-default}

# Create temporary directory
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

echo "🚀 Setting up S3 bucket and IAM permissions for character generator..."

# Check required dependencies
echo "🔍 Checking dependencies..."
for tool in aws jq; do
    if ! command -v $tool &> /dev/null; then
        echo "❌ Error: $tool is required but not installed"
        echo "   Please install $tool and try again"
        exit 1
    fi
done

# Verify AWS credentials
if ! aws sts get-caller-identity --profile "$AWS_PROFILE" &>/dev/null; then
    echo "❌ Error: AWS credentials not configured or invalid"
    echo "   Please run 'aws configure' to set up your credentials"
    exit 1
fi

echo "✅ Dependencies and credentials verified"

# Function to check if bucket exists and is accessible
check_bucket_exists() {
    local bucket_name="$1"
    local result=$(aws s3api head-bucket --bucket "$bucket_name" --profile "$AWS_PROFILE" 2>&1 || true)
    
    if [[ $result == *"Not Found"* ]]; then
        return 1  # Bucket doesn't exist
    elif [[ $result == *"Forbidden"* ]]; then
        echo "❌ Error: Bucket '$bucket_name' exists but you don't have access to it"
        return 2  # Bucket exists but no access
    elif [[ -z $result ]]; then
        return 0  # Bucket exists and accessible
    else
        echo "⚠️  Warning: Unexpected response when checking bucket: $result"
        return 1
    fi
}

# Generate a unique bucket name if the default one is taken
echo "📦 Checking bucket availability..."
bucket_check_result=0
check_bucket_exists "$BUCKET_NAME" || bucket_check_result=$?

if [ $bucket_check_result -eq 0 ]; then
    echo "⚠️  Bucket $BUCKET_NAME already exists and is accessible, generating unique name..."
    TIMESTAMP=$(date +%s)
    BUCKET_NAME="${BUCKET_NAME}-${TIMESTAMP}"
    echo "📦 Using bucket name: $BUCKET_NAME"
elif [ $bucket_check_result -eq 2 ]; then
    echo "❌ Cannot proceed with bucket name $BUCKET_NAME"
    exit 1
fi

# Create S3 bucket with region-specific logic
echo "📦 Creating S3 bucket: $BUCKET_NAME in region: $REGION"
if [ "$REGION" = "us-east-1" ]; then
    # us-east-1 doesn't support LocationConstraint
    aws s3api create-bucket \
        --bucket "$BUCKET_NAME" \
        --profile "$AWS_PROFILE"
else
    aws s3api create-bucket \
        --bucket "$BUCKET_NAME" \
        --region "$REGION" \
        --create-bucket-configuration LocationConstraint="$REGION" \
        --profile "$AWS_PROFILE"
fi

# Wait for bucket to be available
echo "⏳ Waiting for bucket to be available..."
aws s3api wait bucket-exists --bucket "$BUCKET_NAME" --profile "$AWS_PROFILE"

# Configure bucket for public read access
echo "🔓 Configuring bucket for public read access..."

# Remove public access block first
aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
    BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false \
    --profile "$AWS_PROFILE"

# Create bucket policy for public read access
cat > "$TEMP_DIR/bucket-policy.json" << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

# Apply bucket policy
aws s3api put-bucket-policy \
    --bucket "$BUCKET_NAME" \
    --policy file://"$TEMP_DIR/bucket-policy.json" \
    --profile "$AWS_PROFILE"

# Enable versioning (recommended for data protection)
echo "📚 Enabling bucket versioning..."
aws s3api put-bucket-versioning \
    --bucket "$BUCKET_NAME" \
    --versioning-configuration Status=Enabled \
    --profile "$AWS_PROFILE"

# Enable server-side encryption
echo "🔒 Enabling server-side encryption..."
aws s3api put-bucket-encryption \
    --bucket "$BUCKET_NAME" \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }]
    }' \
    --profile "$AWS_PROFILE"

# Check if IAM user already exists
echo "👤 Checking IAM user: $IAM_USER_NAME"
if aws iam get-user --user-name "$IAM_USER_NAME" --profile "$AWS_PROFILE" &>/dev/null; then
    echo "⚠️  IAM user $IAM_USER_NAME already exists"
    echo "🔑 Skipping user creation, but will create new access key..."
    
    # List existing access keys
    existing_keys=$(aws iam list-access-keys --user-name "$IAM_USER_NAME" --profile "$AWS_PROFILE" --query 'AccessKeyMetadata[].AccessKeyId' --output text)
    if [ -n "$existing_keys" ]; then
        echo "⚠️  Existing access keys found: $existing_keys"
        echo "   You may want to delete old keys after confirming the new ones work"
    fi
else
    echo "👤 Creating IAM user: $IAM_USER_NAME"
    aws iam create-user --user-name "$IAM_USER_NAME" --profile "$AWS_PROFILE"
fi

# Create access key for the user
echo "🔑 Creating access key for IAM user..."
ACCESS_KEY_OUTPUT=$(aws iam create-access-key --user-name "$IAM_USER_NAME" --profile "$AWS_PROFILE")
ACCESS_KEY_ID=$(echo "$ACCESS_KEY_OUTPUT" | jq -r '.AccessKey.AccessKeyId')
SECRET_ACCESS_KEY=$(echo "$ACCESS_KEY_OUTPUT" | jq -r '.AccessKey.SecretAccessKey')

# Create IAM policy for S3 write access
echo "📋 Creating IAM policy for S3 write access..."
cat > "$TEMP_DIR/iam-policy.json" << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::$BUCKET_NAME",
                "arn:aws:s3:::$BUCKET_NAME/*"
            ]
        }
    ]
}
EOF

# Check if policy already exists
if aws iam get-policy --policy-arn "arn:aws:iam::$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query Account --output text):policy/$POLICY_NAME" --profile "$AWS_PROFILE" &>/dev/null; then
    echo "⚠️  Policy $POLICY_NAME already exists, skipping creation..."
    POLICY_ARN="arn:aws:iam::$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query Account --output text):policy/$POLICY_NAME"
else
    # Create the policy
    echo "📋 Creating new IAM policy..."
    aws iam create-policy \
        --policy-name "$POLICY_NAME" \
        --policy-document file://"$TEMP_DIR/iam-policy.json" \
        --profile "$AWS_PROFILE"
    
    # Wait for policy to propagate
    sleep 3
    
    POLICY_ARN=$(aws iam list-policies --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text --profile "$AWS_PROFILE")
fi

# Attach policy to user (safe to run multiple times)
echo "🔗 Attaching policy to user..."
aws iam attach-user-policy \
    --user-name "$IAM_USER_NAME" \
    --policy-arn "$POLICY_ARN" \
    --profile "$AWS_PROFILE"

# Create environment file for character generator
echo "📝 Creating environment configuration file..."
ENV_FILE="$TEMP_DIR/character-generator-env.txt"
cat > "$ENV_FILE" << EOF
# Character Generator S3 Configuration
# Add these environment variables to your character generator application

S3_BUCKET_NAME=$BUCKET_NAME
S3_REGION=$REGION
AWS_ACCESS_KEY_ID=$ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY

# Example usage in your application:
# export S3_BUCKET_NAME=$BUCKET_NAME
# export S3_REGION=$REGION
# export AWS_ACCESS_KEY_ID=$ACCESS_KEY_ID
# export AWS_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY

# For Node.js applications, you can also create a .env file:
# S3_BUCKET_NAME=$BUCKET_NAME
# S3_REGION=$REGION
# AWS_ACCESS_KEY_ID=$ACCESS_KEY_ID
# AWS_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY
EOF

# Copy environment file to a permanent location
cp "$ENV_FILE" "./character-generator-env.txt"

# Test the setup
echo "🧪 Testing bucket access..."
test_file="$TEMP_DIR/test.txt"
echo "test" > "$test_file"

# Test upload with new credentials
export AWS_ACCESS_KEY_ID="$ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$SECRET_ACCESS_KEY"

if aws s3 cp "$test_file" "s3://$BUCKET_NAME/test.txt" --region "$REGION" 2>/dev/null; then
    echo "✅ Upload test successful"
    # Clean up test file
    aws s3 rm "s3://$BUCKET_NAME/test.txt" --region "$REGION" 2>/dev/null
else
    echo "⚠️  Upload test failed - you may need to wait a few minutes for IAM changes to propagate"
fi

# Unset test credentials
unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "📊 Summary:"
echo "   Bucket Name: $BUCKET_NAME"
echo "   Region: $REGION"
echo "   Bucket URL: https://$BUCKET_NAME.s3.amazonaws.com"
echo "   IAM User: $IAM_USER_NAME"
echo "   Access Key ID: $ACCESS_KEY_ID"
echo ""
echo "🔐 Security Configuration:"
echo "   ✅ Public read access enabled"
echo "   ✅ Write access restricted to IAM user only"
echo "   ✅ Server-side encryption enabled (AES256)"
echo "   ✅ Versioning enabled"
echo "   ✅ IAM user can upload, delete, and list objects"
echo ""
echo "📁 Recommended Bucket Structure:"
echo "   $BUCKET_NAME/"
echo "   ├── images/          # Character images"
echo "   └── data/           # Character JSON data"
echo ""
echo "⚠️  CRITICAL SECURITY WARNING:"
echo "   🔑 Access Key ID: $ACCESS_KEY_ID"
echo "   🔑 Secret Access Key: $SECRET_ACCESS_KEY"
echo ""
echo "   ⚠️  The secret access key above will NEVER be shown again!"
echo "   ⚠️  Save these credentials securely and clear your terminal history"
echo "   ⚠️  Consider using environment variables or AWS credential files"
echo ""
echo "📄 Environment configuration saved to: ./character-generator-env.txt"
echo ""
echo "🚀 Next steps:"
echo "   1. Save the credentials securely"
echo "   2. Copy the environment variables to your character generator"
echo "   3. Test upload functionality from your application"
echo "   4. Create the images/ and data/ folders in the bucket if needed"
echo "   5. Clear your terminal history to protect the secret key"
echo ""
echo "🔧 Troubleshooting:"
echo "   • If uploads fail initially, wait 5-10 minutes for IAM changes to propagate"
echo "   • Test bucket access: aws s3 ls s3://$BUCKET_NAME --region $REGION"
echo "   • Check IAM user: aws iam get-user --user-name $IAM_USER_NAME"