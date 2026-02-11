# Payload CMS Deployment Guide

Complete guide for deploying Payload CMS to Google Cloud Run with PostgreSQL.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Migration Management](#migration-management)
- [Troubleshooting](#troubleshooting)
- [Environment Variables](#environment-variables)

## Prerequisites

### Required Tools

- **Node.js** 20.9.0 or higher
- **pnpm** 9 or higher
- **Docker** (for containerization)
- **Google Cloud CLI** (`gcloud`)
- **PostgreSQL** 15 (local development)

### Google Cloud Setup

1. **Create a Google Cloud Project** (or use existing)
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Enable Required APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable sqladmin.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

3. **Create Cloud SQL Instance**
   ```bash
   gcloud sql instances create zoi-sql \
     --database-version=POSTGRES_15 \
     --tier=db-f1-micro \
     --region=asia-south1
   ```

4. **Create Database and User**
   ```bash
   gcloud sql databases create zoi-sql-db --instance=zoi-sql
   gcloud sql users create zoi_user --instance=zoi-sql --password=YOUR_SECURE_PASSWORD
   ```

5. **Create Artifact Registry Repository**
   ```bash
   gcloud artifacts repositories create zoi-cms-repo \
     --repository-format=docker \
     --location=asia-south1
   ```

## Local Development

### Initial Setup

1. **Clone and Install Dependencies**
   ```bash
   cd payload
   pnpm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your local PostgreSQL credentials:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/zoi-cms
   PAYLOAD_SECRET=your-secret-minimum-32-characters
   NODE_ENV=development
   ```

3. **Run Migrations**
   ```bash
   pnpm run migrate
   ```

4. **Start Development Server**
   ```bash
   pnpm run dev
   ```

   Access the admin panel at: http://localhost:3000/admin

### Creating Migrations

When you modify collections or schema:

```bash
# Generate a new migration
pnpm run migrate:create

# Check migration status
pnpm run migrate:status

# Run pending migrations
pnpm run migrate
```

## Production Deployment

### Option 1: Automated Deployment (GitHub Actions)

The repository includes a GitHub Actions workflow for automatic deployment on push to `main`.

#### Setup GitHub Secrets

1. **Create Service Account**
   ```bash
   gcloud iam service-accounts create github-deployer \
     --display-name="GitHub Actions Deployer"
   ```

2. **Grant Permissions**
   ```bash
   PROJECT_ID=$(gcloud config get-value project)
   
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:github-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
     --role="roles/run.developer"
   
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:github-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
     --role="roles/iam.serviceAccountUser"
   
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:github-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
     --role="roles/artifactregistry.writer"
   ```

3. **Generate and Add Key to GitHub**
   ```bash
   gcloud iam service-accounts keys create key.json \
     --iam-account=github-deployer@${PROJECT_ID}.iam.gserviceaccount.com
   ```
   
   - Copy the contents of `key.json`
   - Go to GitHub Repository → Settings → Secrets → Actions
   - Create new secret: `GCP_SA_KEY` with the JSON content
   - **Delete `key.json` immediately**

4. **Push to Main Branch**
   ```bash
   git push origin main
   ```
   
   The workflow will automatically:
   - Build Docker image
   - Push to Artifact Registry
   - Run database migrations
   - Deploy to Cloud Run
   - Perform health checks

### Option 2: Manual Deployment

Use the deployment helper script:

```bash
# Set required environment variables
export DATABASE_URL="postgres://zoi_user:PASSWORD@localhost/zoi-sql-db?host=/cloudsql/PROJECT:REGION:INSTANCE"
export PAYLOAD_SECRET="your-secret-here"
export BUNNY_API_KEY="your-bunny-api-key"
export BUNNY_LIBRARY_ID="your-library-id"
export BUNNY_CDN_HOSTNAME="your-cdn-hostname"

# Run deployment
pnpm run deploy:local
```

Or deploy manually:

```bash
# 1. Build and push image
IMAGE_TAG="asia-south1-docker.pkg.dev/PROJECT_ID/zoi-cms-repo/payload-cms:latest"
docker build -t $IMAGE_TAG .
docker push $IMAGE_TAG

# 2. Deploy migration job
gcloud run jobs deploy zoi-cms-migrate \
  --image $IMAGE_TAG \
  --region asia-south1 \
  --set-cloudsql-instances=PROJECT:REGION:INSTANCE \
  --set-env-vars "DATABASE_URL=...,PAYLOAD_SECRET=..." \
  --command="pnpm" \
  --args="tsx,scripts/migrate.ts"

# 3. Run migrations
gcloud run jobs execute zoi-cms-migrate --region asia-south1 --wait

# 4. Deploy application
gcloud run deploy zoi-cms \
  --image $IMAGE_TAG \
  --region asia-south1 \
  --allow-unauthenticated \
  --add-cloudsql-instances=PROJECT:REGION:INSTANCE \
  --set-env-vars "DATABASE_URL=...,PAYLOAD_SECRET=..."
```

## Migration Management

### Understanding Migrations

Payload CMS uses a migration system to manage database schema changes:

- **Migration files** are stored in `src/migrations/`
- Each migration has `up` (apply) and `down` (rollback) functions
- Migrations run in a transaction for data integrity
- Migration history is tracked in the database

### Best Practices

1. **Always test migrations locally first**
   ```bash
   pnpm run migrate
   ```

2. **Backup database before production migrations**
   ```bash
   gcloud sql backups create --instance=zoi-sql
   ```

3. **Check migration status**
   ```bash
   pnpm run migrate:status
   ```

4. **Never edit existing migrations** - create new ones instead

### Migration Workflow

```mermaid
graph LR
    A[Modify Schema] --> B[Generate Migration]
    B --> C[Test Locally]
    C --> D{Tests Pass?}
    D -->|No| E[Fix Issues]
    E --> C
    D -->|Yes| F[Commit & Push]
    F --> G[CI/CD Runs Migration]
    G --> H[Deploy Application]
```

## Troubleshooting

### Common Issues

#### 1. Migration Fails in Cloud Run

**Symptoms:** Migration job fails with timeout or connection errors

**Solutions:**
- Check Cloud Run Job logs:
  ```bash
  gcloud run jobs executions list zoi-cms-migrate --region asia-south1
  gcloud run jobs executions logs read zoi-cms-migrate --region asia-south1
  ```
- Verify Cloud SQL connection string format
- Ensure Cloud SQL instance is running
- Check migration job has Cloud SQL instance attached

#### 2. Application Won't Start

**Symptoms:** Cloud Run service fails health checks

**Solutions:**
- Check service logs:
  ```bash
  gcloud run services logs read zoi-cms --region asia-south1
  ```
- Verify all environment variables are set
- Ensure migrations completed successfully
- Check database connectivity

#### 3. Build Fails

**Symptoms:** Docker build or Next.js build errors

**Solutions:**
- Clear build cache: `docker builder prune`
- Check Node.js version matches requirements
- Verify all dependencies are installed
- Review build logs for specific errors

#### 4. Database Connection Issues

**Symptoms:** "Connection refused" or timeout errors

**Solutions:**
- For Cloud Run, use Unix socket format:
  ```
  postgresql://user:pass@/dbname?host=/cloudsql/PROJECT:REGION:INSTANCE
  ```
- For local development, use standard format:
  ```
  postgresql://user:pass@localhost:5432/dbname
  ```
- Verify Cloud SQL instance is in same region as Cloud Run
- Check firewall rules and Cloud SQL authorization

### Rollback Procedures

#### Rollback Application Deployment

```bash
# List revisions
gcloud run revisions list --service=zoi-cms --region=asia-south1

# Rollback to previous revision
gcloud run services update-traffic zoi-cms \
  --to-revisions=REVISION_NAME=100 \
  --region=asia-south1
```

#### Rollback Database Migration

> [!CAUTION]
> Database rollbacks can cause data loss. Always backup first!

```bash
# Restore from backup
gcloud sql backups restore BACKUP_ID \
  --backup-instance=zoi-sql \
  --backup-instance=zoi-sql
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `PAYLOAD_SECRET` | Secret key for Payload (min 32 chars) | `your-secret-minimum-32-characters` |
| `NODE_ENV` | Environment mode | `production` or `development` |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID (Required for uploads) | `abc123...` |
| `R2_ACCESS_KEY_ID` | R2 access key | `xyz...` |
| `R2_SECRET_ACCESS_KEY` | R2 secret key | `***` |
| `R2_BUCKET_NAME` | R2 bucket name | `zoi-assets` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PAYLOAD_CONFIG_PATH` | Path to Payload config | `src/payload.config.ts` |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID | - |
| `R2_ACCESS_KEY_ID` | R2 access key | - |
| `R2_SECRET_ACCESS_KEY` | R2 secret key | - |
| `R2_BUCKET_NAME` | R2 bucket name | `zoi-assets` |
| `BUNNY_API_KEY` | Bunny CDN API key | - |
| `BUNNY_LIBRARY_ID` | Bunny library ID | - |
| `BUNNY_CDN_HOSTNAME` | Bunny CDN hostname | - |
| `NEXT_PUBLIC_SERVER_URL` | Public URL of the CMS | `https://your-service.run.app` |

### Cloud Run Specific

For Cloud Run deployments, use the Unix socket format for `DATABASE_URL`:

```env
DATABASE_URL=postgresql://user:password@/dbname?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
```

## Monitoring and Maintenance

### View Logs

```bash
# Application logs
gcloud run services logs read zoi-cms --region=asia-south1 --limit=100

# Migration logs
gcloud run jobs executions logs read zoi-cms-migrate --region=asia-south1
```

### Monitor Performance

```bash
# Service metrics
gcloud run services describe zoi-cms --region=asia-south1

# Database metrics
gcloud sql instances describe zoi-sql
```

### Database Backups

```bash
# Create manual backup
gcloud sql backups create --instance=zoi-sql

# List backups
gcloud sql backups list --instance=zoi-sql

# Configure automatic backups
gcloud sql instances patch zoi-sql \
  --backup-start-time=03:00
```

## Security Best Practices

1. **Use Google Secret Manager** for sensitive credentials (recommended for production)
2. **Enable Cloud SQL SSL** connections
3. **Restrict Cloud Run to authenticated users** if not public
4. **Regular security updates** - keep dependencies updated
5. **Monitor access logs** for suspicious activity
6. **Use least privilege** IAM roles

## Additional Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL for PostgreSQL](https://cloud.google.com/sql/docs/postgres)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## Support

For issues specific to:
- **Payload CMS**: [GitHub Issues](https://github.com/payloadcms/payload/issues)
- **Google Cloud**: [Support Console](https://cloud.google.com/support)
- **This Project**: Contact your development team
