import qrcode
import requests

beUrl = "https://my-warehouse-app-heroku.herokuapp.com/api/tool/"

response = requests.get(beUrl)
if (response.status_code != 200):
    print(response.status_code)
    print("Connection error")
    raise Exception("Connection Error")

tools = response.json()
for tool in tools:
    img = qrcode.make(beUrl + tool["_id"])
    img.save("./qr-codes/"+tool["label"].replace(" ",
             "_").replace("/", "_").replace("\"", "_")+".png")
