const request = require('request');
const CryptoJS = require("crypto-js");
const express = require('express');

const key = 'fb5832d83b3399a42cb50b8e1941641a'

const token_url = 'https://api.yeziapp.com/client/tokens'
const account_url = 'https://api.yeziapp.com/client/accounts'

const login_data = {'serialNumber': 'C02SDDLEFVH3', 'seller': 'yezi'}

const port = 8800

function decrypt(content) {
    let bytes = CryptoJS.AES.decrypt(content, key, {
        //iv: key,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    let decryptResult = bytes.toString(CryptoJS.enc.Utf8);
    return decryptResult.toString();
}

function get_data(headers, callback) {
    request.get(account_url, {'headers': headers}, function (error, res, body) {
        let encodedString = JSON.parse(body).data
        let accountsString = decrypt(encodedString)
        let accounts = JSON.parse(accountsString)
        // appleID password
        callback(accounts)
    })
}


function get_from_network(callback) {
    request.post(token_url, {"json": login_data}, function (error, res, body) {
        let cookie1 = res.headers['set-cookie'][0].split(';')[0] + '; ';
        let cookie2 = res.headers['set-cookie'][1].split(';')[0] + '; ';
        // CLOVER_TOKEN.sig=KwtwB8d_FSltbLSnDiWyC_ETp2A; path=/; expires=Tue, 05 Feb 2019 18:17:34 GMT; domain=.yeziapp.com
        get_data({'cookie': cookie1 + cookie2, 'referer': 'https://yezi-apps.yeziapp.com/nav'}, callback)
    });
}

get_from_network((accounts) => {
    console.log(accounts)
})

const app = express();


app.get('/', (req, res) => {
    get_from_network((data) => {
        res.send(JSON.stringify(data))
    })
})

const server = app.listen(port, () => {

    const host = server.address().address;
    const port = server.address().port;

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

});