const puppeteer = require('puppeteer');
const path = require('path');
const { json } = require('body-parser');

//run integration test
(async () => {
	try {
		const browser = await puppeteer.launch({ headless: true });
		const page = await browser.newPage();
		await page.setRequestInterception(true);

		page.on('request', async request => {
			try {
				//when header bidding requests go out, capture emx request to server
				if(request.url().toString().includes('hb.emxdgt.com')){
					//inspect json body
					const emxRequest = JSON.parse(request.postData());
					console.log('checking to ensure EMX header bidding request present');
					if(!emxRequest){
						throw new Error('no header bidding request found');
					}

					console.log('checking to ensure request has an id');
					if(!emxRequest.id){ //check id
						throw new Error('header bidding request must have an id');
					}

					console.log('checking to ensure request has an imp object');
					if(!emxRequest.imp){ //check to make sure containts imp
						throw new Error('header bidding request must have an imp');
					}

					console.log('checking to ensure imp object is an array');
					if(!Array.isArray(emxRequest.imp)){ // make sure that imp object is and array 
						throw new Error('imp object is not an array');
					}

					console.log('checking to ensure imp array is not empty');
					if(emxRequest.imp.length == 0){ //check it has at least one impression object
						throw new Error('imp array is empty')
					}

					console.log('checking to ensure request is of type site or app');
					if(!emxRequest.site && !body.app){ //check to ensure site object or app object, app for education, always site here
						throw new Error('header bidding request must have site or app object')
					}

					console.log(`checking to ensure imp[0] has a "ext" field`);
					if(!emxRequest.imp[0].ext) {
						throw new Error(`imp does not have a "ext" field`);
					}

					console.log(`checking to ensure imp[0].ext has a "gpid" field`);
					if(!emxRequest.imp[0].ext.gpid) {

						throw new Error(`imp.ext does not have a "gpid" field`);
					}

					console.log(`checking to ensure imp[0].ext.gpid is equal to "/19968336/header-bid-tag-0"`);
					if(emxRequest.imp[0].ext.gpid.localeCompare("/19968336/header-bid-tag-0") != 0) {
						throw new Error(`imp[0].ext.gpid does not equal "/19968336/header-bid-tag-0". it equals "${emxRequest.imp[0].ext.gpid}"`);
					}

					console.log('All tests pass. Woohoo!');

				}else{
					request.continue();
				}
			} catch(e) {
				console.error(e);
				console.error(request.postData());
				request.abort();
				process.exit(1);
			}

		});

		page.on('requestfailed', async err => {
			console.error(`Request error for url: ${err._url}. Error: ${err._failureText}`);
			process.exit(1)
		});
		page.on("pageerror", err => {
			console.error(`Page error: ${err.toString()}`);
			process.exit(1)
		});

		//load test adapter page
		await page.goto(`file:${path.join(__dirname, './prebid.html')}`);
		await browser.close();
	}catch(e) {
		console.error(e);
		process.exit(1)
	}

})();

