/* Copyright Spurwing.io and Healthie Inc.
 * Released under the MIT license 
 * https://www.spurwing.io/
 */

'use strict';

const axios = require('axios');

class Spurwing {
  constructor(provider_id, api_key) {
    this.API_URL = 'https://api.spurwing.io/api/v2/';
  }

  isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  formUrlEncode(obj) {
    if (!obj)
      return '';
    let urlData = '';
    for (let x in obj)
      urlData = urlData + x + '=' + encodeURIComponent(obj[x]) + '&';
    urlData = urlData.substr(0, (urlData.length - 1));
    return urlData;
  }

  async get_appointment_types(provider_id, clients_can_book) {
    return await this.HTTP('GET', this.API_URL + 'appointment_types.json', { provider_id, clients_can_book })
  }
  async get_days_available(provider_id, appointment_type_id, date_from_month, timezone, org_level) {
    return await this.HTTP('GET', this.API_URL + 'bookings/days_available.json', { provider_id, appointment_type_id, date_from_month, timezone, org_level })
  }
  async get_slots_available(provider_id, appointment_type_id, start_date, end_date, org_level) {
    return await this.HTTP('GET', this.API_URL + 'bookings/slots_available.json', { provider_id, appointment_type_id, start_date, end_date, org_level })
  }
  async complete_booking(provider_id, appointment_type_id, date, timezone, first_name, last_name, email, phone_number, contact_type) {
    return await this.HTTP('POST', this.API_URL + 'bookings/complete_booking.json', { provider_id, appointment_type_id, date, timezone, first_name, last_name, email, phone_number, contact_type })
  }
  async list_appointments(authorization, page_size, offset, provider_id) {
    return await this.HTTP('GET', this.API_URL + 'appointments', { page_size, offset, provider_id }, { authorization: 'Bearer ' + authorization })
  }
  async delete_appointment(appointment_id, authorization) {
    return await this.HTTP('DELETE', this.API_URL + 'appointments/' + appointment_id, {}, { authorization: 'Bearer ' + authorization })
  }

  async HTTP(method, url, data, headers) {
    if (method === 'GET' && data && !this.isEmpty(data))
      url = url + '?' + this.formUrlEncode(data);

    let resp = await axios({
      method: method,
      url: url,
      data: data,
      headers: headers,
    });

    if (resp.status === 200)
      return resp.data;
    else
      throw Exception({status:resp.status, text:resp.statusText, url})
  }

}

module.exports = Spurwing
