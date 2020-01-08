const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = './csv/scrap_8_jan_2019/76210_zillow.csv';

if(! fs.existsSync(path)){
  fs.writeFileSync(path, 'Address,City,State,Zipcode,Price,Beds,Bath,Sqft\n');
}


(async function main(){

    try{
    const browser = await puppeteer.launch({headless: false, ignoreHTTPSErrors: true, slowMo:100, defaultViewport: null});
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.87 Safari/537.36");

    await page.goto("https://www.zillow.com/denton-tx-76210/rentals/2-_beds/2_p/?searchQueryState={%22pagination%22:{%22currentPage%22:2},%22usersSearchTerm%22:%2276210%22,%22mapBounds%22:{%22west%22:-97.19114636315919,%22east%22:-96.99837063684083,%22south%22:33.09221489086841,%22north%22:33.214230416433516},%22regionSelection%22:[{%22regionId%22:91313,%22regionType%22:7}],%22isMapVisible%22:true,%22mapZoom%22:13,%22filterState%22:{%22beds%22:{%22min%22:2},%22isForSaleByAgent%22:{%22value%22:false},%22isForSaleByOwner%22:{%22value%22:false},%22isNewConstruction%22:{%22value%22:false},%22isForSaleForeclosure%22:{%22value%22:false},%22isComingSoon%22:{%22value%22:false},%22isAuction%22:{%22value%22:false},%22isPreMarketForeclosure%22:{%22value%22:false},%22isPreMarketPreForeclosure%22:{%22value%22:false},%22isCondo%22:{%22value%22:false},%22isTownhouse%22:{%22value%22:false},%22isApartment%22:{%22value%22:false},%22isForRent%22:{%22value%22:true}},%22isListVisible%22:true}", {waitUntil: 'load', timeout: 0});

    await page.waitForSelector('#grid-search-results > ul.photo-cards>li');

    let photoCards = await page.$$('#grid-search-results > ul.photo-cards>li');
    let csv_str = '';

    for(let i =0;i<photoCards.length;i++){
      try{
        let price = await photoCards[i].$eval('a > div.list-card-heading > div.list-card-price',(el)=>el.innerText);
        let beds = await photoCards[i].$eval('a > div.list-card-heading > ul > li:nth-child(1)',(el)=>el.innerText);
        let baths = await photoCards[i].$eval('a > div.list-card-heading > ul > li:nth-child(2)',(el)=>el.innerText);
        let sqft = await photoCards[i].$eval('a > div.list-card-heading > ul > li:nth-child(3)',(el)=>el.innerText);
        let address = await photoCards[i].$eval('a > .list-card-addr',(el)=>el.innerText);

        let addressArr = address.split(',');
        address = addressArr[0];
        let city = addressArr[1];
        let statezip_array = addressArr[2].split(" ");

        let state = statezip_array[1];
        let zipcode = statezip_array[2];

        csv_str+=`"${address}","${city}","${state}","${zipcode}","${price}","${beds}","${baths}","${sqft}"\n`;

      }catch(err){
        continue;
      }
    }

     fs.appendFileSync(path,csv_str);
     await browser.close();
   }catch(err){
    console.log(err);
    //continue;
   }

})();


