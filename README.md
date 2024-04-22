# HeatIslands
I want a shell script  that will orechestrtate everything for me. This shell script will:
1. do a terraform init inside terraform folder
2. do a terraform plan inside terraform folder
3. will check if i have macos or windows and will notify that there is a waiting promt for yes or no if i want to apply the terraform plan shown, if there is none of these oses than will just wait until a promt is told
4. do a terraform apply with autoapprove if approved at point 3
5. execute an ansible code

I have anything but i need also the ansible code that will do:
1. will connect to the ec2 instance created at step 4 in the shell script with the key found in terraform folder, the key is called: heat_island.pem
2. will move in the instance another key found in ../git-crypt-key
3. will do just a git clone of this repository: https://github.com/SimonelDavid/HeatIslands.git
4. will unlock the repository with the moved key at step 2
5. will install docker compose in the ec2 instance(the os image is an amazon linux image)
6. will do a docker-compose up -d inside the repository that was unlocked