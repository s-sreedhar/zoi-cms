#!/bin/bash

##############################################################################
# Payload CMS Cloud Run Deployment Script
# 
# This script automates the deployment of Payload CMS to Google Cloud Run.
# It handles building, pushing, migrating, and deploying in the correct order.
#
# Usage:
#   ./scripts/deploy.sh
#
# Prerequisites:
#   - gcloud CLI installed and authenticated
#   - Docker installed
#   - Required environment variables set (see below)
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-nuatlabs}"
REGION="${GCP_REGION:-asia-south1}"
SERVICE="${CLOUD_RUN_SERVICE:-zoi-cms}"
MIGRATION_JOB="${CLOUD_RUN_MIGRATION_JOB:-zoi-cms-migrate}"
REPO_NAME="${ARTIFACT_REGISTRY_REPO:-zoi-cms-repo}"
IMAGE_NAME="${DOCKER_IMAGE_NAME:-payload-cms}"
SQL_INSTANCE="${CLOUD_SQL_INSTANCE:-nuatlabs:asia-south1:zoi-sql}"

# Derived variables
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${IMAGE_NAME}:latest"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        Payload CMS Cloud Run Deployment Script            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Validate required environment variables
echo -e "${YELLOW}📋 Validating environment variables...${NC}"
REQUIRED_VARS=(
  "DATABASE_URL"
  "PAYLOAD_SECRET"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
  echo -e "${RED}❌ Missing required environment variables:${NC}"
  printf '   - %s\n' "${MISSING_VARS[@]}"
  echo ""
  echo "Please set these variables and try again."
  exit 1
fi

echo -e "${GREEN}✅ All required environment variables are set${NC}"
echo ""

# Display configuration
echo -e "${BLUE}📦 Deployment Configuration:${NC}"
echo "   Project ID:       ${PROJECT_ID}"
echo "   Region:           ${REGION}"
echo "   Service:          ${SERVICE}"
echo "   Migration Job:    ${MIGRATION_JOB}"
echo "   Image Tag:        ${IMAGE_TAG}"
echo "   SQL Instance:     ${SQL_INSTANCE}"
echo ""

# Confirm deployment (skip if CI is set)
if [ "$CI" != "true" ]; then
  read -p "$(echo -e ${YELLOW}Continue with deployment? [y/N]: ${NC})" -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Deployment cancelled${NC}"
    exit 0
  fi
else
  echo -e "${YELLOW}CI environment detected, skipping confirmation...${NC}"
fi

# Step 1: Build and Push Docker Image
echo ""
echo -e "${BLUE}🔨 Step 1/4: Building Docker image...${NC}"
docker build -t "${IMAGE_TAG}" .

echo -e "${BLUE}📤 Pushing image to Artifact Registry...${NC}"
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet
docker push "${IMAGE_TAG}"

echo -e "${GREEN}✅ Image built and pushed successfully${NC}"

# Step 2: Deploy Migration Job
echo ""
echo -e "${BLUE}🔄 Step 2/4: Deploying migration job...${NC}"
gcloud run jobs deploy "${MIGRATION_JOB}" \
  --image "${IMAGE_TAG}" \
  --region "${REGION}" \
  --set-cloudsql-instances="${SQL_INSTANCE}" \
  --set-env-vars "DATABASE_URL=${DATABASE_URL},PAYLOAD_SECRET=${PAYLOAD_SECRET},NODE_ENV=production,PAYLOAD_CONFIG_PATH=src/payload.config.ts,PAYLOAD_PUBLIC_SERVER_URL=https://${SERVICE}-991931824365.${REGION}.run.app" \
  --max-retries 0 \
  --task-timeout 10m \
  --memory 1Gi \
  --cpu 1 \
  --command "pnpm" \
  --args "tsx,scripts/migrate.ts"

echo -e "${GREEN}✅ Migration job deployed${NC}"

# Step 3: Run Migrations
echo ""
echo -e "${BLUE}🚀 Step 3/4: Running migrations...${NC}"
if gcloud run jobs execute "${MIGRATION_JOB}" --region "${REGION}" --wait; then
  echo -e "${GREEN}✅ Migrations completed successfully${NC}"
else
  echo -e "${RED}❌ Migration failed!${NC}"
  echo ""
  echo -e "${YELLOW}Fetching migration logs...${NC}"
  EXECUTION=$(gcloud run jobs executions list "${MIGRATION_JOB}" \
    --region "${REGION}" \
    --limit 1 \
    --sort-by=~createTime \
    --format="value(metadata.name)")
  
  if [ -n "$EXECUTION" ]; then
    gcloud run jobs executions logs read "${MIGRATION_JOB}" \
      --region "${REGION}" \
      --execution "$EXECUTION" \
      --limit 200
  fi
  
  echo ""
  echo -e "${RED}Deployment aborted due to migration failure${NC}"
  exit 1
fi

# Step 4: Deploy Application
echo ""
echo -e "${BLUE}🚢 Step 4/4: Deploying application to Cloud Run...${NC}"
gcloud run deploy "${SERVICE}" \
  --image "${IMAGE_TAG}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --add-cloudsql-instances="${SQL_INSTANCE}" \
  --set-env-vars "DATABASE_URL=${DATABASE_URL},PAYLOAD_SECRET=${PAYLOAD_SECRET},NODE_ENV=production,PAYLOAD_CONFIG_PATH=src/payload.config.ts,PAYLOAD_PUBLIC_SERVER_URL=https://${SERVICE}-991931824365.${REGION}.run.app,BUNNY_API_KEY=${BUNNY_API_KEY},BUNNY_LIBRARY_ID=${BUNNY_LIBRARY_ID},BUNNY_CDN_HOSTNAME=${BUNNY_CDN_HOSTNAME}" \
  --memory 2Gi \
  --cpu 2 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              🎉 Deployment Successful! 🎉                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get service URL
SERVICE_URL=$(gcloud run services describe "${SERVICE}" \
  --region "${REGION}" \
  --format="value(status.url)")

echo -e "${BLUE}🌐 Service URL: ${GREEN}${SERVICE_URL}${NC}"
echo -e "${BLUE}📊 Admin Panel: ${GREEN}${SERVICE_URL}/admin${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Test the deployment by visiting the admin panel"
echo "  2. Check Cloud Run logs for any issues"
echo "  3. Monitor application performance"
echo ""
