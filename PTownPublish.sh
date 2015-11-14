scp -r -i ../AWS/PTownPerforce.pem ./dist/. ec2-user@ec2-54-67-81-203.us-west-1.compute.amazonaws.com:/usr/share/nginx/html/dataminer/.

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