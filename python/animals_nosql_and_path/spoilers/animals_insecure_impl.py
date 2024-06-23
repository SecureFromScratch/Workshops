from fastapi import FastAPI, Request, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging

logging.basicConfig(level=logging.DEBUG)

app = FastAPI()
tls_cert = 'X509-cert-8970243521102152029.pem'
db_client = AsyncIOMotorClient('mongodb+srv://cluster0.4el6tu0.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&appName=Cluster0', tls=True, tlsCertificateKeyFile=tls_cert)
db = db_client.secure_animals

app.mount("/public", StaticFiles(directory="public"), name="public")

ANIMALS_COLLECTION = "animals"
SAYINGS_COLLECTION = "english"

# (GET) request handler to fetch animals from MongoDB. No query arguments.
@app.get("/api/animals")
async def get_animals():
    collection = db[ANIMALS_COLLECTION]
    animals = await collection.find({}, {'_id': 0}).to_list(length=None)

    logging.info(f'animals returns: {animals}')
    return animals

# (GET) Fetch animal image. Query parameters are: color=<color>&imgName=<imgNameWithExtension>
@app.get("/api/myanimal")
async def get_animal_image(color: str, imgName: str):
    logging.info(f'myanimal received: {color}, {imgName}')

    # Build path to image according to parameters in req.query, which client sends as:
    # { color: <color>, imgName: <imgNameWithExtension> }
    image_path = os.path.join('public', color, imgName)
    
    if not os.path.exists(image_path):
        logging.error(f"myanimal couldn't find: {image_path}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    logging.info(f'myanimal returns: {image_path}')
    return FileResponse(image_path)

# (POST) Fetch animal saying. req.body structure: { color: <color>, animal: <animalName> }
@app.post("/api/animalsays")
async def get_animal_saying(request: Request):
    body = await request.json()
    logging.info(f'animalsays received: {body}')

    #color = body.get("color")
    #animal = body.get("animal")
    collection = db[SAYINGS_COLLECTION]

    # Query according to actual req.body which the client sends as
    # { color: <color>, animal: <animalName> }
    query = body #{"color": color, "animal": animal}
    found = await collection.find(query, {'_id': 0}).to_list(length=None)
    logging.info(f'found variable contains: {found}');

    # assign to 'toSend' from the entries in 'found'
    to_send = found

    if not to_send or not len(to_send):
        return [{"text": "I'm speechless!"}, {"text": "Nothing to say, yet..."}]
    logging.info(f'animalsays returns: {to_send}')
    return to_send

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
