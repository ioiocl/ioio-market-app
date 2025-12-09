# Terraform Deployment for IOIO

This directory contains Terraform configuration to deploy the IOIO e-commerce platform to Google Cloud Platform.

## Prerequisites

1. Google Cloud Platform account
2. Terraform installed (>= 1.0)
3. gcloud CLI installed and configured
4. Service account with appropriate permissions

## Setup

1. **Configure GCloud CLI**:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Create Service Account** (if not exists):
   ```bash
   gcloud iam service-accounts create ioio-terraform \
     --display-name="IOIO Terraform Service Account"
   
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:ioio-terraform@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/editor"
   
   gcloud iam service-accounts keys create key.json \
     --iam-account=ioio-terraform@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

3. **Set Environment Variable**:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/key.json"
   ```

4. **Configure Variables**:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

## Deployment

1. **Initialize Terraform**:
   ```bash
   terraform init
   ```

2. **Plan Deployment**:
   ```bash
   terraform plan
   ```

3. **Apply Configuration**:
   ```bash
   terraform apply
   ```

4. **Get Outputs**:
   ```bash
   terraform output
   ```

## Resources Created

- **Compute Engine Instances**:
  - Backend (e2-micro): Node.js API server
  - Frontend (e2-micro): React application
  
- **Cloud SQL**:
  - PostgreSQL 15 (db-f1-micro)
  
- **Networking**:
  - Firewall rules for HTTP/HTTPS
  - Public IPs for instances

## Costs

Estimated monthly cost with e2-micro and db-f1-micro instances: ~$15-20 USD

## Cleanup

To destroy all resources:
```bash
terraform destroy
```

## Notes

- The startup scripts will install Docker and deploy the application
- You'll need to manually upload your application code or configure CI/CD
- For production, consider using Cloud Run or GKE for better scalability
- Enable Cloud SQL backups in production
- Use Cloud Load Balancer for high availability
