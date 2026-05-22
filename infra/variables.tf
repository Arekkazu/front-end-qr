variable "project_name" {
  description = "Prefijo para los recursos AWS"
  type        = string
  default     = "qr-frontend"
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "ssh_key_name" {
  description = "Nombre del key pair EC2 existente en AWS"
  type        = string
}

variable "ssh_cidr" {
  description = "CIDR permitido para SSH (tu IP: x.x.x.x/32)"
  type        = string
}

variable "repo_url" {
  description = "URL del repo front-end-qr"
  type        = string
  default     = "https://github.com/Arekkazu/front-end-qr.git"
}

variable "repo_branch" {
  description = "Rama a desplegar"
  type        = string
  default     = "deploy"
}

variable "api_base_url" {
  description = "URL pública del backend (http://<ip-backend>)"
  type        = string
}
