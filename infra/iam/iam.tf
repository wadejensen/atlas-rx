terraform {
  required_version = "0.11.7"
}

variable "region" {}

provider "aws" {
  region = "${var.region}"
}

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
