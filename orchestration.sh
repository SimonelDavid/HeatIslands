#!/bin/bash

HOST=3.73.146.56
PORT=22 

# Function to format time
format_time() {
    local total_seconds=$1
    if [ $total_seconds -ge 60 ]; then
        local minutes=$((total_seconds / 60))
        local seconds=$((total_seconds % 60))
        echo "$minutes minutes and $seconds seconds"
    else
        echo "$total_seconds seconds"
    fi
}

# Start timer
start_time=$(date +%s)

# Navigate to the terraform directory
cd terraform

# Log time for navigating to the directory
cd_time=$(date +%s)
echo "Time to navigate to the terraform directory: $(format_time $((cd_time - start_time)))"

# Initialize Terraform
terraform init

# Log time after terraform init
init_time=$(date +%s)
echo "Time for terraform init: $(format_time $((init_time - cd_time)))"

# Plan Terraform execution
terraform plan

# Log time after terraform plan
plan_time=$(date +$s)
echo "Time for terraform plan: $(format_time $((plan_time - init_time)))"

# Check the operating system and prompt for Terraform apply
case $(uname) in
"Darwin"|"Windows_NT")
    read -p "Do you want to apply this Terraform plan? (yes/no): " answer
    if [ "$answer" == "yes" ]; then
        terraform apply -auto-approve
        apply_time=$(date +%s)
        echo "Time for terraform apply: $(format_time $((apply_time - plan_time)))"
        
        # Execute Ansible playbook after Terraform apply
        while ! nc -z $HOST $PORT; do
            echo "Waiting for instance to become ready..."
            sleep 10
        done
        ready_time=$(date +%s)
        echo "Time for instance to become ready: $(format_time $((ready_time - apply_time)))"
        
        echo "Instance is up and running."
        ansible-playbook -i ../ansible/hosts ../ansible/deployment.yml --private-key=./heat-island.pem
        ansible_time=$(date +%s)
        echo "Time for ansible playbook: $(format_time $((ansible_time - ready_time)))"
    fi
    ;;
*)
    echo "Waiting for manual prompt to apply Terraform plan..."
    read -p "Do you want to apply this Terraform plan? (yes/no): " answer
    if [ "$answer" == "yes" ]; then
        terraform apply -auto-approve
        apply_time=$(date +%s)
        echo "Time for terraform apply: $(format_time $((apply_time - plan_time)))"
        
        # Execute Ansible playbook after Terraform apply
        while ! nc -z $HOST $PORT; do
            echo "Waiting for instance to become ready..."
            sleep 10
        done
        ready_time=$(date +%s)
        echo "Time for instance to become ready: $(format_time $((ready_time - apply_time)))"
        
        echo "Instance is up and running."
        ansible-playbook -i ../ansible/hosts ../ansible/deployment.yml --private-key=./heat-island.pem
        ansible_time=$(date +%s)
        echo "Time for ansible playbook: $(format_time $((ansible_time - ready_time)))"
    fi
    ;;
esac

# End timer and log total execution time
end_time=$(date +%s)
echo "Total execution time: $(format_time $((end_time - start_time)))"
