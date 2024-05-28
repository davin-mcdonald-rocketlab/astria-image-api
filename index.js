import { downloadImage } from './downloadImage.js';
const {
  randomInt,
} = await import('node:crypto');
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.ASTRIA_API_KEY;
const headers = { Authorization: `Bearer ${API_KEY}` }

const TUNE_IDS = {
  CyberRealistic_v2: '657379',
  RealisticVision_v2: '690204',
  CyberRealistic_v4: '838714',
  RealisticVision_v5: '678865',
}

const CONTROLNET_OPT = {
  lineart: 'lineart',
  hed: 'hed',
  pose: 'pose',
  composition: 'composition',
  reference: 'reference',
  ipadapter: 'ipadapter',
  depth: 'depth',
  tile: 'tile',
  canny: 'canny',
  mlsd: 'mlsd',
  qr: 'qr',
}

const generateRandomApiUrl = () => {
  const tuneIdsKeys = Object.keys(TUNE_IDS);
  const randomTuneIdKey = tuneIdsKeys[randomInt(tuneIdsKeys.length)];
  const tuneId = TUNE_IDS[randomTuneIdKey];
  
  return `https://api.astria.ai/tunes/${tuneId}/prompts`;
}

const GENDER = {
  male: '((male, man)),',
  female: '((female, woman)),',
}

// TODO: add camera lens type to the prompt
const PROMPT = {
  astronaut: `astronaut in a garden on a spring day, by martine johanna and simon stalenhag and chie yoshii and casey weldon and wlop, ornate`,
  beerGarden: `Sitting in a beer garden with some drinks`,
  italian: `italian, ornate`,
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
  return `photorealistic, photo, ${gender} ${prompt}, dynamic, particulate, rich colors, intricate, highly detailed, realistic, hi-res, smooth, sharp focus, 8 k, octane rende --mask_prompt foreground, face, glasses --mask_negative clothes --mask_invert --mask_dilate -20 --hires_denoising_strength 0.2`
}

const generateThreeUniquePrompts = (gender) => {
  const promptKeys = Object.keys(PROMPT);
  const selectedPrompts = new Set();

  // Ensure unique selection of prompts
  while (selectedPrompts.size < 6) {
    const randomPromptKey = promptKeys[randomInt(promptKeys.length)];

    if (!selectedPrompts.has(randomPromptKey)) {
      selectedPrompts.add(randomPromptKey);
    }
  }

  return Array.from(selectedPrompts).map(promptKey => {
    const prompt = PROMPT[promptKey];
    return generatePrompt(prompt, GENDER[gender]);
  });
}

// randomly select 6 unique prompts
const promptArray = generateThreeUniquePrompts('male')

console.log('promptArray: ', promptArray)

const generateFormData = (promptArray, imageURL) => {
  const form = new FormData();
  form.append('prompt[text]', promptArray);
  form.append('prompt[num_images]', '1');
  form.append('prompt[negative_prompt]', 'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry');
  form.append('prompt[seed]', '');
  form.append('prompt[steps]', '30');
  form.append('prompt[cfg_scale]', '');
  form.append('prompt[controlnet]', CONTROLNET_OPT.pose);
  form.append('prompt[input_image_url]', imageURL);
  form.append('prompt[mask_image_url]', '');
  form.append('prompt[denoising_strength]', '');
  form.append('prompt[controlnet_conditioning_scale]', '');
  form.append('prompt[controlnet_txt2img]', false);
  form.append('prompt[super_resolution]', true);
  form.append('prompt[inpaint_faces]', false);
  form.append('prompt[face_correct]', true);
  form.append('prompt[film_grain]', false);
  form.append('prompt[face_swap]', false);
  form.append('prompt[hires_fix]', true);
  // form.append('prompt[ar]', 1.1);
  form.append('prompt[scheduler]', 'dpm++sde_karras');
  form.append('prompt[color_grading]', '');
  form.append('prompt[use_lpw]', true);
  form.append('prompt[w]', '512');
  form.append('prompt[h]', '768');
  return form;
}

const fetchJson = async (url) => {
  const response = await fetch(url, { headers: headers });
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();

  // Check if the images are ready
  if (data.images.length > 0) {
    console.log('Images exists', data.images);
    data.images.map( async (image) => {
      const ref = image.split('/').pop();
      await downloadImage(image, `./images/image-${ref}`);
    });
  } else {
    // Wait for a 5 seconds before retrying to avoid spamming the server
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('Images are still processing, retrying in 5 seconds...');
    // Check again if the images are ready
    return fetchJson(url);
  }
};

const images = {
  davin: 'https://therocketlab.github.io/rktlb-signatures/profile-images/davin-lg.jpg',
  random: 'https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg?t=st=1713312958~exp=1713316558~hmac=83aed9a33b9a59324cfc4fd592a2f3d78f04cacc08a1d8e46b845f24a4654917&w=2000',
  tsvi: 'https://therocketlab.github.io/rktlb-signatures/profile-images/selfie.jpg'
}

const getImage = async () => {
  // TODO: loop through all the prompts
  const apiUrl = generateRandomApiUrl();
  const form = generateFormData(promptArray[0], images.davin);
  console.log('form: ', form)
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: form
    });
    const data = await response.json();

    const jsonURL = data?.url;
    jsonURL && await fetchJson(jsonURL)
    
    console.log('Image saved to', data);
  } catch (error) {
    console.error('Error fetching or saving the image:', error);
  }
};

getImage();