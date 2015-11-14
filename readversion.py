import json,sys; 


with open('package.json') as data_file:
	data = json.load(data_file);
	
print data['version'];



