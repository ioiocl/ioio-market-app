terraform {
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
}

# VPC Network
resource "google_compute_network" "vpc" {
  name                    = "ioio-v2-network"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "ioio-v2-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id
}

# Firewall rules
resource "google_compute_firewall" "allow_http" {
  name    = "ioio-v2-allow-http"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "3000", "5000"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["ioio-v2-web"]
}

resource "google_compute_firewall" "allow_ssh" {
  name    = "ioio-v2-allow-ssh"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["ioio-v2-web"]
}

# Cloud SQL PostgreSQL instance
resource "google_sql_database_instance" "postgres" {
  name             = "ioio-v2-db"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = "db-f1-micro"

    ip_configuration {
      ipv4_enabled    = true
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

resource "google_sql_database" "database" {
  name     = "ioio_v2"
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "user" {
  name     = "ioio_admin"
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

# Compute Engine instance
resource "google_compute_instance" "ioio_v2" {
  name         = "ioio-v2-server"
  machine_type = "e2-medium"
  zone         = "${var.region}-a"

  tags = ["ioio-v2-web"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 20
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.subnet.id
    access_config {
      // Ephemeral public IP
    }
  }

  metadata_startup_script = templatefile("${path.module}/startup.sh", {
    db_host     = google_sql_database_instance.postgres.public_ip_address
    db_name     = google_sql_database.database.name
    db_user     = google_sql_user.user.name
    db_password = var.db_password
  })

  service_account {
    scopes = ["cloud-platform"]
  }
}

# Outputs
output "instance_ip" {
  value       = google_compute_instance.ioio_v2.network_interface[0].access_config[0].nat_ip
  description = "Public IP of the IOIO V2 server"
}

output "database_ip" {
  value       = google_sql_database_instance.postgres.public_ip_address
  description = "Public IP of the PostgreSQL database"
}

output "frontend_url" {
  value       = "http://${google_compute_instance.ioio_v2.network_interface[0].access_config[0].nat_ip}"
  description = "Frontend URL"
}

output "admin_url" {
  value       = "http://${google_compute_instance.ioio_v2.network_interface[0].access_config[0].nat_ip}/admin"
  description = "Admin panel URL (password: admin123)"
}
