# Quick Deployment Reference

## 🚀 Deploy Backend Updates

### Option 1: Quick Deploy (2-3 min)
```powershell
cd terraform
.\quick-deploy.ps1
```

### Option 2: Full Deploy with Checks (3-5 min)
```powershell
cd terraform
.\deploy-backend-update.ps1
```

---

## 📋 Common Commands

### View Logs
```powershell
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker logs -f ioio-backend"
```

### Restart Backend
```powershell
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker restart ioio-backend"
```

### Check Status
```powershell
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker ps"
```

### Test Health
```powershell
Invoke-WebRequest -Uri "http://136.111.207.65:5000/health" -UseBasicParsing
```

---

## 🔧 Fix .env File Missing

```powershell
cd terraform
gcloud compute scp create-env.sh ioio-backend:/tmp/create-env.sh --zone=us-central1-a
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo bash /tmp/create-env.sh"
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker restart ioio-backend"
```

---

## 📝 Deployment Workflow

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Update message"
   git push origin main
   ```

2. **Deploy**
   ```powershell
   cd terraform
   .\quick-deploy.ps1
   ```

3. **Verify**
   ```powershell
   gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker logs --tail 20 ioio-backend"
   ```

---

## 🆘 Emergency Commands

### Container crashed
```powershell
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker logs ioio-backend"
gcloud compute ssh ioio-backend --zone=us-central1-a --command="sudo docker restart ioio-backend"
```

### Complete rebuild
```powershell
cd terraform
.\deploy-backend-update.ps1
```

### SSH into VM
```powershell
gcloud compute ssh ioio-backend --zone=us-central1-a
```

---

## ℹ️ Info

- **Backend IP**: 136.111.207.65:5000
- **VM Name**: ioio-backend
- **Zone**: us-central1-a
- **Code Path**: /opt/ioio/backend
- **Container**: ioio-backend

For full documentation, see: `DEPLOYMENT_GUIDE.md`
