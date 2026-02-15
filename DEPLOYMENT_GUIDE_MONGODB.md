# Deployment Guide: Payload CMS with MongoDB Atlas

This guide explains how to deploy your Payload CMS to Google Cloud Run using **MongoDB Atlas**.

## Step 1: Create a MongoDB Atlas Cluster

1.  **Sign Up/Log In**: Go to [mongodb.com/atlas](https://www.mongodb.com/atlas).
2.  **Create Cluster**: 
    - Choose the **Free Tier** (M0) or a dedicated tier.
    - **Cloud Provider**: Select **Google Cloud**.
    - **Region**: Select **asia-south1** (Mumbai) or your preferred GCP region.
3.  **Database User**: Create a database user with **Read and Write to any database** permissions. Save the password securely.
4.  **IP Access List**: 
    - Go to **Network Access > IP Access List**.
    - Click **Add IP Address**.
    - For initial deployment, select **Allow Access from Anywhere** (`0.0.0.0/0`).
    - *Note: For security, you can later restrict this to your specific GCP VPC or static IPs.*

## Step 2: Get Connection String

1.  In the Atlas dashboard, click **Connect** on your cluster.
2.  Choose **Connect your application**.
3.  Select **Driver**: Node.js.
4.  Copy the connection string (it looks like `mongodb+srv://<db_user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`).

## Step 3: Configure Environment Variables

Update your local `payload/.env` file with the connection string you copied:

```env
DATABASE_URL=mongodb+srv://<db_user>:<password>@cluster0.xxxxx.mongodb.net/zoicms?retryWrites=true&w=majority
PAYLOAD_SECRET=your_payload_secret
GCP_PROJECT_ID=nuatlabs
GCP_REGION=asia-south1
CLOUD_RUN_SERVICE=zoi-cms
ARTIFACT_REGISTRY_REPO=zoi-cms-repo
DOCKER_IMAGE_NAME=payload-cms
```

## Step 4: Run the Deployment Script

Execute the deployment script from the `payload` directory:

```bash
./scripts/deploy.sh
```

The script will build your image, push it to GCP Artifact Registry, run migrations, and deploy your service to Cloud Run.

## Troubleshooting

- **Connection Error**: Double-check your `DATABASE_URL` password (ensure special characters are URL-encoded). Verify that `0.0.0.0/0` is in the Atlas IP Access List.
- **Migration Failed**: Check Cloud Run Job logs for `zoi-cms-migrate` in the GCP Console.
- **Admin Access**: Ensure your `PAYLOAD_PUBLIC_SERVER_URL` is correct if you have custom login overrides.


