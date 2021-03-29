/* Copyright Spurwing.io and Healthie Inc.
 * Released under the MIT license 
 * https://www.spurwing.io/
 */

// chai testing framework: https://www.chaijs.com/guide/styles/
const chai = require('chai');
chai.should();
const expect = chai.expect;

let PID, KEY;
if (process.env.SPURWING_PID && process.env.SPURWING_KEY) {
  PID = process.env.SPURWING_PID;
  KEY = process.env.SPURWING_KEY;
} else {
  let CONFIG = require('./config.js');
  PID = CONFIG.provider_id;
  KEY = CONFIG.api_key;
}
if (!PID || !KEY) throw 'missing PID and/or KEY values';

const Spurwing = require('./spurwing.js')

async function runner(testname, func) {
  try {
    console.log(testname, 'STARTED')
    await func()
    console.log('\n'+testname, 'PASSED\n')
  } catch (err) {
    console.error(testname, 'FAILED')
    // console.error(err)
    throw err;
  }
}

function logResp(obj) {
  // console.log(obj)
  process.stdout.write(".");
}

(async () => {

  await runner('TEST 1', (async() => {
    let sp = new Spurwing();

    let A = await sp.get_appointment_types(PID)
    logResp({A})
    A.should.have.lengthOf(3) // default 3

    let appointment_type_id = A[0].id;

    let B = await sp.get_days_available(PID, appointment_type_id)
    logResp({B})
    expect(B.days_available.length).to.be.at.least(1) // at least one day available this month

    let C = await sp.get_slots_available(PID, appointment_type_id, dateNow(), dateTomorrow())
    logResp({C})
    expect(C.slots_available.length).to.be.at.least(10) // each day has 96 15min slots (60*24 / 15 == 96)

    let slot = C.slots_available[5].date
    let D = await sp.complete_booking(PID, appointment_type_id, 'ilya2@nevolin.be', 'Ilya', 'Nevo', slot, 'Test booking');
    logResp({D})
    D.should.have.property('appointment')
    expect(D.appointment.length).to.equal(60)

    let E = await sp.list_appointments(KEY, 1000, 0)
    logResp({E})
    E.should.have.property('data')
    E.data.should.have.property('appointments')
    expect(E.data.appointmentsCount).to.be.at.least(1)

    let apid = D.appointment.id;
    let F = await sp.delete_appointment(KEY, apid)
    logResp({F})
    F.should.have.property('data')
    F.data.should.have.property('appointment')
    F.data.appointment.id.should.equal(D.appointment.id)
    F.errors.should.have.lengthOf(0)
  }));

  await runner('TEST 2', (async() => {
    let sp = new Spurwing();
    let A = await sp.list_appointments(KEY, 1000, 0)
    logResp({A})
    A.should.have.property('data')
    A.data.should.have.property('appointments')
  }));

})();

//////////////////////////////
////// helper functions //////
//////////////////////////////

function dateNow() {
  let d = new Date();
  return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
}

function  dateTomorrow() {
  let d = new Date();
  d.setDate(d.getDate() + 1);
  return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
}