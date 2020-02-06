
const LP = {
    title: 'Oi Vantagens',
    headers: 'http://clic.news/headers/',
    baseUrl: 'http://api.oston.io/oi-fidelidade/v2',
    analytics_url: 'http://api.oston.io/analytics',
    analytics_status: false,
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


window.onload = function () {
    analytics({
        from: '/',
        to: '/fb',
        gaFrom: '',
        gaTo: 'lp-facebook'
    })
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

request({ url: LP.headers })
    .then(data => {
        let response = JSON.parse(data);
        getPlans(ddd(response.Msisdn));
        if (response.Msisdn) {
            localStorage.setItem('msisdn', response.Msisdn);
            document.getElementById('msisdn').remove();
        } else {
            throw "msisdn não encontrado";
        }
    })
    .catch(error => {
        console.log(error);
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
                localStorage.setItem('plans', data);
                LP.price.innerText = localStorage.getItem('price');
            }
        })
}

function ddd(msisdn) {
    return msisdn ? msisdn.substring(2, 4) : '';
}

function redirect(obj) {
    if (!obj.page) {
        document.querySelector(obj.target).classList.toggle('active');
    } else {
        window.open(obj.url, "_blank")
    }

    articles(localStorage.getItem('plans'));

    if (!!obj.analytics) {
        analytics({
            to: obj.analytics.to,
            from: obj.analytics.from,
            gaTo: obj.analytics.gaTo,
            gaFrom: obj.analytics.gaFrom
        })
    }
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

/**
 * @return {string}
 */
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
    //Create and append the options

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
        // class of the parent element where the error/success class is added
        classTo: 'required',
        errorClass: 'has-danger',
        successClass: 'has-success',
        // class of the parent element where error text element is appended
        errorTextParent: 'required',
        // type of element to create for the error text
        errorTextTag: 'span',
        // class of the error text element
        errorTextClass: 'error'
    };

    // create the pristine instance
    var pristine = new Pristine(form, config);

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // check if the form is valid
        var valid = pristine.validate(); // returns true or false

        if (valid) {

            let data = {
                msisdn: form.querySelector('input[name="msisdn"]').value.length ? localStorage.getItem('Msisdn') : form.querySelector('input[name="msisdn"]').value,
                cpf: form.querySelector('input[name="cpf"]').value,
                birth_date: form.querySelector('select[name="bDay"]').value + '/' + form.querySelector('select[name="bMonth"]').value + '/' + form.querySelector('select[name="bYear"]').value,
                cep: form.querySelector('input[name="cep"]').value,
                number: form.querySelector('input[name="card_number"]').value,
                month: form.querySelector('select[name="month"]').value,
                year: form.querySelector('select[name="year"]').value,
                cvv: form.querySelector('input[name="cvv"]').value,
                referer: localStorage.getItem('REFERER') ? localStorage.getItem('REFERER') : REFERER,
                utm_campaign: "",
                utm_medium: "",
                plan_id: "",
                card_token: ""
            };

            console.log(data)
            // post({
            //     url: '/',
            //     data: JSON.stringify(data)
            // })
        }

    });

};

//
// function validateForm(name) {
//     var msisdn = document.forms["form"]["msisdn"];
//
//
//
//     return false;
//
//     if (msisdn === "" || msisdn.length < 11) {
//         alert("erro");
//         return false;
//     }
// }
//
// function validateInput(el) {
//
//     el.onchange = function () {
//         var val = this.value;
//         var next = this.nextElementSibling;
//         next.style.display = !/[0-9]{11}/.exec(val) ? 'block' : 'none';
//     };
//
//     el.onblur = function () {
//         var next = this.nextElementSibling;
//         next.style.display = this.value.length < this.getAttribute('maxlength') || this.value.length < this.getAttribute('minlength') ? 'block' : 'none';
//     };
//
//     el.oninput = function () {
//         this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
//     }
// }
//
//
// function formInputs() {
//     var elem = document.querySelector('.form');
//     for(var i = 0; i < elem.length; i++) {
//         var span  = document.createElement("span");
//         span.classList.add('error');
//         span.innerText = 'erro';
//
//         elem[i].parentNode.insertBefore(span, elem[i].nextSibling)
//         validateInput(elem[i])
//     }
// }
// // <span class="error">Erro</span>
// formInputs();


function selectPlan(e, plan) {
    var text = e.querySelector('header p').innerText;



    document.querySelector('#form').classList.toggle('active');
    document.getElementById('plan-class').innerText = text.split('\n')[0];
    document.getElementById('plan-data').innerText = text.split('\n')[1];
}


var article = function (plan) {

    return '<article class="plan" onclick="selectPlan(this, \'' + plan.id + '\')">' +
        '<header>' +
        '<p><small>'+ plan.class +'</small> '+ plan.data +'GB' +
        '</p>' +
        '</header>' +
        '<div class="plan-content">' +
        '<p>Apps sem descontar da internet</p>' +
        '<div class="apps">' +
        apps(plan.apps) +
        '</div>' +
        '<hr>' +
        '</div>' +
        '<footer>' +
        '<div class="price">R$' +
        '<div class="decimals">'+ plan.price_broke.unity +'</div>' +
        '<div class="units"><div>,'+ plan.price_broke.tenths +'</div>/Mês</div>' +
        '</div>' +
        '<div class="button">Quero Agora</div>' +
        '<p>*No cartão de crédito</p>' +
        '</footer>' +
        '</article>'
};

var apps = function (apps) {
    var a = '';
    if (apps.toLowerCase().includes('whatsapp'))
        a += '<figure><img src="/images/whatsapp-icon.svg" alt="Whatsapp"></figure>';
    if (apps.toLowerCase().includes('messenger'))
        a += '<figure><img src="/images/messenger-icon.svg" alt="Messenger"></figure>';
    if (apps.toLowerCase().includes('instagram'))
        a += '<figure><img src="/images/instagram-icon.svg" alt="Instagram"></figure>';
    if (apps.toLowerCase().includes('netflix'))
        a += '<figure><img src="/images/netflix-icon.svg" alt=""></figure>';
    if (apps.toLowerCase().includes('facebook'))
        a += '<figure><img src="/images/facebook-icon.svg" alt=""></figure>';

    return a;
};

var p = document.querySelector('#plans .content');
var articles = function(obj) {

    var plans = JSON.parse(obj);
    p.innerHTML = '';
    plans.forEach(function(plan) {
        if ( plan.data === 4 || plan.data === 16 ) {
            return false;
        }
        p.innerHTML += article(plan)
    })

};


function showmethod(el) {
    var e = document.getElementsByClassName('card-method');

    console.log(e)
    for (var i = 0; i <e.length; i++) {
        var t = e[i]
        if ( el === 'boleto' ) {
            t.style.display = 'none';
        } else if ( el === 'cartao' ) {
            t.style.display = 'block';
        }
    }


}