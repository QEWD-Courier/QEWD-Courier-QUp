/*

 ----------------------------------------------------------------------------
 | ripple-cdr-openehr: Ripple MicroServices for OpenEHR                     |
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  22 December 2018

*/

const { GetPatientHeadingSummaryCommand } = require('../../commands/patients');
const { getResponseError } = require('../../errors');

/**
 * @param  {Object} args
 * @param  {Function} finished
 */
module.exports = async function getMyHeadingSummary(args, finished) {
  try {
    const query = args.req.query || {};
    const command = new GetPatientHeadingSummaryCommand(args.req.ctx, args.session);
    const responseObj = await command.execute(args.session.nhsNumber, args.heading, query);

    finished(responseObj);
  } catch (err) {
    const responseError = getResponseError(err);

    finished(responseError);
  }
};

