const fs = require("fs");
const puppeteer = require("puppeteer");
const pdf = require('pdfkit');
const path  = require("path");


let ctab;
let link =
  "https://www.youtube.com/playlist?list=PLRBp0Fe2GpgnIh0AiYKh7o7HnYAej-5ph";
(async function () {
  try {
    const browserInstance = await puppeteer.launch({
      headless: false,
      args: ["--start-maximized"],
      defaultViewport: null,
    });
    const pages = await browserInstance.pages();
    ctab = pages[0];
    await ctab.goto(link);
    await ctab.waitForSelector(`#title .style-scope .style-scope`);
    let name = await ctab.evaluate((selector) => {
      return document.querySelector(selector).innerHTML;
    }, `#title .style-scope .style-scope`);
    console.log(name);
    let allData = await ctab.evaluate(
      getData,
      `#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer`
    );

    console.log(
      `Number  of videos : ${allData.numOfVideos} -- Number  of views : ${allData.numOfViews}`
    );

    let totalVideos = allData.numOfVideos.split(" ")[0] ;
    
     totalVideos =  parseInt('1047')
    
         
    let currVideos = await getVideosLength();
  
    let res  = totalVideos - currVideos
    console.log(res)
    while(totalVideos - currVideos >= 20){
       
        await scrolltoBottom();
        currVideos = await getVideosLength();
        if(currVideos == 1047){
          break;
        }
    }

    let finalList = await getInfo();
    
    // console.log(finalList)

    // console.log(currVideos);

    const dir = path.join(__dirname , "play.pdf")

    if(fs.existsSync(dir) == false){
      // fs.writeFileSync(dir , JSON.stringify(finalList))
      let pdfDoc = new pdf;
      pdfDoc.pipe(fs.createWriteStream(dir))
      pdfDoc.text(JSON.stringify(finalList))
      pdfDoc.end();
    }else{
      console.log("already Exist")
    }

  } 
  
  catch (error) {
      console.log(error)
  }
})();

function getData(selector) {
  let data = document.querySelectorAll(selector);
  let numOfVideos = data[0].innerText;
  let numOfViews = data[1].innerText;
  return { numOfVideos, numOfViews };
}

async function getVideosLength(){

    let len = ctab.evaluate(getLen ,'#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer' )
    return len;
}

function getLen(selec){
    
    let len = document.querySelectorAll(selec);
    return len.length
}

async function scrolltoBottom(){

    await ctab.evaluate(srollto )
    function srollto(){
    window.scrollBy(0,window.innerHeight)
    }
}

async function getInfo(){
    // console.log("hi")
    
    let fin = await ctab.evaluate(getDuration_and_Time ,'#video-title' , '#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer'  )
    // console.log(fin)
    return fin;
}

function getDuration_and_Time(titleSelector , LenghtSelector){
console.log("bye")
let allvideoTitle = document.querySelectorAll(titleSelector);
let allvideoLength = document.querySelectorAll(LenghtSelector);
// console.log(allvideoLength.length + " time")

let videoInfo = [];
for (let i = 0; i < allvideoLength.length; i++) {
    let videoTitle = allvideoTitle[i].innerText;
    let videoLength = allvideoLength[i].innerText;

    videoInfo.push({videoTitle , videoLength})

}
return videoInfo;

}