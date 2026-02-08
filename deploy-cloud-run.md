# Deploying Zoi CMS to Google Cloud Run

This guide outlines the steps to deploy the Payload CMS to Google Cloud Run, using a `db-f1-micro` Cloud SQL instance.

## Prerequisites
- Google Cloud CLI (`gcloud`) installed and authenticated.
- Docker installed.
- A Google Cloud Project.

## 1. Database Setup (Cloud SQL)

1.  **Create a Cloud SQL Instance**:
    ```bash
    gcloud sql instances create zoi-sql \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region=asia-south1
    ```
    *(Adjust region as needed)*

2.  **Create Database and User**:
    ```bash
    gcloud sql databases create zoi_sql-db --instance=zoi-sql
    gcloud sql users create zoi_user --instance=zoi-sql --password=Luffy@123
    ```

## 2. Containerization

1.  **Configure Docker Build**:
    ensure your `next.config.mjs` has `output: 'standalone'`.

2.  **Build and Push Image**:
    ```bash
    # Set your project ID
    export PROJECT_ID=$(gcloud config get-value project)
    
    # Enable Artifact Registry
    gcloud services enable artifactregistry.googleapis.com

    # Create Repository (if not exists)
    gcloud artifacts repositories create zoi-cms-repo \
        --repository-format=docker \
        --location=asia-south1

    # Build and Push
    gcloud builds submit --tag asia-south1-docker.pkg.dev/nuatlabs/zoi-cms-repo/payload-cms:latest .
    ```

## 3. Deployment to Cloud Run

Deploy the service using the pushed image.

```bash
gcloud run deploy zoi-cms \
    --image asia-south1-docker.pkg.dev/nuatlabs/zoi-cms-repo/payload-cms:latest \
    --region asia-south1 \
    --platform managed \
    --allow-unauthenticated \
    --add-cloudsql-instances nuatlabs:asia-south1:zoi-sql \
    --set-env-vars "DATABASE_URL=postgres://zoi_user:Luffy@123@/zoi_cms?host=/cloudsql/nuatlabs:asia-south1:zoi-sql" \
    --set-env-vars "PAYLOAD_SECRET=YOUR_SECRET_KEY" \
    --set-env-vars "PAYLOAD_PUBLIC_SERVER_URL=https://zoi-cms-run-url.a.run.app" \
    --set-env-vars "NEXT_PUBLIC_SERVER_URL=https://zoi-cms-run-url.a.run.app" \
    --set-env-vars "BUNNY_API_KEY=YOUR_BUNNY_KEY" \
    --set-env-vars "BUNNY_LIBRARY_ID=YOUR_BUNNY_LIB_ID"
```

### Important Notes
- **DATABASE_URL**: When using Cloud Run with Cloud SQL, the host is a Unix socket: `/cloudsql/INSTANCE_CONNECTION_NAME`.
- **PAYLOAD_PUBLIC_SERVER_URL**: You'll know the actual URL *after* the first deployment or by reserving a name. You might need to redeploy to update this self-reference.
- **Resources**: `db-f1-micro` is small. Valid for dev/staging. For production traffic, consider upgrading.

## 4. Migrations

Payload CMS migrations need to run against the production database.
Since Cloud Run is serverless, you can run a "Job" or use a temporary VM/Bastion to run migrations, OR enable `push: true` temporarily (not recommended for production).

**Recommended**: proper migration job.
1. Create a `migrate` script in `package.json` that runs `payload migrate`.
2. Submit a Cloud Build job or run a one-off Cloud Run job that connects to the same Cloud SQL instance.
