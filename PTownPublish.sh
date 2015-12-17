#scp -r -i ../AWS/PTownPerforce.pem *.js ec2-user@ec2-54-67-81-203.us-west-1.compute.amazonaws.com:/usr/share/nginx/html/dataminer
#scp -r -i ../AWS/PTownPerforce.pem *.json ec2-user@ec2-54-67-81-203.us-west-1.compute.amazonaws.com:/usr/share/nginx/html/dataminer
#scp -r -i ../AWS/PTownPerforce.pem *.ts ec2-user@ec2-54-67-81-203.us-west-1.compute.amazonaws.com:/usr/share/nginx/html/dataminer
#scp -r -i ../AWS/PTownPerforce.pem *.html ec2-user@ec2-54-67-81-203.us-west-1.compute.amazonaws.com:/usr/share/nginx/html/dataminer
#scp -r -i ../AWS/PTownPerforce.pem lib ec2-user@ec2-54-67-81-203.us-west-1.compute.amazonaws.com:/usr/share/nginx/html/dataminer
#scp -r -i ../AWS/PTownPerforce.pem typings ec2-user@ec2-54-67-81-203.us-west-1.compute.amazonaws.com:/usr/share/nginx/html/dataminer
scp -r -i ../AWS/PTownPerforce.pem components ec2-user@ec2-54-67-81-203.us-west-1.compute.amazonaws.com:/usr/share/nginx/html/dataminer
#scp -r -i ../AWS/PTownPerforce.pem *.md ec2-user@ec2-54-67-81-203.us-west-1.compute.amazonaws.com:/usr/share/nginx/html/dataminer
#scp -r -i ../AWS/PTownPerforce.pem *.css ec2-user@ec2-54-67-81-203.us-west-1.compute.amazonaws.com:/usr/share/nginx/html/dataminer


var=$(python readversion.py)
echo $var

a='{"dataminer":{"liveVersion":"'
b='"}}'
c=$a$var$b


curl \
--header "Content-type: application/json; charset=utf-8" \
--request PUT \
--data $c \
https://api.myjson.com/bins/1t5wx