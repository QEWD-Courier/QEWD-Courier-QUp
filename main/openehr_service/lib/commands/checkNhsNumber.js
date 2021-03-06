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

  11 May 2019

*/

const { logger } = require('../core');
const { BadRequestError } = require('../errors');
const { Patient, RecordStatus, Role } = require('../shared/enums');
const { isPatientIdValid } = require('../shared/validation');

class CheckNhsNumberCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
    this.statusService = this.ctx.services.statusService;
  }

  /**
   * @param  {int|string} patientId
   * @return {Promise.<Object>}
   */
  async execute(patientId) {
    logger.info('commands/checkNhsNumber', { patientId });

    let state = null;

    // override dummy patientId
    if (patientId === Patient.DUMMY) {
      patientId = this.session.nhsNumber;
    }

    // override patientId for PHR Users - only allowed to see their own data
    if (this.session.role === Role.PHR_USER) {
      patientId = this.session.nhsNumber;
    }

    const valid = isPatientIdValid(patientId);
    if (!valid.ok) {
      throw new BadRequestError(valid.error);
    }

    state = this.statusService.check(patientId);

    logger.debug('state:', { state });

    if (state && state.status === RecordStatus.LOADING) {
      return {
        status: state.status,
        new_patient: state.new_patient,
        responseNo: state.requestNo,
        nhsNumber: patientId
      };
    }

    if (state && state.status === RecordStatus.READY) {
      return {
        status: RecordStatus.READY,
        nhsNumber: patientId
      };
    }

    // see index.js for workerResponseHandler that is invoked when this has completed
    // where it will next fetch any new heading data from Discovery and write it into EtherCIS record

    logger.debug('first time this API has been called in this user session');
    const initialState = {
      status: RecordStatus.LOADING,
      new_patient: 'not_known_yet',
      requestNo: 1
    };
    this.statusService.create(patientId, initialState);

    const host = this.ctx.defaultHost;
    const { created } = await this.ctx.services.patientService.check(host, patientId);

    if (created) {
      const feed = {
        author: 'Helm PHR service',
        name: 'Leeds Live - Whats On',
        landingPageUrl: 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/',
        rssFeedUrl: 'https://www.leeds-live.co.uk/news/?service=rss'
      };

      logger.debug('add the standard feed:', { patientId, feed });
      this.ctx.services.phrFeedService.create(patientId, feed);
    }

    state = this.statusService.get(patientId);
    logger.debug('record state:', { state });
    state.new_patient = created;
    this.statusService.update(patientId, state);

    return {
      status: RecordStatus.LOADING,
      new_patient: created,
      responseNo: state.requestNo,
      nhsNumber: patientId
    };
  }
}

module.exports = CheckNhsNumberCommand;
