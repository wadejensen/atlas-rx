terraform {
  required_version = "0.11.7"
}

variable "region" {}

variable "az" {}

provider "aws" {
  region = "${var.region}"
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = {
    Name = "main"
  }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = "${aws_vpc.main.id}"
}

resource "aws_route_table" "public" {
  vpc_id = "${aws_vpc.main.id}"

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = "${aws_internet_gateway.gw.id}"
  }
}

resource "aws_eip" "nat" {
  vpc = "true"
}

resource "aws_nat_gateway" "nat" {
  allocation_id = "${aws_eip.nat.id}"
  subnet_id = "${aws_subnet.public.id}"
}

resource "aws_route_table" "private" {
  vpc_id = "${aws_vpc.main.id}"

  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = "${aws_nat_gateway.nat.id}"
  }
}

resource "aws_subnet" "public" {
  vpc_id = "${aws_vpc.main.id}"
  cidr_block = "10.0.0.0/24"
  availability_zone = "${var.az}"
  map_public_ip_on_launch = true
  tags = {
    Name = "main.public"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id = "${aws_subnet.public.id}"
  route_table_id = "${aws_route_table.public.id}"
}

resource "aws_subnet" "private" {
  vpc_id = "${aws_vpc.main.id}"
  cidr_block = "10.0.1.0/24"
  availability_zone = "${var.az}"
  tags = {
    Name = "main.private"
  }
}

resource "aws_route_table_association" "private_aa" {
  subnet_id = "${aws_subnet.private.id}"
  route_table_id = "${aws_route_table.private.id}"
}

resource "aws_security_group" "atlas_public" {
  vpc_id = "${aws_vpc.main.id}"
  name = "atlas.public"
  description = "atlas public subnet access"

  ingress {
    from_port = 22
    to_port = 22
    protocol = "tcp"

    cidr_blocks = ["0.0.0.0/0"]
  }

  // ALLOW 3000 from public
  ingress {
    from_port = 3000
    to_port = 3000
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

//  // ALLOW all ingress (because docker hub)
//  ingress {
//    from_port = 0
//    to_port = 0
//    protocol = "-1"
//    cidr_blocks = ["0.0.0.0/0"]
//  }

  // ALLOW ALL
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "atlas_private" {
  vpc_id = "${aws_vpc.main.id}"
  name = "atlas"
  description = "atlas private subnet access"

  ingress {
    from_port = 22
    to_port = 22
    protocol = "tcp"

    cidr_blocks = ["0.0.0.0/0"]
  }

  // ALLOW 3000 from public subnet
  ingress {
    from_port = 3000
    to_port = 3000
    protocol = "tcp"
    security_groups = [
      "${aws_security_group.atlas_public.id}"
    ]
  }

  // ALLOW ALL
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "subnet_public" {
  value = "${aws_subnet.public.id}"
}

output "subnet_private" {
  value = "${aws_subnet.private.id}"
}

output "security_group_atlas_public" {
  value = "${aws_security_group.atlas_public.id}"
}
