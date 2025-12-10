terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Compute Engine Instance for Backend
resource "google_compute_instance" "backend" {
  name         = "ioio-backend"
  machine_type = "e2-micro"
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 10
    }
  }

  network_interface {
    network = "default"
    access_config {
      // Ephemeral public IP
    }
  }

  metadata_startup_script = templatefile("${path.module}/startup-backend.sh", {
    db_host         = google_sql_database_instance.postgres.public_ip_address
    db_name         = google_sql_database.database.name
    db_user         = google_sql_user.user.name
    db_password     = var.db_password
    jwt_secret      = var.jwt_secret
    gcs_bucket_name = var.gcs_bucket_name
  })

  tags = ["http-server", "https-server"]

  service_account {
    scopes = ["cloud-platform"]
  }
}

# Compute Engine Instance for Frontend
resource "google_compute_instance" "frontend" {
  name         = "ioio-frontend"
  machine_type = "e2-micro"
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 10
    }
  }

  network_interface {
    network = "default"
    access_config {
      // Ephemeral public IP
    }
  }

  metadata_startup_script = templatefile("${path.module}/startup-frontend.sh", {
    api_url = "http://${google_compute_instance.backend.network_interface[0].access_config[0].nat_ip}:5000/api"
  })

  tags = ["http-server", "https-server"]

  service_account {
    scopes = ["cloud-platform"]
  }

  depends_on = [google_compute_instance.backend]
}

# Cloud SQL PostgreSQL Instance
resource "google_sql_database_instance" "postgres" {
  name             = "ioio-postgres"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = "db-f1-micro"

    ip_configuration {
      ipv4_enabled    = true
      private_network = null
      
      # Note: For production, restrict this to your backend's IP after deployment
      # or use Cloud SQL Auth Proxy with private networking
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }

    backup_configuration {
      enabled = true
    }
  }

  deletion_protection = false
}

# Database
resource "google_sql_database" "database" {
  name     = var.db_name
  instance = google_sql_database_instance.postgres.name
}

# Database User
resource "google_sql_user" "user" {
  name     = var.db_user
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

# Firewall Rules
resource "google_compute_firewall" "allow_http" {
  name    = "allow-http"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["80", "3000", "5000"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["http-server"]
}

resource "google_compute_firewall" "allow_https" {
  name    = "allow-https"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["https-server"]
}
