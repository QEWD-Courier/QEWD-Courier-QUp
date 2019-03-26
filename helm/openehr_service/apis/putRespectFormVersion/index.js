/*

 ----------------------------------------------------------------------------
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Alexey Kucherenko <alexei.kucherenko@gmail.com>                  |
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

  25 March 2019

*/

'use strict';

const { logger } = require('../../lib/core');
const { PutRespectFormVersionCommand } = require('../../lib/commands');
const { getResponseError } = require('../../lib/errors');

/**
 * PUT /api/patients/:patientId/respectforms/:sourceId/:version
 *
 * @param  {Object} args
 * @param  {Function} finished
 */
module.exports = async function putRespectFormVersion(args, finished) {
  try {
    const command = new PutRespectFormVersionCommand(args.req.ctx);
    const responseObj = await command.execute(args.patientId, args.sourceId, args.version, args.req.body);

    finished(responseObj);
  } catch (err) {
    logger.error('apis/putRespectFormVersion|err:', err);

    const responseError = getResponseError(err);

    finished(responseError);
  }
};