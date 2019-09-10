terraform {
  required_version = "0.12.6"
}

provider "aws" {
  region = "${var.region}"
  version = "2.21.1"
}

variable "region" {}

variable "enabled" {
  default = false
}

locals {
  count = "${var.enabled ? 1 : 0}"
}

data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}

data "terraform_remote_state" "vpc" {
  backend = "local"
  config = {
    path = "../vpc/terraform.tfstate"
  }
}

data "terraform_remote_state" "iam" {
  backend = "local"
  config = {
    path = "../iam/terraform.tfstate"
  }
}

resource "aws_instance" "atlas-server" {
  count = local.count
  # Ubuntu 18.04
  ami = "ami-0b76c3b150c6b1423"
  key_name = "adhoc"
  vpc_security_group_ids = data.terraform_remote_state.vpc.outputs.security_group_atlas_public
  instance_type = "t2.nano"
  associate_public_ip_address = true
  monitoring = false
  subnet_id = data.terraform_remote_state.vpc.outputs.subnet_public[count.index]
  iam_instance_profile = data.terraform_remote_state.iam.outputs.atlas_instance_profile
  instance_initiated_shutdown_behavior = "terminate"
  # Install docker and start docker daemon
  user_data = file("${path.module}/../../bin/run_ec2.sh")

  root_block_device {
    delete_on_termination = true
    volume_size = "8"
    volume_type = "gp2"
  }

  tags = {
    Name = "atlas.server"
  }
}

output "account_id" {
  value = "${data.aws_caller_identity.current.account_id}"
}

output "atlas-server-ip" {
  value = "${aws_instance.atlas-server.*.public_ip}"
}

output "atlas-server-key-pair" {
  value = "${aws_instance.atlas-server.*.key_name}"
}

output "ssh-command" {
  value = "ssh -i ~/Downloads/${var.enabled ? aws_instance.atlas-server[local.count - 1].key_name : ""}.pem ubuntu@${var.enabled ? aws_instance.atlas-server[local.count - 1].public_ip: ""}"
}
