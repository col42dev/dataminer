echo Publishing
#scp -r -i ../AWS/cmoore2.pem ./dist/. ec2-user@ec2-54-201-237-107.us-west-2.compute.amazonaws.com:~/nginx/html/dataminers/.

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