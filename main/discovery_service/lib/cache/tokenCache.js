/*

 ----------------------------------------------------------------------------
 | ripple-cdr-discovery: Ripple Discovery Interface                         |
 |                                                                          |
 | Copyright (c) 2017-19 Ripple Foundation Community Interest Company       |
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

  11 February 2019

*/

'use strict';

const { logger } = require('../core');

class TokenCache {
  constructor(adapter) {
    this.adapter = adapter;
  }

  static create(adapter) {
    return new TokenCache(adapter);
  }

  /**
   * Gets token
   *
   * @return {Object|null}
   */
  get() {
    logger.info('cache/tokenCache|get');

    const key = ['discoveryToken'];

    return this.adapter.getObject(key);
  }

  /**
   * Sets a token
   *
   * @param  {Object} data
   * @return {void}
   */
  set(data) {
    logger.info('cache/tokenCache|set', { data });

    const key = ['discoveryToken'];
    this.adapter.putObject(key, data);
  }

  /**
   * Deletes a token
   *
   * @param  {string} host
   * @return {void}
   */
  delete() {
    logger.info('cache/tokenCache|delete');

    const key = ['discoveryToken'];
    this.adapter.delete(key);
  }
}

module.exports = TokenCache;
