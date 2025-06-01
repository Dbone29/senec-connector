function hex2float(e) {
  const a = 2147483648 & e ? -1 : 1;
  let t = ((e >> 23) & 255) - 127;
  const r = (8388608 + (8388607 & e)).toString(2);
  let o = 0;
  for (let e = 0; e < r.length; e += 1) (o += parseInt(r[e]) ? Math.pow(2, t) : 0), t--;
  return a * o;
}

function isValidDecimal(e) {
  return e.match(/^-?\d+$/) != null;
}

function isValidFloat(e) {
  return e.match(/^[-+]?[0-9]*\.?[0-9]+$/) != null;
}

function isValidEmail(e) {
  return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    e,
  );
}

function isValidIP(e) {
  errorString = '';
  const a = e.match(
    /^(25[0-5]|2[0-4][0-9]|[01]?[1-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  );
  return e == '255.255.255.255'
    ? (alert(e + lng.lNoValidIP), !1)
    : a != null || (alert(e + lng.lNoValidIP), !1);
}

function isInRange(e, a, t) {
  return e >= a && e <= t;
}

function isValidSenecNumber(e) {
  return (
    e.match(/^\w{4}\d{2}[G]\d{1}[-]\d{5}[-]\w{2}$/) != null
    || e.match(/^\w{4}\d{2}[G]\d{1}[-]\d{2}[-]\d{5}[-]\w{2}$/) != null
    || e.match(/^\w{2}[-][V]\d{1}[-]\d{2}\w{2}\d{2}[-]\d{5}$/) != null
    || e.match(/^[S][H]\d+[G]\d{6}$/) != null
    || e.match(/^[G]\d{7}$/) != null
    || e.match(/^\w{2}[-][V]\d{1}[.]\d{1}[-]\d{2}\w{2}\d{2}[-]\d{4}$/) != null
    || e.match(/^\w{2}[-][V]\d{1}[.]\d{1}[-]\d{2}\w{2}\d{2}[-]\d{5}$/) != null
    || e.match(/^\w{2}[-][V]\d{1}[-]\w{1,2}[-]\d{2}\w{2}\d{2}[-]\d{5}$/) != null
    || e.match(/^\w{2}[-][V]\d{1}[-]\w{1,2}[-]\d{2}\w{2}\d{2}[-]\d{6}$/) != null
    || e.match(/^[S][G][2][X][L]\d{5}$/) != null
  );
}

function isValidNationalMeterID(e) {
  (enteredNMI = e.substring(0, 10)), (enteredCheckSum = e.substring(10, 11));
  let a = 0;
  let t = 0;
  for (let e = 0, t = enteredNMI.length; e < t; e++) {
    let t = enteredNMI[e].charCodeAt(0);
    e % 2 > 0 && (t *= 2);
    let r = 0;
    for (let e = 0, a = t.toString().length; e < a; e++) r += parseInt(t.toString()[e]);
    a += r;
  }
  return (
    a % 10 != 0 && (t = 10 - (a % 10)),
    enteredNMI.length == 10 && t == enteredCheckSum
  );
}

function roundValue(e, a) {
  let t = e;
  switch (a) {
    case 0:
      t = Math.round(t);
      break;
    case 1:
    default:
      (t = Math.round(10 * t)), (t /= 10);
      break;
    case 2:
      (t = Math.round(100 * t)), (t /= 100);
      break;
    case 3:
      (t = Math.round(1e3 * t)), (t /= 1e3);
  }
  return t;
}

function configNumberToString(e) {
  switch (e) {
    case 1:
      return 'PV';
    case 2:
      return 'Parallel';
    case 4:
      return 'Battery';
    case 8:
      return 'NoConfig';
    case 16:
      return 'Off';
  }
}

function jsonRequest() {
  (this.create_json_object = function() {
    this.jsonReq = {};
  }),
  (this.add_json_object = function(e) {
    this.jsonReq[e] = {};
  }),
  (this.add_property_to_object = function(e, a, t) {
    this.jsonReq[e][a] = t;
  }),
  (this.get_object = function() {
    return this.jsonReq;
  }),
  (this.get_json = function() {
    return JSON.stringify(this.jsonReq);
  });
}

t.push([e, a, 'u8_01']);
