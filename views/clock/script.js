const hourHand = document.querySelector('[data-hour-hand]');
const minuteHand = document.querySelector('[data-minute-hand]');
const secondHand = document.querySelector('[data-second-hand]');

function getFormattedTime(region) {
    var date = new Date().toLocaleString("en-US", {timeZone: region});
    date = new Date(date);
    var hours = "0" + date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    var milliseconds = "00" + new Date().getMilliseconds();
    var formattedTime = hours.substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime;
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function getDate(region) {
    var date = new Date().toLocaleString("en-US", {timeZone: region});
    date = new Date(date);
    var formattedDate = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][date.getDay()-1==-1?6:date.getDay()] + ' ' + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()] + ' ' + date.getDate().toString() + ' ' + date.getUTCFullYear().toString();
    return formattedDate;
}

function setClock(region) {
    var date = new Date().toLocaleString("en-US", {timeZone: region});
    const currentDate = new Date(date);
    const milliseconds = new Date().getMilliseconds();
    const secondsRatio = (currentDate.getSeconds() + milliseconds / 1000) / 60;
    const minutesRatio = (secondsRatio + currentDate.getMinutes()) / 60;
    const hoursRatio = (minutesRatio + currentDate.getHours()) / 12;
    setRotation(secondHand, secondsRatio);
    setRotation(minuteHand, minutesRatio);
    setRotation(hourHand, hoursRatio);
}

function setRotation(element, rotationRatio) {
    element.style.setProperty('--rotation', rotationRatio * 360);
}

function request(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

setInterval(function() {
    setClock(region);
    $("#time").html(getFormattedTime(region));
    $("#date").html(getDate(region));
    
}, 1);

setClock(region);
$("#time").html(getFormattedTime(region));
$("#date").html(getDate(region));

