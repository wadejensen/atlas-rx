terraform {
  required_version = "0.11.7"
}

variable "region" {}

provider "aws" {
  region = "${var.region}"
}

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


//data "aws_iam_policy_document" "atlas-role-policy-document" {
//
//  statement {
//    actions = [
//      "sts:AssumeRole"
//    ]
//
//    principals {
//      type = "Service"
//      identifiers = [
//        "ec2.amazonaws.com"
//      ]
//    }
//  }
//
////  statement {
////    actions = [
////      "kms:Decrypt"
////    ]
////    resources = [
////      "arn:aws:kms:ap-southeast-2:${data.aws_caller_identity.current.account_id}:key/4fff767c-337a-49c9-a79e-e82662862e5c"
////    ]
////  }
//}

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
      "Sid": "KMSDecryptDockerHubPW",
      "Action": [
        "kms:Decrypt"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:kms:ap-southeast-2:771125400872:key/4fff767c-337a-49c9-a79e-e82662862e5c"
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
