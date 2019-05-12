terraform {
  required_version = "0.11.7"
}

provider "aws" {
  region = "${var.region}"
}

variable "region" {}

data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}

data "terraform_remote_state" "vpc" {
  backend = "local"

  config {
    path = "../vpc/terraform.tfstate"
  }
}

data "terraform_remote_state" "iam" {
  backend = "local"

  config {
    path = "../iam/terraform.tfstate"
  }
}

resource "aws_instance" "atlas-server" {
  count = 0
  # Ubuntu 18.04
  ami = "ami-0b76c3b150c6b1423"
  key_name = "adhoc"
  vpc_security_group_ids = ["${data.terraform_remote_state.vpc.security_group_atlas_public}"]
  instance_type = "t2.nano"
  associate_public_ip_address = true
  monitoring = false
  subnet_id = "${data.terraform_remote_state.vpc.subnet_public}"
  iam_instance_profile = "${data.terraform_remote_state.iam.atlas_instance_profile}"
  instance_initiated_shutdown_behavior = "terminate"
  # Install docker and start docker daemon
  user_data = <<SCRIPT
#!/bin/bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get update
apt-cache policy docker-ce
apt-get install -y docker-ce
apt-get install -y awscli
systemctl status docker

KMS_ENCRYPTED_KEY="AQICAHhUjEp+8CCFIY/q4LCQMt4IcEHznznw61ye221S4AwPhwGejeenErY4wC/XnlFg4ggWAAAAgTB/BgkqhkiG9w0BBwagcjBwAgEAMGsGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMjp3wf7jIKY81phTjAgEQgD5glYhuQrwibdrzdKC+H4FHR0PGoFcZmWpZBAB/bt6Ms5k5mBkIYdgQW3eE5jnj0kJzy0FdEMvRYr65/Oku+A=="
aws kms decrypt \
  --ciphertext-blob fileb://<(echo "$KMS_ENCRYPTED_KEY" | base64 --decode) \
  --region "ap-southeast-2" \
  --output text \
  --query Plaintext \
  | base64 --decode \
  | docker login --username wadejensen --password-stdin
docker run -p 3000:3000 wadejensen/atlas:latest
SCRIPT

  root_block_device {
    delete_on_termination = true
    volume_size = "8"
    volume_type = "gp2"
  }

  tags {
    Name = "atlas.server"
  }
}

output "account_id" {
  value = "${data.aws_caller_identity.current.account_id}"
}

output "atlas-server-ip" {
  value = "${aws_instance.atlas-server.public_ip}"
}

output "atlas-server-key-pair" {
  value = "${aws_instance.atlas-server.key_name}"
}

output "ssh-command" {
  value = "ssh -i ~/Downloads/${aws_instance.atlas-server.key_name}.pem ubuntu@${aws_instance.atlas-server.public_ip}"
}
