const puppeteer = require('puppeteer');
const path = require('path');
const { json } = require('body-parser');

function loadAdapter(){
  return new Promise(async(resolve, reject) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', async request => {

      //when header bidding requests go out, capture emx request to server
      if(request.url().toString().includes('hb.emxdgt.com')){

        //inspect json body
        const emxRequest = JSON.parse(request.postData());
        if(!emxRequest){
          reject(false);
        }

        resolve({
          url : request.url(),
          body : emxRequest 
        });
        
      }else{
          request.continue();
      }
      
    });
  
    //load test adapter page
    await page.goto(`file:${path.join(__dirname, './prebid.html')}`);
    await browser.close();
    
  });
}

async function someTask(){
  return true;
}

(async () => {
/*
 */

const task = await someTask();
  //run prebid adapter, get EMX request
/*) const request = await loadAdapter();
  if(!request.url){
    console.error('Failed to get url to EMX header bidding adapter, make sure gulp build command was ran');
  }  */

  var request = {
    url : 'http://www.google.com',
    body : '{"test" : "body"}'
  }; 

  //inspect EMX request from adapter
  console.log('Inspection body for request: ' + request.url);
/*
  //do validation logic here....
  console.log('checking to ensure EMX header bidding request present');
  if(!request.body){
    throw new Error('no header bidding request found');
  }
  
  console.log('checking to ensure request has an id');
  if(!request.body.id){ //check id
    throw new Error('header bidding request must have an id');
  }

  console.log('checking to ensure request has an imp object');
  if(!request.body.imp){ //check to make sure containts imp
    throw new Error('header bidding request must have an imp');
  }

  console.log('checking to ensure imp object is an array');
  if(!Array.isArray(request.body.imp)){ // make sure that imp object is and array 
    throw new Error('imp object is not an array');
  }

  console.log('checking to ensure imp array is not empty');
  if(request.body.imp.length == 0){ //check it has at least one impression object
    throw new Error('imp array is empty')
  }

  console.log('checking to ensure request is of type site or app');
  if(!request.body.site && !request.body.app){ //check to ensure site object or app object, app for education, always site here
    throw new Error('header bidding request must have site or app object')
  } */

  console.log(JSON.stringify(request.body));

 })()