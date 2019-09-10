#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
INFRA_HOME="${REPO_ROOT}/infra"
VPC_INFRA_HOME="${INFRA_HOME}/vpc"
IAM_INFRA_HOME="${INFRA_HOME}/iam"
EC2_INFRA_HOME="${INFRA_HOME}/ec2"

PROG=$(basename "$0")

usage() {
    cat <<EOF
Usage: "${PROG}" [plan|apply|deploy|teardown]
EOF
}

plan() {
  local dir
  dir="$1"

  cd "${dir}"
  terraform plan -var-file=prod.tfvars
}

apply() {
  local dir
  dir="$1"

  cd "${dir}"
  terraform apply -var-file=prod.tfvars
}

teardown() {
  local dir
  dir="$1"

  cd "${dir}"
  terraform apply -var-file=prod.tfvars -var 'enabled=false'
}

deploy() {
  local dir
  dir="$1"

  cd "${dir}"
  terraform apply -var-file=prod.tfvars -var 'enabled=true'
}

main() {
    if [[ "$#" -ne 1 ]]; then
        usage
        exit 1
    fi

    local verb="$1"

    if [[ "${verb}" == "plan" ]]; then
        plan "${VPC_INFRA_HOME}"
        plan "${IAM_INFRA_HOME}"
        plan "${EC2_INFRA_HOME}"
    elif [[ "${verb}" == "apply" ]]; then
        apply "${VPC_INFRA_HOME}"
        apply "${IAM_INFRA_HOME}"
        apply "${EC2_INFRA_HOME}"
    elif [[ "${verb}" == "deploy" ]]; then
        deploy "${VPC_INFRA_HOME}"
        deploy "${IAM_INFRA_HOME}"
        deploy "${EC2_INFRA_HOME}"
    elif [[ "${verb}" == "teardown" ]]; then
        teardown "${EC2_INFRA_HOME}"
        teardown "${VPC_INFRA_HOME}"
    else
      echo "Unknown infra.sh argument: $1"
      usage
      exit 1
    fi
}

main "$@"
