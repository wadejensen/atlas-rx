terraform {
  required_version = "0.12.6"
}

variable "region" {}

provider "aws" {
  region = "${var.region}"
  version = "2.21.1"
}

variable "enabled" {}

data "aws_caller_identity" "current" {}


resource "aws_iam_user" "wjensen" {
  name = "wjensen"
}

resource "aws_iam_user_policy_attachment" "wjensen_ec2_policy_attach" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2FullAccess"
  user = "${aws_iam_user.wjensen.id}"
}

resource "aws_iam_user_policy_attachment" "wjensen_iam_policy_attach" {
  policy_arn = "arn:aws:iam::aws:policy/IAMFullAccess"
  user = "${aws_iam_user.wjensen.id}"
}

resource "aws_iam_user_policy_attachment" "wjensen_vpc_policy_attach" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonVPCFullAccess"
  user = "${aws_iam_user.wjensen.id}"
}

resource "aws_iam_role" "atlas" {
  name = "atlas"
  assume_role_policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid":"AssumeInstanceRole",
      "Effect":"Allow",
      "Principal":{
        "Service":"ec2.amazonaws.com"
      },
      "Action":"sts:AssumeRole"
    }
  ]
}
POLICY
}

resource "aws_iam_role_policy" "atlas-kms-access" {
  role = "${aws_iam_role.atlas.id}"
  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "KMSDecrypt",
      "Action": [
        "kms:Decrypt"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:kms:ap-southeast-2:771125400872:key/4fff767c-337a-49c9-a79e-e82662862e5c",
        "arn:aws:kms:ap-southeast-2:771125400872:key/c59ddaea-de19-432e-9ffd-1e61ceb8508e",
        "arn:aws:kms:ap-southeast-2:771125400872:key/1f171c64-3681-4b4f-a874-85234d20dcda"
      ]
    }
  ]
}
POLICY
}

resource "aws_iam_instance_profile" "atlas" {
  name = "atlas"
  role = "${aws_iam_role.atlas.name}"
}

output "atlas_instance_profile" {
  value = "${aws_iam_instance_profile.atlas.name}"
}
