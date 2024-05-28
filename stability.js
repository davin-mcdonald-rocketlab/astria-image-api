import fs from "fs";
import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.STABILITY_API_KEY;

const GENDER = {
  male: '((male, man)),',
  female: '((female, woman)),',
}

const PROMPT = {
  astronaut: `astronaut in a garden on a spring day, by martine johanna and simon stalenhag and chie yoshii and casey weldon and wlop, ornate`,
  beerGarden: `Sitting in a beer garden with some drinks`,
  italian: `italian, pink hair, ornate`,
  fireman: `fireman, firefighter, ornate`,
  formal: `Walking to a formal function in a tuxedo / ball gown, ornate`,
  hike: `On a hike with some trees, nature`,
  puppies: `Lying with a bunch of puppies, cute, fluffy`,
  surfing: `On a surfboard with a shark in the background, potential danger`,
  karaoke: `Singing karaoke with friends, fun, party, bar, pub`,
  dog: `Snuggling with golden retriever, couch, cute, cozy`,
  machuPichu: `Standing on Machu Pichu with arms in the air, mountains, nature, travel`,
  martini: `Smirking with a martini in hand, ornate, party, fun`,
  iceSkating: `Fallen over ice skating and a smile on face, winter, fun, cold`,
  baby: `Holding a crying baby looking nervous but happy, cute, baby, family`,
  gardening: `In a vegetable patch, tending to the plants, nature, gardening`,
  riding: `Riding a bike on a cobblestone path, nature, fun, exercise`,
  boardGame: `Laughing with friends with a board game at a pub, fun, party, friends`,
  pottery: `Concentrating on working a pottery wheel, art, craft, pottery`,
  swim: `In a lap pool, holding onto the edge, looking up to the camera with sun in their face, exercise, swim, pool`,
  marathon: `Posing with a medal at the end of a marathon looking sweaty but happy and relieved, exercise, marathon,`,
  art: `In a museum looking closly at a painting, art, museum, culture`,
  flower: `Picking a daffodil out of a garden, nature, flower, gardening`,
  ute: `Sitting in the back of a ute whilst driving in country side with friends around, fun, car, friends, travel`,
}

const generatePrompt = (prompt, gender) => {
  return `realistic digital painting, ${gender} ${prompt}, dynamic, particulate, rich colors, intricate, highly detailed, realistic, hi-res, harpers bazaar art, smooth, sharp focus, 8 k, octane rende --mask_prompt face, hair, head --mask_negative clothes --mask_invert --mask_dilate -20 --hires_denoising_strength 0.1`
}

const prompt = generatePrompt(PROMPT.fireman, GENDER.male)

// const formData = new FormData();
// formData.append("prompt", prompt); 
// formData.append("mode", "text-to-image"); 
// formData.append("strength", "0.7"); 
// formData.append("output_format", "jpeg"); 
// formData.append("model", "sd3");
// formData.append("image", "https://therocketlab.github.io/rktlb-signatures/profile-images/davin-lg.jpg");
// formData.append("negative_prompt", "clay, text, watermark, padding, cropped, typography, nipples");

const getImage = async () => {
  try {
    const response = await fetch("https://api.stability.ai/v2beta/stable-image/generate/sd3", {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${API_KEY}`, 
        Accept: "image/*" 
      },
      body: formData,
    });

    const buffer = await response.arrayBuffer()

    console.log('response: ', response)

    if(response.status === 200) {
      fs.writeFileSync("./avatar.jpeg", Buffer.from(buffer));
    } else {
      throw new Error(`${response.status}: ${buffer.toString()}`);
    }
  } catch (error) {
    console.error('error:', JSON.stringify(error.toString()));
  }
}

// getImage();



const engineId = 'stable-diffusion-v1-6'
const apiHost = process.env.API_HOST ?? 'https://api.stability.ai'
const apiKey = API_KEY

if (!apiKey) throw new Error('Missing Stability API key.')

// NOTE: This example is using a NodeJS FormData library.
// Browsers should use their native FormData class.
// React Native apps should also use their native FormData class.
const fileBuffer = fs.readFileSync('./allen.png');
console.log('fileBuffer: ', fileBuffer)
const formData = new FormData()
formData.append('init_image', fileBuffer);
formData.append('init_image_mode', 'IMAGE_STRENGTH')
formData.append('image_strength', 0.35)
formData.append('text_prompts[0][text]', prompt)
formData.append('cfg_scale', 7)
formData.append('samples', 1)
formData.append('steps', 30)

const response = await fetch(
  `${apiHost}/v1/generation/${engineId}/image-to-image`,
  {
    method: 'POST',
    headers: {
      // ...formData.getHeaders(),
      Accept: 'image/png',
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  }
)

if (!response.ok) {
  throw new Error(`Non-200 response: ${await response.text()}`)
}

const responseJSON = (await response.json())

responseJSON.artifacts.forEach((image, index) => {
  fs.writeFileSync(
    `out/v1_img2img_${index}.png`,
    Buffer.from(image.base64, 'base64')
  )
})

