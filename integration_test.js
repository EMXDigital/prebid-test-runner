const puppeteer = require('puppeteer');
const path = require('path');
const { json } = require('body-parser');

class IntegrationTest{
  async run(){
    const request = await this.runAdapter(); //run emx adapter for prebid.js
    if(!request){
      throw new Error('Failed to run prebid adapter. Be sure to build gulpfile for project to run correctly');
    }

    console.log('Inspecting body for request: ' + request.url);
    this.inspect(request.body); //parse respone ensure good for header bidding proxy server
  }

  async runAdapter(){
    return new Promise(async(resolve, reject) => { //promise turn this into asnyc function
      
      //initialize headless browser
      const browser = await puppeteer.launch(); 
      const page = await browser.newPage();
      await page.setRequestInterception(true);
      
      //callbak for when the page starts making request in network console
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
  
  inspect(body){
    //do validation logic here....
    console.log('checking to ensure EMX header bidding request present');
    if(!body){
      throw new Error('no header bidding request found');
    }
    
    console.log('checking to ensure request has an id');
    if(!body.id){ //check id
      throw new Error('header bidding request must have an id');
    }

    console.log('checking to ensure request has an imp object');
    if(!body.imp){ //check to make sure containts imp
      throw new Error('header bidding request must have an imp');
    }

    console.log('checking to ensure imp object is an array');
    if(!Array.isArray(body.imp)){ // make sure that imp object is and array 
      throw new Error('imp object is not an array');
    }

    console.log('checking to ensure imp array is not empty');
    if(body.imp.length == 0){ //check it has at least one impression object
      throw new Error('imp array is empty')
    }

    console.log('checking to ensure request is of type site or app');
    if(!body.site && !body.app){ //check to ensure site object or app object, app for education, always site here
      throw new Error('header bidding request must have site or app object')
    }
    
    console.log('EMX Prebid Request: ' + '\n' + JSON.stringify(body));
    process.exit();
  }
}

//run integration test
const integrationTest = new IntegrationTest();
await integrationTest.run();

