//---------------------------------------------//
// Copyright (c) 2020 Ernesto Leonel Argüello.
// This file is covered by LICENSE at the root of this project.
//---------------------------------------------//

import Twitter from 'twitter-lite'; // OG.
import fs from 'fs';

const TokenJSON = JSON.parse(fs.readFileSync("Token.json", {encoding: "utf8"})); // Keys go here.
const ConsKey = TokenJSON.consumer_key
const ConsSecret = TokenJSON.consumer_secret
const TokenKey = TokenJSON.access_token_key
const TokenSecret = TokenJSON.access_token_secret

const client = new Twitter({
    subdomain: "api", // "api" is the default (change for other subdomains)
    version: "1.1", // version "1.1" is the default (change for other subdomains)
    consumer_key: ConsKey, // from Twitter.
    consumer_secret: ConsSecret, // from Twitter.
    access_token_key: TokenKey, // from your User (oauth_token)
    access_token_secret: TokenSecret // from your User (oauth_token_secret)
});

function sleep(ms) { // Sleep in case you rate limit yourself.
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function LoopDelete() { // Heavy lifting.

  try {

    // Last tweet or retweet.
    const response1 = await client.get("statuses/user_timeline", {user_id: '1499778236', count: 1})
    
    if (response1[0].text.startsWith("RT")) {

      // Endpoint for unretweeting.
      console.log(response1[0].text)
      await client.post("statuses/unretweet", {id: (response1[0].id_str)})
      await LoopDelete()
      return;
    }

    // Endpoint for deleting your own tweet.
    console.log(response1[0].text)
    await client.post("statuses/destroy", {id: response1[0].id_str})
    await LoopDelete()
    return;

  } catch (error) {
    if (error.errors[0].code == 88) { // 88 is a rate limit.

      console.log("RATE LIMITED")
      let RateLimit = (parseInt(error._headers.get('x-rate-limit-reset'))) * 1000
      await sleep(RateLimit)
      await LoopDelete()
      return;
    }

    console.log(error) // Stops.
    return;
  }
}

async function Begin() {
  await LoopDelete()
  console.log("Finished loops.")
  return;
}

Begin() // Go.