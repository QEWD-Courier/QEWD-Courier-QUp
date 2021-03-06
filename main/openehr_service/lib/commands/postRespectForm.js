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

  17 April 2019

*/

'use strict';

const { logger } = require('../core');
const { BadRequestError } = require('../errors');
const { Heading, Role, PostHeadingFormat } = require('../shared/enums');
const { isPatientIdValid } = require('../shared/validation');

class PostRespectFormCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  /**
   * @param  {string} patientId
   * @return {Promise.<Object>}
   */
  async execute(patientId) {
    logger.info('commands/postRespectForm', { patientId });

    if (this.session.role === Role.PHR_USER) {
      logger.debug('override patientId for PHR Users - only allowed to see their own data');
      patientId = this.session.nhsNumber;
    }

    const patientValid = isPatientIdValid(patientId);
    if (!patientValid.ok) {
      throw new BadRequestError(patientValid.error);
    }

    const { headingService, cacheService } = this.ctx.services;

    const host = this.ctx.defaultHost;
    const heading = Heading.RESPECT_FORMS;
    const data = {
      data: {},
      format: PostHeadingFormat.PULSETILE
    };
    const responseObj = await headingService.post(host, patientId, heading, data);
    logger.debug('responseObj = %j', { responseObj });

    await cacheService.delete(host, patientId, heading);

    return responseObj;
  }
}

module.exports = PostRespectFormCommand;
