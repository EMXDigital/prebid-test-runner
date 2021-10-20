const puppeteer = require('puppeteer');
const path = require('path');
const { json } = require('body-parser');
let logs = []; //concating logs because async tasks block from github actions

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setRequestInterception(true);
  page.on('request', async request => {

    //when header bidding requests go out, capture emx request to server
    if(request.url().toString().includes('hb.emxdgt.com')){

        //inspect url
        logs.push('EMX Header Bidding Request: ' + request.url());

        //inspect json body
        const hbRequest = JSON.parse(request.postData());
        
        //do validation logic here....
        logs.push('checking to ensure EMX header bidding request present');
        if(!hbRequest){
          throw new Error('no header bidding request found');
        }

        
        logs.push('checking to ensure request has an id');
        if(!hbRequest.id){ //check id
          throw new Error('header bidding request must have an id');
        }

        logs.push('checking to ensure request has an imp object');
        if(!hbRequest.imp){ //check to make sure containts imp
          throw new Error('header bidding request must have an imp');
        }

        logs.push('checking to ensure imp object is an array');
        if(!Array.isArray(hbRequest.imp)){ // make sure that imp object is and array 
          throw new Error('imp object is not an array');
        }

        logs.push('checking to ensure imp array is not empty');
        if(hbRequest.imp.length == 0){ //check it has at least one impression object
          throw new Error('imp array is empty')
        }

        logs.push('checking to ensure request is of type site or app');
        if(!hbRequest.site && !hbRequest.app){ //check to ensure site object or app object, app for education, always site here
          throw new Error('header bidding request must have site or app object')
        }

        logs.push(JSON.stringify(hbRequest));
        
        return;

    }else{
        request.continue();
    }
    
  });

  //load test adapter page
  await page.goto(`file:${path.join(__dirname, './prebid.html')}`);
  await browser.close();

  for(const log of logs){
    console.log(log);
  }
 
})();