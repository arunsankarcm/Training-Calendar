const urlParams = new URLSearchParams(window.location.search);
const monthText = urlParams.get("month");
const yearText = urlParams.get("year");
console.log("URL Parameters - Month:", monthText, "Year:", yearText);
let versionNo =1;

function downloadImage() {
  const element = document.getElementById('container-capture');
 
  html2canvas(element, {
    scale: 1, // Set scale to prevent excessive resolution
    width: 846, // Set width to match the element width
  }).then(canvas => {
    // Create a temporary link to download the image
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `Training_Calendar_${monthText}_${yearText}_v${versionNo}.png`;
    versionNo++;
   
    // Append the link to the document and click it to trigger download
    document.body.appendChild(link);
    link.click();
   
    // Clean up: remove the link from the DOM
    document.body.removeChild(link);
  }).catch(error => {
    console.error('Error generating the image:', error);
  });
}

function emailAttacher(){

    const element = document.getElementById('container-capture');
    html2canvas(element).then(canvas => {
 
    const imgData = canvas.toDataURL('image/png');
    return imgData;

  });

}



  // document.getElementById("customMail").setAttribute(
  //     "href","mailto:"+benefit.emails[0].to+"?cc="+benefit.emails[0].cc+
  //     "&subject="+benefit.emails[0].subject);


    // +"&body="+encodedBody,emailAttacher()