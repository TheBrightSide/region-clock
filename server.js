// app.js

const express = require("express");
const fs = require('fs');
const http = require('http');
const bodyParser = require('body-parser');
const serveIndex = require('serve-index');

function getIp (req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return [d.getUTCFullYear(), weekNo];
}

function pad(value) {
    return value < 10 ? '0' + value : value;
}

function removeXSS(str) {
    var out = '';
    for(var item in str) {
        if (str[item] == '&') {
            out += '&amp;';
        } else if (str[item] == '<') {
            out += '&lt;';
        } else if (str[item] == '>') {
            out += '&gt;';
        } else if (str[item] == '"') {
            out += '&quot;';
        } else if (str[item] == '\'') {
            out += '&#x27;';
        } else if (str[item] == '/') {
            out += '&#x2F;';
        } else {
            out += str[item];
        }
    }
    return out;
}

function createOffset(date) {
    var sign = (date.getTimezoneOffset() > 0) ? "-" : "+";
    var offset = Math.abs(date.getTimezoneOffset());
    var hours = pad(Math.floor(offset / 60));
    var minutes = pad(offset % 60);
    return sign + hours + ":" + minutes;
}

function getTime(region, date) {
    if(region != null) {
        var date = new Date().toLocaleString("en-US", {timeZone: region});
        date = new Date(date);
    }
    var hours = "0" + date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    var milliseconds = "00" + new Date().getMilliseconds();
    var formattedTime = hours.substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2) + '.' + milliseconds.substr(-3);
    return formattedTime;
}

function getDate(region, date) {
    if(region != null) {
        var date = new Date().toLocaleString("en-US", {timeZone: region});
        date = new Date(date);
    }
    var formattedDate = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).substr(-2) + '-' + ("0" + date.getDate()).substr(-2);
    return formattedDate;
}

function getUTCTimeStamp(date) {
    return getDate(null, date) + 'T' + getTime(null, date);
}

function getYearDay(date) {
    //var date = new Date();
    var start = new Date(date.getFullYear(), 0, 0);
    var diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);
    return day;
}

var app = express();
var api = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/static', express.static('views'));
app.use('/api', api);

app.get('/', function (req, res) {
    console.log('Request for / from ' + getIp(req).toString());
    var region = req.query.region;
    if (region == undefined) {
        res.render('./region-chooser/region-chooser.jade', {links: JSON.parse(fs.readFileSync('./views/region-chooser/regions.json'))})
    } else {
        res.render('./clock/clock.jade', {region: region});
    }
});



api.get('/', function(req, res) {
    console.log('Request for /api from ' + getIp(req).toString());
    var region = req.query.region;

    if(region == null) {
        res.send({
            "error": "Argument region not present!"
        });
    }

    try {
        var date = new Date().toLocaleString("en-US", {timeZone: region});
    } catch ( e ) {
        res.send({
            "error": "Invalid region!"
        })
    }

    var date = new Date().toLocaleString("en-US", {timeZone: region});
    var date = new Date(date);

    res.send({
        "week_number": getWeekNumber(date)[1],
        "utc_datetime": getUTCTimeStamp(date),
        "unixtime": date.getTime() + new Date().getMilliseconds(),
        "timezone": region,
        "day_of_year": getYearDay(date),
        "day_of_week": date.getDay(),
        "raw_date": {
            "year": date.getFullYear(),
            "month": date.getMonth,
            "day": date.getDate(),
            "hours": date.getHours(),
            "minutes": date.getMinutes(),
            "seconds": date.getSeconds(),
            "milliseconds": new Date().getMilliseconds()
        }
    })
});

var listener = app.listen('3000', function () {
    console.clear();
    console.log(`App listening on port ${listener.address().port}`);
});