variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "ioio-finbot"
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "db_password" {
  description = "PostgreSQL database password"
  type        = string
  sensitive   = true
  default     = "ioio_secure_password_2026"
}
