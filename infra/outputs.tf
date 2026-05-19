output "instance_id" {
  value = aws_instance.frontend.id
}

output "public_ip" {
  value = aws_instance.frontend.public_ip
}

output "frontend_url" {
  value = "http://${aws_instance.frontend.public_ip}"
}

output "ssh_command" {
  value = "ssh -i <key.pem> ec2-user@${aws_instance.frontend.public_ip}"
}
