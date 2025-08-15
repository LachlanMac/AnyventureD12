import json

with open('old/traits.txt', 'r') as file:
    csv_data = file.read()
lines = csv_data.strip().split("\n")
json_data = []
count = 0
for line in lines:
    count = count + 1
    parts = line.split(',')
    name = parts[0]
    description = parts[-1]
    json_data.append({"id":count,"name": name, "description": description, "weight_mod":0.0,"height_mod":0.0,"attributes":[0,0,0,0,0],"attack":[0,0,0,0,0,0],"damage":[0,0,0,0,0,0],"skills":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"],"spells":["", "", ""],"mitigations":[0,0,0,0,0,0,0],"crafts":[0,0,0,0,0,0,0], "extra":"", "item":"", "language":"", "wealth":""})
json_output = json.dumps(json_data, indent=4)


# Writing each dictionary in the array to a new line in the file
with open('traits.json', 'w') as file:
    file.write('[')
    for item in json_data:
        json_string = json.dumps(item)
        file.write(json_string + ',\n')
    file.write(']')


with open('old/occupation.txt', 'r') as file:
    csv_data = file.read()
lines = csv_data.strip().split("\n")
json_data = []
count = 0
for line in lines:
    count = count + 1
    parts = line.split(',')
    name = parts[7]
    json_data.append({"id":count,"name": name, "description": "","weight_mod":0.0,"height_mod":0.0,"attributes":[0,0,0,0,0],"attack":[0,0,0,0,0,0],"damage":[0,0,0,0,0,0],"skills":["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"], "spells":["", "", ""],"mitigations":[0,0,0,0,0,0,0],"crafts":[0,0,0,0,0,0,0], "extra":"", "item":"", "language":"", "wealth":""})
json_output = json.dumps(json_data, indent=4)




# Writing each dictionary in the array to a new line in the file
with open('occupation.json', 'w') as file:
    file.write('[')
    for item in json_data:
        json_string = json.dumps(item)
        file.write(json_string + ',\n')
    file.write(']')