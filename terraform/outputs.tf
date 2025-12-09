output "backend_ip" {
  description = "Backend public IP address"
  value       = google_compute_instance.backend.network_interface[0].access_config[0].nat_ip
}

output "frontend_ip" {
  description = "Frontend public IP address"
  value       = google_compute_instance.frontend.network_interface[0].access_config[0].nat_ip
}

output "frontend_url" {
  description = "Frontend URL"
  value       = "http://${google_compute_instance.frontend.network_interface[0].access_config[0].nat_ip}:3000"
}

output "backend_url" {
  description = "Backend API URL"
  value       = "http://${google_compute_instance.backend.network_interface[0].access_config[0].nat_ip}:5000"
}

output "database_connection" {
  description = "Database connection name"
  value       = google_sql_database_instance.postgres.connection_name
}

output "database_ip" {
  description = "Database IP address"
  value       = google_sql_database_instance.postgres.ip_address[0].ip_address
}
