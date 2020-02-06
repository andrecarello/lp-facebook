var STATUS = "PROD";
var PROTOCOL =  document.location.protocol;
var BASE_URL = PROTOCOL + (STATUS === "DEV" ? "//indigo-moon-ilfwekexk2x3.vapor-farm-b1.com/v1/" : "//api.oston.io/oi-go/v1/");
var SUBMIT = false;

var LP = {
    title: 'Oi Vantagens',
    headers: 'http://clic.news/headers/',
    baseUrl: 'http://api.oston.io/oi-fidelidade/v2',
    analytics_url: BASE_URL + "interactions",
    analytics_status: true,
    msisdn: '',
    ddd: '',
    price: document.getElementById('price'),
    body: document.querySelector('[view=home]'),
    loading: document.querySelector('[view=loading]'),
    anonymous_code: 'IAMOston',
    uuid: '',
    ref: 'FB',
    current_version: 0,
    current_os: '',
    ua: navigator.userAgent,
    uaIndex: '',
    smsText: '',
    code: "IAMOston"
};

document.title = LP.title;
LP.price.innerText = localStorage.getItem('price');
localStorage.setItem('REFERER', LP.ref);


document.onreadystatechange = function () {
    if (document.readyState == "interactive") {
        analytics({
            from: '/',
            to: '/fb',
            gaFrom: '',
            gaTo: 'lp-facebook'
        })
    }
};

function currentOS() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/windows phone/i.test(userAgent)) return "Windows Phone";
    if (/android/i.test(userAgent)) return "Android";
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return "iOS";

    return "unknown";
}

function currentVersion() {
    if (LP.ua.match(/iPad/i) || LP.ua.match(/iPhone/i)) {
        LP.current_os = 'iOS';
        LP.uaIndex = LP.ua.indexOf('OS ');
    }
    else if (LP.ua.match(/Android/i)) {
        LP.current_os = 'Android';
        LP.uaIndex = LP.ua.indexOf('Android ');
    }
    else {
        LP.current_os = null;
    }

    if (LP.current_os === 'iOS' && LP.uaIndex > -1) {
        LP.current_version = LP.ua.substr(LP.uaIndex + 3, 3).replace('_', '.');
    }
    else if (LP.current_os === 'Android' && LP.uaIndex > -1) {
        LP.current_os = LP.ua.substr(LP.uaIndex + 8, 3);
    }
    else {
        LP.current_version = null;
    }
}
currentVersion();

function request(obj) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(obj.method || "GET", obj.url);
        if (obj.headers) {
            Object.keys(obj.headers).forEach(key => {
                xhr.setRequestHeader(key, obj.headers[key]);
            });
        }
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send(obj.body);
    });
}

function hideInputMsisdn (value) {
    var msisdnElement = document.getElementById('msisdn');
    msisdnElement.style.visibility = "hidden";
    msisdnElement.style.opacity = "0";
    msisdnElement.style.height = "0";

    if (!!value) {
        document.querySelector('input[name="msisdn"]').value = value.substr(2, value.length);
    }
}

request({ url: LP.headers })
    .then(function(data) {
        let response = JSON.parse(data);

        if (response.Msisdn) {
            localStorage.setItem('msisdn', response.Msisdn);
            getPlans(ddd(response.Msisdn));
            hideInputMsisdn(response.Msisdn);
        } else {
            throw "msisdn não encontrado";
        }
    })
    .catch(function(err) {
        LP.price.innerText = '34,99';
    });

function post(obj) {
    return new Promise(function (resolve, reject) {

        var req = new XMLHttpRequest();
        req.open('post', obj.url);

        req.setRequestHeader('Content-Type', 'application/json');
        req.onload = function () {
            if (req.status === 200) {
                resolve(req.response);
            } else {
                reject(Error(req.statusText));
            }
        };

        req.onerror = function () {
            reject(Error("Network Error"));
        };
        req.send(obj.data);
    });
}


function getPlans(ddd) {
    request({ url: LP.baseUrl + '/sales/group-plans?area_code=' + ddd + '&orderBy=data&orderDirection=asc' })
        .then(data => {
            if (data.length) {
                let response = JSON.parse(data);
                localStorage.setItem('price', response[0].price);
                LP.price.innerText = localStorage.getItem('price');
            }
        })
}

function ddd(msisdn) {
    return msisdn.substring(2, 4);
}

function analytics(obj) {
    const _schema = {
        os: currentOS(),
        to: !!obj.to ? obj.to : "",
        from: !!obj.from ? obj.from : "",
        gaTo: !!obj.gaTo ? obj.gaTo : "",
        gaFrom: !!obj.gaFrom ? obj.gaFrom : "",
        msisdn: localStorage.getItem('msisdn'),
        anonymous: getAnonymous(),
        onlyNavigation: false,
        host: window.location.hostname,
        referer: !localStorage.getItem('REFERER') ? "" : localStorage.getItem('REFERER'),
        listPlans: '',
        cluster: 0,
        status: !!obj.status ? obj.status : "",
        plan: !!obj.plan ? obj.plan : "",
        balance: 0
    };

    if (LP.analytics_status) {
        post({
            url: LP.analytics_url,
            data: JSON.stringify(_schema)
        });
    }
}

function setupAnonymous() {

    if (!hasAnonymousID()) {
        generateAnonymous();
    } else {
        getAnonymous();
    }

    return getAnonymous();
}

function hasAnonymousID() {
    return !!localStorage.getItem(LP.code);
}

function getAnonymous() {
    return localStorage.getItem(LP.code);
}

function generateAnonymous() {

    LP.uuid = Uuid();

    generateLocalStorage();
    generateCookie();

    return this;
}

function generateLocalStorage() {
    localStorage.setItem(LP.code, Uuid());
    return this;
}

function generateCookie() {
    document.cookie = LP.code + '=' + getAnonymous();
    return this;
}

function Uuid() {

    let uuid = '', ii;
    for (ii = 0; ii < 32; ii += 1) {
        switch (ii) {
            case 8:
            case 20:
                uuid += '-';
                uuid += (Math.random() * 16 | 0).toString(16);
                break;
            case 12:
                uuid += '-';
                uuid += '4';
                break;
            case 16:
                uuid += '-';
                uuid += (Math.random() * 4 | 8).toString(16);
                break;
            default:
                uuid += (Math.random() * 16 | 0).toString(16);
        }
    }
    return uuid;
}

setupAnonymous();

function sms() {
    if (LP.current_os === 'iOS') {
        if (parseFloat(LP.current_version) <= 8) {
            LP.os = "IOS<8";
            LP.smsText = 'sms:+3333;body=Oi, quero contratar o Adiantamento de Recarga no valor de RS5';
        } else {
            LP.os = "IOS>8";
            LP.smsText = 'sms:+3333&body=Oi, quero contratar o Adiantamento de Recarga no valor de RS5';
        }
    } else {
        LP.os = "Android";
        LP.smsText = 'sms:+3333?body=Oi, quero contratar o Adiantamento de Recarga no valor de RS5';
    }

    analytics({
        from: '/fb/adiantamento-recarga',
        to: 'SMS Recarga - ' + LP.current_os,
        gaFrom: '/fb/adiantamento-recarga',
        gaTo: 'sms'
    });

    window.open(LP.smsText)
}

function select(elem, size) {

    size.min = size.min || 1;

    for (var i = size.min; i <= size.max; i++) {
        var option = document.createElement("option");
        console.log(size.min);
        if (i < 10) {
            option.value = '0' + i.toString();
            option.text = '0' + i.toString();
        } else {
            option.value = i.toString();
            option.text = i.toString();
        }

        document.querySelector(elem).appendChild(option);
    }
}

select('#dia', { max: 31 });
select('#mes', { max: 12 });
select('#ano', { min: 1950, max: 2000 });

select('#mes-expiracao', { max: 12 });
select('#ano-expiracao', { min: 2020, max: 2035 });


window.onload = function () {

    var form = document.getElementById("formElement");

    let config = {
        classTo: 'required',
        errorClass: 'has-danger',
        successClass: 'has-success',
        errorTextParent: 'required',
        errorTextTag: 'span',
        errorTextClass: 'error'
    };

    var pristine = new Pristine(form, config);

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        console.log('=> SUBMIT: ', SUBMIT);

        if (SUBMIT === false) {

            SUBMIT = true;


            var valid = pristine.validate();

            console.log('=> VALID', valid);
            console.log('=> SUBMIT: ', SUBMIT);

            if (valid) {

                var msisdn = !document.querySelector('input[name="msisdn"]') ? localStorage.getItem('msisdn') : form.querySelector('input[name="msisdn"]').value;

                var cpf = form.querySelector('input[name="cpf"]').value,
                    birth_date = form.querySelector('select[name="bYear"]').value + '-' + form.querySelector('select[name="bMonth"]').value + '-' + form.querySelector('select[name="bDay"]').value,
                    cep = form.querySelector('input[name="cep"]').value,
                    number = form.querySelector('input[name="card_number"]').value,
                    month = form.querySelector('select[name="month"]').value,
                    year = form.querySelector('select[name="year"]').value,
                    cvv = form.querySelector('input[name="cvv"]').value,
                    referer = localStorage.getItem('REFERER'),
                    plan_id = "",
                    card_token = "";

                post({
                    url: BASE_URL + "orders/" + msisdn,
                    data: JSON.stringify({
                        "phone": msisdn,
                        "origin": localStorage.getItem("REFERER"),
                        "document": cpf,
                        "credit_card_number": number,
                        "credit_card_expiration_year": year,
                        "credit_card_expiration_month": month,
                        "credit_card_cvv": cvv,
                        "credit_card_zip": cep,
                        "birthday": birth_date
                    })
                }).then(function(res) {
                    SUBMIT = false;
                    form.reset();
                }).catch(function(err) {
                    SUBMIT = false;
                });
            } else {
                SUBMIT = false;
            }
        }

    });

};
